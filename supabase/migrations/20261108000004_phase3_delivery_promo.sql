-- SwissWatch_premium Phase 3: Promo Codes, Delivery Methods & Preparation Time
-- Migration: 20261108000004_phase3_delivery_promo.sql

-- 1. SEED DEFAULT 4 DELIVERY METHODS IF NOT PRESENT
INSERT INTO public.delivery_methods (id, name_uz, name_ru, delivery_type, branch_id, price_usd, free_above_usd, is_enabled, sort_order)
VALUES
  ('pickup_tashkent', 'Toshkent filialidan olib ketish (Langar ko''chasi 12)', 'Самовывоз из филиала в Ташкенте (ул. Лангар, 12)', 'pickup', 'tashkent', 0, NULL, true, 0),
  ('pickup_namangan', 'Namangan filialidan olib ketish (A. Navoiy ko''chasi 42)', 'Самовывоз из филиала в Намангане (ул. А. Навои, 42)', 'pickup', 'namangan', 0, NULL, true, 1),
  ('courier_city', 'Shahar bo''ylab kuryer orqali yetkazib berish', 'Курьерская доставка по городу', 'delivery', NULL, 0, NULL, false, 2),
  ('regional_delivery', 'Viloyatlar bo''ylab yetkazib berish', 'Доставка по регионам', 'delivery', NULL, 0, NULL, false, 3)
ON CONFLICT (id) DO NOTHING;

