interface Env {
  ONESIGNAL_APP_ID: string;
  ONESIGNAL_REST_API_KEY: string;
  HURR_PUSH_WEBHOOK_SECRET: string;
  PUBLIC_SITE_URL: string;
}
interface PagesContext { request: Request; env: Env; }
const encoder = new TextEncoder();
function toHex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, '0')).join('');
}
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  if (!env.ONESIGNAL_APP_ID || !env.ONESIGNAL_REST_API_KEY || !env.HURR_PUSH_WEBHOOK_SECRET || !env.PUBLIC_SITE_URL) {
    return Response.json({ error: 'Push service is not configured' }, { status: 503 });
  }
  const rawBody = await request.text();
  const key = await crypto.subtle.importKey('raw', encoder.encode(env.HURR_PUSH_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = `sha256=${toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody)))}`;
  if (!safeEqual(request.headers.get('X-HURR-Signature') || '', expected)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let payload: { orderId?: unknown; adminUserIds?: unknown };
  try { payload = JSON.parse(rawBody); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const orderId = typeof payload.orderId === 'string' ? payload.orderId.trim() : '';
  const adminUserIds = Array.isArray(payload.adminUserIds)
    ? [...new Set(payload.adminUserIds.filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length < 128))]
    : [];
  if (!orderId || orderId.length > 128) return Response.json({ error: 'Invalid order id' }, { status: 400 });
  if (!adminUserIds.length) return Response.json({ delivered: 0 }, { status: 200 });
  let siteUrl: URL;
  try { siteUrl = new URL(env.PUBLIC_SITE_URL); } catch { return Response.json({ error: 'Invalid site URL' }, { status: 500 }); }
  if (siteUrl.protocol !== 'https:') return Response.json({ error: 'HTTPS site URL required' }, { status: 500 });
  const orderUrl = new URL('/admin', siteUrl);
  orderUrl.searchParams.set('order', orderId);
  const response = await fetch('https://api.onesignal.com/notifications?c=push', {
    method: 'POST',
    headers: { Authorization: `Key ${env.ONESIGNAL_REST_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: env.ONESIGNAL_APP_ID,
      target_channel: 'push',
      include_aliases: { external_id: adminUserIds },
      headings: { ar: 'متجر حُرّ' },
      contents: { ar: 'لديك طلب جديد يحتاج إلى المراجعة.' },
      url: orderUrl.toString(),
      data: { orderId },
    }),
  });
  const result = await response.json().catch(() => null) as { id?: unknown; recipients?: unknown; errors?: unknown } | null;
  const recipients = Number(result?.recipients ?? 0);
  if (!response.ok || recipients < 1) {
    console.error('[hurr-push] OneSignal did not deliver to an active subscription', { status: response.status, recipients, errors: result?.errors });
    return Response.json({ error: recipients < 1 ? 'No active admin push subscription matched' : 'Push delivery failed' }, { status: 502 });
  }
  return Response.json({ delivered: recipients, messageId: typeof result?.id === 'string' ? result.id : undefined }, { status: 200 });
}
