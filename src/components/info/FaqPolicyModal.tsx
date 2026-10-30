import React, { useState } from 'react';
import { X, HelpCircle, ShieldCheck, Truck, RefreshCw, ChevronDown } from 'lucide-react';

interface FaqPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'faq' | 'shipping' | 'returns';
}

export const FaqPolicyModal: React.FC<FaqPolicyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'faq',
}) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'shipping' | 'returns'>(defaultTab);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'كيف أتعرف إلى مواصفات العطر قبل الطلب؟',
      a: 'تجد المعلومات المعتمدة لكل عطر في صفحته. راجع التفاصيل قبل الطلب، وتواصل مع حُرّ إن احتجت إلى توضيح.',
    },
    {
      q: 'ما شروط الاستبدال والاسترجاع؟',
      a: 'راجع الشروط المعروضة قبل تأكيد الطلب، وتواصل مع خدمة حُرّ إذا احتجت إلى توضيح.',
    },
    {
      q: 'هل يمكنني فحص ومعاينة الشحنة قبل الدفع للمندوب؟',
      a: 'تعتمد خيارات المعاينة على ما يظهر عند تأكيد الطلب. تحقّق من الوسائل المتاحة قبل إتمام الشراء.',
    },
    {
      q: 'كيف يمكنني الدفع عبر فودافون كاش أو إنستاباي مصر؟',
      a: 'تُعرض طرق الدفع المتاحة عند تأكيد الطلب. لا تُحوّل أي مبلغ إلا بعد التأكد من بيانات الدفع المعتمدة من خدمة العملاء.',
    },
    {
      q: 'كم يستغرق توصيل الشحنة داخل مصر؟',
      a: 'تختلف مدة التوصيل حسب المحافظة وشركة الشحن. ستؤكد خدمة العملاء المدة المتوقعة ورسوم التوصيل قبل اعتماد الطلب.',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#0E0E0E] border border-[#C5A059]/40 rounded-2xl p-6 sm:p-8 text-right shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-[#777] hover:text-[#EDE8DC] rounded-full hover:bg-[#1A1A1A]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-[#222] pb-3 mb-6">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'faq'
                ? 'bg-[#C5A059] text-[#0A0A0A]'
                : 'text-[#A69F90] hover:text-[#EDE8DC] bg-[#141414]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>الأسئلة الشائعة</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'shipping'
                ? 'bg-[#C5A059] text-[#0A0A0A]'
                : 'text-[#A69F90] hover:text-[#EDE8DC] bg-[#141414]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>الشحن والتوصيل</span>
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'returns'
                ? 'bg-[#C5A059] text-[#0A0A0A]'
                : 'text-[#A69F90] hover:text-[#EDE8DC] bg-[#141414]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>الاستبدال والاسترجاع</span>
          </button>
        </div>

        {/* Tab 1: FAQs Accordion */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="border border-[#222] rounded-xl overflow-hidden bg-[#121212] transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full p-4 text-right flex items-center justify-between text-xs sm:text-sm font-semibold text-[#EDE8DC] hover:text-[#E5C378]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#C5A059] transition-transform duration-200 shrink-0 mr-2 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-[#9E9687] leading-relaxed border-t border-[#1C1C1C] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Shipping Policy in Egypt */}
        {activeTab === 'shipping' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#B0A99B] leading-relaxed">
            <div className="p-4 bg-[#141414] border border-[#222] rounded-xl space-y-2">
              <h4 className="font-bold text-[#E5C378]">خيارات الشحن داخل مصر:</h4>
              <p className="text-xs">
                تختلف التغطية ومدة التوصيل والرسوم حسب المحافظة، وتظهر التفاصيل قبل تأكيد الطلب.
              </p>
              <ul className="text-xs space-y-1 text-[#C8C2B3] pt-1">
                <li>• <strong>القاهرة والجيزة:</strong> تُؤكد رسوم ومدة التوصيل قبل اعتماد الطلب.</li>
                <li>• <strong>الإسكندرية والقليوبية:</strong> تُؤكد رسوم ومدة التوصيل قبل اعتماد الطلب.</li>
                <li>• <strong>محافظات الدلتا ومدن القناة:</strong> تُؤكد رسوم ومدة التوصيل قبل اعتماد الطلب.</li>
                <li>• <strong>محافظات الصعيد والوجه القبلي:</strong> تُؤكد رسوم ومدة التوصيل قبل اعتماد الطلب.</li>
                <li>• <strong>المحافظات الحدودية:</strong> تُؤكد رسوم ومدة التوصيل قبل اعتماد الطلب.</li>
              </ul>
            </div>

            <div className="p-4 bg-[#181611] border border-[#C5A059]/30 rounded-xl space-y-1">
              <h4 className="font-bold text-[#E5C378]">تفاصيل رسوم الشحن:</h4>
              <p className="text-xs">
                تظهر رسوم الشحن وأي عروض سارية في السلة قبل تأكيد الطلب.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Returns & Guarantee */}
        {activeTab === 'returns' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#B0A99B] leading-relaxed">
            <div className="p-4 bg-[#141414] border border-[#222] rounded-xl space-y-2">
              <h4 className="font-bold text-[#E5C378]">الاستبدال والاسترجاع لدى حُرّ:</h4>
              <p className="text-xs">
                تواصل مع حُرّ قبل إتمام الطلب لمعرفة الشروط السارية. راجع التفاصيل المعروضة قبل تأكيد الشراء.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-[#EDE8DC]">قبل تأكيد طلبك:</h5>
              <ol className="list-decimal list-inside space-y-1.5 text-[#9E9687]">
                <li>اقرأ الشروط المعروضة كاملة قبل إتمام الطلب.</li>
                <li>تأكد من مراجعة تفاصيل المنتج وبيانات الطلب.</li>
                <li>استفسر من خدمة حُرّ عن أي نقطة غير واضحة قبل تأكيد الشراء.</li>
                <li>تخضع معالجة الطلب للشروط المعروضة عند تأكيد الشراء.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer Support Contact */}
        <div className="mt-6 pt-4 border-t border-[#222] flex items-center justify-between text-xs text-[#8A8275]">
          <span>هل تحتاج إلى مساعدة؟</span>
          <a
            href="https://wa.me/201062003963"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C5A059] hover:underline font-semibold"
          >
            تحدث مع خدمة العملاء (01062003963)
          </a>
        </div>
      </div>
    </div>
  );
};
