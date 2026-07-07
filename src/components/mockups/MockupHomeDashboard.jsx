import React from 'react';
import { PhoneFrame, MobileBottomNav } from './MockupFrame';

export default function MockupHomeDashboard() {
  return (
    <PhoneFrame label="2 · Home Dashboard">
      <div className="relative min-h-full pb-20">
        {/* Header */}
        <div className="bg-[#0A1F52] px-5 pt-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/50 text-[10px]">Good morning</p>
              <p className="text-white font-bold text-sm">Mamadou Diallo</p>
            </div>
            <div className="relative">
              <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">🔔</span>
              </div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-[#FF7A00] rounded-full text-[8px] text-white flex items-center justify-center font-bold">3</div>
            </div>
          </div>

          {/* Selected Profile Card */}
          <div className="bg-white rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0A1F52] to-[#071A3D] rounded-full flex items-center justify-center">
              <span className="text-[#FF7A00] font-bold text-sm">MD</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-[#0F172A] text-sm">Diallo Law Firm</p>
                <span className="px-1.5 py-0.5 bg-[#FF7A00]/10 text-[#FF7A00] text-[8px] font-bold rounded">DEFAULT</span>
              </div>
              <p className="text-[#64748B] text-[10px]">Law Firm · Professional Plan</p>
            </div>
            <span className="text-[#64748B] text-xs">›</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 -mt-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: '🔗', label: 'Share' },
              { icon: '📱', label: 'NFC' },
              { icon: '📊', label: 'Stats' },
              { icon: '➕', label: 'Lead' },
            ].map((a) => (
              <div key={a.label} className="bg-white rounded-xl p-2.5 flex flex-col items-center gap-1 border border-[#E5EAF2] shadow-sm">
                <span className="text-lg">{a.icon}</span>
                <span className="text-[9px] font-medium text-[#0F172A]">{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="px-5 mt-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: '247', label: 'Views', color: '#0A1F52' },
              { value: '38', label: 'Taps', color: '#FF7A00' },
              { value: '12', label: 'Leads', color: '#22C55E' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-[#E5EAF2]">
                <p className="text-lg font-bold" style={{color: s.color}}>{s.value}</p>
                <p className="text-[9px] text-[#64748B]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="px-5 mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-[#0F172A]">Today's Appointments</p>
            <span className="text-[10px] text-[#FF7A00]">View all</span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-[#E5EAF2] flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF7A00]/10 rounded-lg flex items-center justify-center">
              <span className="text-sm">📅</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#0F172A]">Consultation — J. Smith</p>
              <p className="text-[10px] text-[#64748B]">2:00 PM · Immigration</p>
            </div>
            <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] text-[8px] font-bold rounded">CONFIRMED</span>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="px-5 mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-[#0F172A]">Latest Leads</p>
            <span className="text-[10px] text-[#FF7A00]">View all</span>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Sarah Lee', type: 'Civil', time: '5m ago' },
              { name: 'K. Johnson', type: 'Criminal', time: '1h ago' },
            ].map((l) => (
              <div key={l.name} className="bg-white rounded-xl p-3 border border-[#E5EAF2] flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0A1F52]/10 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#0A1F52]">{l.name.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#0F172A]">{l.name}</p>
                  <p className="text-[10px] text-[#64748B]">{l.type} · {l.time}</p>
                </div>
                <span className="px-2 py-0.5 bg-[#FF7A00]/10 text-[#FF7A00] text-[8px] font-bold rounded">NEW</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Health */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-xl p-3 border border-[#E5EAF2] flex items-center gap-3">
            <div className="w-9 h-9 bg-[#22C55E]/10 rounded-lg flex items-center justify-center">
              <span className="text-sm">📱</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#0F172A]">2 NFC Devices Active</p>
              <p className="text-[10px] text-[#64748B]">BG-000001 · BG-000003</p>
            </div>
            <span className="px-2 py-0.5 bg-[#22C55E]/10 text-[#22C55E] text-[8px] font-bold rounded">HEALTHY</span>
          </div>
        </div>

        <MobileBottomNav active="Home" />
      </div>
    </PhoneFrame>
  );
}