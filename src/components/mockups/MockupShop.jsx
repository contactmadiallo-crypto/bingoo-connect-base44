import React from 'react';
import { PhoneFrame, MobileBottomNav, Badge } from './MockupFrame';
import { Icon } from './BingooIcons';
import { NFCCardVisual, NFCKeychainVisual, NFCStickerVisual, NFCBraceletVisual, NFCStandVisual, NFCBadgeVisual } from './MockupFrame';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function MockupShop() {
  const products = [
    { name: 'NFC Business Card', price: '$19.99', tag: 'Bestseller', visual: <NFCCardVisual name="" width={120} />, color: NAVY },
    { name: 'NFC Metal Card', price: '$29.99', tag: 'Premium', visual: <NFCCardVisual name="" width={120} color="#1a1a2e" accent="#FFD700" />, color: '#1a1a2e' },
    { name: 'NFC Wood Card', price: '$27.99', visual: <NFCCardVisual name="" width={120} color="#8B4513" accent="#FF7A00" />, color: '#8B4513' },
    { name: 'NFC Keychain', price: '$11.99', visual: <NFCKeychainVisual width={60} /> },
    { name: 'NFC Bracelet', price: '$24.99', visual: <NFCBraceletVisual width={90} /> },
    { name: 'NFC Sticker', price: '$12.99', visual: <NFCStickerVisual width={55} /> },
    { name: 'NFC Phone Stand', price: '$22.99', visual: <NFCStandVisual width={65} /> },
    { name: 'NFC Badge', price: '$19.99', visual: <NFCBadgeVisual width={55} /> },
  ];

  return (
    <PhoneFrame label="10 · Shop">
      <div className="relative min-h-full pb-24">
        {/* Header */}
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, #071A3D)` }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-[10px] font-medium">Bingoo Connect</p>
              <p className="text-white font-black text-xl">Shop</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Icon name="shop" size={18} color="#FFFFFF" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] text-white flex items-center justify-center font-bold" style={{ background: ORANGE }}>2</div>
            </div>
          </div>
        </div>

        {/* Bundle Banner */}
        <div className="px-5 -mt-3 mb-4">
          <div className="rounded-2xl p-4 flex items-center gap-3 shadow-lg" style={{ background: `linear-gradient(135deg, ${ORANGE}, #fb923c)` }}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Icon name="package" size={20} color="#FFFFFF" />
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-xs">Bundle & Save 20%</p>
              <p className="text-white/80 text-[9px]">Card + Keychain + Sticker</p>
            </div>
            <button className="px-3 py-1.5 bg-white text-[10px] font-black rounded-lg" style={{ color: ORANGE }}>Shop</button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="px-5">
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <div key={p.name} className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-28 flex items-center justify-center relative" style={{ background: '#F7F9FC' }}>
                  {p.visual}
                  {p.tag && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[7px] font-black rounded-md text-white" style={{ background: ORANGE }}>{p.tag.toUpperCase()}</span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[10px] font-bold text-[#0F172A] leading-tight mb-1.5">{p.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black" style={{ color: ORANGE }}>{p.price}</p>
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: NAVY }}>
                      <Icon name="plus" size={14} color="#FFFFFF" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Design CTA */}
        <div className="px-5 mt-4">
          <div className="rounded-2xl p-4 border border-[#E5EAF2]" style={{ background: `linear-gradient(135deg, ${NAVY}, #071A3D)` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ORANGE }}>
                <Icon name="palette" size={20} color="#FFFFFF" />
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-xs">Business Design Studio</p>
                <p className="text-white/50 text-[9px]">Custom branded NFC devices</p>
              </div>
            </div>
            <button className="w-full py-2 text-[10px] font-black text-white rounded-lg flex items-center justify-center gap-1.5" style={{ background: ORANGE }}>
              Design Your Own <Icon name="arrowRight" size={12} color="#FFFFFF" />
            </button>
            <p className="text-white/30 text-[8px] text-center mt-2">Business Plan required</p>
          </div>
        </div>

        <MobileBottomNav active="More" />
      </div>
    </PhoneFrame>
  );
}