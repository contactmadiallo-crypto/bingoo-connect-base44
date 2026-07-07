import React from 'react';
import { DesktopFrame } from './MockupFrame';

export default function MockupDesignStudio() {
  return (
    <DesktopFrame label="11 · Business Design Studio" height="h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#E5EAF2]">
        <div>
          <h3 className="font-bold text-[#0F172A] text-sm">Business Design Studio</h3>
          <p className="text-[10px] text-[#64748B]">Custom NFC devices · Powered by Bingoo</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-[#F7F9FC] text-[#0F172A] text-[10px] font-medium rounded-lg border border-[#E5EAF2]">Save Draft</button>
          <button className="px-3 py-1.5 bg-[#FF7A00] text-white text-[10px] font-semibold rounded-lg">Submit Order →</button>
        </div>
      </div>

      <div className="flex h-[540px]">
        {/* Left: Customization */}
        <div className="w-64 border-r border-[#E5EAF2] p-4 overflow-y-auto bg-[#F7F9FC]">
          <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Product Type</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['💳 Card', '🔑 Key', '⌚ Band'].map((p, i) => (
              <button key={p} className={`py-2 text-[9px] font-medium rounded-lg ${i === 0 ? 'bg-[#0A1F52] text-white' : 'bg-white text-[#64748B] border border-[#E5EAF2]'}`}>{p}</button>
            ))}
          </div>

          <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Company Logo</p>
          <div className="border-2 border-dashed border-[#E5EAF2] rounded-lg p-4 text-center bg-white mb-4">
            <span className="text-2xl text-[#64748B]">📁</span>
            <p className="text-[9px] text-[#64748B] mt-1">Upload logo (PNG/SVG)</p>
          </div>

          <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Company Name</p>
          <div className="bg-white rounded-lg px-3 py-2 text-[10px] text-[#0F172A] border border-[#E5EAF2] mb-4">Diallo Law Firm</div>

          <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Brand Colors</p>
          <div className="flex gap-2 mb-4">
            {['#0A1F52', '#FF7A00', '#22C55E', '#8B5CF6', '#EF4444'].map((c, i) => (
              <div key={c} className={`w-7 h-7 rounded-full border-2 ${i === 0 ? 'border-[#FF7A00] border-2' : 'border-[#E5EAF2]'}`} style={{backgroundColor: c}} />
            ))}
          </div>

          <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Material / Finish</p>
          <div className="space-y-1.5">
            {['Metal Brushed', 'Matte Black', 'Glossy White', 'Wood'].map((m, i) => (
              <button key={m} className={`w-full py-1.5 px-3 text-[10px] font-medium rounded-lg text-left ${i === 0 ? 'bg-[#0A1F52] text-white' : 'bg-white text-[#64748B] border border-[#E5EAF2]'}`}>{m}</button>
            ))}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center bg-white">
          <div className="flex gap-4 mb-4">
            <button className="px-4 py-1.5 bg-[#0A1F52] text-white text-[10px] font-semibold rounded-lg">Front</button>
            <button className="px-4 py-1.5 bg-[#F7F9FC] text-[#64748B] text-[10px] font-medium rounded-lg border border-[#E5EAF2]">Back</button>
          </div>

          {/* Card Front Preview */}
          <div className="w-80 h-48 bg-gradient-to-br from-[#0A1F52] to-[#071A3D] rounded-2xl shadow-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <div className="w-10 h-10 bg-[#FF7A00] rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">DLF</span>
                </div>
                <p className="text-white text-sm font-bold">Diallo Law Firm</p>
                <p className="text-white/50 text-[10px]">Immigration · Civil · Criminal</p>
              </div>
              <span className="text-[#FF7A00] text-[8px] font-bold">BINGOO</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-[9px]">Mamadou Diallo</p>
                <p className="text-white/50 text-[8px]">Attorney at Law</p>
              </div>
              <div className="text-right">
                <p className="text-[#FF7A00] text-[7px] font-bold">Powered by Bingoo</p>
                <p className="text-white/30 text-[6px]">Connect · Share · Grow</p>
              </div>
            </div>
          </div>

          {/* Card Back Preview */}
          <div className="w-80 h-48 bg-[#0A1F52] rounded-2xl shadow-2xl p-5 mt-3 opacity-60 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white rounded-lg p-1.5 mx-auto mb-2">
                <div className="w-full h-full bg-[#0A1F52] rounded grid grid-cols-6 gap-px p-1">
                  {Array.from({length:36}).map((_,i)=><div key={i} className="bg-white rounded-[1px]" />)}
                </div>
              </div>
              <p className="text-white/50 text-[8px]">Activation: BG-000001</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="text-center">
              <p className="text-[10px] text-[#64748B]">Unit Price</p>
              <p className="text-sm font-bold text-[#0F172A]">$34.99</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[#64748B]">Quantity</p>
              <p className="text-sm font-bold text-[#0F172A]">50</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[#64748B]">Total</p>
              <p className="text-sm font-bold text-[#FF7A00]">$1,749.50</p>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}