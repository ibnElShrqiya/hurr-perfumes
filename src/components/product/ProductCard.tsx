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
    <article className="hurr-product-card hurr-product-card-v2 group relative overflow-hidden rounded-2xl border border-[#835b2b] bg-[#120d08] shadow-[0_10px_28px_rgba(0,0,0,.32)] transition hover:border-[#e5b94e]">
      <div className="hurr-card-v2-layout">
        <button
          type="button"
          onClick={() => setQuickViewProduct(product)}
          className="hurr-card-v2-image"
          aria-label={`عرض تفاصيل عطر ${product.nameAr}`}
        >
          <span className="hurr-card-v2-image-glow" />
          <span className="hurr-card-v2-bottle-frame">
            <BottleVisual product={product} size="sm" />
          </span>
          {product.discountPercentage ? (
            <span className="hurr-card-v2-discount">خصم {product.discountPercentage}%</span>
          ) : product.isBestseller ? (
            <span className="hurr-card-v2-discount">الأكثر مبيعًا</span>
          ) : null}
        </button>

        <div className="hurr-card-v2-info">
          <div className="hurr-card-v2-heading">
            <div className="min-w-0">
              <span className="hurr-card-v2-category">{categoryLabel[product.category] || product.scentFamilyAr}</span>
              <button type="button" onClick={() => setQuickViewProduct(product)} className="hurr-card-v2-name">
                {product.nameAr}
              </button>
            </div>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={inWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              className="hurr-card-v2-wishlist"
            >
              <Heart className={inWishlist ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
            </button>
          </div>

          <div className="hurr-card-v2-rating" aria-label={`التقييم ${product.rating} من 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} className={`h-3.5 w-3.5 ${index < Math.round(product.rating) ? 'fill-current' : 'opacity-30'}`} />
            ))}
            <span>({product.reviewsCount})</span>
          </div>

          {isLowStock && <div className="hurr-card-v2-stock"><AlertCircle className="h-3 w-3" /> متبقي {product.stock} فقط</div>}
          {isOutOfStock && <span className="hurr-card-v2-out">نفد مؤقتاً</span>}
        </div>
      </div>

      <div className="hurr-card-v2-footer">
        <div className="hurr-card-v2-price">
          <span>{product.price.toLocaleString('ar-EG')} <small>جنيه</small></span>
          {product.originalPrice && <del>{product.originalPrice.toLocaleString('ar-EG')}</del>}
        </div>
        <button
          type="button"
          onClick={() => addToCart(product, 1)}
          disabled={isOutOfStock}
          className={`hurr-card-v2-add ${isOutOfStock ? 'is-disabled' : ''}`}
        >
          <ShoppingCart className="h-3.5 w-3.5" /> {isOutOfStock ? 'نفد' : 'أضف إلى السلة'}
        </button>
      </div>
    </article>
  );
};
