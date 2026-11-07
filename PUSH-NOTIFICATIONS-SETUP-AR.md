# إعداد إشعارات الطلبات في حُرّ

تكامل Web Push للمدير فقط، بلا ترحيل قاعدة بيانات. لا ينطلق الإشعار إلا بعد نجاح RPC الخاص بحفظ الطلب. تعطل الإشعار لا يغيّر نتيجة الطلب.

## OneSignal

1. التطبيق المستخدم هو `hurr`، والنطاق الفعلي `https://hurr-web-site.pages.dev`.
2. أضف **App ID** إلى `VITE_ONESIGNAL_APP_ID` و**Safari Web ID** إلى `VITE_ONESIGNAL_SAFARI_WEB_ID في بيئة بناء Cloudflare Pages.
3. يستخدم الموقع تكامل Custom Code وزر التفعيل داخل لوحة الإدارة. لا تفعّل زر OneSignal العام ولا تنشئ مطالبة اشتراك للزوار.
4. سجّل الدخول إلى `/admin` بحساب مدير واسمح بالإشعارات على كل جهاز. على iPhone، أضف الموقع إلى الشاشة الرئيسية.

## Cloudflare Pages Function

الاستقبال يعمل بوظيفة Cloudflare Pages ضمن بيئة Workers، على المسار `POST /api/push`. بعد تجهيز الكود، اضبط Production variables/secrets في مشروع Cloudflare Pages `hurr-web-site`:

- Variables: `ONESIGNAL_APP_ID`, `PUBLIC_SITE_URL=https://hurr-web-site.pages.dev`
- Secrets: `ONESIGNAL_REST_API_KEY`, `HURR_PUSH_WEBHOOK_SECRET`

أضف متغيري الواجهة `VITE_ONESIGNAL_APP_ID` و`VITE_ONESIGNAL_SAFARI_WEB_ID` إلى إعدادات البناء نفسها. لا تضع REST API Key أو HMAC secret في متغيرات `VITE_` أو المستودع.

في Supabase Edge Function secrets اضبط `CLOUDFLARE_PUSH_WORKER_URL=https://hurr-web-site.pages.dev/api/push` و`HURR_PUSH_WEBHOOK_SECRET` بالقيمة المشتركة نفسها. اترك `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` متاحين لوظيفة إنشاء الطلب الحالية، ثم أعد نشر `create-order`.

تعطل OneSignal أو Cloudflare لا يغيّر نتيجة الطلب المحفوظ. يرسل النظام تنبيهاً عاماً ورقم الطلب فقط، ويظل تسجيل دخول المدير مطلوباً لعرض التفاصيل.

## التشغيل

- لا يلزم DNS إضافي لـ Worker لأننا نستخدم نطاق Pages الحالي.
- قبل الإطلاق الفعلي: دمج التغيير، ضبط الأسرار في Pages وSupabase، ثم نشر الواجهة ووظيفة `create-order`.