-- 2. UPDATE update_order_status_secure TO PERMIT MAINTAINING STATUS (For Notes & Ready Date updates)
CREATE OR REPLACE FUNCTION public.update_order_status_secure(
  p_order_id UUID,
  p_new_status order_status,
  p_reason TEXT DEFAULT NULL,
  p_internal_notes TEXT DEFAULT NULL,
  p_estimated_ready_date DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_role user_role;
  v_caller_id UUID;
  v_caller_email TEXT;
  v_current_order orders%ROWTYPE;
  v_is_valid BOOLEAN := false;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Avtorizatsiyadan o''tilmagan.';
  END IF;

  SELECT role, email INTO v_caller_role, v_caller_email
  FROM public.profiles
  WHERE id = v_caller_id AND is_active = true;

  IF v_caller_role IS NULL THEN
    RAISE EXCEPTION 'Foydalanuvchiga ruxsat berilmagan.';
  END IF;

  SELECT * INTO v_current_order
  FROM public.orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Buyurtma topilmadi.';
  END IF;

  -- Enforce status transition matrix
  IF p_new_status = v_current_order.status THEN
    -- Status remains unchanged (updating internal_notes or estimated_ready_date)
    v_is_valid := true;
  ELSIF p_new_status = 'cancelled' THEN
    IF v_current_order.status IN ('completed', 'cancelled') THEN
      RAISE EXCEPTION 'Yakunlangan yoki bekor qilingan buyurtma qayta bekor qilinmaydi.';
    END IF;
    IF p_reason IS NULL OR trim(p_reason) = '' THEN
      RAISE EXCEPTION 'Buyurtmani bekor qilish sababi ko''rsatilishi shart.';
    END IF;
    v_is_valid := true;
  ELSIF v_current_order.status = 'new' AND p_new_status = 'confirmed' THEN
    v_is_valid := true;
  ELSIF v_current_order.status = 'confirmed' AND p_new_status = 'preparing' THEN
    v_is_valid := true;
  ELSIF v_current_order.status = 'preparing' AND p_new_status = 'ready' THEN
    v_is_valid := true;
  ELSIF v_current_order.status = 'ready' AND (
    (v_current_order.delivery_type = 'delivery' AND p_new_status = 'out_for_delivery') OR
    (v_current_order.delivery_type = 'pickup' AND p_new_status = 'completed')
  ) THEN
    v_is_valid := true;
  ELSIF v_current_order.status = 'out_for_delivery' AND p_new_status = 'completed' THEN
    v_is_valid := true;
  END IF;

  IF NOT v_is_valid THEN
    RAISE EXCEPTION 'Holatni % dan % ga o''zgartirishga ruxsat berilmagan.', v_current_order.status, p_new_status;
  END IF;

  -- Perform status update (Columns total_usd, subtotal_usd, payment_status are IMMUTABLE here)
  UPDATE public.orders
  SET
    status = p_new_status,
    internal_notes = COALESCE(p_internal_notes, internal_notes),
    estimated_ready_date = COALESCE(p_estimated_ready_date, estimated_ready_date),
    updated_at = now()
  WHERE id = p_order_id;

  -- Record status history only if status actually changed
  IF p_new_status <> v_current_order.status THEN
    INSERT INTO public.order_status_history (
      order_id,
      previous_status,
      new_status,
      changed_by_profile_id,
      reason
    ) VALUES (
      p_order_id,
      v_current_order.status,
      p_new_status,
      v_caller_id,
      p_reason
    );
  END IF;

  -- Record audit log
  INSERT INTO public.audit_log (
    user_id,
    user_email,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    v_caller_id,
    v_caller_email,
    'ORDER_STATUS_UPDATE',
    'order',
    p_order_id::text,
    jsonb_build_object(
      'status', v_current_order.status,
      'estimated_ready_date', v_current_order.estimated_ready_date,
      'internal_notes', v_current_order.internal_notes
    ),
    jsonb_build_object(
      'status', p_new_status,
      'estimated_ready_date', COALESCE(p_estimated_ready_date, v_current_order.estimated_ready_date),
      'internal_notes', COALESCE(p_internal_notes, v_current_order.internal_notes),
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'status', p_new_status,
    'estimated_ready_date', COALESCE(p_estimated_ready_date, v_current_order.estimated_ready_date),
    'internal_notes', COALESCE(p_internal_notes, v_current_order.internal_notes)
  );
END;
$$;

-- 3. PROMO CODE VALIDATION RPC (For Real-time Client Verification)
CREATE OR REPLACE FUNCTION public.validate_promo_code_rpc(
  p_code TEXT,
  p_subtotal_usd NUMERIC,
  p_customer_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_clean_phone TEXT;
  v_redemption_count INT := 0;
  v_discount NUMERIC(10,2) := 0;
  v_digits TEXT;
BEGIN
  IF p_code IS NULL OR trim(p_code) = '' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Promokod kiritilmadi.');
  END IF;

  SELECT * INTO v_promo
  FROM public.promo_codes
  WHERE upper(code) = upper(trim(p_code)) AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Promokod mavjud emas yoki faol emas.');
  END IF;

  IF v_promo.valid_from IS NOT NULL AND now() < v_promo.valid_from THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Promokod hali faollashmagan.');
  END IF;

  IF v_promo.valid_to IS NOT NULL AND now() > v_promo.valid_to THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Promokodning amal qilish muddati tugagan.');
  END IF;

  IF p_subtotal_usd < v_promo.min_order_usd THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Ushbu promokoddan foydalanish uchun minimal buyurtma summasi $' || v_promo.min_order_usd || ' bo''lishi kerak.'
    );
  END IF;

  IF v_promo.total_usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.total_usage_limit THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Ushbu promokoddan foydalanish limiti tugagan.');
  END IF;

  -- Check per-customer limit if phone is provided
  IF p_customer_phone IS NOT NULL AND trim(p_customer_phone) <> '' THEN
    v_digits := regexp_replace(p_customer_phone, '\D', '', 'g');
    IF length(v_digits) = 9 THEN
      v_clean_phone := '+998' || v_digits;
    ELSIF length(v_digits) = 12 AND v_digits LIKE '998%' THEN
      v_clean_phone := '+' || v_digits;
    END IF;

    IF v_clean_phone IS NOT NULL THEN
      SELECT count(*) INTO v_redemption_count
      FROM public.promo_redemptions
      WHERE promo_code_id = v_promo.id AND customer_phone = v_clean_phone;

      IF v_redemption_count >= v_promo.per_customer_limit THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Siz bu promokoddan allaqachon foydalangansiz.');
      END IF;
    END IF;
  END IF;

  -- Calculate discount
  IF v_promo.type = 'percent' THEN
    v_discount := round((p_subtotal_usd * (v_promo.value / 100.0)), 2);
    IF v_promo.max_discount_usd IS NOT NULL AND v_discount > v_promo.max_discount_usd THEN
      v_discount := v_promo.max_discount_usd;
    END IF;
  ELSE
    v_discount := v_promo.value;
  END IF;

  IF v_discount > p_subtotal_usd THEN
    v_discount := p_subtotal_usd;
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'promo_id', v_promo.id,
    'code', v_promo.code,
    'type', v_promo.type,
    'value', v_promo.value,
    'discount_usd', v_discount,
    'min_order_usd', v_promo.min_order_usd,
    'max_discount_usd', v_promo.max_discount_usd
  );
END;
$$;

