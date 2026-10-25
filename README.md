# متجر حُرّ | HURR PARFUMS D'ORIENT

متجر عربي للعطور الشرقية بهوية حُرّ السوداء والذهبية، مبني بـ React وTypeScript وVite. يدعم قاعدة Supabase حقيقية عند ضبط متغيرات البيئة. لا يستخدم بيانات محلية كبديل لقبول الطلبات.

## المتطلبات

- Node.js 20.19+ أو 22.12+، وnpm
- مشروع Supabase
- Supabase CLI عند استخدام أوامر النشر أدناه

## التشغيل محلياً

```sh
npm install
Copy-Item .env.example .env.local
npm run dev
```

أضف عنوان مشروع Supabase ومفتاحه العام إلى `.env.local`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

لا تضع `service_role` أو مفاتيح بوابة الدفع في متغيرات `VITE_` أو في المتصفح.

## إعداد Supabase للمرة الأولى

1. أنشئ مشروع Supabase وسجّل Project Ref.
2. اربط مجلد المشروع: `supabase link --project-ref YOUR_PROJECT_REF`.
3. طبّق المخطط والسياسات: `supabase db push`.
4. فعّل **Anonymous Sign-Ins** ضمن إعدادات مزوّدي الدخول في Supabase؛ يستخدم المتجر جلسة مجهولة موقّعة لاستدعاء دوال الطلب والتتبع، ولا يتطلب العميل إنشاء حساب.
5. أنشئ أول مستخدم مدير من **Authentication → Users** في لوحة Supabase، ثم انسخ UUID الخاص به.
6. من **SQL Editor** نفّذ، مع استبدال UUID:

   ```sql
   insert into public.profiles (user_id, role)
   values ('YOUR_AUTH_USER_UUID', 'admin')
   on conflict (user_id) do update set role = 'admin';
   ```

7. انشر الدالتين:

   ```sh
   supabase functions deploy create-order
   supabase functions deploy track-order
   ```

   تضبط Supabase تلقائياً `SUPABASE_URL` و`SUPABASE_SERVICE_ROLE_KEY` للدوال. لا تنسخ المفتاح السري إلى إعدادات الواجهة.

8. سجّل الدخول إلى `/admin` بالبريد وكلمة المرور للمستخدم المدير. إذا كانت قاعدة البيانات فارغة، يضيف تسجيل المدير الأول المنتجات والكوبونات الابتدائية مرة واحدة، بصلاحيات قاعدة البيانات. تحقّق من ظهورها في واجهة المتجر.
9. أعد بناء ونشر الموقع بعد ضبط متغيرات البيئة. استخدم عنوان HTTPS في الإنتاج.

## الأمان وسير العمل

- سياسات RLS تحصر قراءة بيانات الطلبات والعملاء وتعديل المنتجات والكوبونات على دور `admin`.
- المتجر يقرأ المنتجات النشطة والكوبونات المتاحة فقط.
- إنشاء الطلب يتم عبر Edge Function، وتعيد قاعدة البيانات احتساب السعر والخصم والشحن، وتقفل صفوف المخزون داخل معاملة واحدة، وتكتب `orders` و`order_items` وتخصم المخزون قبل نجاح العملية.
- يعيد التتبع حالة الشحن والدفع والملخص فقط، ويتطلب رمزاً عشوائياً خاصاً. يحفظ المتصفح الرمز على جهاز إتمام الطلب ويعرضه للعميل ليحتفظ به. لا يسمح البحث برقم الهاتف وحده.
- سجّل الخروج من لوحة الإدارة لإبطال جلسة Supabase.

## الدفع

الدفع عند الاستلام والتحويل اليدوي يُسجلان كـ `pending` للمراجعة. الدفع بالبطاقة معطل ولا يجمع بيانات البطاقة. لإطلاق الدفع الإلكتروني، اربط Paymob أو بوابة معتمدة عبر جلسة دفع مستضافة ودالة webhook تتحقق من التوقيع ثم تحدّث حالة الدفع. لا تعتبر تحويل Vodafone Cash أو InstaPay مدفوعاً قبل التحقق اليدوي.

## الفحوصات

```sh
npm run lint
npm run build
```

## التواصل والهوية

تظل الواجهة العربية RTL، وألوان الأسود المطفي والذهب والعاج، وشعار ومواد دار حُرّ كما في ملفات المشروع.
 

## النشر على Cloudflare Pages

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: اتركه فارغاً إذا كان `package.json` في جذر المستودع.
- استخدم `package-lock.json` مع npm، ولا تترك `bun.lock` في المستودع إلا إذا كنت ستحدّثه مع كل تغيير في `package.json`.
- أضف متغيري `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` في إعدادات المشروع على Cloudflare Pages. المفتاح يجب أن يكون المفتاح العام/anon فقط، وليس `service_role`.
- لا ترفع ملف `.env.local` أو أي مفاتيح سرية إلى GitHub.

بعد النشر، راجع سجل البناء وتأكد أن Vite أنشأ مجلد `dist`.
