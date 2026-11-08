-- SwissWatch_premium Phase 2: Atomic Orders RPC, DB Rate Limiting, and Realtime
-- Migration: 20261108000003_orders_and_realtime.sql

-- 1. ATOMIC SERVERLESS RATE LIMITER FUNCTION
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip TEXT,
  p_action TEXT,
  p_max_count INT,
  p_window_seconds INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_rec rate_limits%ROWTYPE;
BEGIN
  -- 1. Clean up stale entries occasionally (1 in 20 chance or expired)
  IF random() < 0.05 THEN
    DELETE FROM public.rate_limits WHERE reset_at < v_now;
  END IF;

  -- 2. Lock row if exists
  SELECT * INTO v_rec
  FROM public.rate_limits
  WHERE ip = p_ip AND action = p_action
  FOR UPDATE;

  -- 3. If no active record or expired, reset counter
  IF NOT FOUND OR v_rec.reset_at <= v_now THEN
    INSERT INTO public.rate_limits (ip, action, count, reset_at)
    VALUES (p_ip, p_action, 1, v_now + (p_window_seconds || ' seconds')::interval)
    ON CONFLICT (ip, action) DO UPDATE
    SET count = 1, reset_at = v_now + (p_window_seconds || ' seconds')::interval;
    RETURN true;
  END IF;

  -- 4. Check if limit exceeded
  IF v_rec.count >= p_max_count THEN
    RETURN false; -- Blocked!
  END IF;

  -- 5. Increment counter
  UPDATE public.rate_limits
  SET count = count + 1
  WHERE ip = p_ip AND action = p_action;

  RETURN true;
END;
$$;

