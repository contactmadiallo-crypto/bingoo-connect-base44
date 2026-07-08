import React from 'react';
import { PhoneFrame, DesktopFrame, Badge } from '@/components/mockups/MockupFrame';
import { BingooLogo, BingooStamp, InfinityMark } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', MUTED = '#64748B', INK = '#0F172A';

const APP_ICON_URL = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/8792d3cda_generated_image.png';
const NFC_CARD_URL = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/49bd24382_generated_image.png';

const PRODUCTS = [
  { name: 'NFC Business Card', price: '$19.99', type: 'card', desc: 'Premium matte card', color: NAVY, img: NFC_CARD_URL },
  { name: 'NFC Metal Card', price: '$29.99', type: 'card', desc: 'Brushed metal finish', color: '#8b5cf6' },
  { name: 'NFC Wood Card', price: '$27.99', type: 'card', desc: 'Eco-friendly bamboo', color: '#92400e' },
  { name: 'NFC Keychain', price: '$11.99', type: 'keychain', desc: 'Compact & durable', color: ORANGE },
  { name: 'NFC Bracelet', price: '$24.99', type: 'bracelet', desc: 'Wearable silicone', color: '#ec4899' },
  { name: 'NFC Sticker', price: '$12.99', type: 'sticker', desc: 'Stick anywhere', color: '#22C55E' },
  { name: 'NFC Phone Stand', price: '$22.99', type: 'stand', desc: 'Desk display stand', color: '#3b82f6' },
  { name: 'NFC Event Badge', price: '$14.99', type: 'badge', desc: 'Conference badge', color: '#fbbf24' },
  { name: 'Business Starter Kit', price: '$99.99', type: 'bundle', desc: '5 cards + 5 keychains + stand', color: NAVY, bundle: true },
  { name: 'Event Bundle (10x)', price: '$149.99', type: 'bundle', desc: '10 badges + QR display', color: ORANGE, bundle: true },
  { name: 'NFC Phone Tag', price: '$9.99', type: 'tag', desc: 'Stick on phone case', color: '#3b82f6' },
  { name: 'NFC Table Stand', price: '$34.99', type: 'stand', desc: 'Restaurant table display', color: '#22C55E' },
  { name: 'NFC Desk Stand', price: '$39.99', type: 'stand', desc: 'Premium office display', color: '#8b5cf6' },
];

