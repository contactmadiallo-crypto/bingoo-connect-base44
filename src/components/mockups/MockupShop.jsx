import React from 'react';
import { PhoneFrame, MobileBottomNav } from './MockupFrame';

export default function MockupShop() {
  const products = [
    { name: 'NFC Business Card', price: '$19.99', icon: '💳', tag: 'Bestseller' },
    { name: 'NFC Metal Card', price: '$29.99', icon: '💳', tag: 'Premium' },
    { name: 'NFC Keychain', price: '$11.99', icon: '🔑' },
    { name: 'NFC Bracelet', price: '$24.99', icon: '⌚' },
    { name: 'NFC Sticker', price: '$12.99', icon: '🏷️' },
    { name: 'NFC Phone Stand', price: '$22.99', icon: '📱' },
  ];

  return (
    <PhoneFrame label="10 · Shop">
      <div className="relative min-h-full pb-20">
        {/* Header */}
        <div className="bg-[#0A1F52] px-5 pt-8 pb-6">
          <p className="text-white font-bold text-lg">Bingoo Shop</p>
          <p className="text-white/50 text-[10px]">Premium NFC products</p>
        </div>

        {/* Hero Banner */}
        <div className="px-5 -mt-3 mb-4">
          <div className="bg-gradient-to-r from-[#FF7A00] to-[#fb923c] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">Bundle & Save 20%</p>
              <p className="text-white/80 text-[10px]">Card + Keychain + Sticker</p>
            </div>
            <button className="px-3 py-1.5 bg-white text-[#FF7A00] text-[10px] font-bold rounded-lg">Shop Bundle</button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="px-5">
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <div key={p.name} className="bg-white rounded-xl border border-[#E5EAF2] overflow-hidden">
                {/* Product image area */}
                <div className="h-24 bg-gradient-to-br from-[#F7F9FC] to-[#E5EAF2] flex items-center justify-center relative">
                  <span className="text-3xl">{p.icon}</span>
                  {p.tag && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-[#FF7A00] text-white text-[7px] font-bold rounded">{p.tag.toUpperCase()}</span>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-[10px] font-semibold text-[#0F172A] leading-tight mb-1">{p.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#FF7A00]">{p.price}</p>
                    <button className="px-2 py-1 bg-[#0A1F52] text-white text-[8px] font-bold rounded">Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Design CTA */}
        <div className="px-5 mt-4">
          <div className="bg-gradient-to-br from-[#0A1F52] to-[#071A3D] rounded-xl p-4 text-center">
            <p className="text-white font-bold text-xs mb-1">Business Design Studio</p>
            <p className="text-white/50 text-[9px] mb-3">Custom branded NFC devices for your business</p>
            <button className="px-4 py-1.5 bg-[#FF7A00] text-white text-[10px] font-bold rounded-lg">Design Your Own →</button>
            <p className="text-white/30 text-[8px] mt-2">Business Plan required</p>
          </div>
        </div>

        <MobileBottomNav active="Home" />
      </div>
    </PhoneFrame>
  );
}