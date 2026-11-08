-- SwissWatch_premium Initial Database Schema
-- Migration: 20261108000001_initial_schema.sql

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE movement_type AS ENUM ('automatic', 'quartz');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'new',
    'confirmed',
    'preparing',
    'ready',
    'out_for_delivery',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash_on_delivery', 'payme', 'click');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_type AS ENUM ('pickup', 'delivery');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percent', 'fixed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE sms_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. SEQUENCES
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

-- 3. HELPER FUNCTIONS: updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. PROFILES TABLE (Staff, Manager, Owner)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  is_active BOOLEAN NOT NULL DEFAULT true,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. SECURITY DEFINER: auth_role()
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid() AND is_active = true;
  RETURN v_role;
END;
$$;

-- 6. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  price_usd NUMERIC(10,2) NULL, -- NULL represents "Narxni so'rash / Уточнить цену"
  currency TEXT NOT NULL DEFAULT 'USD',
  images TEXT[] NOT NULL DEFAULT '{}',
  description_uz TEXT NOT NULL DEFAULT '',
  description_ru TEXT NOT NULL DEFAULT '',
  movement_type movement_type NOT NULL DEFAULT 'automatic',
  movement_text TEXT NOT NULL DEFAULT '',
  case_diameter TEXT NOT NULL DEFAULT '',
  case_diameter_val INT NOT NULL DEFAULT 0,
  dial_color TEXT NULL,
  water_resistance TEXT NULL,
  glass TEXT NULL,
  features TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INT NOT NULL DEFAULT 1,
  prep_days INT NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. SITE SETTINGS TABLE (Single row 'default')
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL DEFAULT 'SwissWatch_premium',
  display_name TEXT NOT NULL DEFAULT 'SwissWatch Premium',
  tagline_uz TEXT NOT NULL,
  tagline_ru TEXT NOT NULL,
  about_uz TEXT NOT NULL,
  about_ru TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '+998 88 500 70 00',
  phone_clean TEXT NOT NULL DEFAULT '+998885007000',
  telegram_channel TEXT NOT NULL DEFAULT 'https://t.me/swisswatch_premium',
  telegram_manager TEXT NOT NULL DEFAULT '@swissWatch_admin',
  telegram_manager_url TEXT NOT NULL DEFAULT 'https://t.me/swissWatch_admin',
  instagram_handle TEXT NULL,
  working_hours_uz TEXT NOT NULL,
  working_hours_ru TEXT NOT NULL,
  usd_to_uzs_rate NUMERIC(10,2) NULL DEFAULT NULL, -- NULL: No invented rate; online payments disabled until set
  default_prep_days INT NOT NULL DEFAULT 1,
  delivery_info_uz TEXT NOT NULL,
  delivery_info_ru TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. BRANCHES TABLE (Toshkent, Namangan)
