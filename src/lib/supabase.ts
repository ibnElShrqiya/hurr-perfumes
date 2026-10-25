import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
// Support both the legacy Supabase anon key variable and the newer publishable-key name.
const key = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)
)?.trim();
export const supabase = url && key && url.startsWith('https://') ? createClient(url, key) : null;
export const hasSupabaseConfig = Boolean(supabase);

export function fromDbProduct(row: any) {
  return {
    id: row.id, name: row.name, nameAr: row.name_ar, slug: row.slug, tagline: row.tagline,
    description: row.description, story: row.story, category: row.category, price: Number(row.price),
    originalPrice: row.original_price == null ? undefined : Number(row.original_price),
    discountPercentage: Number(row.discount_percentage) || undefined, stock: row.stock, images: row.images || [],
    bottleStyle: row.bottle_style ?? 'obsidian', rating: Number(row.rating), reviewsCount: row.reviews_count,
    isBestseller: row.is_bestseller, isNew: row.is_new, isFeatured: row.is_featured,
    volume: row.volume, concentration: row.concentration, longevity: row.longevity, sillage: row.sillage,
    notes: row.notes && typeof row.notes === 'object' ? { top: Array.isArray(row.notes.top) ? row.notes.top : [], heart: Array.isArray(row.notes.heart) ? row.notes.heart : [], base: Array.isArray(row.notes.base) ? row.notes.base : [] } : { top: [], heart: [], base: [] }, scentFamily: row.scent_family,
    scentFamilyAr: row.scent_family_ar, occasion: row.occasion, season: row.season,
    status: row.status, createdAt: row.created_at,
  };
}

export function toDbProduct(p: any) {
  return {
    id: p.id, name: p.name, name_ar: p.nameAr, slug: p.slug, tagline: p.tagline,
    description: p.description, story: p.story, category: p.category, price: p.price,
    original_price: p.originalPrice ?? null, discount_percentage: p.discountPercentage ?? 0,
    stock: p.stock, images: p.images, rating: p.rating,
    reviews_count: p.reviewsCount, is_bestseller: p.isBestseller ?? false, is_new: p.isNew ?? false,
    is_featured: p.isFeatured ?? false, volume: p.volume, concentration: p.concentration,
    longevity: p.longevity, sillage: p.sillage, notes: p.notes, scent_family: p.scentFamily,
    scent_family_ar: p.scentFamilyAr, occasion: p.occasion, season: p.season, status: p.status,
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
