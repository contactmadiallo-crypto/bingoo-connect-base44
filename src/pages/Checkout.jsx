import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { getCart } from '@/lib/cartStore';
import { cartLineTotal } from '@/lib/designStudioCatalog';
import { openExternalUrl, isNativeApp } from '@/lib/nativePlatform';
import { getRegion } from '@/lib/regionSettings';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';
import { localizeShopProduct } from '@/lib/shopI18n';

export default function Checkout() {
  const { language } = useI18n();
  const nativeApp = isNativeApp();
  const cart = getCart();
  useEffect(() => { let meta=document.querySelector('meta[name="robots"]'); if(!meta){meta=document.createElement('meta');meta.setAttribute('name','robots');document.head.appendChild(meta)} meta.setAttribute('content','noindex, nofollow'); return()=>meta.setAttribute('content','index, follow'); }, []);
  const subtotal=cart.reduce((sum,item)=>sum+cartLineTotal(item),0), totalNfcUnits=cart.reduce((sum,item)=>sum+item.quantity,0);
  const [form,setForm]=useState({name:'',email:'',phone:'',address:'',city:'',state:'',zip:'',country:getRegion(),notes:''});
  const [shippingQuote,setShippingQuote]=useState({amountCents:500,service:'Bingoo Standard',etaMinDays:3,etaMaxDays:7,dutiesTerms:'domestic'});
  const total=subtotal+(shippingQuote.amountCents||0)/100;
  useEffect(()=>{let cancelled=false; const timer=setTimeout(async()=>{try{const res=await base44.functions.invoke('getShippingQuote',{country:form.country,subtotal_cents:Math.round(subtotal*100)}); if(!cancelled&&res.data?.amountCents!==undefined)setShippingQuote(res.data);}catch(e){console.warn('Shipping quote unavailable:',e.message)}},250); return()=>{cancelled=true;clearTimeout(timer)}},[form.country,subtotal]);
  const [loading,setLoading]=useState(false); const [error,setError]=useState(null); const idempotencyKeyRef=useRef(null);
  const handleChange=(e)=>setForm({...form,[e.target.name]:e.target.value});

  const handleSubmit=async(e)=>{
    e.preventDefault(); setError(null);
    if(window.self!==window.top){alert(t('checkout_only_published',language));return;}
    if(cart.length===0){setError(t('checkout_empty',language));return;}
    setLoading(true);
    const timeoutId=setTimeout(()=>{setLoading(false);setError(t('checkout_too_long',language));},20000);
    try{
      if(!idempotencyKeyRef.current) idempotencyKeyRef.current='cko-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
      const res=await base44.functions.invoke('createShopCheckout',{
        idempotency_key:idempotencyKeyRef.current,
        customer:{name:form.name,email:form.email,phone:form.phone,address:form.address,city:form.city,state:form.state,zip:form.zip,country:form.country,notes:form.notes},
        items:cart.map(item=>({product_id:item.id,quantity:item.quantity,...(item.customDesign&&{customDesign:item.customDesign})})),
      });
      clearTimeout(timeoutId); const stripeUrl=res?.data?.url,serverError=res?.data?.error;
      if(serverError)throw new Error(serverError); if(!stripeUrl)throw new Error(t('checkout_no_url',language)); await openExternalUrl(stripeUrl);
    }catch(err){clearTimeout(timeoutId);console.error('Checkout error:',err);setLoading(false);setError(err.message||t('checkout_failed_try',language));}
  };

  if(cart.length===0)return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-slate-500 mb-4">{t("checkout_empty",language)}</p><Link to="/shop"><Button>{t("checkout_go_shop",language)}</Button></Link></div></div>;

  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/20 overflow-x-hidden"><div className={`bg-white/80 backdrop-blur-xl border-b border-slate-200 z-20 ${nativeApp ? "relative" : "sticky top-0"}`}><div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 min-w-0"><Link to="/cart" className="text-slate-600 hover:text-slate-900 flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> {t("checkout_back_cart",language)}</Link><h1 className="text-lg sm:text-xl font-bold text-slate-900 sm:ml-2 truncate">{t("checkout_title",language)}</h1><Lock className="w-4 h-4 text-green-500 ml-auto"/><span className="hidden sm:inline text-xs text-slate-500">{t("checkout_secure",language)}</span></div></div><div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 sm:py-8 min-w-0">{error&&<div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4"><AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5"/><div><p className="font-semibold text-sm">{t("checkout_failed",language)}</p><p className="text-sm mt-0.5">{error}</p></div></div>}<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 min-w-0"><div className="space-y-4"><h2 className="text-lg font-bold text-slate-900">{t("checkout_shipping_info",language)}</h2><div><Label>{t("checkout_full_name",language)}</Label><Input name="name" value={form.name} onChange={handleChange} required placeholder={language === "fr" ? "Jean Dupont" : "John Doe"}/></div><div><Label>{t("checkout_email",language)}</Label><Input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@example.com"/></div><div><Label>{t("checkout_phone",language)}</Label><Input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000"/></div><div><Label>{t("checkout_address",language)}</Label><Input name="address" value={form.address} onChange={handleChange} required placeholder={language === "fr" ? "123 rue Principale" : "123 Main St"}/></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><Label>{t("checkout_city",language)}</Label><Input name="city" value={form.city} onChange={handleChange} required placeholder={language === "fr" ? "Paris" : "New York"}/></div><div><Label>{t("checkout_state",language)}</Label><Input name="state" value={form.state} onChange={handleChange} placeholder="NY"/></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><Label>{t("checkout_zip",language)}</Label><Input name="zip" value={form.zip} onChange={handleChange} required placeholder="10001"/></div><div><Label>{t("checkout_country",language)}</Label><Input name="country" value={form.country} onChange={handleChange} required placeholder="US"/></div></div><div><Label>{t("checkout_notes",language)}</Label><Input name="notes" value={form.notes} onChange={handleChange} placeholder={t("checkout_notes_placeholder",language)}/></div></div><div className="min-w-0"><h2 className="text-lg font-bold text-slate-900 mb-4">{t("checkout_order_summary",language)}</h2><div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 mb-4 min-w-0">{cart.map(item=>{const design=item.customDesign||{};const displayItem=localizeShopProduct(item,language);return <div key={item.lineKey||item.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0"><div className="flex justify-between text-sm"><span className="text-slate-700 font-semibold">{displayItem.name} × {item.quantity}</span><span className="font-medium">${cartLineTotal(item).toFixed(2)}</span></div>{(design.colorName||design.finish||design.nameText)&&<p className="mt-1 text-xs text-slate-500">{[design.colorName,design.finish,design.nameText].filter(Boolean).join(' · ')}</p>}</div>})}<div className="flex justify-between text-sm text-slate-500"><span>{t("checkout_total_units",language)}</span><span className="font-semibold text-slate-700">{totalNfcUnits}</span></div><div className="border-t border-slate-100 pt-3 flex justify-between text-sm text-slate-500"><span>{shippingQuote.service||t('checkout_shipping_fallback',language)}</span><span>${((shippingQuote.amountCents||0)/100).toFixed(2)}</span></div><p className="text-[11px] text-slate-400">{t('checkout_estimated',language)} {shippingQuote.etaMinDays}-{shippingQuote.etaMaxDays} {t('checkout_business_days',language)}{shippingQuote.dutiesTerms==='DAP'?` · ${t('checkout_duties',language)}`:''}</p><div className="flex justify-between font-bold text-slate-900 text-lg"><span>{t("checkout_est_total",language)}</span><span>${total.toFixed(2)}</span></div></div><Button type="submit" disabled={loading} className="w-full bg-brand-orange hover:bg-brand-orange-light gap-2 h-12 text-base disabled:opacity-70"><Lock className="w-4 h-4"/>{loading?<span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"/>{t("checkout_redirecting",language)}</span>:t('checkout_continue_payment',language)}</Button><p className="text-xs text-slate-500 text-center mt-2">{t("checkout_design_attached",language)}</p></div></form></div></div>;
}
