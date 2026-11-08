import React from 'react';
import { ArrowLeft, Users, UserRound, UserRoundCheck, type LucideIcon } from 'lucide-react';
import { ProductCategory } from '../../types';
import { useStore } from '../../context/StoreContext';

const collections: { id: ProductCategory; title: string; image: string; Icon: LucideIcon }[] = [
  { id: 'men', title: 'عطور الرجال', image: '/images/collection-men.jpg', Icon: UserRound },
  { id: 'women', title: 'عطور النساء', image: '/images/collection-women.jpg', Icon: UserRoundCheck },
  { id: 'unisex', title: 'عطور للجنسين', image: '/images/collection-unisex.jpg', Icon: Users },
];

export const CollectionShowcase: React.FC = () => {
  const { setActiveCategory } = useStore();

  const openCollection = (category: ProductCategory) => {
    setActiveCategory(category);
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hurr-collections mx-auto max-w-[1440px] px-4 pt-5 text-right sm:px-6 sm:pt-6">
      <h2 className="hurr-ornate-heading"><span>تشكيلة حُرّ</span></h2>
      <div className="hurr-collection-grid grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3">
        {collections.map(({ id, title, image, Icon }) => <button key={id} onClick={() => openCollection(id)} className="hurr-collection group relative flex items-center overflow-hidden rounded-xl border border-[#956126]/75 bg-[#100c09] text-right shadow-[inset_0_0_24px_rgba(0,0,0,.5)] transition hover:border-[#edc35b]">
          <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-l from-[#100906]/90 via-[#100906]/40 to-transparent" />
            <div className="relative z-[1] flex w-full items-center justify-between gap-3 px-5 py-3 sm:px-6">
            <Icon className="h-8 w-8 shrink-0 text-[#edc66a] sm:h-9 sm:w-9" strokeWidth={1.35} />
            <div>
              <span className="block font-serif text-lg font-semibold text-[#fff4e4] sm:text-xl">{title}</span>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#e3bc68] px-3 py-1 text-[10px] font-medium text-[#efd18b] sm:text-xs">تصفح المجموعة <ArrowLeft className="h-3 w-3" /></span>
            </div>
          </div>
        </button>)}
      </div>
    </section>
  );
};
