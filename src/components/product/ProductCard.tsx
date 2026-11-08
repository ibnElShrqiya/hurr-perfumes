import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { BottleVisual } from '../common/BottleVisual';
import { ShoppingCart, Heart, Star, AlertCircle } from 'lucide-react';

interface ProductCardProps { product: Product; }

const categoryLabel: Record<string, string> = {
  men: 'عطر رجالي',
  women: 'عطر نسائي',
  unisex: 'عطر للجنسين',
  private_collection: 'مجموعة حُرّ',
  offers: 'عرض خاص',
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useStore();
  const inWishlist = isInWishlist(product.id);
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  return (
    <article className="hurr-product-card group relative overflow-hidden rounded-2xl border border-[#835b2b] bg-[#120d08] shadow-[0_10px_28px_rgba(0,0,0,.32)] transition hover:border-[#e5b94e]">
      <div className="hurr-product-card__body">
        <button
          type="button"
          onClick={() => setQuickViewProduct(product)}
          className="hurr-product-card__image relative flex items-center justify-center overflow-hidden"
          aria-label={`عرض تفاصيل عطر ${product.nameAr}`}
        >
          <span className="hurr-product-card__image-glow" />
          <BottleVisual product={product} size="sm" className="h-full w-full !max-w-full" />
          {product.discountPercentage ? (
            <span className="hurr-product-card__discount">خصم {product.discountPercentage}%</span>
          ) : product.isBestseller ? (
            <span className="hurr-product-card__discount">الأكثر مبيعًا</span>
          ) : null}
        </button>

        <div className="hurr-product-card__info">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="mb-1 block text-[10px] font-medium text-[#d9b96f]">{categoryLabel[product.category] || product.scentFamilyAr}</span>
              <button
                type="button"
                onClick={() => setQuickViewProduct(product)}
                className="block text-right font-serif text-lg font-bold leading-relaxed text-[#fff4e4] transition hover:text-[#f2cd72]"
              >
                {product.nameAr}
              </button>
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={inWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#8d6a36] bg-[#1b130b] text-[#f0c555] transition hover:bg-[#30200d]"
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-[#e8b949]' : ''}`} />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-1 text-[#f1c252]" aria-label={`التقييم ${product.rating} من 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} className={`h-3.5 w-3.5 ${index < Math.round(product.rating) ? 'fill-current' : 'opacity-30'}`} />
            ))}
            <span className="mr-1 text-[10px] text-[#c8b99f]">({product.reviewsCount})</span>
          </div>

          {isLowStock && (
            <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-[#ffe39c]">
              <AlertCircle className="h-3 w-3" /> متبقي {product.stock} فقط
            </div>
          )}
          {isOutOfStock && (
            <span className="mt-3 inline-flex rounded-md bg-red-950/50 px-2 py-1 text-[10px] text-red-200">نفد مؤقتاً</span>
          )}
        </div>
      </div>

      <div className="hurr-product-card__footer flex min-h-[62px] items-center justify-between gap-2 border-t border-[#9b7132]/35 bg-gradient-to-b from-[#18110a] to-[#100b07] px-3 py-2.5 sm:px-4">
        <div className="min-w-0 text-left">
          <span className="whitespace-nowrap text-sm font-bold text-[#fff5df] sm:text-base">
            {product.price.toLocaleString('ar-EG')} <span className="text-[10px] font-normal">جنيه</span>
          </span>
          {product.originalPrice && (
            <span className="mr-1 whitespace-nowrap text-[10px] text-[#9b8a70] line-through">{product.originalPrice.toLocaleString('ar-EG')}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => addToCart(product, 1)}
          disabled={isOutOfStock}
          className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-bold transition sm:text-xs ${isOutOfStock ? 'cursor-not-allowed border-[#554a37] bg-[#29251e] text-[#807969]' : 'border-[#f2cc6f] bg-gradient-to-b from-[#ffe08a] to-[#d7982b] text-[#211505] hover:brightness-110'}`}
        >
          <ShoppingCart className="h-3.5 w-3.5" /> {isOutOfStock ? 'نفد' : 'أضف إلى السلة'}
        </button>
      </div>
    </article>
  );
};
