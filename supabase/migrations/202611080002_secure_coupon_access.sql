-- HURR: keep coupon codes and campaign metadata private to store administrators.
-- Coupon validation for customers is performed by the validate-coupon Edge Function
-- with the service role key; final discount calculation remains in create_store_order.
-- Review and back up production before applying. This file is prepared but NOT executed.

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Remove existing policies so no legacy public-read policy can expose active coupon rows.
DO $$
DECLARE policy_row record;
BEGIN
  FOR policy_row IN
    SELECT policyname
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'coupons'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.coupons', policy_row.policyname);
  END LOOP;
END $$;

REVOKE ALL ON TABLE public.coupons FROM PUBLIC;
REVOKE ALL ON TABLE public.coupons FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.coupons TO authenticated;
GRANT SELECT ON TABLE public.coupons TO service_role;

CREATE POLICY coupons_admin_only
  ON public.coupons
  FOR ALL
  TO authenticated
  USING (public.is_store_admin())
  WITH CHECK (public.is_store_admin());

-- service_role bypasses RLS and is used only by trusted Edge Functions.
NOTIFY pgrst, 'reload schema';
