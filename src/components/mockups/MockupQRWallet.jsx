import React from 'react';
import { PhoneFrame, MobileBottomNav, Badge } from './MockupFrame';
import { Icon } from './BingooIcons';
import { WalletPassVisual } from './MockupFrame';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function MockupQRWallet() {
  return (
    <PhoneFrame label="6 · QR & Wallet Center">
      <div className="relative min-h-full pb-24">
        {/* Header */}
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, #071A3D)` }}>
          <p className="text-white/40 text-[10px] font-medium">Share</p>
          <p className="text-white font-black text-xl">QR & Wallet</p>
        </div>

        {/* QR Section */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] text-center">
            <p className="text-xs font-black text-[#0F172A] mb-3">Your QR Code</p>
            <div className="inline-block p-3 bg-white rounded-2xl border-2 border-[#E5EAF2] shadow-md">
              <div className="w-32 h-32 rounded-lg p-1.5" style={{ background: NAVY }}>
                <div className="w-full h-full rounded grid grid-cols-7 gap-px p-1">
                  {Array.from({ length: 49 }).map((_, i) => {
                    const corners = [0, 6, 42, 48];
                    const isCorner = corners.includes(i);
                    return (
                      <div key={i} className={`rounded-[1px] ${isCorner || Math.random() > 0.45 ? 'bg-white' : 'bg-transparent'}`} />
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 mt-3">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: ORANGE }}>
                <span className="text-white font-black text-[10px]">B</span>
              </div>
              <span className="text-[10px] font-bold text-[#64748B]">Scan Me</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex flex-col items-center gap-1 py-2 rounded-xl bg-[#F7F9FC] cursor-pointer">
                <Icon name="download" size={16} color={NAVY} />
                <span className="text-[8px] font-bold text-[#64748B]">Download</span>
              </div>
              <div className="flex flex-col items-center gap-1 py-2 rounded-xl bg-[#F7F9FC] cursor-pointer">
                <Icon name="share" size={16} color={NAVY} />
                <span className="text-[8px] font-bold text-[#64748B]">Share</span>
              </div>
              <div className="flex flex-col items-center gap-1 py-2 rounded-xl bg-[#F7F9FC] cursor-pointer">
                <Icon name="palette" size={16} color={NAVY} />
                <span className="text-[8px] font-bold text-[#64748B]">Customize</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Settings */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2]">
            <p className="text-xs font-black text-[#0F172A] mb-3">QR Customization</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#64748B]">Color</span>
              <div className="flex gap-1.5">
                {['#0F172A', '#0b2149', '#f97316', '#22C55E', '#3b82f6'].map((c, i) => (
                  <div key={c} className={`w-6 h-6 rounded cursor-pointer border-2 ${i === 1 ? 'border-[#0F172A] scale-110' : 'border-[#E5EAF2]'}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#64748B]">Label</span>
              <div className="px-3 py-1.5 bg-[#F7F9FC] rounded-lg text-[10px] font-bold text-[#0F172A]">Scan Me</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#64748B]">Watermark Logo</span>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-5 rounded-full p-0.5" style={{ background: ORANGE }}>
                  <div className="w-4 h-4 rounded-full bg-white ml-auto" />
                </div>
                <span className="text-[9px] font-bold text-[#22C55E]">ON</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Passes */}
        <div className="px-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-[#0F172A]">Wallet Passes</p>
            <Badge color={ORANGE}>OWNER ONLY</Badge>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#1a1a2e' }}>
                <Icon name="globe" size={20} color="#4285F4" />
              </div>
              <div className="flex-1">
                <p className="font-black text-sm text-[#0F172A]">Google Wallet</p>
                <p className="text-[10px] text-[#64748B]">Add your profile to Google Wallet</p>
              </div>
              <button className="px-3 py-1.5 text-[10px] font-bold text-white rounded-lg" style={{ background: ORANGE }}>Add</button>
            </div>
            <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#1c1c1e' }}>
                <Icon name="sparkles" size={20} color="#FFFFFF" />
              </div>
              <div className="flex-1">
                <p className="font-black text-sm text-[#0F172A]">Apple Wallet</p>
                <p className="text-[10px] text-[#64748B]">Add your profile to Apple Wallet</p>
              </div>
              <button className="px-3 py-1.5 text-[10px] font-bold text-white rounded-lg" style={{ background: ORANGE }}>Add</button>
            </div>
          </div>
        </div>

        <MobileBottomNav active="More" />
      </div>
    </PhoneFrame>
  );
}