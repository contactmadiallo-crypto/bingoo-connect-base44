import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Eye, Save, ShoppingCart, Upload, WandSparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { addToCart } from '@/lib/cartStore';
import { getDesignStudioProduct } from '@/lib/designStudioCatalog';
import { getDrafts, saveDraft } from '@/lib/draftStore';
import { PRODUCT_TYPES, ProductTypeIcon, ProductPreview } from '@/components/bingoo/designStudio/ProductPreview';

const NAVY='#0b2149', ORANGE='#f97316', BORDER='#e5eaf2', MUTED='#64748b', BG='#f7f9fc';
const CARD_COLORS=['#F1F5F9','#0b2149','#0F172A','#3b82f6','#0d9488','#7C1D3A','#8b5cf6','#f97316','#D4AF37','#B76E79'];
const ACCENTS=['#f97316','#D4A017','#0b2149','#3b82f6','#0d9488','#22c55e','#ec4899'];
const FINISHES=['Matte','Glossy','Frosted'];
const TEMPLATES=[
 {id:'modern',name:'Modern',cardColor:'#F1F5F9',accentColor:'#D4A017',finish:'Frosted',pattern:null},
 {id:'minimal',name:'Minimal',cardColor:'#F8FAFC',accentColor:'#0b2149',finish:'Matte',pattern:null},
 {id:'corporate',name:'Corporate',cardColor:'#0b2149',accentColor:'#3b82f6',finish:'Matte',pattern:null},
 {id:'creative',name:'Creative',cardColor:'#F1F5F9',accentColor:'#f97316',finish:'Glossy',pattern:{enabled:true,opacity:8,size:'large',direction:'corner_fade',coverage:'full'}},
];
const UNIT_PRICE=3.99, SETUP_FEE=25, REMOVE_BRANDING_FEE=2.5, SHIPPING=5;