CREATE TABLE IF NOT EXISTS public.branches (
  id TEXT PRIMARY KEY,
  city_uz TEXT NOT NULL,
  city_ru TEXT NOT NULL,
  address_uz TEXT NOT NULL,
  address_ru TEXT NOT NULL,
  landmark_uz TEXT NOT NULL,
  landmark_ru TEXT NOT NULL,
  note_uz TEXT NULL,
  note_ru TEXT NULL,
  phone TEXT NULL,
  working_hours_uz TEXT NULL,
  working_hours_ru TEXT NULL,
  map_link TEXT NULL,
  pickup_enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 9. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
  id SERIAL PRIMARY KEY,
  question_uz TEXT NOT NULL,
  question_ru TEXT NOT NULL,
  answer_uz TEXT NOT NULL,
  answer_ru TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 10. HERO BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.hero_banners (
  id SERIAL PRIMARY KEY,
  title_line1_uz TEXT NOT NULL,
  title_line2_uz TEXT NOT NULL,
  title_line1_ru TEXT NOT NULL,
  title_line2_ru TEXT NOT NULL,
  subtitle_uz TEXT NOT NULL,
  subtitle_ru TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0
);

-- 11. DELIVERY METHODS TABLE
CREATE TABLE IF NOT EXISTS public.delivery_methods (
  id TEXT PRIMARY KEY,
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  delivery_type delivery_type NOT NULL,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  free_above_usd NUMERIC(10,2) NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false, -- Defaults to disabled until owner activates
  sort_order INT NOT NULL DEFAULT 0
);

-- 12. PROMO CODES & REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type discount_type NOT NULL DEFAULT 'percent',
  value NUMERIC(10,2) NOT NULL,
  min_order_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount_usd NUMERIC(10,2) NULL,
  valid_from TIMESTAMPTZ NULL,
  valid_to TIMESTAMPTZ NULL,
  total_usage_limit INT NULL,
  per_customer_limit INT NOT NULL DEFAULT 1,
  usage_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NULL,
  lang TEXT NOT NULL DEFAULT 'uz',
  status order_status NOT NULL DEFAULT 'new',
  delivery_type delivery_type NOT NULL,
  branch_id TEXT REFERENCES public.branches(id) ON DELETE RESTRICT NULL,
  delivery_method_id TEXT REFERENCES public.delivery_methods(id) ON DELETE RESTRICT NULL,
  delivery_address TEXT NULL,
  comment TEXT NULL,
  internal_notes TEXT NULL,
  promo_code_id INT REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  promo_code TEXT NULL,
  discount_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  subtotal_usd NUMERIC(10,2) NOT NULL,
  delivery_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_usd NUMERIC(10,2) NOT NULL,
  usd_to_uzs_rate NUMERIC(10,2) NULL,
  total_uzs BIGINT NULL,
  payment_method payment_method NOT NULL DEFAULT 'cash_on_delivery',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  estimated_ready_date DATE NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.promo_redemptions (
  id SERIAL PRIMARY KEY,
  promo_code_id INT NOT NULL REFERENCES public.promo_codes(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  discount_usd NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_slug TEXT NOT NULL,
  product_name_uz TEXT NOT NULL,
  product_name_ru TEXT NOT NULL,
  brand TEXT NOT NULL,
  image_url TEXT NULL,
  unit_price_usd NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total_price_usd NUMERIC(10,2) NOT NULL,
  prep_days INT NOT NULL DEFAULT 1
);

-- 15. ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id SERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status order_status NULL,
  new_status order_status NOT NULL,
  changed_by_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. PAYMENT TRANSACTIONS (Payme & Click)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id SERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'payme' | 'click'
  payme_trans_id TEXT NULL,
  payme_state INT NULL,
  payme_create_time BIGINT NULL,
  payme_perform_time BIGINT NULL,
  payme_cancel_time BIGINT NULL,
  payme_reason INT NULL,
  click_trans_id BIGINT NULL,
  click_paydoc_id BIGINT NULL,
  click_state INT NULL,
  amount NUMERIC(14,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'initiated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. AUDIT LOG
CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_email TEXT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB NULL,
  new_values JSONB NULL,
  ip_address TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. PAYMENTS LOG
CREATE TABLE IF NOT EXISTS public.payments_log (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  method TEXT NOT NULL,
  request_payload JSONB NOT NULL,
  response_payload JSONB NOT NULL,
  status TEXT NOT NULL,
  transaction_id TEXT NULL,
  amount NUMERIC(14,2) NULL,
  error_code INT NULL,
  error_message TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. SMS LOG & TEMPLATES
CREATE TABLE IF NOT EXISTS public.sms_log (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'mock' | 'eskiz'
  status sms_status NOT NULL DEFAULT 'pending',
  attempt_count INT NOT NULL DEFAULT 1,
  external_id TEXT NULL,
  error_details TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sms_templates (
  id TEXT PRIMARY KEY,
  template_uz TEXT NOT NULL,
  template_ru TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. RATE LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.rate_limits (
  ip TEXT NOT NULL,
  action TEXT NOT NULL,
  count INT NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (ip, action)
);

-- 21. INDEXES
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_log_order_id ON public.payments_log(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_sms_log_order_id ON public.sms_log(order_id);

-- 22. SECURITY DEFINER: Status Transition Function
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
  IF p_new_status = 'cancelled' THEN
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

  -- Perform status update
  UPDATE public.orders
  SET
    status = p_new_status,
    internal_notes = COALESCE(p_internal_notes, internal_notes),
    estimated_ready_date = COALESCE(p_estimated_ready_date, estimated_ready_date),
    updated_at = now()
  WHERE id = p_order_id;

  -- Record status history
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
    'orders',
    p_order_id::text,
    jsonb_build_object('status', v_current_order.status),
    jsonb_build_object('status', p_new_status, 'reason', p_reason)
  );

  RETURN jsonb_build_object('success', true, 'new_status', p_new_status);
END;
$$;

-- 23. UPDATED_AT TRIGGERS
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_payment_transactions_updated_at BEFORE UPDATE ON public.payment_transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_sms_log_updated_at BEFORE UPDATE ON public.sms_log FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_sms_templates_updated_at BEFORE UPDATE ON public.sms_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

