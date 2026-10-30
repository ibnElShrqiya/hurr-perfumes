-- HURR: Fix order RPC compatibility with the deployed products schema.
-- The original secure-store schema defines products.id as TEXT and products.status.
-- A later compatibility migration introduced is_active while retaining TEXT identifiers.
-- This migration is safe to re-run and preserves all existing product identifiers.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.create_store_order(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  it jsonb;
  p public.products%ROWTYPE;
  n integer;
  sub numeric(10,2) := 0;
  disc numeric(10,2) := 0;
  ship numeric(10,2);
  total numeric(10,2);
  c public.coupons%ROWTYPE;
  oid text;
  tok text;
  code text;
  product_is_active boolean;
BEGIN
  IF jsonb_typeof(p_payload->'items') <> 'array'
     OR jsonb_array_length(p_payload->'items') NOT BETWEEN 1 AND 30 THEN
    RAISE EXCEPTION 'يجب إضافة منتج واحد على الأقل إلى الطلب';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_payload->'items') AS item(value)
    WHERE nullif(item.value->>'productId', '') IS NULL
       OR nullif(item.value->>'quantity', '') IS NULL
  ) THEN
    RAISE EXCEPTION 'بيانات المنتجات أو الكميات غير مكتملة';
  END IF;

  IF (
    SELECT count(DISTINCT value->>'productId')
    FROM jsonb_array_elements(p_payload->'items')
  ) <> jsonb_array_length(p_payload->'items') THEN
    RAISE EXCEPTION 'يوجد منتج مكرر في الطلب';
  END IF;

  -- Lock rows before calculating totals to prevent concurrent overselling.
  FOR it IN SELECT value FROM jsonb_array_elements(p_payload->'items') LOOP
    n := (it->>'quantity')::integer;
    IF n < 1 OR n > 50 THEN
      RAISE EXCEPTION 'كمية المنتج غير صالحة';
    END IF;

    SELECT *
      INTO p
      FROM public.products
     WHERE id = it->>'productId'
     FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'أحد المنتجات المطلوبة غير موجود';
    END IF;

    product_is_active := COALESCE(
      (to_jsonb(p)->>'is_active')::boolean,
      (to_jsonb(p)->>'status') = 'active',
      true
    );

    IF NOT product_is_active OR p.stock < n THEN
      RAISE EXCEPTION 'أحد المنتجات غير متاح أو أن الكمية المطلوبة غير متوفرة';
    END IF;

    sub := sub + p.price * n;
  END LOOP;

  code := nullif(upper(trim(p_payload->>'couponCode')), '');
  IF code IS NOT NULL THEN
    SELECT *
      INTO c
      FROM public.coupons
     WHERE coupons.code = code
       AND is_active
       AND (expires_at IS NULL OR expires_at > now())
       AND (max_uses IS NULL OR usage_count < max_uses)
     FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'كود الخصم غير صالح أو منتهي أو استنفد مرات الاستخدام';
    END IF;

    IF sub < COALESCE(c.min_order_amount, 0) THEN
      RAISE EXCEPTION 'قيمة الطلب أقل من الحد الأدنى لاستخدام الكوبون';
    END IF;

    IF c.discount_type = 'percentage' AND c.value > 100 THEN
      RAISE EXCEPTION 'نسبة الخصم غير صالحة';
    END IF;

    disc := LEAST(
      sub,
      ROUND(
        CASE
          WHEN c.discount_type = 'percentage' THEN sub * c.value / 100
          ELSE c.value
        END,
        2
      )
    );
  END IF;

  SELECT fee
    INTO ship
    FROM public.shipping_rates
   WHERE governorate = p_payload->>'governorate'
     AND active = true;

  IF ship IS NULL THEN
    RAISE EXCEPTION 'منطقة التوصيل غير مدعومة حالياً';
  END IF;

  -- Free delivery applies when the payable merchandise subtotal reaches EGP 1000.
  IF sub - disc >= 1000 THEN
    ship := 0;
  END IF;

  total := GREATEST(0, sub - disc + ship);
  oid := 'HURR-EG-' || upper(substr(encode(gen_random_bytes(5), 'hex'), 1, 8));
  tok := encode(gen_random_bytes(24), 'hex');

  INSERT INTO public.orders (
    id, tracking_token_hash, customer_name, customer_phone, customer_email,
    governorate, city, detailed_address, notes, payment_method,
    subtotal, shipping_fee, discount_amount, coupon_code, total_amount
  )
  VALUES (
    oid,
    encode(digest(tok, 'sha256'), 'hex'),
    p_payload->>'customerName',
    p_payload->>'customerPhone',
    nullif(p_payload->>'customerEmail', ''),
    p_payload->>'governorate',
    p_payload->>'city',
    p_payload->>'detailedAddress',
    nullif(p_payload->>'notes', ''),
    p_payload->>'paymentMethod',
    sub, ship, disc, code, total
  );

  FOR it IN SELECT value FROM jsonb_array_elements(p_payload->'items') LOOP
    n := (it->>'quantity')::integer;

    SELECT *
      INTO p
      FROM public.products
     WHERE id = it->>'productId'
     FOR UPDATE;

    -- Keep both supported availability representations synchronized when present.
    UPDATE public.products
       SET stock = stock - n
     WHERE id = p.id;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'products'
         AND column_name = 'is_active'
    ) AND p.stock - n = 0 THEN
      EXECUTE 'UPDATE public.products SET is_active = false WHERE id = $1'
      USING p.id;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'products'
         AND column_name = 'status'
    ) AND p.stock - n = 0 THEN
      EXECUTE 'UPDATE public.products SET status = ''out_of_stock'' WHERE id = $1'
      USING p.id;
    END IF;

    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_image,
      selected_size, quantity, unit_price
    )
    VALUES (
      oid,
      p.id,
      COALESCE(to_jsonb(p)->>'name_ar', to_jsonb(p)->>'name', ''),
      COALESCE(
        to_jsonb(p)->>'image_url',
        to_jsonb(p)->'images'->>0,
        ''
      ),
      COALESCE(it->>'selectedSize', ''),
      n,
      p.price
    );
  END LOOP;

  IF code IS NOT NULL THEN
    UPDATE public.coupons
       SET usage_count = usage_count + 1
     WHERE coupons.code = code;
  END IF;

  RETURN jsonb_build_object(
    'id', oid,
    'trackingToken', tok,
    'subtotal', sub,
    'shippingFee', ship,
    'discountAmount', disc,
    'totalAmount', total,
    'couponCode', code,
    'items', (
      SELECT COALESCE(
        jsonb_agg(jsonb_build_object(
          'productId', i.product_id,
          'productName', i.product_name,
          'productImage', i.product_image,
          'quantity', i.quantity,
          'unitPrice', i.unit_price,
          'totalPrice', i.total_price,
          'selectedSize', i.selected_size
        )),
        '[]'::jsonb
      )
      FROM public.order_items i
      WHERE i.order_id = oid
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_store_order(jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_store_order(jsonb) TO service_role;

-- Tracking continues to require the unguessable one-time token; no customer PII is exposed.
CREATE OR REPLACE FUNCTION public.track_store_order(p_id text, p_token text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE
    WHEN o.id IS NULL THEN NULL
    ELSE jsonb_build_object(
      'id', o.id,
      'shippingStatus', o.shipping_status,
      'paymentStatus', o.payment_status,
      'paymentMethod', o.payment_method,
      'subtotal', o.subtotal,
      'shippingFee', o.shipping_fee,
      'discountAmount', o.discount_amount,
      'totalAmount', o.total_amount,
      'createdAt', o.created_at,
      'trackingHistory', o.tracking_history,
      'items', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'productName', i.product_name,
          'quantity', i.quantity,
          'unitPrice', i.unit_price,
          'totalPrice', i.total_price,
          'selectedSize', i.selected_size
        ))
        FROM public.order_items i
        WHERE i.order_id = o.id
      ), '[]'::jsonb)
    )
  END
  FROM public.orders o
  WHERE o.id = p_id
    AND o.tracking_token_hash = encode(digest(p_token, 'sha256'), 'hex');
$$;

REVOKE ALL ON FUNCTION public.track_store_order(text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_store_order(text, text) TO service_role;

NOTIFY pgrst, 'reload schema';
