import React from 'react';
import { PhoneFrame, MobileBottomNav } from './MockupFrame';

export default function MockupNFC() {
  return (
    <PhoneFrame label="5 · NFC Operating Center">
      <div className="relative min-h-full pb-20">
        {/* Header */}
        <div className="bg-[#0A1F52] px-5 pt-8 pb-6">
          <p className="text-white font-bold text-lg">NFC Devices</p>
          <p className="text-white/50 text-[10px]">3 devices · 2 active · 1 lost</p>
        </div>

        {/* Stats */}
        <div className="px-5 -mt-3 mb-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: '3', label: 'Total', color: '#0A1F52' },
              { value: '2', label: 'Active', color: '#22C55E' },
              { value: '1', label: 'Lost', color: '#EF4444' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-[#E5EAF2]">
                <p className="text-lg font-bold" style={{color: s.color}}>{s.value}</p>
                <p className="text-[9px] text-[#64748B]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Device List */}
        <div className="px-5 space-y-3">
          {/* Device 1 */}
          <div className="bg-white rounded-xl border border-[#E5EAF2] p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#0A1F52] rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm">💳</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">NFC Metal Card</p>
                  <p className="text-[10px] text-[#64748B]">BG-000001 · Diallo Law Firm</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] text-[8px] font-bold rounded">ACTIVE</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <div>
                <p className="text-sm font-bold text-[#0F172A]">142</p>
                <p className="text-[8px] text-[#64748B]">Taps</p>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">bg.co/n/1</p>
                <p className="text-[8px] text-[#64748B]">URL</p>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">5d ago</p>
                <p className="text-[8px] text-[#64748B]">Last tap</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button className="flex-1 py-1.5 bg-[#F7F9FC] text-[#0F172A] text-[9px] font-medium rounded-lg">Reassign</button>
              <button className="flex-1 py-1.5 bg-[#F7F9FC] text-[#0F172A] text-[9px] font-medium rounded-lg">Replace</button>
              <button className="flex-1 py-1.5 bg-[#EF4444]/10 text-[#EF4444] text-[9px] font-medium rounded-lg">Report Lost</button>
            </div>
          </div>

          {/* Device 2 */}
          <div className="bg-white rounded-xl border border-[#E5EAF2] p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#0A1F52] rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm">🔑</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">NFC Keychain</p>
                  <p className="text-[10px] text-[#64748B]">BG-000003 · Bingoo Personal</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] text-[8px] font-bold rounded">ACTIVE</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-sm font-bold text-[#0F172A]">38</p>
                <p className="text-[8px] text-[#64748B]">Taps</p>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">bg.co/n/3</p>
                <p className="text-[8px] text-[#64748B]">URL</p>
              </div>
              <div>
                <p className="text-sm font-bold text-[#0F172A]">1h ago</p>
                <p className="text-[8px] text-[#64748B]">Last tap</p>
              </div>
            </div>
          </div>

          {/* Device 3 - Lost */}
          <div className="bg-white rounded-xl border-2 border-[#EF4444]/30 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#EF4444]/10 rounded-xl flex items-center justify-center">
                  <span className="text-sm">💳</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">NFC Wood Card</p>
                  <p className="text-[10px] text-[#64748B]">BG-000002 · Unassigned</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444] text-[8px] font-bold rounded">LOST</span>
            </div>
            <p className="text-[10px] text-[#EF4444] mb-2">⚠ 2 finder reports received</p>
            <button className="w-full py-1.5 bg-[#22C55E]/10 text-[#22C55E] text-[9px] font-medium rounded-lg">View Reports · Mark Found</button>
          </div>

          {/* Activate New */}
          <button className="w-full bg-[#0A1F52] text-white py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
            <span className="text-base">＋</span> Activate New Device
          </button>
        </div>

        <MobileBottomNav active="NFC" />
      </div>
    </PhoneFrame>
  );
}