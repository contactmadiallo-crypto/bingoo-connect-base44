import React from 'react';
import { PhoneFrame, MobileBottomNav } from './MockupFrame';

export default function MockupQRWallet() {
  return (
    <PhoneFrame label="6 · QR & Wallet Center">
      <div className="relative min-h-full pb-20">
        {/* Header */}
        <div className="bg-[#0A1F52] px-5 pt-8 pb-4">
          <p className="text-white font-bold text-lg">QR & Wallet</p>
          <p className="text-white/50 text-[10px]">Diallo Law Firm</p>
        </div>

        {/* Tab Toggle */}
        <div className="px-5 pt-4">
          <div className="flex gap-1 bg-[#F7F9FC] rounded-lg p-1">
            <button className="flex-1 py-1.5 bg-white text-[#0F172A] text-[10px] font-semibold rounded-md shadow-sm">QR Code</button>
            <button className="flex-1 py-1.5 text-[#64748B] text-[10px] font-medium">Wallet Passes</button>
          </div>
        </div>

        {/* QR Preview */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl border border-[#E5EAF2] p-5 text-center">
            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-3">Live Preview</p>
            <div className="inline-block p-4 bg-white rounded-xl border-2 border-[#0A1F52]">
              <div className="w-32 h-32 bg-[#0A1F52] rounded-lg p-2 relative">
                {/* Fake QR pattern */}
                <div className="w-full h-full grid grid-cols-8 gap-0.5">
                  {Array.from({length:64}).map((_,i) => (
                    <div key={i} className={`${Math.random() > 0.4 ? 'bg-white' : 'bg-[#0A1F52]'} rounded-[1px]`} />
                  ))}
                </div>
                {/* Logo center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#FF7A00] rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-[10px]">B</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#64748B] mt-3">bingooconnect.com/p/diallolaw</p>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-2 bg-[#FF7A00] text-white text-[10px] font-semibold rounded-lg">📥 Download PNG</button>
              <button className="flex-1 py-2 bg-[#F7F9FC] text-[#0F172A] text-[10px] font-medium rounded-lg border border-[#E5EAF2]">SVG</button>
            </div>
          </div>
        </div>

        {/* QR Customization */}
        <div className="px-5 mt-4 space-y-3">
          <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">QR Color</p>
            <div className="flex gap-2">
              {['#0A1F52', '#0F172A', '#FF7A00', '#22C55E'].map((c, i) => (
                <div key={c} className={`w-8 h-8 rounded-full border-2 ${i === 0 ? 'border-[#FF7A00]' : 'border-[#E5EAF2]'}`} style={{backgroundColor: c}} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Logo Watermark</p>
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-[#E5EAF2]">
              <span className="text-[10px] text-[#0F172A]">Bingoo Logo</span>
              <div className="w-10 h-5 bg-[#FF7A00] rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="px-5 mt-4">
          <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Add to Wallet (Owner Only)</p>
          <div className="space-y-2">
            <button className="w-full bg-[#0A1F52] text-white py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold">
              <span className="text-base">􀀯</span> Add to Google Wallet
            </button>
            <button className="w-full bg-[#0F172A] text-white py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold">
              <span className="text-base">􀣺</span> Add to Apple Wallet
            </button>
          </div>
          <p className="text-[9px] text-[#64748B] mt-2 text-center">🔒 Wallet passes are generated for the profile owner only. Visitors do not see wallet buttons.</p>
        </div>

        <MobileBottomNav active="Profiles" />
      </div>
    </PhoneFrame>
  );
}