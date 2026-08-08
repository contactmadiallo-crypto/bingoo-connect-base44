import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { getCart } from '@/lib/cartStore';

const SHIPPING_COST = 5;

export default function Checkout() {
  const cart = getCart();
  useEffect(() => { let meta=document.querySelector('meta[name="robots"]'); if(!meta){meta=document.createElement('meta');meta.setAttribute('name','robots');document.head.appendChild(meta)} meta.setAttribute('content','noindex, nofollow'); return()=>meta.setAttribute('content','index, follow'); }, []);
  const subtotal=cart.reduce((sum,item)=>sum+item.price*item.quantity,0), total=subtotal+SHIPPING_COST, totalNfcUnits=cart.reduce((sum,item)=>sum+(item.customDesign?.quantity||item.quantity),0);
  const [form,setForm]=useState({name:'',email:'',phone:'',address:'',city:'',state:'',zip:'',country:'US',notes:''});
  const [loading,setLoading]=useState(false); const [error,setError]=useState(null); const idempotencyKeyRef=useRef(null);
  const handleChange=(e)=>setForm({...form,[e.target.name]:e.target.value});

  const handleSubmit=async(e)=>{
    e.preventDefault(); setError(null);
    if(window.self!==window.top){alert('Checkout is only available from the published app.');return;}
    if(cart.length===0){setError('Your cart is empty.');return;}
    setLoading(true);
    const timeoutId=setTimeout(()=>{setLoading(false);setError('Checkout is taking too long. Please try again.');},20000);
    try{
      if(!idempotencyKeyRef.current) idempotencyKeyRef.current='cko-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
      const res=await base44.functions.invoke('createShopCheckout',{
        idempotency_key:idempotencyKeyRef.current,
        customer:{name:form.name,email:form.email,phone:form.phone,address:form.address,city:form.city,state:form.state,zip:form.zip,country:form.country,notes:form.notes},
        items:cart.map(item=>({product_id:item.id,quantity:item.quantity,...(item.customDesign&&{customDesign:item.customDesign})})),
      });
      clearTimeout(timeoutId); const stripeUrl=res?.data?.url,serverError=res?.data?.error;
      if(serverError)throw new Error(serverError); if(!stripeUrl)throw new Error('No checkout URL returned from server. Please try again.'); window.location.href=stripeUrl;
    }catch(err){clearTimeout(timeoutId);console.error('Checkout error:',err);setLoading(false);setError(err.message||'Checkout failed. Please try again.');}
  };

  if(cart.length===0)return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-slate-500 mb-4">Your cart is empty.</p><Link to="/shop"><Button>Go to Shop</Button></Link></div></div>;

  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/20"><div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-20"><div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3"><Link to="/cart" className="text-slate-600 hover:text-slate-900 flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Back to Cart</Link><h1 className="text-xl font-bold text-slate-900 ml-2">Checkout</h1><Lock className="w-4 h-4 text-green-500 ml-auto"/><span className="text-xs text-slate-500">Secure checkout</span></div></div><div className="max-w-4xl mx-auto px-4 py-8">{error&&<div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4"><AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5"/><div><p className="font-semibold text-sm">Checkout failed</p><p className="text-sm mt-0.5">{error}</p></div></div>}<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-4"><h2 className="text-lg font-bold text-slate-900">Shipping Information</h2><div><Label>Full Name *</Label><Input name="name" value={form.name} onChange={handleChange} required placeholder="John Doe"/></div><div><Label>Email *</Label><Input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@example.com"/></div><div><Label>Phone</Label><Input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000"/></div><div><Label>Address *</Label><Input name="address" value={form.address} onChange={handleChange} required placeholder="123 Main St"/></div><div className="grid grid-cols-2 gap-3"><div><Label>City *</Label><Input name="city" value={form.city} onChange={handleChange} required placeholder="New York"/></div><div><Label>State</Label><Input name="state" value={form.state} onChange={handleChange} placeholder="NY"/></div></div><div className="grid grid-cols-2 gap-3"><div><Label>ZIP Code *</Label><Input name="zip" value={form.zip} onChange={handleChange} required placeholder="10001"/></div><div><Label>Country *</Label><Input name="country" value={form.country} onChange={handleChange} required placeholder="US"/></div></div><div><Label>Order Notes</Label><Input name="notes" value={form.notes} onChange={handleChange} placeholder="Any special instructions?"/></div></div><div><h2 className="text-lg font-bold text-slate-900 mb-4">Order Summary</h2><div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 mb-4">{cart.map(item=>{const design=item.customDesign||{};return <div key={item.lineKey||item.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0"><div className="flex justify-between text-sm"><span className="text-slate-700 font-semibold">{item.name} × {item.customDesign?.quantity||item.quantity}</span><span className="font-medium">${(item.price*item.quantity).toFixed(2)}</span></div>{(design.colorName||design.finish||design.nameText)&&<p className="mt-1 text-xs text-slate-500">{[design.colorName,design.finish,design.nameText].filter(Boolean).join(' · ')}</p>}</div>})}<div className="flex justify-between text-sm text-slate-500"><span>Total NFC Units</span><span className="font-semibold text-slate-700">{totalNfcUnits}</span></div><div className="border-t border-slate-100 pt-3 flex justify-between text-sm text-slate-500"><span>Shipping</span><span>${SHIPPING_COST.toFixed(2)}</span></div><div className="flex justify-between font-bold text-slate-900 text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div></div><Button type="submit" disabled={loading} className="w-full bg-brand-orange hover:bg-brand-orange-light gap-2 h-12 text-base disabled:opacity-70"><Lock className="w-4 h-4"/>{loading?<span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"/>Redirecting to payment…</span>:`Pay $${total.toFixed(2)} securely`}</Button><p className="text-xs text-slate-500 text-center mt-2">Your selected color and finish are attached to the ShopOrder before Stripe payment.</p></div></form></div></div>;
}
