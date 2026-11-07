import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json; charset=utf-8' };
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors });
  try {
    const payload = await req.json();
    const required = ['customerName','customerPhone','governorate','city','detailedAddress','paymentMethod'];
    if (required.some((k) => typeof payload[k] !== 'string' || !payload[k].trim()) || !Array.isArray(payload.items)) throw new Error('بيانات الطلب غير مكتملة');
    if (payload.customerName.length > 120 || payload.city.length > 120 || payload.governorate.length > 120 || payload.detailedAddress.length > 600 || (payload.notes?.length ?? 0) > 500) throw new Error('بعض بيانات الطلب أطول من المسموح');
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    let phone = String(payload.customerPhone)
      .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
      .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
      .replace(/[^\d+]/g, '');
    if (phone.startsWith('+20')) phone = `0${phone.slice(3)}`;
    else if (phone.startsWith('0020')) phone = `0${phone.slice(4)}`;
    if (!/^(010|011|012|015)\d{8}$/.test(phone)) throw new Error('رقم الهاتف غير صالح');
    payload.customerPhone = phone;
    if (payload.customerEmail != null && (typeof payload.customerEmail !== 'string' || payload.customerEmail.length > 254)) throw new Error('البريد الإلكتروني غير صالح');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[create-order] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY secret');
      return Response.json({ error: 'خدمة الطلبات غير مكتملة الإعداد على الخادم. يرجى التواصل مع إدارة المتجر.' }, { status: 500, headers: cors });
    }
    const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data, error } = await db.rpc('create_store_order', { p_payload: payload });
    if (error) {
      console.error('[create-order] Database RPC failed', { message: error.message, code: error.code, details: error.details, hint: error.hint });
      throw new Error(error.message || 'تعذر حفظ الطلب في قاعدة البيانات');
    }
    // Notify admins only after the database RPC has committed the order.
    // Delivery failures must never turn a successful order into a checkout failure.
    const savedOrder = data?.order ?? data;
    const orderId = savedOrder?.id;
    const workerUrl = Deno.env.get('CLOUDFLARE_PUSH_WORKER_URL');
    const webhookSecret = Deno.env.get('HURR_PUSH_WEBHOOK_SECRET');
    if (orderId && workerUrl && webhookSecret) {
      try {
        const [adminRoles, profileRoles] = await Promise.all([
          db.from('admin_roles').select('user_id').eq('role', 'admin'),
          db.from('profiles').select('user_id').eq('role', 'admin'),
        ]);
        const adminUserIds = [...new Set([
          ...(adminRoles.data || []).map((row: any) => row.user_id),
          ...(profileRoles.data || []).map((row: any) => row.user_id),
        ].filter((id: unknown): id is string => typeof id === 'string' && id.length > 0))];
        if (adminUserIds.length) {
          const body = JSON.stringify({ orderId: String(orderId), adminUserIds });
          const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(webhookSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
          const signatureBytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)));
          const signature = [...signatureBytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          try {
            const pushResponse = await fetch(workerUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-HURR-Signature': `sha256=${signature}` },
              body, signal: controller.signal,
            });
            if (!pushResponse.ok) console.warn('[create-order] Push delivery failed with status', pushResponse.status);
          } finally { clearTimeout(timeout); }
        }
      } catch (pushError) {
        console.warn('[create-order] Push delivery failed; order was saved', pushError instanceof Error ? pushError.message : 'unknown error');
      }
    }
    return Response.json(data, { headers: cors });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'تعذر إنشاء الطلب';
    console.error('[create-order] Request rejected', message);
    return Response.json({ error: message }, { status: 400, headers: cors });
  }
});
