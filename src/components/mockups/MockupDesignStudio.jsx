import React from 'react';
import { DesktopFrame, Badge } from './MockupFrame';
import { Icon } from './BingooIcons';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function MockupDesignStudio() {
  return (
    <DesktopFrame label="11 · Business Design Studio">
      <div className="flex h-full">
        {/* Left Controls */}
        <div className="w-72 border-r border-[#E5EAF2] bg-[#F7F9FC] p-5 overflow-y-auto">
          <div className="mb-5">
            <p className="text-[10px] font-bold text-[#f97316] tracking-wider">CUSTOM NFC</p>
            <h2 className="text-lg font-black text-[#0F172A]">Design Studio</h2>
            <p className="text-[10px] text-[#64748B] mt-1">Create branded NFC devices for your business</p>
          </div>

          {/* Product Type */}
          <div className="mb-5">
            <p className="text-xs font-black text-[#0F172A] mb-2">Product Type</p>
            <div className="grid grid-cols-3 gap-2">
              {['Card', 'Keychain', 'Sticker'].map((p, i) => (
                <div key={p} className={`p-2 rounded-lg border-2 text-center cursor-pointer ${i === 0 ? 'border-[#f97316] bg-white' : 'border-[#E5EAF2] bg-white'}`}>
                  <div className="w-full h-8 rounded mb-1" style={{ background: i === 0 ? NAVY : '#E5EAF2' }} />
                  <span className={`text-[9px] font-bold ${i === 0 ? 'text-[#f97316]' : 'text-[#64748B]'}`}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="mb-5">
            <p className="text-xs font-black text-[#0F172A] mb-2">Logo</p>
            <div className="border-2 border-dashed border-[#E5EAF2] rounded-xl p-4 text-center cursor-pointer hover:border-[#f97316] bg-white">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${NAVY}10` }}>
                <Icon name="download" size={18} color={NAVY} />
              </div>
              <p className="text-[9px] font-bold text-[#0F172A]">Upload Logo</p>
              <p className="text-[8px] text-[#64748B]">PNG, SVG · Max 2MB</p>
            </div>
          </div>

          {/* Colors */}
          <div className="mb-5">
            <p className="text-xs font-black text-[#0F172A] mb-2">Card Color</p>
            <div className="flex gap-2 flex-wrap">
              {['#0b2149', '#0F172A', '#f97316', '#22C55E', '#3b82f6', '#ec4899', '#8b5cf6', '#1a1a2e'].map((c, i) => (
                <div key={c} className={`w-8 h-8 rounded-lg cursor-pointer border-2 ${i === 0 ? 'border-[#0F172A] scale-110' : 'border-white'}`} style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-black text-[#0F172A] mb-2">Accent Color</p>
            <div className="flex gap-2 flex-wrap">
              {['#f97316', '#FFD700', '#FFFFFF', '#22C55E', '#3b82f6', '#ec4899'].map((c, i) => (
                <div key={c} className={`w-8 h-8 rounded-lg cursor-pointer border-2 ${i === 0 ? 'border-[#0F172A] scale-110' : 'border-white'}`} style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Text Fields */}
          <div className="mb-5 space-y-3">
            <div>
              <p className="text-xs font-black text-[#0F172A] mb-1.5">Name on Card</p>
              <div className="px-3 py-2 bg-white rounded-lg border border-[#E5EAF2] text-[11px] font-bold text-[#0F172A]">Diallo Law Firm</div>
            </div>
            <div>
              <p className="text-xs font-black text-[#0F172A] mb-1.5">Role / Tagline</p>
              <div className="px-3 py-2 bg-white rounded-lg border border-[#E5EAF2] text-[11px] font-bold text-[#64748B]">Immigration · Civil · Criminal</div>
            </div>
          </div>

          {/* Finish */}
          <div className="mb-5">
            <p className="text-xs font-black text-[#0F172A] mb-2">Finish</p>
            <div className="grid grid-cols-3 gap-2">
              {['Matte', 'Glossy', 'Frosted'].map((f, i) => (
                <div key={f} className={`px-2 py-2 rounded-lg border text-[9px] font-bold text-center cursor-pointer ${i === 0 ? 'border-[#f97316] text-white' : 'border-[#E5EAF2] text-[#64748B] bg-white'}`} style={i === 0 ? { background: ORANGE } : {}}>{f}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Preview */}
        <div className="flex-1 flex flex-col items-center justify-center p-8" style={{ background: 'linear-gradient(180deg, #F7F9FC, #EDF1F7)' }}>
          <div className="flex items-center justify-between w-full max-w-md mb-6">
            <p className="text-sm font-black text-[#0F172A]">Live Preview</p>
            <Badge color={ORANGE}>REAL-TIME</Badge>
          </div>

          {/* Front */}
          <div className="mb-8 transform hover:scale-105 transition-transform">
            <div className="rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between p-6" style={{ width: 320, height: 200, background: `linear-gradient(135deg, ${NAVY}, #071A3D)` }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ background: ORANGE, filter: 'blur(50px)' }} />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg" style={{ background: ORANGE }}>
                    <span className="text-white font-black text-lg">B</span>
                  </div>
                  <p className="text-white font-black text-lg">Diallo Law Firm</p>
                  <p className="text-white/50 text-xs">Immigration · Civil · Criminal</p>
                </div>
                <div className="w-14 h-14 bg-white rounded-lg p-1.5">
                  <div className="w-full h-full rounded grid grid-cols-6 gap-px p-0.5" style={{ background: NAVY }}>
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className="font-black text-xs tracking-wider" style={{ color: ORANGE }}>BINGOO</span>
                <Icon name="nfc" size={18} color="rgba(255,255,255,0.3)" />
              </div>
            </div>
            <p className="text-center text-[10px] font-bold text-[#64748B] mt-2">FRONT</p>
          </div>

          {/* Back */}
          <div className="transform hover:scale-105 transition-transform">
            <div className="rounded-2xl shadow-xl flex items-center justify-center" style={{ width: 320, height: 200, background: '#F7F9FC', border: '1px solid #E5EAF2' }}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${NAVY}10` }}>
                  <Icon name="nfc" size={28} color={NAVY} />
                </div>
                <p className="text-[10px] font-bold text-[#64748B]">Tap your phone here to share</p>
                <p className="text-[8px] text-[#64748B] mt-1">bingoo.co/diallo</p>
              </div>
            </div>
            <p className="text-center text-[10px] font-bold text-[#64748B] mt-2">BACK</p>
          </div>
        </div>

        {/* Right Options */}
        <div className="w-64 border-l border-[#E5EAF2] bg-white p-5 overflow-y-auto">
          <p className="text-xs font-black text-[#0F172A] mb-4">Order Summary</p>

          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#64748B]">Product</span>
              <span className="text-[10px] font-bold text-[#0F172A]">NFC Card</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#64748B]">Finish</span>
              <span className="text-[10px] font-bold text-[#0F172A]">Matte</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#64748B]">Quantity</span>
                <span className="text-[10px] font-black" style={{ color: ORANGE }}>50 units</span>
              </div>
              <div className="h-2 bg-[#F7F9FC] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '50%', background: ORANGE }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[8px] text-[#64748B]">Min: 25</span>
                <span className="text-[8px] text-[#64748B]">Max: 500</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F7F9FC] rounded-xl p-3 space-y-2 mb-5">
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-[#64748B]">Unit Price</span>
              <span className="text-[10px] font-bold text-[#0F172A]">$3.99</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-[#64748B]">Subtotal</span>
              <span className="text-[10px] font-bold text-[#0F172A]">$199.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-bold text-[#64748B]">Setup Fee</span>
              <span className="text-[10px] font-bold text-[#0F172A]">$25.00</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E5EAF2]">
              <span className="text-xs font-black text-[#0F172A]">Total</span>
              <span className="text-sm font-black" style={{ color: ORANGE }}>$224.50</span>
            </div>
          </div>

          <button className="w-full py-2.5 text-xs font-black text-white rounded-xl shadow-md flex items-center justify-center gap-2" style={{ background: ORANGE }}>
            Place Order <Icon name="arrowRight" size={14} color="#FFFFFF" />
          </button>

          <div className="mt-4 pt-4 border-t border-[#E5EAF2] space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="clock" size={12} color={NAVY} />
              <span className="text-[9px] font-bold text-[#64748B]">7-10 business days</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="package" size={12} color={NAVY} />
              <span className="text-[9px] font-bold text-[#64748B]">Free shipping over $200</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="shield" size={12} color={NAVY} />
              <span className="text-[9px] font-bold text-[#64748B]">Quality guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}