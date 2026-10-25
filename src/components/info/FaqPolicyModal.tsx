import React, { useState } from 'react';
import { X, HelpCircle, ShieldCheck, Truck, RefreshCw, ChevronDown } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD } from '../../data/governorates';

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
      q: 'كيف أضمن ثبات وفوحان عطور دار حُرّ قبل الشراء؟',
      a: 'كافة عطورنا مصنعة بتركيز إكستريت دي بارفان (Extrait de Parfum) بزيوت عطرية نقية معتقة لا تقل نسبتها عن 30-40%، مما يضمن ثباتاً يتجاوز 36 ساعة على الملابس وفوحاناً أصيلاً واسعاً. إضافة إلى ذلك، نرفق عينة مجانية بحجم 3 مل مع كل طلب لتجربتها قبل فتح تغليف العطر الأصلي.',
    },
    {
      q: 'ما هو الضمان الذهبي لدار حُرّ وسياسة الاسترجاع؟',
      a: 'نضمن لك رضاك التام بنسبة 100%. عند استلام الطلب، قم بتجربة العينة المرفقة أولاً. إذا لم يتوافق العطر مع ذوقك الرفيع، يحق لك استرجاع الزجاجة المغلفة بالكامل خلال 14 يوماً واسترداد كامل ثمنها دون أي تعقيد وفقاً لقوانين جهاز حماية المستهلك المصري.',
    },
    {
      q: 'هل يمكنني فحص ومعاينة الشحنة قبل الدفع للمندوب؟',
      a: 'نعم بالتأكيد! عند اختيار الدفع عند الاستلام (COD)، نتيح لك فحص الشحنة والتأكد من سلامة الزجاجات والختم المذهب والعينة قبل سداد المبلغ للمندوب.',
    },
    {
      q: 'كيف يمكنني الدفع عبر فودافون كاش أو إنستاباي مصر؟',
      a: 'يمكنك اختيار الدفع عبر المحافظ الإلكترونية، وتحويل قيمة الطلب مباشرة إلى رقم الهاتف المعتمد لدار حُرّ: 01062003963 أو عبر إنستاباي، وكتابة رقم هاتفك المحول منه في صفحة الدفع ليتم تأكيد الطلب فوراً.',
    },
    {
      q: 'كم يستغرق توصيل الشحنة داخل مصر؟',
      a: 'يستغرق التوصيل للقاهرة والجيزة من 24 إلى 48 ساعة فقط. الإسكندرية ومدن الدلتا والقناة خلال يومين، ومحافظات الصعيد والحدودية خلال 3 إلى 5 أيام كحد أقصى.',
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
            <span>الشحن والتوصيل في مصر</span>
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
            <span>الضمان الذهبي والاسترجاع</span>
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
              <h4 className="font-bold text-[#E5C378]">تغطية الشحن لكافة المحافظات المصرية (27 محافظة):</h4>
              <p className="text-xs">
                نتعاون مع أفضل شركات الشحن السريع الموثوقة لضمان وصول عطرك محكم التغليف في
                أسرع وقت.
              </p>
              <ul className="text-xs space-y-1 text-[#C8C2B3] pt-1">
                <li>• <strong>القاهرة والجيزة:</strong> 45 ج.م (توصيل خلال 24 ساعة).</li>
                <li>• <strong>الإسكندرية والقليوبية:</strong> 55 ج.م (توصيل خلال 24-48 ساعة).</li>
                <li>• <strong>محافظات الدلتا ومدن القناة:</strong> 60-65 ج.م (خلال 2-3 أيام).</li>
                <li>• <strong>محافظات الصعيد والوجه القبلي:</strong> 70-85 ج.م (خلال 3-4 أيام).</li>
                <li>• <strong>شمال وجنوب سيناء والبحر الأحمر ومطروح:</strong> 90-95 ج.م.</li>
              </ul>
            </div>

            <div className="p-4 bg-[#181611] border border-[#C5A059]/30 rounded-xl space-y-1">
              <h4 className="font-bold text-[#E5C378]">ميزة الشحن المجاني الأصيل:</h4>
              <p className="text-xs">
                أي طلب تتجاوز قيمته <strong>{FREE_SHIPPING_THRESHOLD.toLocaleString('ar-EG')} ج.م</strong> يحصل تلقائياً على شحن مجاني كامل إلى أي عنوان داخل جمهورية مصر العربية!
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Returns & Guarantee */}
        {activeTab === 'returns' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#B0A99B] leading-relaxed">
            <div className="p-4 bg-[#141414] border border-[#222] rounded-xl space-y-2">
              <h4 className="font-bold text-[#E5C378]">الضمان الأصيل الذهبي لدار حُرّ:</h4>
              <p className="text-xs">
                ثقتنا في جودة ونقاء عطورنا لا حدود لها. لهذا السبب نرفق مع كل زجاجة عطرية «عينة مجانية بحجم 3 مل» من نفس العطر لتقوم بتجربتها على بشرتك وملابسك قبل فتح الزجاجة الأصلية.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h5 className="font-bold text-[#EDE8DC]">شروط الاستبدال والاسترجاع:</h5>
              <ol className="list-decimal list-inside space-y-1.5 text-[#9E9687]">
                <li>مدة الاسترجاع 14 يوماً من تاريخ استلام الشحنة وفقاً لقانون حماية المستهلك المصري.</li>
                <li>يجب أن تكون زجاجة العطر الأصلية مغلفة بتغليف السوليفان المصنعي ولم يتم فتحها.</li>
                <li>العينة المجانية هي هديتك من دار حُرّ ويمكنك الاحتفاظ بها حتى في حال استرجاع العطر.</li>
                <li>يتم استرداد كامل المبلغ إلى حسابك البنكي أو محفظتك الإلكترونية فور وصول الشحنة وفحصها.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer Support Contact */}
        <div className="mt-6 pt-4 border-t border-[#222] flex items-center justify-between text-xs text-[#8A8275]">
          <span>تحتاج لمساعدة إضافية؟</span>
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
