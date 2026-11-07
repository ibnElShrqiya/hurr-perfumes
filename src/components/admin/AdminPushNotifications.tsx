import React, { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import { supabase } from '../../lib/supabase';
type OneSignalApi = { init:(options:{appId:string;allowLocalhostAsSecureOrigin:boolean;safari_web_id?:string})=>Promise<void>; login:(externalId:string)=>Promise<void>; logout:()=>Promise<void>; Notifications:{requestPermission:()=>Promise<boolean>;isPushSupported:()=>boolean}; User:{PushSubscription:{id:string|null|undefined;optedIn:boolean|undefined;optIn:()=>Promise<void>}} };
declare global { interface Window { OneSignalDeferred?: Array<(sdk:OneSignalApi)=>void> } }
const appId=(import.meta.env.VITE_ONESIGNAL_APP_ID as string|undefined)?.trim(); const safariWebId=(import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID as string|undefined)?.trim(); let initPromise:Promise<OneSignalApi>|undefined;
function getOneSignal():Promise<OneSignalApi>{
 if(!appId)return Promise.reject(new Error('أضف VITE_ONESIGNAL_APP_ID إلى إعدادات الموقع.'));
 if(!initPromise)initPromise=new Promise((resolve,reject)=>{
  window.OneSignalDeferred=window.OneSignalDeferred||[];
  window.OneSignalDeferred.push(async sdk=>{try{await sdk.init({appId,allowLocalhostAsSecureOrigin:import.meta.env.DEV,...(safariWebId?{safari_web_id:safariWebId}:{})});resolve(sdk)}catch(error){reject(error)}});
  if(!document.querySelector('script[data-hurr-onesignal]')){const script=document.createElement('script');script.src='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';script.async=true;script.dataset.hurrOnesignal='true';script.onerror=()=>reject(new Error('تعذر تحميل خدمة الإشعارات.'));document.head.appendChild(script)}
 });
 return initPromise;
}
export const AdminPushNotifications:React.FC=()=>{
 const[busy,setBusy]=useState(false);const[message,setMessage]=useState('');
 useEffect(()=>{let alive=true;if(Notification.permission==='granted')void supabase?.auth.getUser().then(async({data})=>{if(data.user&&alive){const sdk=await getOneSignal();await sdk.login(data.user.id)}}).catch(error=>console.warn('[HUR push] Admin identity setup failed',error));return()=>{alive=false}},[]);
 const enable=async()=>{setBusy(true);setMessage('');try{if(!supabase)throw new Error('تعذر التحقق من حساب المدير.');const{data,error}=await supabase.auth.getUser();if(error||!data.user)throw new Error('سجّل دخول المدير أولاً.');const sdk=await getOneSignal();if(!sdk.Notifications.isPushSupported())throw new Error('هذا المتصفح لا يدعم إشعارات Push. جرّب Chrome أو Edge على هذا الجهاز.');await sdk.login(data.user.id);const granted=await sdk.Notifications.requestPermission();if(!granted||Notification.permission!=='granted'){setMessage('لم يتم السماح بالإشعارات. يمكنك تفعيلها من إعدادات المتصفح.');return}await sdk.User.PushSubscription.optIn();for(let attempt=0;attempt<20;attempt++){if(sdk.User.PushSubscription.optedIn===true&&sdk.User.PushSubscription.id){setMessage('تم الاشتراك الفعلي في إشعارات الطلبات على هذا الجهاز.');return}await new Promise(resolve=>window.setTimeout(resolve,250))}throw new Error('سمح المتصفح بالإشعارات، لكن OneSignal لم يُنشئ اشتراكاً لهذا الجهاز. أعد المحاولة بعد تحديث الصفحة.')}catch(error){setMessage(error instanceof Error?error.message:'تعذر تفعيل الإشعارات.')}finally{setBusy(false)}};
 return <section className="mb-6 flex flex-col gap-3 rounded-xl border border-[#C5A059]/30 bg-[#111111] p-4 text-right sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-sm font-bold text-[#E5C378]"><BellRing className="h-4 w-4"/>إشعارات الطلبات الجديدة</h2><p className="mt-1 text-xs text-[#A69F90]">فعّل الإشعارات على هذا الجهاز لتصلك الطلبات حتى عند إغلاق الموقع.</p>{message&&<p role="status" className="mt-2 text-xs text-[#E5C378]">{message}</p>}{!appId&&<p className="mt-2 text-xs text-amber-400">يلزم إعداد معرف تطبيق OneSignal في بيئة الموقع.</p>}</div><button type="button" onClick={()=>void enable()} disabled={busy||!appId} className="shrink-0 rounded-lg bg-[#C5A059] px-4 py-2 text-xs font-bold text-[#0A0A0A] disabled:opacity-50">{busy?'جارٍ التفعيل…':'تفعيل على هذا الجهاز'}</button></section>;
};
