import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors });
  try {
    const payload = await req.json();
    const required = ['customerName','customerPhone','governorate','city','detailedAddress','paymentMethod'];
    if (required.some((k) => typeof payload[k] !== 'string' || !payload[k].trim()) || !Array.isArray(payload.items)) throw new Error('بيانات الطلب غير مكتملة');
    if (payload.customerName.length > 120 || payload.city.length > 120 || payload.governorate.length > 120 || payload.detailedAddress.length > 600 || (payload.notes?.length ?? 0) > 500) throw new Error('بعض بيانات الطلب أطول من المسموح');
    if (!/^(010|011|012|015)\d{8}$/.test(payload.customerPhone.replace(/\s/g, ''))) throw new Error('رقم الهاتف غير صالح');
    if (payload.customerEmail != null && (typeof payload.customerEmail !== 'string' || payload.customerEmail.length > 254)) throw new Error('البريد الإلكتروني غير صالح');
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const { data, error } = await db.rpc('create_store_order', { p_payload: payload });
    if (error) throw error;
    return Response.json(data, { headers: cors });
  } catch (e) { return Response.json({ error: e instanceof Error ? e.message : 'تعذر إنشاء الطلب' }, { status: 400, headers: cors }); }
});