-- 2. ATOMIC ORDER CREATION RPC (ONE Postgres Function in a Single Transaction)
CREATE OR REPLACE FUNCTION public.create_order_rpc(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT DEFAULT NULL,
  p_lang TEXT DEFAULT 'uz',
  p_delivery_type delivery_type DEFAULT 'pickup',
  p_branch_id TEXT DEFAULT NULL,
  p_delivery_method_id TEXT DEFAULT NULL,
  p_delivery_address TEXT DEFAULT NULL,
  p_comment TEXT DEFAULT NULL,
  p_payment_method payment_method DEFAULT 'cash_on_delivery',
  p_promo_code TEXT DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID := gen_random_uuid();
  v_seq BIGINT;
  v_order_number TEXT;
  v_clean_phone TEXT;
  v_subtotal_usd NUMERIC(10,2) := 0;
  v_delivery_fee_usd NUMERIC(10,2) := 0;
  v_discount_usd NUMERIC(10,2) := 0;
  v_total_usd NUMERIC(10,2) := 0;
  v_usd_rate NUMERIC(10,2) := NULL;
  v_total_uzs BIGINT := NULL;
  v_max_prep_days INT := 1;
  v_estimated_ready DATE;
  v_item JSONB;
  v_product_id TEXT;
  v_quantity INT;
  v_product products%ROWTYPE;
  v_promo promo_codes%ROWTYPE;
  v_branch branches%ROWTYPE;
  v_delivery_method delivery_methods%ROWTYPE;
  v_promo_redemption_count INT;
  v_digits TEXT;
BEGIN
  -- 1. Validate customer name
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Ism va familiya kiritilishi shart (kamida 2 ta harf).';
  END IF;

  -- 2. Normalize and validate phone format (+998XXXXXXXXX)
  v_digits := regexp_replace(COALESCE(p_customer_phone, ''), '\D', '', 'g');
  IF length(v_digits) = 9 THEN
    v_clean_phone := '+998' || v_digits;
  ELSIF length(v_digits) = 12 AND v_digits LIKE '998%' THEN
    v_clean_phone := '+' || v_digits;
  ELSE
    RAISE EXCEPTION 'Telefon raqami noto''g''ri kiritilgan. Format: +998 XX XXX XX XX.';
  END IF;

  -- 3. Validate items array
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Buyurtmada kamida bitta mahsulot bo''lishi shart.';
  END IF;

  -- 4. Validate delivery options
  IF p_delivery_type = 'pickup' THEN
    IF p_branch_id IS NULL THEN
      RAISE EXCEPTION 'Olib ketish uchun filial tanlanishi shart.';
    END IF;
    SELECT * INTO v_branch FROM public.branches WHERE id = p_branch_id AND is_active = true AND pickup_enabled = true;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Tanlangan filial mavjud emas yoki qabul qilish uchun nofaol: %', p_branch_id;
    END IF;
  ELSIF p_delivery_type = 'delivery' THEN
    IF p_delivery_address IS NULL OR length(trim(p_delivery_address)) < 5 THEN
      RAISE EXCEPTION 'Yetkazib berish manzili to''liq kiritilishi shart.';
    END IF;
  END IF;

  -- 5. Fetch delivery method fee from DB (Never trust client)
  IF p_delivery_method_id IS NOT NULL THEN
    SELECT * INTO v_delivery_method FROM public.delivery_methods WHERE id = p_delivery_method_id AND is_enabled = true;
    IF FOUND THEN
      v_delivery_fee_usd := v_delivery_method.price_usd;
    END IF;
  END IF;

  -- 6. Loop over items, acquire row lock (FOR UPDATE), validate and decrement stock safely
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := v_item->>'product_id';
    v_quantity := COALESCE((v_item->>'quantity')::int, 1);

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Mahsulot soni 1 dan kam bo''lishi mumkin emas.';
    END IF;

    -- Concurrency Lock: FOR UPDATE serializes concurrent checkouts on the exact product row!
    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_product_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Noma''lum yoki sotuvda yo''q mahsulot: %', v_product_id;
    END IF;

    -- Price check: Unpriced products (NULL) cannot be checked out online
    IF v_product.price_usd IS NULL THEN
      RAISE EXCEPTION 'Mahsulot narxi belgilanmagan: %. Iltimos menejer bilan bog''laning.', v_product.name_uz;
    END IF;

    -- Stock check
    IF v_product.stock_quantity < v_quantity THEN
      RAISE EXCEPTION 'Omborda yetarli qoldiq mavjud emas: %. Mavjud: % dona, so''ralgan: % dona.',
        v_product.name_uz, v_product.stock_quantity, v_quantity;
    END IF;

    -- Decrement stock safely
    UPDATE public.products
    SET
      stock_quantity = stock_quantity - v_quantity,
      in_stock = (stock_quantity - v_quantity > 0),
      updated_at = now()
    WHERE id = v_product.id;

    -- Track subtotal & prep days
    v_subtotal_usd := v_subtotal_usd + (v_product.price_usd * v_quantity);
    IF v_product.prep_days > v_max_prep_days THEN
      v_max_prep_days := v_product.prep_days;
    END IF;
  END LOOP;

  -- 7. Free delivery threshold check
  IF v_delivery_method.free_above_usd IS NOT NULL AND v_subtotal_usd >= v_delivery_method.free_above_usd THEN
    v_delivery_fee_usd := 0;
  END IF;

  -- 8. Promo Code Verification (Atomic with Row Lock)
  IF p_promo_code IS NOT NULL AND trim(p_promo_code) <> '' THEN
    SELECT * INTO v_promo
    FROM public.promo_codes
    WHERE upper(code) = upper(trim(p_promo_code)) AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Promokod mavjud emas yoki muddati o''tgan.';
    END IF;

    IF v_promo.valid_from IS NOT NULL AND now() < v_promo.valid_from THEN
      RAISE EXCEPTION 'Promokod hali faollashmagan.';
    END IF;

    IF v_promo.valid_to IS NOT NULL AND now() > v_promo.valid_to THEN
      RAISE EXCEPTION 'Promokod muddati tugagan.';
    END IF;

    IF v_subtotal_usd < v_promo.min_order_usd THEN
      RAISE EXCEPTION 'Promokod uchun minimal buyurtma summasi: $% USD.', v_promo.min_order_usd;
    END IF;

    IF v_promo.total_usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.total_usage_limit THEN
      RAISE EXCEPTION 'Ushbu promokoddan foydalanish limiti tugagan.';
    END IF;

    SELECT count(*) INTO v_promo_redemption_count
    FROM public.promo_redemptions
    WHERE promo_code_id = v_promo.id AND customer_phone = v_clean_phone;

    IF v_promo_redemption_count >= v_promo.per_customer_limit THEN
      RAISE EXCEPTION 'Siz bu promokoddan allaqachon foydalangansiz.';
    END IF;

    -- Calculate discount
    IF v_promo.type = 'percent' THEN
      v_discount_usd := round((v_subtotal_usd * (v_promo.value / 100.0)), 2);
      IF v_promo.max_discount_usd IS NOT NULL AND v_discount_usd > v_promo.max_discount_usd THEN
        v_discount_usd := v_promo.max_discount_usd;
      END IF;
    ELSE
      v_discount_usd := v_promo.value;
    END IF;

    IF v_discount_usd > v_subtotal_usd THEN
      v_discount_usd := v_subtotal_usd;
    END IF;

    -- Increment usage count
    UPDATE public.promo_codes
    SET usage_count = usage_count + 1
    WHERE id = v_promo.id;
  END IF;

  -- 9. Final Totals & Currency Exchange
  v_total_usd := v_subtotal_usd + v_delivery_fee_usd - v_discount_usd;

  SELECT usd_to_uzs_rate INTO v_usd_rate FROM public.site_settings WHERE id = 'default';
  IF v_usd_rate IS NOT NULL THEN
    v_total_uzs := round(v_total_usd * v_usd_rate);
  END IF;

  -- 10. Generate Order Number from DB Sequence
  SELECT nextval('order_number_seq') INTO v_seq;
  v_order_number := 'SWP-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(v_seq::text, 4, '0');

  -- Estimated ready date
  v_estimated_ready := (current_date + (v_max_prep_days || ' days')::interval)::date;

  -- 11. Insert Order
  INSERT INTO public.orders (
    id,
    order_number,
    customer_name,
    customer_phone,
    customer_email,
    lang,
    status,
    delivery_type,
    branch_id,
    delivery_method_id,
    delivery_address,
    comment,
    promo_code_id,
    promo_code,
    discount_usd,
    subtotal_usd,
    delivery_fee_usd,
    total_usd,
    usd_to_uzs_rate,
    total_uzs,
    payment_method,
    payment_status,
    estimated_ready_date,
    created_at,
    updated_at
  ) VALUES (
    v_order_id,
    v_order_number,
    p_customer_name,
    v_clean_phone,
    p_customer_email,
    p_lang,
    'new',
    p_delivery_type,
    p_branch_id,
    p_delivery_method_id,
    p_delivery_address,
    p_comment,
    v_promo.id,
    v_promo.code,
    v_discount_usd,
    v_subtotal_usd,
    v_delivery_fee_usd,
    v_total_usd,
    v_usd_rate,
    v_total_uzs,
    p_payment_method,
    'unpaid',
    v_estimated_ready,
    now(),
    now()
  );

  -- 12. Insert Order Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := v_item->>'product_id';
    v_quantity := COALESCE((v_item->>'quantity')::int, 1);

    SELECT * INTO v_product FROM public.products WHERE id = v_product_id;

    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_slug,
      product_name_uz,
      product_name_ru,
      brand,
      image_url,
      unit_price_usd,
      quantity,
      total_price_usd,
      prep_days
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.slug,
      v_product.name_uz,
      v_product.name_ru,
      v_product.brand,
      v_product.images[1],
      v_product.price_usd,
      v_quantity,
      round(v_product.price_usd * v_quantity, 2),
      v_product.prep_days
    );
  END LOOP;

  -- 13. Record Promo Redemption
  IF v_promo.id IS NOT NULL THEN
    INSERT INTO public.promo_redemptions (
      promo_code_id,
      order_id,
      customer_phone,
      discount_usd,
      created_at
    ) VALUES (
      v_promo.id,
      v_order_id,
      v_clean_phone,
      v_discount_usd,
      now()
    );
  END IF;

  -- 14. Record Status History
  INSERT INTO public.order_status_history (
    order_id,
    previous_status,
    new_status,
    changed_by_profile_id,
    reason,
    created_at
  ) VALUES (
    v_order_id,
    NULL,
    'new',
    NULL,
    'Mijoz tomonidan sayt orqali yaratildi',
    now()
  );

  -- 15. Return JSON payload
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal_usd', v_subtotal_usd,
    'discount_usd', v_discount_usd,
    'delivery_fee_usd', v_delivery_fee_usd,
    'total_usd', v_total_usd,
    'total_uzs', v_total_uzs,
    'estimated_ready_date', v_estimated_ready
  );
END;
$$;

-- 3. ENABLE SUPABASE REALTIME FOR ORDERS (Protected by RLS)
-- In Supabase PostgreSQL, adding orders to supabase_realtime publication
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN others THEN null; END $$;

-- 4. RE-VERIFY ORDERS RLS
-- RLS guarantees only authenticated users whose auth_role() IN ('owner', 'manager', 'staff') can SELECT rows.
-- Anonymous subscriptions will receive 0 row payloads through Realtime.

