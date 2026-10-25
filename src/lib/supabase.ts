import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
// Support both the legacy Supabase anon key variable and the newer publishable-key name.
const key = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)
)?.trim();
export const supabase = url && key && url.startsWith('https://') ? createClient(url, key) : null;
export const hasSupabaseConfig = Boolean(supabase);

/**
 * Maps the real production products schema to the richer UI model.
 * Current public.products columns: id, name, slug, description, price,
 * image_url, stock, is_active, created_at, updated_at.
 * Keep unsupported presentation-only fields in the UI defaults; never send
 * columns that do not exist in Supabase.
 */
export function fromDbProduct(row: any) {
  const image = typeof row.image_url === 'string' && row.image_url.trim() ? row.image_url : '';
  const active = row.is_active !== false;
  return {
    id: String(row.id),
    name: row.name ?? '',
    nameAr: row.name ?? '',
    slug: row.slug ?? '',
    tagline: '',
    description: row.description ?? '',
    story: '',
    category: 'unisex' as const,
    price: Number(row.price ?? 0),
    originalPrice: undefined,
    discountPercentage: undefined,
    stock: Number(row.stock ?? 0),
    images: image ? [image] : [],
    bottleStyle: 'obsidian' as const,
    rating: 0,
    reviewsCount: 0,
    isBestseller: false,
    isNew: false,
    isFeatured: false,
    volume: '',
    concentration: 'Eau de Parfum' as const,
    longevity: '',
    sillage: '',
    notes: { top: [], heart: [], base: [] },
    scentFamily: 'oud' as const,
    scentFamilyAr: '',
    occasion: '',
    season: '',
    status: active ? (Number(row.stock ?? 0) > 0 ? 'active' : 'out_of_stock') : 'draft',
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

/** Only persist columns that actually exist in public.products. */
export function toDbProduct(p: any) {
  const image = Array.isArray(p.images) ? p.images.find((item: unknown) => typeof item === 'string' && item.trim()) : null;
  return {
    name: String(p.nameAr || p.name || '').trim(),
    slug: String(p.slug || '').trim() || null,
    description: String(p.description || ''),
    price: Number(p.price),
    image_url: image || null,
    stock: Math.max(0, Math.trunc(Number(p.stock) || 0)),
    is_active: p.status !== 'draft' && p.status !== 'out_of_stock',
  };
}

export function fromDbCoupon(row: any) {
  return { code: row.code, discountType: row.discount_type, value: Number(row.value), minOrderAmount: Number(row.min_order_amount), isActive: row.is_active, usageCount: row.usage_count, description: row.description };
}

export function fromDbOrder(row: any) {
  return { id: row.id, customerName: row.customer_name, customerPhone: row.customer_phone,
    customerEmail: row.customer_email || undefined, governorate: row.governorate, city: row.city,
    detailedAddress: row.detailed_address, notes: row.notes || undefined, paymentMethod: row.payment_method,
    paymentStatus: row.payment_status, shippingStatus: row.shipping_status, subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee), discountAmount: Number(row.discount_amount), couponCode: row.coupon_code || undefined,
    totalAmount: Number(row.total_amount), items: (row.order_items || []).map((i: any) => ({ productId: i.product_id,
      productName: i.product_name, productImage: i.product_image, quantity: i.quantity, unitPrice: Number(i.unit_price),
      totalPrice: Number(i.total_price), selectedSize: i.selected_size })), createdAt: row.created_at,
    trackingHistory: row.tracking_history || [] };
}
