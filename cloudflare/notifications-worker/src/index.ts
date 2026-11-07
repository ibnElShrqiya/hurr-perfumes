interface Env{ONESIGNAL_APP_ID:string;ONESIGNAL_REST_API_KEY:string;HURR_PUSH_WEBHOOK_SECRET:string;PUBLIC_SITE_URL:string}
const enc=new TextEncoder();const hex=(b:ArrayBuffer)=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
function equal(a:string,b:string){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0}
export default{async fetch(request:Request,env:Env):Promise<Response>{
 if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
 if(!env.ONESIGNAL_APP_ID||!env.ONESIGNAL_REST_API_KEY||!env.HURR_PUSH_WEBHOOK_SECRET||!env.PUBLIC_SITE_URL)return Response.json({error:'Push service is not configured'},{status:503});
 const raw=await request.text();const key=await crypto.subtle.importKey('raw',enc.encode(env.HURR_PUSH_WEBHOOK_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const expected='sha256='+hex(await crypto.subtle.sign('HMAC',key,enc.encode(raw)));if(!equal(request.headers.get('X-HURR-Signature')||'',expected))return Response.json({error:'Unauthorized'},{status:401});
 let payload:{orderId?:unknown;adminUserIds?:unknown};try{payload=JSON.parse(raw)}catch{return Response.json({error:'Invalid JSON'},{status:400})}
 const orderId=typeof payload.orderId==='string'?payload.orderId.trim():'';const ids=Array.isArray(payload.adminUserIds)?[...new Set(payload.adminUserIds.filter((id):id is string=>typeof id==='string'&&id.length>0&&id.length<128))]:[];
 if(!orderId||orderId.length>128)return Response.json({error:'Invalid order id'},{status:400});if(!ids.length)return Response.json({delivered:0});
 let site:URL;try{site=new URL(env.PUBLIC_SITE_URL)}catch{return Response.json({error:'Invalid site URL'},{status:500})}if(site.protocol!=='https:')return Response.json({error:'HTTPS site URL required'},{status:500});
 const link=new URL('/admin',site);link.searchParams.set('order',orderId);
 const result=await fetch('https://api.onesignal.com/notifications?c=push',{method:'POST',headers:{Authorization:'Key '+env.ONESIGNAL_REST_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({app_id:env.ONESIGNAL_APP_ID,target_channel:'push',include_aliases:{external_id:ids},headings:{ar:'متجر حُرّ'},contents:{ar:'لديك طلب جديد يحتاج إلى المراجعة.'},url:link.toString(),data:{orderId}})});
 if(!result.ok){console.error('[hurr-push] OneSignal rejected notification',result.status);return Response.json({error:'Push delivery failed'},{status:502})}return Response.json({delivered:1});
}};
