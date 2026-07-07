import React from 'react';
import { DesktopFrame } from './MockupFrame';

export default function MockupAnalytics() {
  return (
    <DesktopFrame label="9 · Analytics">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF2]">
        <div>
          <h3 className="font-bold text-[#0F172A] text-sm">Analytics</h3>
          <p className="text-[10px] text-[#64748B]">Diallo Law Firm · Last 30 days</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-[#F7F9FC] rounded-lg p-0.5">
            <button className="px-3 py-1 text-[#64748B] text-[10px]">7D</button>
            <button className="px-3 py-1 bg-white text-[#0F172A] text-[10px] font-semibold rounded shadow-sm">30D</button>
            <button className="px-3 py-1 text-[#64748B] text-[10px]">90D</button>
          </div>
          <button className="px-3 py-1.5 bg-[#F7F9FC] text-[#0F172A] text-[10px] font-medium rounded-lg border border-[#E5EAF2]">📥 Export</button>
        </div>
      </div>

      <div className="p-4 bg-[#F7F9FC]">
        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { value: '2,847', label: 'Profile Views', trend: '+24%', color: '#0A1F52' },
            { value: '389', label: 'NFC Taps', trend: '+12%', color: '#FF7A00' },
            { value: '156', label: 'QR Scans', trend: '+8%', color: '#22C55E' },
            { value: '47', label: 'Leads', trend: '+31%', color: '#8B5CF6' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
              <p className="text-[10px] text-[#64748B] mb-1">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold" style={{color: s.color}}>{s.value}</p>
                <span className="text-[9px] text-[#22C55E] font-semibold">{s.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-4 border border-[#E5EAF2] mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-[#0F172A]">Views & Taps Trend</p>
            <div className="flex items-center gap-3 text-[9px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0A1F52]" /> Views</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF7A00]" /> Taps</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {Array.from({length: 30}).map((_, i) => {
              const h1 = 30 + Math.sin(i * 0.3) * 40 + Math.random() * 30;
              const h2 = 15 + Math.cos(i * 0.4) * 20 + Math.random() * 15;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full flex items-end gap-0.5 h-full">
                    <div className="flex-1 bg-[#0A1F52] rounded-t" style={{height: `${h1}%`}} />
                    <div className="flex-1 bg-[#FF7A00] rounded-t" style={{height: `${h2}%`}} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[8px] text-[#64748B] mt-1">
            <span>Jun 7</span><span>Jun 17</span><span>Jun 27</span><span>Jul 7</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {/* Link Interactions */}
          <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
            <p className="text-xs font-bold text-[#0F172A] mb-3">Link Interactions</p>
            {[
              { label: 'WhatsApp', count: 142, pct: 85, color: '#22C55E' },
              { label: 'Phone Call', count: 98, pct: 62, color: '#0A1F52' },
              { label: 'Email', count: 67, pct: 40, color: '#FF7A00' },
              { label: 'Website', count: 45, pct: 28, color: '#8B5CF6' },
              { label: 'Book Appointment', count: 33, pct: 20, color: '#EF4444' },
            ].map((l) => (
              <div key={l.label} className="mb-2">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="text-[#0F172A] font-medium">{l.label}</span>
                  <span className="text-[#64748B]">{l.count}</span>
                </div>
                <div className="h-1.5 bg-[#F7F9FC] rounded-full">
                  <div className="h-full rounded-full" style={{width: `${l.pct}%`, backgroundColor: l.color}} />
                </div>
              </div>
            ))}
          </div>

          {/* Source Breakdown */}
          <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
            <p className="text-xs font-bold text-[#0F172A] mb-3">Traffic Sources</p>
            <div className="flex items-center gap-4">
              {/* Donut */}
              <div className="relative w-24 h-24">
                <div className="w-full h-full rounded-full" style={{background: 'conic-gradient(#0A1F52 0% 45%, #FF7A00 45% 70%, #22C55E 70% 85%, #8B5CF6 85% 100%)'}} />
                <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#0F172A]">2.8K</p>
                    <p className="text-[7px] text-[#64748B]">Total</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[
                  { label: 'Profile', pct: 45, color: '#0A1F52' },
                  { label: 'NFC', pct: 25, color: '#FF7A00' },
                  { label: 'QR', pct: 15, color: '#22C55E' },
                  { label: 'Referral', pct: 15, color: '#8B5CF6' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5 text-[10px]">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}} />
                    <span className="text-[#0F172A]">{s.label}</span>
                    <span className="text-[#64748B] ml-auto">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}