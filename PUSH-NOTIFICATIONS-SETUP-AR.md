# إعداد إشعارات الطلبات في حُرّ

تكامل Web Push للمدير فقط، بلا ترحيل قاعدة بيانات. لا ينطلق الإشعار إلا بعد نجاح RPC الخاص بحفظ الطلب. تعطل الإشعار لا يغيّر نتيجة الطلب.

## OneSignal

1. أنشئ حساباً وتطبيقاً من نوع Web Push في OneSignal.
2. أضف نطاق المتجر النهائي عبر HTTPS إلى إعداد الموقع في OneSignal.
3. أضف **App ID** إلى `VITE_ONESIGNAL_APP_ID`، و**Safari Web ID** إلى `VITE_ONESIGNAL_SAFARI_WEB_ID`، ثم أعد نشر الموقع.
4. سجّل الدخول إلى `/admin` بحساب مدير، واسمح بالإشعارات واضغط «تفعيل على هذا الجهاز» على كل جهاز. iPhone يتطلب إضافة الموقع إلى الشاشة الرئيسية.

## Cloudflare

من `cloudflare/notifications-worker` انشر Worker باستخدام Wrangler. أضف الأسرار التالية في Cloudflare: `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`, `HURR_PUSH_WEBHOOK_SECRET`, `PUBLIC_SITE_URL`. استخدم عنوان المتجر النهائي لـ `PUBLIC_SITE_URL` وسراً عشوائياً قوياً لـ `HURR_PUSH_WEBHOOK_SECRET`.

أضف في Supabase Edge Function secrets: `CLOUDFLARE_PUSH_WORKER_URL` و`HURR_PUSH_WEBHOOK_SECRET` بالقيمة المطابقة. أبقِ `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` متاحين لوظيفة الطلب الحالية، ثم أعد نشر `create-order`.

يمكن استخدام عنوان `workers.dev` الافتراضي؛ لا يلزم DNS إضافي. لا يحتاج Worker إلى CORS لأنه يستقبل استدعاءً خادمياً موقّعاً.

## قبل التشغيل

تحتاج حساب OneSignal ومفتاح REST API، نشر Worker وإعداده، إضافة App ID لبيئة الموقع، وربط نطاق HTTPS في OneSignal. تأكد أن حساب المدير موجود في `admin_roles` أو `profiles` بدور `admin`. لا تُرسل بيانات العميل؛ الإشعار عام ويحمل رقم الطلب والرابط المفلتر إلى لوحة الإدارة، وتبقى المصادقة مطلوبة لرؤية التفاصيل.
