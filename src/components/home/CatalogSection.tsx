import React, { useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';

export const CatalogSection: React.FC = () => {
  const {
    products,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    selectedFamily,
    setSelectedFamily,
    sortBy,
    setSortBy,
  } = useStore();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'next' | 'previous') => {
    carouselRef.current?.scrollBy({ left: direction === 'next' ? -360 : 360, behavior: 'smooth' });
  };

  // Filter & Sort Logic
  const visibleProducts = products.filter((product) => product.status !== 'draft');
  const filteredProducts = visibleProducts.filter((product) => {
    // Category match
    const matchCategory =
      activeCategory === 'all' || product.category === activeCategory;

    // Scent Family match
    const matchFamily =
      selectedFamily === 'all' || product.scentFamily === selectedFamily;

    // Search query match
    const query = searchQuery.trim().toLowerCase();
    const matchQuery =
      !query ||
      product.nameAr.toLowerCase().includes(query) ||
      product.tagline.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.notes.top.some((n) => n.toLowerCase().includes(query)) ||
      product.notes.heart.some((n) => n.toLowerCase().includes(query)) ||
      product.notes.base.some((n) => n.toLowerCase().includes(query));

    return matchCategory && matchFamily && matchQuery;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    // 'featured' default
    return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
  });

  return (
    <section id="catalog-section" className="mx-auto max-w-[1440px] space-y-5 px-4 py-5 text-right sm:px-6 sm:py-7">
      <div className="relative flex items-center justify-center border-0 pb-1">
        <h2 className="hurr-ornate-heading">أبرز العطور</h2>
        <div className="absolute left-0 flex items-center gap-3">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} aria-label="ترتيب العطور" className="rounded-lg border border-[#76582f] bg-[#170f08] p-2 text-xs text-[#ead8b6] focus:border-[#C5A059] focus:outline-none">
            <option value="featured">الأكثر طلباً وتميزاً</option>
            <option value="price_asc">السعر: من الأقل للأعلى</option>
            <option value="price_desc">السعر: من الأعلى للأقل</option>
            <option value="rating">الأعلى تقييماً (★)</option>
          </select>
        </div>
      </div>

      {/* Active Search Notification */}
      {searchQuery && (
        <div className="p-3 bg-[#16140F] border border-[#C5A059]/30 rounded-lg text-xs text-[#E5C378] flex items-center justify-between">
          <span>نتائج البحث عن: «{searchQuery}»</span>
          <button onClick={() => setSearchQuery('')} className="text-[#888] hover:text-white">
            مسح البحث
          </button>
        </div>
      )}

      {/* Products 3-Column Grid */}
      {sortedProducts.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-[#111111] border border-[#222] rounded-2xl p-8">
          <p className="text-base font-serif font-bold text-[#EDE8DC]">
            {visibleProducts.length === 0 ? 'تُجهّز مجموعة حُرّ للإطلاق' : 'لم نجد عطراً يطابق بحثك الحالي'}
          </p>
          <p className="text-xs text-[#8A8275] max-w-sm mx-auto leading-6">
            {visibleProducts.length === 0
              ? 'ستظهر هنا المنتجات المعتمدة وأسعارها فور إضافتها من لوحة الإدارة. لا نعرض منتجات أو أسعارًا تجريبية.'
              : 'جرّب تعديل كلمات البحث أو إعادة ضبط عوامل التصفية.'}
          </p>
          {visibleProducts.length > 0 && <button
            onClick={() => { setActiveCategory('all'); setSelectedFamily('all'); setSearchQuery(''); }}
            className="px-5 py-2.5 bg-[#C5A059] text-[#0A0A0A] font-bold text-xs rounded-lg"
          >إعادة ضبط التصفية</button>}
        </div>
      ) : (
        <div className="hurr-carousel-frame relative">
          <div ref={carouselRef} className="hurr-featured-carousel grid grid-flow-col overflow-x-auto no-scrollbar">
            {sortedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
          {sortedProducts.length > 1 && <>
            <button onClick={() => scrollCarousel('previous')} aria-label="العطر السابق" className="hurr-carousel-arrow absolute -right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#9d6d29] bg-[#291909]/95 text-[#f3c65e] shadow-lg sm:flex">‹</button>
            <button onClick={() => scrollCarousel('next')} aria-label="العطر التالي" className="hurr-carousel-arrow absolute -left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#9d6d29] bg-[#291909]/95 text-[#f3c65e] shadow-lg sm:flex">›</button>
          </>}
        </div>
      )}
    </section>
  );
};
