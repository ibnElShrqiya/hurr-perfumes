import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { CatalogSection } from './components/home/CatalogSection';
import { BrandStorySection } from './components/brand/BrandStorySection';
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderTrackingPage } from './components/tracking/OrderTrackingPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ScentQuizModal } from './components/home/ScentQuizModal';
import { FaqPolicyModal } from './components/info/FaqPolicyModal';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { ToastContainer } from './components/common/ToastContainer';
import { Order } from './types';

type AppView = 'store' | 'checkout' | 'tracking' | 'admin' | 'brand_story';

function MainApp() {
  const [currentView, setCurrentView] = useState<AppView>('store');
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [faqTab, setFaqTab] = useState<'faq' | 'shipping' | 'returns'>('faq');
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('hurr_theme') === 'light');

  useEffect(() => {
    localStorage.setItem('hurr_theme', isLightMode ? 'light' : 'dark');
  }, [isLightMode]);

  const { quickViewProduct, setQuickViewProduct } = useStore();

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleOrderCompleted = (order: Order) => {
    setActiveTrackingOrder(order);
    setCurrentView('tracking');
  };

  const handleOpenFaqWithTab = (tab: 'faq' | 'shipping' | 'returns') => {
    setFaqTab(tab);
    setIsFaqOpen(true);
  };

  return (
    <div className={`hurr-app min-h-screen bg-[#080808] text-[#EDE8DC] flex flex-col justify-between selection:bg-[#C5A059] selection:text-[#0A0A0A] ${isLightMode ? 'light-mode' : ''}`}>
      <button
        type="button"
        onClick={() => setIsLightMode((value) => !value)}
        aria-label={isLightMode ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
        title={isLightMode ? 'الوضع الداكن' : 'الوضع الفاتح'}
        className="hurr-theme-toggle fixed bottom-5 left-5 z-[70] flex items-center gap-2 rounded-full border border-[#C5A059]/50 bg-[#111] px-4 py-3 text-sm font-semibold text-[#E5C378] shadow-xl transition hover:scale-105"
      >
        {isLightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        <span>{isLightMode ? 'الوضع الداكن' : 'الوضع الفاتح'}</span>
      </button>

      {/* Top Header */}
      <Header
        onOpenTracking={() => setCurrentView('tracking')}
        onOpenAdmin={() => setCurrentView('admin')}
        onOpenBrandStory={() => {
          setCurrentView('brand_story');
        }}
        onOpenFaq={() => handleOpenFaqWithTab('faq')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'store' && (
          <>
            <HeroSection />
            <CatalogSection />
            <BrandStorySection />
          </>
        )}

        {currentView === 'brand_story' && (
          <div className="py-8">
            <BrandStorySection />
          </div>
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onBackToStore={() => setCurrentView('store')}
            onOrderCompleted={handleOrderCompleted}
          />
        )}

        {currentView === 'tracking' && (
          <OrderTrackingPage
            initialOrder={activeTrackingOrder}
            onBackToStore={() => {
              setActiveTrackingOrder(null);
              setCurrentView('store');
            }}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onBackToStore={() => setCurrentView('store')} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenBrandStory={() => setCurrentView('brand_story')}
        onOpenFaq={() => handleOpenFaqWithTab('faq')}
        onOpenTracking={() => setCurrentView('tracking')}
      />

      {/* Modals & Drawers */}
      {/* 1. Product Detail Modal */}
      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onInstantCheckout={() => {
            setQuickViewProduct(null);
            setCurrentView('checkout');
          }}
        />
      )}

      {/* 2. Slide-over Shopping Cart Drawer */}
      <CartDrawer
        onProceedToCheckout={() => {
          setCurrentView('checkout');
        }}
      />

      {/* 3. Interactive Scent Quiz Assistant */}
      <ScentQuizModal />

      {/* 4. FAQs & Egyptian Return Policy Modal */}
      <FaqPolicyModal
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
        defaultTab={faqTab}
      />

      {/* 5. Floating Luxury Egypt WhatsApp Concierge */}
      <FloatingWhatsApp />

      {/* 6. Notifications Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
