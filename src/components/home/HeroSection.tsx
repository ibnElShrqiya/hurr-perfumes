import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingCart, CreditCard, Gift, ShieldCheck, Truck } from 'lucide-react';

const promises = [
  { Icon: Gift, title: 'عروض حصرية', detail: 'وباقات مميزة' },
  { Icon: ShieldCheck, title: 'جودة عالية', detail: 'وثبات يدوم' },
  { Icon: CreditCard, title: 'الدفع', detail: 'عند الاستلام' },
  { Icon: Truck, title: 'شحن سريع', detail: 'لجميع محافظات مصر' },
];

export const HeroSection: React.FC = () => {
  const { setActiveCategory } = useStore();
  const shopNow = () => {
    setActiveCategory('all');
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hurr-home-hero relative isolate overflow-hidden border-b border-[#8a5d24]/45 bg-[#100903] text-right">
      <div className="hurr-home-hero__art" aria-hidden="true">
        <img src="/images/hurr-hero.jpg" alt="" fetchPriority="high" />
      </div>
      <div className="hurr-home-hero__inner relative mx-auto max-w-[1440px]">
        <div className="hurr-home-hero__copy">
          <p className="mb-1 font-serif text-[1.65rem] font-semibold leading-tight text-[#f5cb69] sm:text-3xl">حُرّ...</p>
          <h1 className="font-serif text-[2rem] font-bold leading-[1.4] text-[#f1d092] sm:text-4xl lg:text-[2.8rem]">عطرٌ يليق بالمقام</h1>
          <div className="my-3 flex items-center justify-end gap-2 text-[#d2a443]"><span className="h-px w-20 bg-gradient-to-l from-[#e4b951] to-transparent"/><span className="h-2 w-2 rotate-45 border border-[#e5bd5e]"/><span className="h-px w-20 bg-gradient-to-r from-[#e4b951] to-transparent"/></div>
          <p className="mx-auto max-w-[440px] text-sm leading-7 text-[#f4ede0] sm:text-base sm:leading-8">مجموعة مختارة من العطور الأصيلة<br className="hidden sm:block"/> بهوية عربية راقية</p>
          <button onClick={shopNow} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ffe09a] bg-gradient-to-b from-[#ffe18b] to-[#d99c2b] px-7 font-bold text-[#1e1305] shadow-[0_3px_18px_rgba(228,174,65,.28)] transition hover:brightness-110">
            تسوق الآن <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
        <div className="hurr-home-hero__promises">
          {promises.map(({ Icon, title, detail }) => <div key={title} className="flex items-center justify-center gap-2 border-l border-[#b88a3e]/25 px-1.5 py-2 last:border-l-0 sm:gap-3 sm:px-4">
            <Icon className="h-6 w-6 shrink-0 text-[#e4b84e] sm:h-8 sm:w-8" strokeWidth={1.45} />
            <span className="text-center text-[9px] leading-4 text-[#f0e7d5] sm:text-xs sm:leading-5"><strong className="block font-semibold">{title}</strong><span className="text-[#d2c6b1]">{detail}</span></span>
          </div>)}
        </div>
      </div>
    </section>
  );
};
