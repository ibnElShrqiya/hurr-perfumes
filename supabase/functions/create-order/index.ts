
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

const telegramText = (value: unknown): string => {
  if (value == null) return 'غير محدد';
  return String(value).slice(0, 500);
};

async function sendTelegramNotification(
  db: ReturnType<typeof createClient>,
  savedOrder: any,
  payload: any,
) {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

  if (!token || !chatId) {
    console.warn('[create-order] Telegram secrets missing');
    return;
  }

  const orderId = savedOrder?.id;
  if (!orderId) {
    console.warn('[create-order] Telegram skipped: order ID missing');
    return;
  }

  // Read trusted order data from the database after saving.
  const { data: order, error: orderError } = await db
    .from('orders')
    .select('id, order_number, customer_name, phone, governorate, city, address, total, payment_method')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.warn('[create-order] Telegram order lookup failed', orderError?.message);
    return;
  }

  const { data: items, error: itemsError } = await db
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (itemsError) {
    console.warn('[create-order] Telegram items lookup failed', itemsError.message);
  }

  const productLines = (items ?? []).map((item: any) => {
    const name = item.product_name ?? item.name ?? 'منتج';
    const quantity = item.quantity ?? 1;
    return `• ${telegramText(name)} × ${quantity}`;
  });

  const products = productLines.length
    ? productLines.join('\n')
    : 'راجع تفاصيل المنتجات في لوحة الإدارة';

  const paymentMethods: Record<string, string> = {
    cod: 'الدفع عند الاستلام',
    online: 'الدفع الإلكتروني',
  };

  const message = [
    '🛍️ طلب جديد | متجر حُرّ',
    '',
    `📦 رقم الطلب: #${telegramText(order.order_number ?? order.id)}`,
    `👤 العميل: ${telegramText(order.customer_name)}`,
    `📱 الهاتف: ${telegramText(order.phone)}`,
    `📍 المحافظة: ${telegramText(order.governorate)}`,
    `🏙️ المدينة: ${telegramText(order.city)}`,
    `🏠 العنوان: ${telegramText(order.address)}`,
    '',
    '🛒 المنتجات:',
    products,
    '',
    `💰 الإجمالي: ${telegramText(order.total)} جنيه مصري`,
    `💳 الدفع: ${paymentMethods[order.payment_method] ?? telegramText(order.payment_method)}`,
    '',
    'افتح لوحة إدارة حُرّ لمراجعة الطلب.',
  ].join('\n').slice(0, 4000);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const result = await response.text();
      console.warn('[create-order] Telegram delivery failed', {
        status: response.status,
        response: result.slice(0, 300),
      });
      return;
    }

    console.info('[create-order] Telegram notification sent', {
      orderId: String(orderId),
    });
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405, headers: cors },
    );
  }

  try {
    const payload = await req.json();

    const required = [
      'customerName',
      'customerPhone',
      'governorate',
      'city',
      'detailedAddress',
      'paymentMethod',
    ];

    if (
      required.some(
        (k) => typeof payload[k] !== 'string' || !payload[k].trim(),
      ) ||
      !Array.isArray(payload.items)
    ) {
      throw new Error('بيانات الطلب غير مكتملة');
    }

    if (
      payload.customerName.length > 120 ||
      payload.city.length > 120 ||
      payload.governorate.length > 120 ||
      payload.detailedAddress.length > 600 ||
      (payload.notes?.length ?? 0) > 500
    ) {
      throw new Error('بعض بيانات الطلب أطول من المسموح');
    }

    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

    let phone = String(payload.customerPhone)
      .replace(/[٠-٩]/g, (digit) =>
        String(arabicDigits.indexOf(digit))
      )
      .replace(/[۰-۹]/g, (digit) =>
        String(persianDigits.indexOf(digit))
      )
      .replace(/[^\d+]/g, '');

    if (phone.startsWith('+20')) {
      phone = `0${phone.slice(3)}`;
    } else if (phone.startsWith('0020')) {
      phone = `0${phone.slice(4)}`;
    }

    if (!/^(010|011|012|015)\d{8}$/.test(phone)) {
      throw new Error('رقم الهاتف غير صالح');
    }

    payload.customerPhone = phone;

    if (
      payload.customerEmail != null &&
      (
        typeof payload.customerEmail !== 'string' ||
        payload.customerEmail.length > 254
      )
    ) {
      throw new Error('البريد الإلكتروني غير صالح');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        '[create-order] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY secret',
      );

      return Response.json(
        {
          error: 'خدمة الطلبات غير مكتملة الإعداد على الخادم. يرجى التواصل مع إدارة المتجر.',
        },
        { status: 500, headers: cors },
      );
    }

    const db = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await db.rpc('create_store_order', {
      p_payload: payload,
    });

    if (error) {
      console.error('[create-order] Database RPC failed', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      throw new Error(
        error.message || 'تعذر حفظ الطلب في قاعدة البيانات',
      );
    }

    // Notify only after the order has been saved successfully.
    // Telegram failures must never affect checkout.
    const savedOrder = data?.order ?? data;

    try {
      await sendTelegramNotification(db, savedOrder, payload);
    } catch (telegramError) {
      console.warn(
        '[create-order] Telegram notification failed; order was saved',
        telegramError instanceof Error
          ? telegramError.message
          : 'unknown error',
      );
    }

    return Response.json(data, { headers: cors });

  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'تعذر إنشاء الطلب';

    console.error('[create-order] Request rejected', message);

    return Response.json(
      { error: message },
      { status: 400, headers: cors },
    );
  }
});
