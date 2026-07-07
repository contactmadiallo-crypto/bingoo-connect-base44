import React from 'react';
import { PhoneFrame, MobileBottomNav, StatCard, Badge } from './MockupFrame';
import { Icon } from './BingooIcons';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function MockupHomeDashboard() {
  return (
    <PhoneFrame label="2 · Home Dashboard">
      <div className="relative min-h-full pb-24">
        {/* Header */}
        <div className="px-5 pt-10 pb-8" style={{ background: `linear-gradient(160deg, ${NAVY}, #071A3D)` }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white/40 text-[10px] font-medium">Good morning</p>
              <p className="text-white font-black text-base">Mamadou Diallo</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Icon name="search" size={16} color="#FFFFFF" />
              </div>
              <div className="relative">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Icon name="bell" size={16} color="#FFFFFF" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] text-white flex items-center justify-center font-bold" style={{ background: ORANGE }}>3</div>
              </div>
            </div>
          </div>
          {/* Profile selector */}
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
              <span className="font-black text-sm" style={{ color: ORANGE }}>MD</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-black text-sm text-[#0F172A]">Diallo Law Firm</p>
                <Badge color={ORANGE}>DEFAULT</Badge>
              </div>
              <p className="text-[#64748B] text-[10px] font-medium">Law Firm · Professional Plan</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#F7F9FC] flex items-center justify-center">
              <Icon name="chevronRight" size={16} color="#64748B" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 -mt-4">
          <div className="grid grid-cols-4 gap-2">
            <StatCard icon="eye" value="247" label="Views" color={NAVY} bg="#EFF3F9" />
            <StatCard icon="nfc" value="38" label="Taps" color={ORANGE} bg="#FFF0E5" />
            <StatCard icon="message" value="12" label="Leads" color="#22C55E" bg="#E8F9EE" />
            <StatCard icon="calendar" value="5" label="Appts" color="#3b82f6" bg="#E8F0FE" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mt-5">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: 'share', label: 'Share QR', bg: NAVY },
              { icon: 'nfc', label: 'My Devices', bg: ORANGE },
              { icon: 'chart', label: 'Analytics', bg: '#22C55E' },
              { icon: 'message', label: 'Leads CRM', bg: '#3b82f6' },
              { icon: 'calendar', label: 'Bookings', bg: '#ec4899' },
              { icon: 'palette', label: 'Design', bg: '#8b5cf6' },
            ].map((a) => (
              <div key={a.label} className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 border border-[#E5EAF2]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: a.bg }}>
                  <Icon name={a.icon} size={18} color="#FFFFFF" />
                </div>
                <span className="text-[9px] font-bold text-[#0F172A]">{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Appointment */}
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-[#0F172A]">Today's Schedule</p>
            <span className="text-[10px] font-bold" style={{ color: ORANGE }}>View all</span>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#FFF0E5' }}>
              <Icon name="calendar" size={20} color={ORANGE} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#0F172A]">Consultation — J. Smith</p>
              <p className="text-[10px] text-[#64748B]">2:00 PM · Immigration</p>
            </div>
            <Badge color="#22C55E">CONFIRMED</Badge>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-[#0F172A]">Latest Leads</p>
            <span className="text-[10px] font-bold" style={{ color: ORANGE }}>View all</span>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Sarah Lee', type: 'Civil Matter', time: '5m ago', initial: 'S', color: '#3b82f6' },
              { name: 'K. Johnson', type: 'Criminal Defense', time: '1h ago', initial: 'K', color: '#ec4899' },
            ].map((l) => (
              <div key={l.name} className="bg-white rounded-2xl p-3 border border-[#E5EAF2] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[11px]" style={{ background: `${l.color}15`, color: l.color }}>
                  {l.initial}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#0F172A]">{l.name}</p>
                  <p className="text-[10px] text-[#64748B]">{l.type} · {l.time}</p>
                </div>
                <Badge color={ORANGE}>NEW</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Device Health */}
        <div className="px-5 mt-5">
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E8F9EE' }}>
              <Icon name="nfc" size={18} color="#22C55E" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#0F172A]">2 NFC Devices Active</p>
              <p className="text-[10px] text-[#64748B]">BG-000001 · BG-000003</p>
            </div>
            <Badge color="#22C55E">HEALTHY</Badge>
          </div>
        </div>

        <MobileBottomNav active="Home" />
      </div>
    </PhoneFrame>
  );
}