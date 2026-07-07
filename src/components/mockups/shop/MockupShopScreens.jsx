import React from 'react';
import { PhoneFrame, MobileBottomNav, Badge } from '@/components/mockups/MockupFrame';
import { Icon } from '@/components/mockups/BingooIcons';
import { NFCCardVisual, NFCKeychainVisual } from '@/components/mockups/MockupFrame';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

// ── Screen 34: Product Detail ──
export function MockupProductDetail() {
  return (
    <PhoneFrame label="34 · Product Detail">
      <div className="min-h-full pb-24" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10"><Icon name="chevronRight" size={18} color="#FFFFFF" className="rotate-180" /></div>
            <p className="text-white font-black text-sm">NFC Business Card</p>
          </div>
          <div className="flex justify-center"><NFCCardVisual name="Bingoo Connect" role="Tap to Share" width={220} /></div>
        </div>
        <div className="px-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-black text-base text-[#0F172A]">NFC Business Card</p>
              <p className="text-[10px] text-[#64748B]">Premium NFC-enabled business card</p>
            </div>
            <Badge color={ORANGE}>BESTSELLER</Badge>
          </div>
          <p className="text-2xl font-black mb-4" style={{ color: ORANGE }}>$19.99</p>
          {/* Features */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
            <p className="text-[10px] font-bold text-[#64748B] mb-3">FEATURES</p>
            {[
              'Premium matte finish',
              'NTAG216 NFC chip (888 bytes)',
              'Works with all smartphones',
              'Customizable with your branding',
              'Durable & water-resistant',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 mb-2">
                <Icon name="check" size={12} color="#22C55E" />
                <span className="text-[10px] font-medium text-[#0F172A]">{f}</span>
              </div>
            ))}
          </div>
          {/* Quantity */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#64748B]">Quantity</span>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg border border-[#E5EAF2] flex items-center justify-center cursor-pointer"><Icon name="chevronDown" size={14} color={MUTED} className="rotate-90" /></div>
                <span className="text-sm font-black text-[#0F172A]">1</span>
                <div className="w-8 h-8 rounded-lg border border-[#E5EAF2] flex items-center justify-center cursor-pointer"><Icon name="chevronDown" size={14} color={MUTED} className="-rotate-90" /></div>
              </div>
            </div>
          </div>
          {/* Add to Cart */}
          <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2 mb-4" style={{ background: ORANGE }}>
            <Icon name="shop" size={16} color="#FFFFFF" /> Add to Cart — $19.99
          </button>
          {/* Related */}
          <p className="text-xs font-black text-[#0F172A] mb-3">You May Also Like</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'NFC Keychain', price: '$11.99', visual: <NFCKeychainVisual width={55} /> },
              { name: 'NFC Card Pack', price: '$49.99', visual: <NFCCardVisual name="" width={100} /> },
            ].map((p) => (
              <div key={p.name} className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
                <div className="h-20 flex items-center justify-center" style={{ background: '#F7F9FC' }}>{p.visual}</div>
                <div className="p-2">
                  <p className="text-[10px] font-bold text-[#0F172A]">{p.name}</p>
                  <p className="text-xs font-black" style={{ color: ORANGE }}>{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <MobileBottomNav active="More" />
      </div>
    </PhoneFrame>
  );
}

// ── Screen 35: Cart / Checkout ──
export function MockupCartCheckout() {
  return (
    <PhoneFrame label="35 · Cart / Checkout">
      <div className="min-h-full pb-24" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10"><Icon name="chevronRight" size={18} color="#FFFFFF" className="rotate-180" /></div>
            <p className="text-white font-black text-sm">Your Cart</p>
          </div>
          <p className="text-white/50 text-[10px]">2 items · $31.98 total</p>
        </div>
        {/* Cart Items */}
        <div className="px-5 mt-4 space-y-2.5">
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="nfc" size={20} color={NAVY} /></div>
            <div className="flex-1">
              <p className="font-bold text-xs text-[#0F172A]">NFC Business Card</p>
              <p className="text-[10px] text-[#64748B]">Qty: 1</p>
            </div>
            <p className="font-black text-sm" style={{ color: ORANGE }}>$19.99</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}10` }}><Icon name="nfc" size={20} color={ORANGE} /></div>
            <div className="flex-1">
              <p className="font-bold text-xs text-[#0F172A]">NFC Keychain</p>
              <p className="text-[10px] text-[#64748B]">Qty: 1</p>
            </div>
            <p className="font-black text-sm" style={{ color: ORANGE }}>$11.99</p>
          </div>
        </div>
        {/* Shipping Form */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
            <p className="text-[10px] font-bold text-[#64748B] mb-3">SHIPPING ADDRESS</p>
            <div className="space-y-2">
              <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] font-medium text-[#0F172A]">Mamadou Diallo</div>
              <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] font-medium text-[#0F172A]">123 Broadway Ave, Apt 4B</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] font-medium text-[#0F172A]">New York, NY</div>
                <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] font-medium text-[#0F172A]">10001</div>
              </div>
            </div>
          </div>
        </div>
        {/* Order Summary */}
        <div className="px-5">
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
            <p className="text-[10px] font-bold text-[#64748B] mb-3">ORDER SUMMARY</p>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]"><span className="font-bold text-[#64748B]">Subtotal</span><span className="font-bold text-[#0F172A]">$31.98</span></div>
              <div className="flex justify-between text-[10px]"><span className="font-bold text-[#64748B]">Shipping</span><span className="font-bold text-[#22C55E]">FREE</span></div>
              <div className="flex justify-between text-[10px]"><span className="font-bold text-[#64748B]">Tax</span><span className="font-bold text-[#0F172A]">$2.88</span></div>
              <div className="flex justify-between pt-2 border-t border-[#E5EAF2]"><span className="text-xs font-black text-[#0F172A]">Total</span><span className="text-sm font-black" style={{ color: ORANGE }}>$34.86</span></div>
            </div>
          </div>
          {/* Checkout */}
          <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2 mb-3" style={{ background: ORANGE }}>
            <Icon name="lock" size={16} color="#FFFFFF" /> Secure Checkout
          </button>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Icon name="shield" size={12} color="#22C55E" />
            <span className="text-[9px] font-bold text-[#64748B]">Secured by Stripe · 256-bit encryption</span>
          </div>
        </div>
        <MobileBottomNav active="More" />
      </div>
    </PhoneFrame>
  );
}