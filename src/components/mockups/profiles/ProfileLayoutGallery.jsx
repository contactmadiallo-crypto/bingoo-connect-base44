import React from 'react';
import { PhoneFrame, DesktopFrame, Badge } from '@/components/mockups/MockupFrame';
import { InfinityMark, BingooAppIcon, BingooWordmark } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

// ── Shared Mini Profile Preview ──
function MiniProfile({ children, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[200px] h-[360px] bg-[#0F172A] rounded-[2rem] p-[6px] shadow-xl shadow-[#0b2149]/20">
        <div className="w-full h-full bg-white rounded-[1.7rem] overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#0F172A] rounded-b-xl z-20" />
          <div className="w-full h-full overflow-hidden">
            {children}
          </div>
        </div>
      </div>
      <span className="text-xs font-bold text-[#64748B]">{label}</span>
    </div>
  );
}

// ── Layout 1: Executive Premium ──
function ExecutivePremium() {
  return (
    <MiniProfile label="Executive Premium">
      <div className="h-full" style={{ background: `linear-gradient(180deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="h-20" />
        <div className="px-4 text-center">
          <div className="w-14 h-14 rounded-full border-3 border-white/20 mx-auto mb-2 flex items-center justify-center" style={{ background: ORANGE }}>
            <span className="text-white font-black text-base">JC</span>
          </div>
          <p className="text-white font-black text-sm">James Carter</p>
          <p className="text-white/50 text-[8px]">CEO · Carter Enterprises</p>
          <div className="mt-2 mb-3"><InfinityMark size={20} color={ORANGE} strokeWidth={2} /></div>
          <div className="space-y-1.5">
            {['Call', 'Email', 'Website'].map((l) => (
              <div key={l} className="flex items-center justify-center py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white text-[9px] font-bold">{l}</div>
            ))}
          </div>
        </div>
      </div>
    </MiniProfile>
  );
}

// ── Layout 2: Creative / Influencer ──
function CreativeInfluencer() {
  return (
    <MiniProfile label="Creative / Influencer">
      <div className="h-full" style={{ background: `linear-gradient(180deg, #ec4899, #8b5cf6)` }}>
        <div className="h-16" />
        <div className="px-4 text-center">
          <div className="w-16 h-16 rounded-3xl mx-auto mb-2 overflow-hidden border-2 border-white/30" style={{ background: '#f97316' }}>
            <span className="flex items-center justify-center h-full text-white font-black text-lg">SK</span>
          </div>
          <p className="text-white font-black text-sm">Sophia Kim</p>
          <p className="text-white/70 text-[8px]">Content Creator · 250K Followers</p>
          <div className="flex justify-center gap-1.5 mt-2 mb-3">
            {['📷', '🎵', '▶️', '📘'].map((e, i) => (
              <div key={i} className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-[10px]">{e}</div>
            ))}
          </div>
          <div className="space-y-1.5">
            {['Latest Video', 'Book a Collab', 'My Store'].map((l, i) => (
              <div key={l} className="flex items-center justify-center py-2 rounded-xl text-[9px] font-black" style={{ background: i === 1 ? '#FFFFFF' : 'rgba(255,255,255,0.2)', color: i === 1 ? '#ec4899' : '#FFFFFF' }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </MiniProfile>
  );
}

// ── Layout 3: Salon / Service Provider ──
function SalonProvider() {
  return (
    <MiniProfile label="Salon / Service Provider">
      <div className="h-full bg-[#FFF5F5]">
        <div className="h-14" style={{ background: `linear-gradient(135deg, #ec4899, #f97316)` }} />
        <div className="px-4 -mt-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-2 border-3 border-white shadow-lg flex items-center justify-center" style={{ background: '#ec4899' }}>
            <span className="text-white font-black text-sm">BS</span>
          </div>
          <p className="text-center font-black text-sm text-[#0F172A]">Bella Studio</p>
          <p className="text-center text-[8px] text-[#64748B]">Hair · Nails · Beauty</p>
          <div className="mt-3 bg-white rounded-xl p-2 shadow-sm">
            <p className="text-[8px] font-bold text-[#64748B] mb-1">SERVICES</p>
            {['Haircut — $35', 'Manicure — $25', 'Coloring — $80'].map((s) => (
              <div key={s} className="flex items-center justify-between py-1 text-[8px]">
                <span className="font-bold text-[#0F172A]">{s.split(' — ')[0]}</span>
                <span className="font-black text-[#ec4899]">{s.split(' — ')[1]}</span>
              </div>
            ))}
          </div>
          <button className="w-full py-2 mt-2 text-white text-[9px] font-black rounded-xl" style={{ background: '#ec4899' }}>Book Appointment</button>
        </div>
      </div>
    </MiniProfile>
  );
}

// ── Layout 4: Law Firm / Professional Services ──
function LawFirmLayout() {
  return (
    <MiniProfile label="Law Firm / Professional">
      <div className="h-full" style={{ background: NAVY }}>
        <div className="h-16 border-b border-white/10 flex items-center justify-center">
          <BingooWordmark size="text-xs" light textColor="#FFFFFF" infinityColor={ORANGE} />
        </div>
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ORANGE }}>
              <span className="text-white font-black text-[10px]">DL</span>
            </div>
            <div>
              <p className="text-white font-black text-[11px]">Diallo Law Firm</p>
              <p className="text-white/50 text-[7px]">Immigration · Civil · Criminal</p>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-2 mb-2 border border-white/10">
            <p className="text-white/40 text-[7px] font-bold mb-1">PRACTICE AREAS</p>
            {['Family Immigration', 'Asylum Defense', 'Deportation'].map((p) => (
              <div key={p} className="flex items-center gap-1 py-0.5"><div className="w-1 h-1 rounded-full" style={{ background: ORANGE }} /><span className="text-white/80 text-[8px] font-medium">{p}</span></div>
            ))}
          </div>
          <div className="space-y-1">
            {['📞 Call', '💬 WhatsApp', '✉️ Email', '📅 Consultation'].map((l, i) => (
              <div key={l} className="flex items-center justify-center py-1.5 rounded-lg text-[8px] font-bold" style={{ background: i === 3 ? ORANGE : 'rgba(255,255,255,0.08)', color: '#FFFFFF' }}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </MiniProfile>
  );
}

// ── Layout 5: Business Team / Company ──
function BusinessTeamLayout() {
  return (
    <MiniProfile label="Business Team / Company">
      <div className="h-full bg-[#F7F9FC]">
        <div className="h-16" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
          <div className="flex items-center justify-center h-full"><BingooAppIcon size={28} glow={false} /></div>
        </div>
        <div className="px-4 pt-3">
          <p className="font-black text-xs text-[#0F172A] text-center">Carter Enterprises</p>
          <p className="text-[8px] text-[#64748B] text-center">Technology · Consulting · Investments</p>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {['About', 'Services', 'Team', 'Careers', 'Contact', 'Portfolio'].map((l) => (
              <div key={l} className="flex items-center justify-center py-2 rounded-lg bg-white border border-[#E5EAF2] text-[8px] font-bold text-[#0F172A]">{l}</div>
            ))}
          </div>
          <div className="mt-2 bg-white rounded-xl p-2 border border-[#E5EAF2]">
            <p className="text-[7px] font-bold text-[#64748B] mb-1">OUR TEAM</p>
            <div className="flex gap-1">
              {['JC', 'MD', 'SL', 'RK'].map((i, idx) => (
                <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-black text-white" style={{ background: [NAVY, ORANGE, '#3b82f6', '#22C55E'][idx] }}>{i}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MiniProfile>
  );
}

// ── Layout 6: Event Networking ──
function EventNetworkingLayout() {
  return (
    <MiniProfile label="Event Networking">
      <div className="h-full" style={{ background: `linear-gradient(180deg, ${ORANGE}, #fb923c)` }}>
        <div className="px-4 pt-6 text-center">
          <Badge color={NAVY}>TECH CONF 2026</Badge>
          <div className="w-14 h-14 rounded-full mx-auto mt-3 mb-2 border-3 border-white/30 flex items-center justify-center bg-white" >
            <span className="font-black text-sm" style={{ color: ORANGE }}>AK</span>
          </div>
          <p className="text-white font-black text-sm">Alex Kumar</p>
          <p className="text-white/70 text-[8px]">CTO · TechStart</p>
          <div className="bg-white rounded-xl p-2 mt-3">
            <div className="w-16 h-16 mx-auto rounded-lg p-1" style={{ background: NAVY }}>
              <div className="w-full h-full grid grid-cols-5 gap-px p-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
            <p className="text-[7px] font-bold text-[#64748B] mt-1">SCAN TO CONNECT</p>
          </div>
          <button className="w-full py-2 mt-2 text-[9px] font-black rounded-xl bg-white" style={{ color: ORANGE }}>Exchange Contact</button>
        </div>
      </div>
    </MiniProfile>
  );
}

// ── Layout 7: Minimal NFC Card ──
function MinimalNFCCard() {
  return (
    <MiniProfile label="Minimal NFC Card">
      <div className="h-full bg-white flex flex-col items-center justify-center px-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2" style={{ background: NAVY }}>
          <span className="font-black text-xs" style={{ color: ORANGE }}>RJ</span>
        </div>
        <p className="font-black text-xs text-[#0F172A]">Robert Jones</p>
        <p className="text-[8px] text-[#64748B] mb-4">Software Engineer</p>
        <div className="space-y-1.5 w-full">
          {[
            { icon: 'phone', label: '(212) 555-0192', color: '#22C55E' },
            { icon: 'mail', label: 'rob@email.com', color: '#3b82f6' },
            { icon: 'globe', label: 'rob.dev', color: ORANGE },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 py-2 px-3 rounded-xl border border-[#E5EAF2]">
              <Icon name={l.icon} size={12} color={l.color} />
              <span className="text-[9px] font-bold text-[#0F172A]">{l.label}</span>
            </div>
          ))}
        </div>
        <InfinityMark size={16} color="#E5EAF2" strokeWidth={2} className="mt-4" />
      </div>
    </MiniProfile>
  );
}

// ── Layout 8: Rich Media Profile ──
function RichMediaLayout() {
  return (
    <MiniProfile label="Rich Media Profile">
      <div className="h-full bg-[#0F172A]">
        <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${NAVY}, #8b5cf6)` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-1" />
            </div>
          </div>
        </div>
        <div className="px-4 -mt-6">
          <div className="w-12 h-12 rounded-2xl border-2 border-[#0F172A] flex items-center justify-center mb-2" style={{ background: '#8b5cf6' }}>
            <span className="text-white font-black text-xs">MV</span>
          </div>
          <p className="text-white font-black text-sm">Maya Visuals</p>
          <p className="text-white/50 text-[8px]">Photographer · Filmmaker</p>
          <div className="grid grid-cols-3 gap-1 mt-3">
            {['#8b5cf6', '#ec4899', '#f97316', '#3b82f6', '#22C55E', '#fbbf24'].map((c, i) => (
              <div key={i} className="aspect-square rounded-lg" style={{ background: c }} />
            ))}
          </div>
          <div className="space-y-1 mt-3">
            <div className="flex items-center justify-center py-2 rounded-xl text-[9px] font-black text-white" style={{ background: '#8b5cf6' }}>View Portfolio</div>
            <div className="flex items-center justify-center py-1.5 rounded-xl text-[8px] font-bold text-white bg-white/10">Book a Shoot</div>
          </div>
        </div>
      </div>
    </MiniProfile>
  );
}

// ── Desktop Public Profile Preview ──
function DesktopProfilePreview() {
  return (
    <DesktopFrame label="Public Profile — Desktop Preview Mode" height="h-[600px]">
      <div className="h-full" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <BingooWordmark size="text-lg" light textColor="#FFFFFF" infinityColor={ORANGE} />
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-[10px] font-bold text-white bg-white/10 rounded-lg backdrop-blur-sm">Share</button>
              <button className="px-3 py-1.5 text-[10px] font-black rounded-lg" style={{ background: ORANGE, color: '#FFFFFF' }}>Open Preview ↗</button>
            </div>
          </div>
          {/* Profile Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="h-32" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20" style={{ background: ORANGE, filter: 'blur(50px)' }} />
            </div>
            <div className="px-8 pt-5 pb-8 -mt-8 relative">
              <div className="flex items-end gap-4 mb-4">
                <div className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
                  <span className="font-black text-xl" style={{ color: ORANGE }}>DL</span>
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-[#0F172A]">Diallo Law Firm</h2>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${NAVY}10` }}>
                      <Icon name="shield" size={10} color={NAVY} />
                      <span className="text-[8px] font-black" style={{ color: NAVY }}>VERIFIED</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#64748B]">Immigration · Civil · Criminal · New York, NY</p>
                </div>
                <InfinityMark size={28} color={ORANGE} strokeWidth={2.5} glow={true} />
              </div>
              {/* Grid Layout */}
              <div className="grid grid-cols-3 gap-4">
                {/* Left: Actions */}
                <div className="col-span-1 space-y-2">
                  <p className="text-[8px] font-bold text-[#64748B] tracking-wider mb-1">CONTACT</p>
                  {[
                    { icon: 'phone', label: 'Call', value: '(212) 555-0192', color: '#22C55E' },
                    { icon: 'message', label: 'WhatsApp', value: 'Chat now', color: '#25D366' },
                    { icon: 'mail', label: 'Email', value: 'contact@dlf.com', color: '#3b82f6' },
                    { icon: 'globe', label: 'Website', value: 'dlf.com', color: ORANGE },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5EAF2] hover:bg-[#F7F9FC] cursor-pointer">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.color}15` }}><Icon name={c.icon} size={14} color={c.color} /></div>
                      <div className="flex-1"><p className="text-[9px] font-bold text-[#0F172A]">{c.label}</p><p className="text-[8px] text-[#64748B]">{c.value}</p></div>
                      <Icon name="chevronRight" size={12} color="#cbd5e1" />
                    </div>
                  ))}
                  <button className="w-full py-2.5 text-[10px] font-black text-white rounded-xl shadow-md" style={{ background: ORANGE }}>📅 Book Consultation</button>
                </div>
                {/* Center: Services */}
                <div className="col-span-1 space-y-2">
                  <p className="text-[8px] font-bold text-[#64748B] tracking-wider mb-1">SERVICES</p>
                  {['Family Immigration', 'Asylum Defense', 'Deportation Defense', 'Civil Litigation', 'Criminal Defense'].map((s) => (
                    <div key={s} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F7F9FC]">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="check" size={10} color={NAVY} /></div>
                      <span className="text-[9px] font-bold text-[#0F172A]">{s}</span>
                    </div>
                  ))}
                </div>
                {/* Right: QR + Social */}
                <div className="col-span-1 space-y-2">
                  <p className="text-[8px] font-bold text-[#64748B] tracking-wider mb-1">SCAN TO SAVE</p>
                  <div className="bg-white rounded-xl p-3 border border-[#E5EAF2] text-center">
                    <div className="inline-block p-1.5 rounded-lg" style={{ background: NAVY }}>
                      <div className="w-16 h-16 grid grid-cols-5 gap-px p-1">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-[7px] font-bold text-[#64748B] mt-1">SCAN ME</p>
                  </div>
                  <p className="text-[8px] font-bold text-[#64748B] tracking-wider mt-2">SOCIAL</p>
                  <div className="flex gap-1.5">
                    {['#1877F2', '#E4405F', '#0A66C2', '#FF0000'].map((c) => (
                      <div key={c} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c}15` }}><Icon name="globe" size={12} color={c} /></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

export default function ProfileLayoutGallery() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <p className="text-xs font-black text-[#0F172A] mb-1">Profile Layout Template Gallery</p>
        <p className="text-[10px] text-[#64748B]">8 distinct layouts — same Bingoo brand system, different professional contexts</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ExecutivePremium />
        <CreativeInfluencer />
        <SalonProvider />
        <LawFirmLayout />
        <BusinessTeamLayout />
        <EventNetworkingLayout />
        <MinimalNFCCard />
        <RichMediaLayout />
      </div>
      <div className="pt-8">
        <p className="text-xs font-black text-[#0F172A] mb-1 text-center">Desktop Public Profile Preview</p>
        <p className="text-[10px] text-[#64748B] text-center mb-6">Modern, premium desktop view — non-clickable except "Open Preview" action</p>
        <DesktopProfilePreview />
      </div>
    </div>
  );
}