import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { BottleVisual } from '../common/BottleVisual';
import { ShoppingCart, Heart, Star, AlertCircle } from 'lucide-react';

interface ProductCardProps { product: Product; }

const categoryScene: Record<string, string> = {
  men: '/images/collection-men.jpg',
  women: '/images/collection-women.jpg',
  unisex: '/images/collection-unisex.jpg',
  private_collection: '/images/collection-men.jpg',
  offers: '/images/collection-unisex.jpg',
};

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
    <article className="hurr-product-card group relative overflow-hidden rounded-xl border border-[#835b2b] bg-[#120d08] shadow-[0_10px_28px_rgba(0,0,0,.32)] transition hover:border-[#e5b94e]">
      <div className="hurr-product-card__visual relative h-[178px] overflow-hidden sm:h-[192px]">
        <img
          src={categoryScene[product.category] || categoryScene.unisex}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-[1.04] group-hover:opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#110b06]/95 via-[#110b06]/40 to-transparent" />

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={inWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          className="absolute bottom-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#e0b648] bg-[#100a06]/90 text-[#f0c555] transition hover:bg-[#24180b]"
        >
          <Heart className={`h-4 w-4 ${inWishlist ? 'fill-[#e8b949]' : ''}`} />
        </button>

        {product.discountPercentage ? (
          <span className="absolute right-3 top-2 z-10 rounded-full border border-[#ebc866] bg-[#251708]/90 px-2.5 py-1 text-[9px] font-bold text-[#f2d482]">
            خصم {product.discountPercentage}%
          </span>
        ) : product.isBestseller ? (
          <span className="absolute right-3 top-2 z-10 rounded-full bg-gradient-to-b from-[#ffe89e] to-[#d79b2c] px-3 py-1 text-[9px] font-bold text-[#271706]">
            الأكثر مبيعًا
          </span>
        ) : null}

        <button
          type="button"
          onClick={() => setQuickViewProduct(product)}
          className="hurr-product-card__details absolute left-4 top-4 z-[4] max-w-[58%] text-right text-[#fff4e4]"
        >
          <span className="block font-serif text-lg font-bold drop-shadow sm:text-xl">{product.nameAr}</span>
          <span className="mt-1 block text-[11px] text-[#f2cd72]">
            {categoryLabel[product.category] || product.scentFamilyAr}
          </span>
          <span className="mt-2 flex items-center gap-1 text-[11px] text-[#f1c252]" aria-label={`التقييم ${product.rating} من 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} className="h-3 w-3 fill-current" />
            ))}
            <span className="mr-1 text-[9px] text-[#e8dcc7]">({product.reviewsCount})</span>
          </span>
        </button>

        <div className="hurr-product-card__bottle absolute bottom-0 right-3 z-[3] h-[158px] w-[108px] transition-transform duration-500 group-hover:-translate-y-1 sm:right-5 sm:h-[172px] sm:w-[126px]">
          <BottleVisual product={product} size="sm" className="!h-full !w-full" />
        </div>

        {isLowStock && (
          <div className="absolute bottom-2 right-[125px] z-[5] flex items-center gap-1 text-[9px] font-medium text-[#ffe39c]">
            <AlertCircle className="h-3 w-3" /> متبقي {product.stock}
          </div>
        )}
        {isOutOfStock && (
          <span className="absolute bottom-2 right-3 z-[5] rounded bg-black/75 px-2 py-1 text-[9px] text-red-200">
            نفد مؤقتاً
          </span>
        )}
      </div>

      <div className="flex min-h-[62px] items-center justify-between gap-2 border-t border-[#9b7132]/35 bg-gradient-to-b from-[#18110a] to-[#100b07] px-3 py-2.5 sm:px-4">
        <div className="min-w-0 text-left">
          <span className="whitespace-nowrap text-sm font-bold text-[#fff5df] sm:text-base">
            {product.price.toLocaleString('ar-EG')} <span className="text-[10px] font-normal">جنيه</span>
          </span>
          {product.originalPrice && (
            <del className="hurr-product-card__original-price mr-1 whitespace-nowrap">
              {product.originalPrice.toLocaleString('ar-EG')}
            </del>
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