function ProductCard({ p }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
      {/* Product Visual */}
      <div className="h-32 flex items-center justify-center relative overflow-hidden" style={{ background: p.img ? `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` : `${p.color}08` }}>
        {p.img ? (
          <img src={p.img} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <div className="rounded-xl shadow-xl p-3 flex flex-col items-center gap-1" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
            <BingooStamp size={28} color={p.color} showText={false} variant="outline" />
            <span className="text-white font-bold text-[7px]">BING∞</span>
          </div>
        )}
        {p.bundle && <div className="absolute top-2 right-2"><Badge color={ORANGE}>BUNDLE</Badge></div>}
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] font-bold text-[#0F172A]">{p.name}</p>
        <p className="text-[8px] text-[#64748B] mb-1">{p.desc}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-black" style={{ color: ORANGE }}>{p.price}</span>
          <button className="px-2.5 py-1 text-[8px] font-black text-white rounded-lg" style={{ background: NAVY }}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

export default function MockupShopCatalog() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-black text-[#0F172A] mb-1">NFC Product Catalog — Real Bingoo Branded Products</p>
        <p className="text-[10px] text-[#64748B]">10 products with 3D renders, color options, and full detail views</p>
      </div>
      {/* Catalog Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {PRODUCTS.map((p) => <ProductCard key={p.name} p={p} />)}
      </div>
      {/* Product Detail */}
      <div className="flex flex-wrap justify-center gap-6 pt-4">
        <PhoneFrame label="Product Detail — Full Info">
          <div className="min-h-full pb-8" style={{ background: BG }}>
            <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10"><Icon name="chevronRight" size={18} color="#FFFFFF" className="rotate-180" /></div>
                <p className="text-white font-black text-sm">NFC Business Card</p>
              </div>
              <div className="flex justify-center">
                <img src={NFC_CARD_URL} alt="NFC Card" className="w-48 h-32 object-cover rounded-2xl shadow-2xl" />
              </div>
            </div>
            <div className="px-5 mt-4">
              <div className="flex items-center justify-between mb-2">
                <div><p className="font-black text-base text-[#0F172A]">NFC Business Card</p><p className="text-[10px] text-[#64748B]">Premium NFC-enabled card</p></div>
                <Badge color={ORANGE}>BESTSELLER</Badge>
              </div>
              <p className="text-2xl font-black mb-4" style={{ color: ORANGE }}>$19.99</p>
              {/* Color/Material Options */}
              <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
                <p className="text-[9px] font-bold text-[#64748B] mb-2">COLOR / MATERIAL</p>
                <div className="flex gap-2">
                  {[
                    { name: 'Navy', color: NAVY, selected: true },
                    { name: 'Black', color: '#0F172A' },
                    { name: 'Orange', color: ORANGE },
                    { name: 'Wood', color: '#92400e' },
                  ].map((c) => (
                    <div key={c.name} className={`w-8 h-8 rounded-lg cursor-pointer border-2 ${c.selected ? 'border-[#0F172A] scale-110' : 'border-white'}`} style={{ background: c.color }} />
                  ))}
                </div>
              </div>
              {/* What's Included */}
              <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
                <p className="text-[9px] font-bold text-[#64748B] mb-2">WHAT'S INCLUDED</p>
                {['1x NFC Business Card (NTAG216)', 'Free activation & profile link', 'Custom branding with infinity mark', 'Lost mode protection'].map((f) => (
                  <div key={f} className="flex items-center gap-2 mb-1.5"><Icon name="check" size={11} color="#22C55E" /><span className="text-[9px] font-medium text-[#0F172A]">{f}</span></div>
                ))}
              </div>
              {/* Who It's For */}
              <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
                <p className="text-[9px] font-bold text-[#64748B] mb-2">PERFECT FOR</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Attorneys', 'Realtors', 'Consultants', 'Agents', 'Executives'].map((t) => (
                    <span key={t} className="px-2 py-1 text-[8px] font-bold rounded-lg" style={{ background: `${NAVY}08`, color: NAVY }}>{t}</span>
                  ))}
                </div>
              </div>
              {/* Activation Steps */}
              <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
                <p className="text-[9px] font-bold text-[#64748B] mb-2">ACTIVATION STEPS</p>
                {['1. Receive your card in mail', '2. Enter device code at bingoo.co/activate', '3. Link to your profile', '4. Tap to share — done!'].map((s) => (
                  <p key={s} className="text-[9px] text-[#0F172A] font-medium mb-1">{s}</p>
                ))}
              </div>
              {/* Delivery & Compatibility */}
              <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-4">
                <div className="flex justify-between text-[9px] mb-2"><span className="font-bold text-[#64748B]">Delivery</span><span className="font-bold text-[#0F172A]">5-7 business days</span></div>
                <div className="flex justify-between text-[9px] mb-2"><span className="font-bold text-[#64748B]">Production</span><span className="font-bold" style={{ color: '#22C55E' }}>In stock</span></div>
                <div className="flex justify-between text-[9px]"><span className="font-bold text-[#64748B]">Compatible</span><span className="font-bold text-[#0F172A]">All NFC phones</span></div>
              </div>
              <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
                <Icon name="shop" size={16} color="#FFFFFF" /> Add to Cart — $19.99
              </button>
            </div>
          </div>
        </PhoneFrame>
        {/* 3D Product Showcase */}
        <PhoneFrame label="3D Product Showcase">
          <div className="min-h-full pb-8" style={{ background: BG }}>
            <div className="px-5 pt-10 pb-6 text-center" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
              <BingooLogo size={32} light showText />
              <p className="text-white font-black text-sm mt-4">Bingoo NFC Products</p>
              <p className="text-white/50 text-[9px] mt-1">Premium hardware with infinity branding</p>
            </div>
            <div className="px-5 mt-4 space-y-3">
              {PRODUCTS.slice(0, 4).map((p) => (
                <div key={p.name} className="bg-white rounded-2xl p-3 border border-[#E5EAF2] flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
                    {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : <BingooStamp size={28} color={p.color} showText={false} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-[#0F172A]">{p.name}</p>
                    <p className="text-[8px] text-[#64748B]">{p.desc}</p>
                    <p className="text-xs font-black" style={{ color: ORANGE }}>{p.price}</p>
                  </div>
                  <Icon name="chevronRight" size={14} color={MUTED} />
                </div>
              ))}
            </div>
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}