export default function DesignStudio({ isDark }) {
 const navigate=useNavigate(), fileInputRef=useRef(null);
 const [productType,setProductType]=useState('card'), [side,setSide]=useState('front');
 const [logoUrl,setLogoUrl]=useState(null), [uploading,setUploading]=useState(false);
 const [cardColor,setCardColor]=useState('#F1F5F9'), [accentColor,setAccentColor]=useState('#D4A017');
 const [nameText,setNameText]=useState(''), [holderName,setHolderName]=useState(''), [roleText,setRoleText]=useState('');
 const [phone,setPhone]=useState(''), [email,setEmail]=useState(''), [website,setWebsite]=useState('');
 const [finish,setFinish]=useState('Frosted'), [quantity,setQuantity]=useState(1), [removeBranding,setRemoveBranding]=useState(false);
 const [brandPattern,setBrandPattern]=useState({enabled:false,opacity:8,size:'medium',direction:'straight',coverage:'full'});
 const [activeTemplate,setActiveTemplate]=useState('modern'), [ordered,setOrdered]=useState(false), [saved,setSaved]=useState(false);
 const [assignProfileId,setAssignProfileId]=useState(''), [userProfiles,setUserProfiles]=useState([]);
 useEffect(()=>{ base44.auth.me().then(u=>u?.id&&base44.entities.Profile.filter({created_by_id:u.id}).then(setUserProfiles).catch(()=>{})).catch(()=>{}); },[]);
 const productLabel=PRODUCT_TYPES.find(p=>p.id===productType)?.label||'Card';
 const subtotal=UNIT_PRICE*quantity+SETUP_FEE+(removeBranding?REMOVE_BRANDING_FEE:0), total=subtotal+SHIPPING;
 const previewProps={productType,cardColor,accentColor,logoUrl,nameText,holderName,roleText,phone,email,website,removeBranding,finish,isDark:false,brandPattern,templateId:activeTemplate};
 const upload=async e=>{const file=e.target.files?.[0]; if(!file)return; setUploading(true); try{const {file_url}=await base44.integrations.Core.UploadFile({file});setLogoUrl(file_url);}finally{setUploading(false)}};
 const save=()=>{saveDraft({productType,cardColor,accentColor,nameText,holderName,roleText,phone,email,website,assignProfileId,finish,quantity,logoUrl,removeBranding,brandPattern,name:`${nameText||'Untitled'} — ${productLabel}`});setSaved(true);setTimeout(()=>setSaved(false),1400)};
 const add=()=>{const p=getDesignStudioProduct(productType,'business');addToCart({...p},quantity,{productType,cardColor,accentColor,nameText,holderName,roleText,phone,email,website,assignProfileId,finish,quantity,logoUrl,removeBranding,brandPattern,designMode:'business',designStore:true});setOrdered(true);setTimeout(()=>navigate('/cart'),800)};
 const input='w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-300';
 return <div className="bg-[#f7f9fc] text-slate-900 rounded-2xl overflow-hidden border border-slate-200">
   <div className="px-5 lg:px-7 py-5 bg-white border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
    <div><h1 className="text-3xl font-black text-[#0b2149]">Design Studio</h1><p className="text-sm text-slate-500">Create your own NFC device. Your brand. Your way.</p></div>
    <div className="flex items-center gap-8 text-xs font-bold text-slate-500"><span className="text-[#0b2149] flex items-center gap-2"><WandSparkles className="w-4 h-4"/>Design</span><span className="flex items-center gap-2"><Eye className="w-4 h-4"/>Preview</span><span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4"/>Checkout</span></div>
   </div>
   <div className="grid 2xl:grid-cols-[360px_minmax(0,1fr)_300px] xl:grid-cols-[340px_minmax(0,1fr)_280px] gap-3 p-3 items-start">
    <section className="space-y-3">
      <Block n="1" title="Choose Your Device"><div className="grid grid-cols-3 gap-2">{PRODUCT_TYPES.map(p=><button key={p.id} onClick={()=>setProductType(p.id)} className={`rounded-xl border-2 p-3 min-h-20 flex flex-col items-center justify-center gap-2 ${productType===p.id?'border-orange-500 bg-orange-50':'border-slate-200'}`}><ProductTypeIcon typeId={p.id} active={productType===p.id}/><span className="text-[11px] font-bold">{p.label}</span></button>)}</div></Block>
      <Block n="2" title="Select a Template"><div className="grid grid-cols-4 gap-2">{TEMPLATES.map(t=><button key={t.id} onClick={()=>{setActiveTemplate(t.id);setCardColor(t.cardColor);setAccentColor(t.accentColor);setFinish(t.finish);setBrandPattern(t.pattern||{enabled:false,opacity:8,size:'medium',direction:'straight',coverage:'full'})}} className={`rounded-xl border-2 p-1.5 ${activeTemplate===t.id?'border-orange-500':'border-slate-200'}`}><div className="h-12 rounded-lg relative overflow-hidden" style={{background:t.cardColor}}><div className="absolute right-0 top-0 w-1/2 h-full opacity-30" style={{background:t.accentColor,clipPath:'polygon(100% 0,100% 100%,0 100%)'}}/></div><p className="text-[10px] font-bold mt-1">{t.name}</p></button>)}</div></Block>
      <Block n="3" title="Customize Your Design">
       <div className="grid grid-cols-2 gap-3"><Field label="Full Name"><input className={input} value={holderName} onChange={e=>setHolderName(e.target.value)} placeholder="Ahsan Habib"/></Field><Field label="Title / Role"><input className={input} value={roleText} onChange={e=>setRoleText(e.target.value)} placeholder="Managing Attorney"/></Field><Field label="Company / Organization"><input className={input} value={nameText} onChange={e=>setNameText(e.target.value)} placeholder="AH Law Firm PLLC"/></Field><Field label="Phone"><input className={input} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 234 567 8900"/></Field><Field label="Email"><input className={input} value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/></Field><Field label="Website"><input className={input} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="www.company.com"/></Field></div>
       <button onClick={()=>fileInputRef.current?.click()} className="mt-3 w-full rounded-xl border-2 border-dashed border-slate-200 p-3 flex items-center gap-3 hover:border-orange-400"><div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">{logoUrl?<img src={logoUrl} className="max-w-full max-h-full"/>:<Upload className="w-5 h-5 text-orange-500"/>}</div><div className="text-left"><p className="text-xs font-black">{uploading?'Uploading…':'Upload Logo'}</p><p className="text-[10px] text-slate-400">JPG, PNG or SVG</p></div></button><input ref={fileInputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/svg+xml" onChange={upload}/>
       <div className="mt-4"><p className="text-xs font-bold mb-2">Base Color</p><div className="flex flex-wrap gap-2">{CARD_COLORS.map(c=><button key={c} onClick={()=>setCardColor(c)} className={`w-7 h-7 rounded-full border-2 ${cardColor===c?'ring-2 ring-orange-300':''}`} style={{background:c}}/>)}</div></div>
       <div className="mt-4"><p className="text-xs font-bold mb-2">Accent Color</p><div className="flex flex-wrap gap-2">{ACCENTS.map(c=><button key={c} onClick={()=>setAccentColor(c)} className={`w-7 h-7 rounded-full border-2 ${accentColor===c?'ring-2 ring-orange-300':''}`} style={{background:c}}/>)}</div></div>
       <div className="mt-4 grid grid-cols-3 gap-2">{FINISHES.map(f=><button key={f} onClick={()=>setFinish(f)} className={`py-2 rounded-lg border text-xs font-bold ${finish===f?'bg-[#0b2149] text-white border-[#0b2149]':'border-slate-200'}`}>{f}</button>)}</div>
       <label className="mt-4 flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={removeBranding} onChange={e=>setRemoveBranding(e.target.checked)}/> Remove Bingoo branding (+$2.50)</label>
       {userProfiles.length>0&&<select className={`${input} mt-3`} value={assignProfileId} onChange={e=>setAssignProfileId(e.target.value)}><option value="">Assign during activation</option>{userProfiles.map(p=><option key={p.id} value={p.id}>{p.display_name}</option>)}</select>}
      </Block>
    </section>
    <section className="space-y-3 min-w-0">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
       <div className="flex items-center justify-between mb-4"><h2 className="font-black text-[#0b2149]">Live Preview</h2><div className="bg-slate-100 rounded-full p-1 flex text-xs font-bold"><button onClick={()=>setSide('front')} className={`px-7 py-2 rounded-full ${side==='front'?'bg-[#0b2149] text-white':''}`}>Front</button><button onClick={()=>setSide('back')} className={`px-7 py-2 rounded-full ${side==='back'?'bg-[#0b2149] text-white':''}`}>Back</button></div></div>
       <div className="min-h-[430px] rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-8 overflow-hidden"><div className="scale-[1.18] origin-center"><ProductPreview {...previewProps} side={side}/></div></div>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">{['front','back'].map(s=><button key={s} onClick={()=>setSide(s)} className={`rounded-xl border-2 p-2 ${side===s?'border-orange-500':'border-slate-200'}`}><div className="scale-[.48] origin-center h-24 flex items-center justify-center"><ProductPreview {...previewProps} side={s}/></div><p className="text-[10px] font-bold capitalize">{s}</p></button>)}<div className="rounded-xl border border-slate-200 p-2 flex flex-col justify-center items-center text-center"><Eye className="w-5 h-5 text-slate-400"/><p className="text-[10px] font-bold mt-2">Production-ready preview</p></div><div className="rounded-xl border border-slate-200 p-2 flex flex-col justify-center items-center text-center"><Check className="w-5 h-5 text-emerald-500"/><p className="text-[10px] font-bold mt-2">Front + back frozen at checkout</p></div></div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-4"><h3 className="text-sm font-black mb-3">Also available in this design</h3><div className="grid grid-cols-3 md:grid-cols-6 gap-2">{PRODUCT_TYPES.map(p=><button key={p.id} onClick={()=>setProductType(p.id)} className="rounded-xl bg-slate-50 border border-slate-100 p-3 flex flex-col items-center gap-2"><ProductTypeIcon typeId={p.id} active={false}/><span className="text-[9px] font-bold">NFC {p.label}</span></button>)}</div></div>
    </section>
    <aside className="bg-white rounded-xl border border-slate-200 p-4 h-fit min-w-0 xl:sticky xl:top-4">
      <h2 className="font-black text-[#0b2149] mb-4">Product Summary</h2><div className="flex gap-3 items-center pb-4 border-b"><div className="w-24 h-20 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center"><div className="scale-[.24]"><ProductPreview {...previewProps} side="front"/></div></div><div className="min-w-0"><p className="font-black text-sm">Custom NFC {productLabel}</p><p className="text-lg font-black mt-1">${subtotal.toFixed(2)} <span className="text-[10px] text-slate-400 font-bold">/ unit</span></p><p className="text-[9px] text-slate-400 mt-1">Design/setup: ${SETUP_FEE.toFixed(2)} + hardware</p></div></div>
      <div className="py-4 space-y-3 text-xs"><Row a="Finish" b={finish}/><Row a="Base Color" b={cardColor}/><Row a="Accent Color" b={accentColor}/><div className="flex items-center justify-between"><span>Quantity</span><div className="flex border rounded-lg overflow-hidden"><button onClick={()=>setQuantity(Math.max(1,quantity-1))} className="px-3 py-2">−</button><span className="px-3 py-2 font-black border-x">{quantity}</span><button onClick={()=>setQuantity(Math.min(500,quantity+1))} className="px-3 py-2">+</button></div></div></div>
      <div className="border-t pt-4 space-y-3 text-sm"><Row a="Subtotal" b={`$${subtotal.toFixed(2)}`}/><Row a="Shipping" b={`$${SHIPPING.toFixed(2)}`}/><div className="flex justify-between text-lg font-black pt-3 border-t"><span>Total</span><span>${total.toFixed(2)}</span></div></div>
      <button onClick={add} className="mt-5 w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 font-black flex items-center justify-center gap-2"><ShoppingCart className="w-4 h-4"/>{ordered?'Added to Cart':'Add to Cart'}</button><button onClick={save} className="mt-3 w-full border border-[#0b2149] text-[#0b2149] rounded-lg py-3 font-black flex items-center justify-center gap-2"><Save className="w-4 h-4"/>{saved?'Design Saved':'Save Design'}</button>
      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t text-center text-[9px] text-slate-500"><span>🛡️<br/>Secure Checkout</span><span>🚚<br/>Worldwide Shipping</span><span>🎧<br/>Expert Support</span></div>
    </aside>
   </div>
 </div>
}
function Block({n,title,children}){return <div className="bg-white rounded-xl border border-slate-200 p-4"><h3 className="font-black text-sm mb-3 text-[#0b2149]"><span className="mr-1">{n}.</span>{title}</h3>{children}</div>}
function Field({label,children}){return <label><span className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</span>{children}</label>}
function Row({a,b}){return <div className="flex justify-between gap-3"><span className="text-slate-500">{a}</span><span className="font-bold text-right">{b}</span></div>}
