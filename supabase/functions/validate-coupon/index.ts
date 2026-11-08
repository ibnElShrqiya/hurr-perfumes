import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

const json = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, { status, headers: cors });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ valid: false, error: 'Method not allowed' }, 405);

  try {
    const payload = await req.json();
    const code = typeof payload?.code === 'string' ? payload.code.trim().toUpperCase() : '';
    const items = payload?.items;

    if (!code || code.length > 64 || /\\s/.test(code)) {
      return json({ valid: false, error: 'كود الخصم غير صالح.' }, 400);
    }
    if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
      return json({ valid: false, error: 'أضف منتجات إلى السلة أولاً.' }, 400);
    }

    const normalizedItems: Array<{ productId: string; quantity: number }> = [];
    const seen = new Set<string>();
    for (const item of items) {
      const productId = typeof item?.productId === 'string' ? item.productId.trim() : '';
      const quantity = Number(item?.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 50 || seen.has(productId)) {
        return json({ valid: false, error: 'بيانات المنتجات أو الكميات غير صالحة.' }, 400);
      }
      seen.add(productId);
      normalizedItems.push({ productId, quantity });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[validate-coupon] Missing Supabase service configuration');
      return json({ valid: false, error: 'خدمة التحقق من الكوبونات غير متاحة حالياً.' }, 500);
    }

    const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const productIds = normalizedItems.map((item) => item.productId);
    const { data: products, error: productsError } = await db
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError) {
      console.error('[validate-coupon] Product lookup failed', productsError.message);
      return json({ valid: false, error: 'تعذر التحقق من المنتجات حالياً.' }, 500);
    }

    const productById = new Map((products ?? []).map((product: any) => [String(product.id), product]));
    let subtotal = 0;
    for (const item of normalizedItems) {
      const product: any = productById.get(item.productId);
      if (!product) return json({ valid: false, error: 'أحد المنتجات لم يعد متاحاً.' }, 400);
      const isActive = product.is_active !== undefined
        ? Boolean(product.is_active)
        : product.status !== undefined
          ? product.status === 'active'
          : true;
      const price = Number(product.price);
      const stock = Number(product.stock);
      if (!isActive || !Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < item.quantity) {
        return json({ valid: false, error: 'أحد المنتجات غير متاح أو أن الكمية المطلوبة غير متوفرة.' }, 400);
      }
      subtotal += price * item.quantity;
    }

    const { data: coupon, error: couponError } = await db
      .from('coupons')
      .select('code, discount_type, value, min_order_amount, is_active, usage_count, max_uses, expires_at, description')
      .eq('code', code)
      .maybeSingle();

    if (couponError) {
      console.error('[validate-coupon] Coupon lookup failed', couponError.message);
      return json({ valid: false, error: 'تعذر التحقق من الكوبون حالياً.' }, 500);
    }

    const valid = coupon &&
      coupon.is_active === true &&
      (!coupon.expires_at || new Date(coupon.expires_at).getTime() > Date.now()) &&
      (coupon.max_uses == null || Number(coupon.usage_count) < Number(coupon.max_uses));

    if (!valid) return json({ valid: false, error: 'كود الخصم غير صحيح أو منتهي الصلاحية أو استنفد عدد استخداماته.' }, 200);

    const minOrderAmount = Number(coupon.min_order_amount ?? 0);
    const value = Number(coupon.value);
    if (subtotal < minOrderAmount) {
      return json({
        valid: false,
        error: `هذا الكوبون يتطلب حداً أدنى للطلب بقيمة ${minOrderAmount.toLocaleString('ar-EG')} ج.م.`,
      }, 200);
    }
    if (!Number.isFinite(value) || value <= 0 || (coupon.discount_type === 'percentage' && value > 100)) {
      console.error('[validate-coupon] Invalid coupon configuration', { code });
      return json({ valid: false, error: 'إعدادات كود الخصم غير صالحة. تواصل مع إدارة المتجر.' }, 500);
    }

    const rawDiscount = coupon.discount_type === 'percentage' ? subtotal * value / 100 : value;
    const discountAmount = Math.min(subtotal, Math.round(rawDiscount * 100) / 100);

    // Return only the entered coupon's customer-facing result, never the coupon table or usage metadata.
    return json({
      valid: true,
      couponCode: coupon.code,
      description: coupon.description || 'تم تطبيق الخصم',
      subtotal,
      discountAmount,
    });
  } catch (error) {
    console.error('[validate-coupon] Request failed', error instanceof Error ? error.message : 'unknown error');
    return json({ valid: false, error: 'تعذر التحقق من كود الخصم. حاول مرة أخرى.' }, 400);
  }
});
