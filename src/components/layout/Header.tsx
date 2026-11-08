import React, { useState } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Heart, Search, X, Menu, Sun, Moon } from 'lucide-react';
import { ProductCategory } from '../../types';

interface HeaderProps {
  onOpenHome: () => void;
  onOpenBrandStory: () => void;
  onOpenFaq: () => void;
  isLightMode: boolean;
  onToggleTheme: () => void;
}

type NavItem = { label: string; category?: ProductCategory | 'all'; action?: () => void };

export const Header: React.FC<HeaderProps> = ({ onOpenHome, onOpenBrandStory, onOpenFaq, isLightMode, onToggleTheme }) => {
  const { cartCount, setIsCartOpen, setActiveCategory, searchQuery, setSearchQuery } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks: NavItem[] = [
    { label: 'الرئيسية', category: 'all', action: onOpenHome },
    { label: 'العطور', category: 'all' },
    { label: 'العروض', category: 'offers' },
    { label: 'من نحن', action: onOpenBrandStory },
    { label: 'تواصل معنا', action: onOpenFaq },
  ];

  const navigate = (item: NavItem) => {
    if (item.action) {
      if (item.category === 'all') setActiveCategory('all');
      item.action();
    } else if (item.category) {
      setActiveCategory(item.category);
      onOpenHome();
      window.setTimeout(() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
    setIsMobileMenuOpen(false);
  };

  const openCart = () => setIsCartOpen(true);
  const openWishlist = () => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <header className="hurr-site-header sticky top-0 z-40 w-full border-b border-[#8d6023]/55 bg-[#0c0906]/95 text-[#f4ead8] backdrop-blur-md">
      <div className="hurr-header-main mx-auto grid h-[70px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        <button type="button" className="hurr-mobile-menu-button justify-self-start text-[#f3d486] xl:hidden" onClick={() => setIsMobileMenuOpen((open) => !open)} aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={isMobileMenuOpen}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <nav aria-label="التنقل الرئيسي" className="hurr-desktop-nav col-start-1 row-start-1 hidden items-center gap-5 justify-self-start text-[13px] font-medium xl:flex 2xl:gap-7">
          {navLinks.map((item, index) => <button key={item.label} onClick={() => navigate(item)} className={`relative py-2 transition-colors hover:text-[#f5d47e] ${index === 0 ? 'font-bold text-[#f5d47e]' : 'text-[#f3eee5]'}`}>
            {item.label}{index === 0 && <span className="absolute inset-x-0 -bottom-1 h-px bg-[#ecc25e] shadow-[0_0_8px_rgba(236,194,94,.8)]" />}
          </button>)}
        </nav>

        <a href="/" onClick={(event) => { event.preventDefault(); setActiveCategory('all'); onOpenHome(); setIsMobileMenuOpen(false); }} className="hurr-header-brand col-start-2 row-start-1 justify-self-center" aria-label="الصفحة الرئيسية - حُرّ">
          <BrandLogo size="md" showSubtitle={false} variant={isLightMode ? 'monochrome' : 'gold'} />
        </a>

        <div className="hurr-header-actions col-start-3 row-start-1 hidden items-center justify-self-end xl:flex">
          <label className="hurr-header-search mr-5 flex h-9 w-[238px] items-center gap-2 rounded-full border border-[#80643b] bg-[#18130d] px-3 text-[#f1cf72]">
            <Search className="h-4 w-4 shrink-0" />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ابحث عن عطر..." className="w-full bg-transparent text-right text-xs text-[#f5ead2] outline-none placeholder:text-[#b6aa97]" aria-label="ابحث عن عطر" />
          </label>
          <button onClick={openCart} className="relative mx-2 flex min-w-12 flex-col items-center gap-0.5 text-[#f1dfbc] transition hover:text-[#f5cf70]" aria-label="السلة"><ShoppingBag className="h-5 w-5"/><span className="text-[10px]">السلة</span><span className="absolute -right-0.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-b from-[#ffe89e] to-[#d99b2d] text-[9px] font-bold text-[#211507]">{cartCount}</span></button>
          <button onClick={openWishlist} className="relative mx-2 flex min-w-12 flex-col items-center gap-0.5 text-[#f1dfbc] transition hover:text-[#f5cf70]" aria-label="المفضلة"><Heart className="h-5 w-5"/><span className="text-[10px]">المفضلة</span></button>
          <button onClick={onToggleTheme} className="hurr-theme-toggle theme-nav-toggle mx-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#80643b] text-[#f1cf72] transition hover:bg-[#241a0d]" aria-label={isLightMode ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'} title={isLightMode ? 'الوضع الداكن' : 'الوضع الفاتح'}>{isLightMode ? <Moon className="h-4 w-4"/> : <Sun className="h-4 w-4"/>}</button>
        </div>

        <button onClick={openCart} className="hurr-mobile-cart col-start-3 row-start-1 hidden justify-self-end text-[#efc252]" aria-label={`السلة، ${cartCount} منتجات`}><ShoppingBag className="h-6 w-6"/><span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#f4cc66] text-[9px] font-bold text-[#211507]">{cartCount}</span></button>
      </div>

      {isMobileMenuOpen && <div className="hurr-mobile-menu border-t border-[#805d2e]/45 bg-[#100b07] px-4 pb-4 pt-3 shadow-xl xl:hidden">
        <label className="mb-3 flex h-10 items-center gap-2 rounded-full border border-[#71562f] bg-[#1a130b] px-3 text-[#eac665]"><Search className="h-4 w-4"/><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ابحث عن عطر..." className="w-full bg-transparent text-right text-sm outline-none placeholder:text-[#a99b86]" /></label>
        <nav className="grid grid-cols-2 gap-2" aria-label="قائمة الهاتف">
          {navLinks.map((item) => <button key={`m-${item.label}`} onClick={() => navigate(item)} className="rounded-lg border border-[#76572c]/45 bg-[#17110b] px-3 py-2.5 text-right text-sm text-[#eee1c9] hover:border-[#d8aa4d]">{item.label}</button>)}
        </nav>
        <div className="mt-3 border-t border-[#76572c]/35 pt-3">
          <button onClick={openWishlist} className="inline-flex items-center gap-2 text-xs text-[#e9d7b1]"><Heart className="h-4 w-4 text-[#e8be59]"/> المفضلة</button>
          <button onClick={onToggleTheme} className="mr-5 inline-flex items-center gap-2 text-xs text-[#e9d7b1]" aria-label={isLightMode ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}>{isLightMode ? <Moon className="h-4 w-4 text-[#9a702c]"/> : <Sun className="h-4 w-4 text-[#e8be59]"/>}{isLightMode ? 'الوضع الداكن' : 'الوضع الفاتح'}</button>
        </div>
      </div>}
    </header>
  );
};
