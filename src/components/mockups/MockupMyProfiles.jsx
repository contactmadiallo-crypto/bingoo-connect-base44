import React from 'react';
import { PhoneFrame, MobileBottomNav, Badge } from './MockupFrame';
import { Icon } from './BingooIcons';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function MockupMyProfiles() {
  const profiles = [
    { name: 'Diallo Law Firm', type: 'Law Firm', plan: 'Law Firm', initial: 'DL', color: NAVY, isDefault: true, views: 247 },
    { name: 'Mamadou Diallo', type: 'Personal', plan: 'Professional', initial: 'MD', color: ORANGE, views: 89 },
    { name: 'Diallo Salon', type: 'Salon', plan: 'Salon', initial: 'DS', color: '#ec4899', views: 156 },
  ];

  return (
    <PhoneFrame label="3 · My Profiles">
      <div className="relative min-h-full pb-24">
        {/* Header */}
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, #071A3D)` }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white/40 text-[10px] font-medium">Manage</p>
              <p className="text-white font-black text-xl">My Profiles</p>
            </div>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: ORANGE }}>
              <Icon name="plus" size={20} color="#FFFFFF" />
            </button>
          </div>
          <p className="text-white/40 text-[10px] font-medium">3 profiles · 492 total views this month</p>
        </div>

        {/* Profile Cards */}
        <div className="px-5 mt-4 space-y-3">
          {profiles.map((p) => (
            <div key={p.name} className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)` }}>
                  <span className="text-white font-black text-base">{p.initial}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm text-[#0F172A]">{p.name}</p>
                    {p.isDefault && <Badge color={ORANGE}>DEFAULT</Badge>}
                  </div>
                  <p className="text-[10px] text-[#64748B] font-medium">{p.type} · {p.plan} Plan</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Icon name="eye" size={11} color="#64748B" />
                    <span className="text-[9px] text-[#64748B] font-medium">{p.views} views</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: 'edit', label: 'Edit' },
                  { icon: 'share', label: 'Share' },
                  { icon: 'chart', label: 'Stats' },
                  { icon: 'eye', label: 'View' },
                ].map((a) => (
                  <div key={a.label} className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-[#F7F9FC] cursor-pointer">
                    <Icon name={a.icon} size={16} color={p.isDefault ? ORANGE : NAVY} />
                    <span className="text-[8px] font-bold text-[#64748B]">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Create New */}
        <div className="px-5 mt-4">
          <div className="rounded-2xl p-4 border-2 border-dashed border-[#E5EAF2] flex items-center gap-3 cursor-pointer hover:border-[#f97316] transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F9FC] flex items-center justify-center">
              <Icon name="plus" size={20} color={ORANGE} />
            </div>
            <div>
              <p className="font-bold text-sm text-[#0F172A]">Create New Profile</p>
              <p className="text-[10px] text-[#64748B]">Start a new digital identity</p>
            </div>
          </div>
        </div>

        <MobileBottomNav active="Profiles" />
      </div>
    </PhoneFrame>
  );
}