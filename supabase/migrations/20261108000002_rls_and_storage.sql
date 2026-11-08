-- SwissWatch_premium RLS Policies & Storage Setup
-- Migration: 20261108000002_rls_and_storage.sql

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES POLICIES
-- Users cannot modify their own role. Only owner can manage roles and view other profiles.
CREATE POLICY "Profiles are viewable by self or owner"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.auth_role() = 'owner');

CREATE POLICY "Users can update own name but cannot change role"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.auth_role() = 'owner')
  WITH CHECK (
    -- If not owner, role and is_active must remain unchanged
    public.auth_role() = 'owner' OR (
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) AND
      is_active = (SELECT p.is_active FROM public.profiles p WHERE p.id = auth.uid())
    )
  );

CREATE POLICY "Owner can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.auth_role() = 'owner');

-- 3. PRODUCTS POLICIES
-- Anon: active products only
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.auth_role() IN ('owner', 'manager', 'staff'));

-- Manager and Owner can insert, update, delete products
CREATE POLICY "Manager and Owner can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.auth_role() IN ('owner', 'manager'));

CREATE POLICY "Manager and Owner can update products"
  ON public.products FOR UPDATE
  USING (public.auth_role() IN ('owner', 'manager'))
  WITH CHECK (public.auth_role() IN ('owner', 'manager'));

CREATE POLICY "Manager and Owner can delete products"
  ON public.products FOR DELETE
  USING (public.auth_role() IN ('owner', 'manager'));

-- 4. SITE SETTINGS POLICIES
-- Public can view settings
CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

-- Only Owner can update site settings (store parameters, exchange rate)
CREATE POLICY "Owner can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.auth_role() = 'owner')
  WITH CHECK (public.auth_role() = 'owner');

-- 5. BRANCHES POLICIES
CREATE POLICY "Public can view active branches"
  ON public.branches FOR SELECT
  USING (is_active = true OR public.auth_role() IN ('owner', 'manager', 'staff'));

CREATE POLICY "Manager and Owner can manage branches"
  ON public.branches FOR ALL
  USING (public.auth_role() IN ('owner', 'manager'))
  WITH CHECK (public.auth_role() IN ('owner', 'manager'));

-- 6. FAQS POLICIES
CREATE POLICY "Public can view active faqs"
  ON public.faqs FOR SELECT
  USING (is_active = true OR public.auth_role() IN ('owner', 'manager', 'staff'));

CREATE POLICY "Manager and Owner can manage faqs"
  ON public.faqs FOR ALL
  USING (public.auth_role() IN ('owner', 'manager'))
  WITH CHECK (public.auth_role() IN ('owner', 'manager'));

-- 7. HERO BANNERS POLICIES
CREATE POLICY "Public can view active hero banners"
  ON public.hero_banners FOR SELECT
  USING (is_active = true OR public.auth_role() IN ('owner', 'manager', 'staff'));

CREATE POLICY "Manager and Owner can manage hero banners"
  ON public.hero_banners FOR ALL
  USING (public.auth_role() IN ('owner', 'manager'))
  WITH CHECK (public.auth_role() IN ('owner', 'manager'));

-- 8. DELIVERY METHODS POLICIES
CREATE POLICY "Public can view enabled delivery methods"
  ON public.delivery_methods FOR SELECT
  USING (is_enabled = true OR public.auth_role() IN ('owner', 'manager', 'staff'));

CREATE POLICY "Manager and Owner can manage delivery methods"
  ON public.delivery_methods FOR ALL
  USING (public.auth_role() IN ('owner', 'manager'))
  WITH CHECK (public.auth_role() IN ('owner', 'manager'));

-- 9. PROMO CODES & REDEMPTIONS POLICIES
-- Anon has NO direct access. Validated exclusively via server action / function.
CREATE POLICY "Staff, Manager and Owner can view promo codes"
  ON public.promo_codes FOR SELECT
  USING (public.auth_role() IN ('owner', 'manager', 'staff'));

CREATE POLICY "Manager and Owner can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (public.auth_role() IN ('owner', 'manager'))
  WITH CHECK (public.auth_role() IN ('owner', 'manager'));

CREATE POLICY "Staff can view promo redemptions"
  ON public.promo_redemptions FOR SELECT
  USING (public.auth_role() IN ('owner', 'manager', 'staff'));

-- 10. ORDERS POLICIES
-- Staff, Manager, Owner can view all orders
CREATE POLICY "Staff, Manager and Owner can view orders"
  ON public.orders FOR SELECT
  USING (public.auth_role() IN ('owner', 'manager', 'staff'));

-- Direct table UPDATE by staff is NOT permitted to enforce column restrictions and transition matrix.
-- All status updates MUST go through the SECURITY DEFINER function update_order_status_secure().
-- Only Owner can update raw order fields if required.
CREATE POLICY "Owner can update orders directly"
  ON public.orders FOR UPDATE
  USING (public.auth_role() = 'owner')
  WITH CHECK (public.auth_role() = 'owner');

-- 11. ORDER ITEMS POLICIES
CREATE POLICY "Staff, Manager and Owner can view order items"
  ON public.order_items FOR SELECT
  USING (public.auth_role() IN ('owner', 'manager', 'staff'));

-- 12. ORDER STATUS HISTORY POLICIES
CREATE POLICY "Staff, Manager and Owner can view status history"
  ON public.order_status_history FOR SELECT
  USING (public.auth_role() IN ('owner', 'manager', 'staff'));

-- 13. AUDIT LOG POLICIES
-- Viewable by Owner and Manager
CREATE POLICY "Owner and Manager can view audit log"
  ON public.audit_log FOR SELECT
  USING (public.auth_role() IN ('owner', 'manager'));

CREATE POLICY "Authenticated users can append audit log"
  ON public.audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 14. PAYMENTS LOG & TRANSACTIONS POLICIES
CREATE POLICY "Owner and Manager can view payment transactions"
  ON public.payment_transactions FOR SELECT
  USING (public.auth_role() IN ('owner', 'manager'));

CREATE POLICY "Owner and Manager can view payments log"
  ON public.payments_log FOR SELECT
  USING (public.auth_role() IN ('owner', 'manager'));

-- 15. SMS LOG & TEMPLATES POLICIES
CREATE POLICY "Staff, Manager and Owner can view sms log"
  ON public.sms_log FOR SELECT
  USING (public.auth_role() IN ('owner', 'manager', 'staff'));

CREATE POLICY "Staff, Manager and Owner can view sms templates"
  ON public.sms_templates FOR SELECT
  USING (public.auth_role() IN ('owner', 'manager', 'staff'));

CREATE POLICY "Manager and Owner can manage sms templates"
  ON public.sms_templates FOR ALL
  USING (public.auth_role() IN ('owner', 'manager'))
  WITH CHECK (public.auth_role() IN ('owner', 'manager'));

-- 16. SUPABASE STORAGE: product-images BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read images
CREATE POLICY "Public Access to product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Uploads: Manager and Owner only
CREATE POLICY "Manager and Owner can upload product-images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    public.auth_role() IN ('owner', 'manager')
  );

CREATE POLICY "Manager and Owner can update product-images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    public.auth_role() IN ('owner', 'manager')
  );

CREATE POLICY "Manager and Owner can delete product-images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    public.auth_role() IN ('owner', 'manager')
  );

