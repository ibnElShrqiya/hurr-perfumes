import React from 'react';
import { useStore } from '../../context/StoreContext';
import { BottleVisual } from '../common/BottleVisual';
import { Sparkles, ArrowDown, Award, ShieldCheck, Flame, Droplets } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { products, setIsQuizOpen, setActiveCategory } = useStore();
  const heroProduct = products.find((p) => p.isBestseller) || products[0];

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full bg-[#080808] border-b border-[#C5A059]/20 overflow-hidden pt-6 pb-12 lg:py-16">
      {/* Background Decorative Atmospheric Effects */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-gradient-to-b from-[#C5A059]/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-amber-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* 2-Column Split Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text Column (7 cols on lg) */}
          <div className="min-w-0 lg:col-span-7 space-y-6 text-right">
            {/* Quiet Editorial Kicker with Calligraphy Accent */}
            <div className="inline-flex max-w-full flex-wrap items-center gap-2 text-xs text-[#C5A059] font-medium tracking-wide">
              <span className="w-6 h-[1px] bg-[#C5A059]" />
              <span>حكاية الطيب والأصالة من حُرّ للعطور في مصر</span>
              <span className="w-2 h-2 rotate-45 border border-[#C5A059] inline-block" />
            </div>

            {/* Display Headline with balanced typography */}
            <h1 className="max-w-full break-words text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#FBF9F5] leading-[1.25] tracking-tight [text-wrap:balance]">
              طيبٌ من روح الشرق.. <br />
              <span className="gold-gradient-text">أثرٌ طيب يبقى في الذاكرة</span>
            </h1>

            {/* Prose description */}
            <p className="max-w-full text-base sm:text-lg text-[#B0A99B] leading-relaxed max-w-2xl font-light">
              من وحي العود والعنبر والمسك، نصوغ توليفات عطرية بروح شرقية واهتمام بالتفاصيل،
              ونحرص على وضوح المكونات وجودة التجربة، لترافقك رائحة تعبّر عن ذوقك وتترك أثراً طيباً.
            </p>

            {/* Interactive Scent Feature Highlight */}
            <div className="w-full min-w-0 p-4 bg-[#121212]/80 border border-[#C5A059]/30 rounded-xl flex items-center justify-between gap-4 max-w-xl backdrop-blur-sm">
              <div className="flex min-w-0 items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#E5C378] shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-[#EDE8DC]">وعد حُرّ بالجودة</h4>
                  <p className="text-xs text-[#8A8275]">
                    عينة للتجربة مع كل عطر، وسياسة استرجاع واضحة وفق الشروط المعلنة
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToCatalog}
                className="px-6 py-3.5 bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#E5C378] hover:from-[#D4AF37] hover:to-[#FFF3D1] text-[#0A0A0A] font-bold text-sm rounded-lg shadow-[0_4px_20px_rgba(197,160,89,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <span>اكتشف مجموعة حُرّ</span>
                <ArrowDown className="w-4 h-4 text-[#0A0A0A]" />
              </button>

              <button
                onClick={() => setIsQuizOpen(true)}
                className="px-5 py-3.5 bg-[#141414] hover:bg-[#1E1E1E] text-[#EDE8DC] hover:text-[#C5A059] border border-[#C5A059]/40 hover:border-[#C5A059] font-medium text-sm rounded-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <span>دليل اختيار العطر (اكتشف ما يناسبك)</span>
              </button>
            </div>
          </div>

          {/* Media Column (5 cols on lg) - Bottle Visual Presentation */}
          <div className="min-w-0 lg:col-span-5 relative flex items-center justify-center">
            {/* Background circular glowing pedestal */}
            <div className="relative w-full max-w-md aspect-square rounded-2xl bg-gradient-to-b from-[#161513] via-[#101010] to-[#0A0A0A] border border-[#C5A059]/25 p-6 flex flex-col items-center justify-center shadow-2xl overflow-hidden group">
              {/* Subtle gold decorative frame line */}
              <div className="absolute inset-3 border border-[#C5A059]/15 rounded-xl pointer-events-none" />

              {/* Floating Bestseller Tag */}
              <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3 py-1 bg-[#C5A059]/20 border border-[#C5A059]/50 rounded-full text-[11px] font-semibold text-[#E5C378] backdrop-blur-md">
                <Award className="w-3.5 h-3.5" />
                <span>العطر الأكثر اختياراً من عملائنا</span>
              </div>

              {/* The Flacon */}
              <div className="relative z-10 py-4 transform group-hover:scale-105 transition-transform duration-700">
                <BottleVisual product={heroProduct} size="lg" showAromaMist={true} />
              </div>

              {/* Product quick summary bar */}
              <div className="relative z-20 w-full bg-[#111111]/90 border border-[#C5A059]/30 rounded-lg p-3 text-center backdrop-blur-md mt-2">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <span className="text-xs text-[#C5A059] font-semibold block">
                      {heroProduct.nameAr}
                    </span>
                    <span className="text-[11px] text-[#8C8475]">{heroProduct.concentration}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-[#EDE8DC] font-sans tabular-nums">
                      {heroProduct.price.toLocaleString('ar-EG')} ج.م
                    </span>
                    {heroProduct.originalPrice && (
                      <span className="text-[10px] text-[#6E6759] line-through block tabular-nums">
                        {heroProduct.originalPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column KPI Trust Bar below the hero split */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-[#1C1C1C]">
          <div className="p-4 bg-[#101010] border border-[#222] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#8A8275] block">تركيز زيتي نقي</span>
              <span className="text-sm font-bold text-[#EDE8DC]">Extrait de Parfum</span>
            </div>
          </div>

          <div className="p-4 bg-[#101010] border border-[#222] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#8A8275] block">ثبات وفوحان</span>
              <span className="text-sm font-bold text-[#EDE8DC]">+36 ساعة مضمونة</span>
            </div>
          </div>

          <div className="p-4 bg-[#101010] border border-[#222] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#8A8275] block">شحن مجاني</span>
              <span className="text-sm font-bold text-[#EDE8DC]">فوق 1,500 ج.م</span>
            </div>
          </div>

          <div className="p-4 bg-[#101010] border border-[#222] rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#8A8275] block">تقييم العملاء في مصر</span>
              <span className="text-sm font-bold text-[#EDE8DC]">4.95 / 5.0 (تقييم العملاء)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
