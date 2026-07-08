import React from 'react';
import { PhoneFrame, MobileBottomNav, Badge, StatCard } from '@/components/mockups/MockupFrame';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

// ── Screen 13: Profile Details / Manage Profile ──
export function MockupProfileDetails() {
  return (
    <PhoneFrame label="13 · Profile Details / Manage">
      <div className="min-h-full pb-24" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-sm">
              <Icon name="chevronRight" size={18} color="#FFFFFF" className="rotate-180" />
            </div>
            <p className="text-white font-black text-sm">Profile Details</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f})` }}>
              <span className="font-black text-lg" style={{ color: ORANGE }}>DL</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-black text-base">Diallo Law Firm</p>
                <Badge color={ORANGE}>DEFAULT</Badge>
              </div>
              <p className="text-white/50 text-[10px]">Law Firm Plan · bingooconnect.com/diallo-law</p>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="px-5 -mt-3">
          <div className="grid grid-cols-4 gap-2">
            <StatCard icon="eye" value="247" label="Views" color={NAVY} bg="#EFF3F9" />
            <StatCard icon="nfc" value="38" label="Taps" color={ORANGE} bg="#FFF0E5" />
            <StatCard icon="message" value="12" label="Leads" color="#22C55E" bg="#E8F9EE" />
            <StatCard icon="calendar" value="5" label="Appts" color="#3b82f6" bg="#E8F0FE" />
          </div>
        </div>
        {/* Quick Actions */}
        <div className="px-5 mt-5">
          <p className="text-xs font-black text-[#0F172A] mb-3">Manage</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: 'edit', label: 'Edit', color: NAVY },
              { icon: 'share', label: 'Share', color: ORANGE },
              { icon: 'qr', label: 'QR Code', color: '#3b82f6' },
              { icon: 'nfc', label: 'Devices', color: '#22C55E' },
              { icon: 'chart', label: 'Analytics', color: '#8b5cf6' },
              { icon: 'palette', label: 'Design', color: '#ec4899' },
              { icon: 'link', label: 'Links', color: '#f97316' },
              { icon: 'settings', label: 'Settings', color: '#64748B' },
            ].map((a) => (
              <div key={a.label} className="bg-white rounded-2xl p-2.5 flex flex-col items-center gap-1.5 border border-[#E5EAF2]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `linear-gradient(135deg, ${a.color}, ${a.color}dd)` }}>
                  <Icon name={a.icon} size={16} color="#FFFFFF" />
                </div>
                <span className="text-[8px] font-bold text-[#0F172A]">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Profile Sections */}
        <div className="px-5 mt-5">
          <p className="text-xs font-black text-[#0F172A] mb-3">Profile Sections</p>
          <div className="bg-white rounded-2xl border border-[#E5EAF2] divide-y divide-[#E5EAF2]">
            {[
              { icon: 'users', label: 'Information', desc: 'Name, title, bio, photo', color: NAVY },
              { icon: 'palette', label: 'Design & Layout', desc: 'Magazine layout, navy theme', color: ORANGE },
              { icon: 'link', label: 'Links & Social', desc: '5 social links connected', color: '#3b82f6' },
              { icon: 'grid', label: 'Media & Portfolio', desc: '3 portfolio items', color: '#22C55E' },
              { icon: 'briefcase', label: 'Business Tools', desc: 'CRM, appointments, analytics', color: '#8b5cf6' },
              { icon: 'shield', label: 'NFC & Lost Mode', desc: '2 devices, 1 lost', color: '#ec4899' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 p-3.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <Icon name={s.icon} size={16} color={s.color} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#0F172A]">{s.label}</p>
                  <p className="text-[9px] text-[#64748B]">{s.desc}</p>
                </div>
                <Icon name="chevronRight" size={14} color={MUTED} />
              </div>
            ))}
          </div>
        </div>
        <MobileBottomNav active="Profiles" />
      </div>
    </PhoneFrame>
  );
}

// ── Screen 18: Public Profile Preview ──
export function MockupPublicProfilePreview() {
  return (
    <PhoneFrame label="18 · Public Profile Preview (Visitor View)">
      <div className="min-h-full" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        {/* Cover */}
        <div className="relative h-32" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: ORANGE, filter: 'blur(60px)' }} />
        </div>
        {/* Avatar */}
        <div className="px-5 -mt-12 relative z-10">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-2xl flex items-center justify-center mb-3" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
            <span className="font-black text-2xl" style={{ color: ORANGE }}>DL</span>
          </div>
          <p className="text-white font-black text-xl">Diallo Law Firm</p>
          <p className="text-white/60 text-xs mb-1">Immigration · Civil · Criminal</p>
          <div className="flex items-center gap-1 mb-4">
            <Icon name="mapPin" size={12} color="rgba(255,255,255,0.5)" />
            <span className="text-white/50 text-[10px]">New York, NY</span>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="px-5 space-y-2.5 mb-5">
          {[
            { icon: 'phone', label: 'Call (212) 555-0192', color: '#22C55E' },
            { icon: 'message', label: 'WhatsApp', color: '#25D366' },
            { icon: 'mail', label: 'Email', color: '#3b82f6' },
            { icon: 'globe', label: 'Visit Website', color: ORANGE },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md border border-white/10" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${b.color}25` }}>
                <Icon name={b.icon} size={16} color={b.color} />
              </div>
              <span className="text-white text-xs font-bold flex-1">{b.label}</span>
              <Icon name="chevronRight" size={14} color="rgba(255,255,255,0.3)" />
            </div>
          ))}
        </div>
        {/* Social Links */}
        <div className="px-5 mb-5">
          <div className="flex justify-center gap-3">
            {['globe', 'globe', 'globe', 'globe', 'globe'].map((_, i) => {
              const colors = ['#1877F2', '#E4405F', '#000000', '#0A66C2', '#FF0000'];
              return (
                <div key={i} className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <Icon name="globe" size={16} color={colors[i]} />
                </div>
              );
            })}
          </div>
        </div>
        {/* QR */}
        <div className="px-5 mb-5">
          <div className="bg-white rounded-2xl p-4 text-center mx-auto max-w-[200px]">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">SCAN TO SAVE CONTACT</p>
            <div className="inline-block p-2 bg-white rounded-lg">
              <div className="w-28 h-28 rounded-lg p-1.5" style={{ background: NAVY }}>
                <div className="w-full h-full rounded grid grid-cols-7 gap-px p-1">
                  {Array.from({ length: 49 }).map((_, i) => {
                    const corners = [0, 6, 42, 48];
                    return <div key={i} className={`rounded-[1px] ${corners.includes(i) || Math.random() > 0.45 ? 'bg-white' : 'bg-transparent'}`} />;
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ORANGE}, #fb923c)` }}>
                <svg width="8" height="4" viewBox="0 0 48 24" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><path d="M 14 12 C 14 6 20 6 24 12 C 28 18 34 18 34 12 C 34 6 28 6 24 12 C 20 18 14 18 14 12 Z" /></svg>
              </div>
              <span className="text-[9px] font-bold text-[#64748B]">Scan Me</span>
            </div>
          </div>
        </div>
        {/* Save Contact */}
        <div className="px-5 pb-8">
          <button className="w-full py-3 text-white text-sm font-black rounded-2xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
            <Icon name="download" size={16} color="#FFFFFF" /> Save to Contacts
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}