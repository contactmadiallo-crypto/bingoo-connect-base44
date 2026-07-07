import React from 'react';
import { PhoneFrame, MobileBottomNav, Badge } from './MockupFrame';
import { Icon } from './BingooIcons';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function MockupNFC() {
  const devices = [
    { code: 'BG-000001', type: 'NFC Business Card', status: 'active', initial: 'C', color: NAVY },
    { code: 'BG-000003', type: 'NFC Keychain', status: 'active', initial: 'K', color: ORANGE },
    { code: 'BG-000007', type: 'NFC Bracelet', status: 'lost', initial: 'B', color: '#EF4444' },
  ];

  const activeActions = [
    { icon: 'share', label: 'Share' },
    { icon: 'edit', label: 'Edit' },
    { icon: 'shield', label: 'Lost Mode' },
  ];

  const lostActions = [
    { icon: 'eye', label: 'View' },
    { icon: 'package', label: 'Replace' },
    { icon: 'shield', label: 'Deactivate' },
  ];

  return (
    <PhoneFrame label="5 · NFC Operating Center">
      <div className="relative min-h-full pb-24">
        {/* Header */}
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, #071A3D)` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/40 text-[10px] font-medium">Manage</p>
              <p className="text-white font-black text-xl">NFC Center</p>
            </div>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: ORANGE }}>
              <Icon name="plus" size={20} color="#FFFFFF" />
            </button>
          </div>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: '3', label: 'Total', color: '#FFFFFF' },
              { value: '2', label: 'Active', color: '#22C55E' },
              { value: '1', label: 'Lost', color: '#EF4444' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[9px] text-white/50 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Device Cards */}
        <div className="px-5 mt-4 space-y-3">
          {devices.map((d) => {
            const actions = d.status === 'active' ? activeActions : lostActions;
            return (
              <div key={d.code} className="bg-white rounded-2xl p-4 border border-[#E5EAF2]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${d.color}, ${d.color}cc)` }}>
                    <Icon name="nfc" size={22} color="#FFFFFF" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-[#0F172A]">{d.type}</p>
                    <p className="text-[10px] text-[#64748B] font-medium">{d.code}</p>
                  </div>
                  <Badge color={d.status === 'active' ? '#22C55E' : '#EF4444'}>
                    {d.status === 'active' ? 'ACTIVE' : 'LOST'}
                  </Badge>
                </div>
                {d.status === 'lost' && (
                  <div className="bg-[#FEF2F2] rounded-xl p-3 mb-3 flex items-center gap-2">
                    <Icon name="alert" size={14} color="#EF4444" />
                    <p className="text-[10px] text-[#EF4444] font-bold">Lost mode active — finder sees your contact info</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {actions.map((a) => (
                    <div key={a.label} className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-[#F7F9FC] cursor-pointer">
                      <Icon name={a.icon} size={16} color={NAVY} />
                      <span className="text-[8px] font-bold text-[#64748B]">{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Shop CTA */}
        <div className="px-5 mt-4">
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${NAVY}, #071A3D)` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ORANGE }}>
              <Icon name="shop" size={20} color="#FFFFFF" />
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-xs">Need More Devices?</p>
              <p className="text-white/50 text-[9px]">Shop premium NFC products</p>
            </div>
            <Icon name="chevronRight" size={16} color={ORANGE} />
          </div>
        </div>

        <MobileBottomNav active="NFC" />
      </div>
    </PhoneFrame>
  );
}