import React from 'react';
import { PhoneFrame, DesktopFrame, Badge } from '@/components/mockups/MockupFrame';
import { InfinityMark, BingooAppIcon, BingooWordmark, LoadingDots } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', MUTED = '#64748B', INK = '#0F172A';

const META_GLASS_URL = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/6185126c6_generated_image.png';

// ── AI Profile Builder ──
function AIProfileBuilder() {
  return (
    <PhoneFrame label="AI Profile Builder">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-3">
            <BingooAppIcon size={28} glow={false} />
            <p className="text-white font-black text-sm">AI Profile Builder</p>
          </div>
          <p className="text-white/50 text-[10px]">Let AI craft your perfect profile</p>
        </div>
        <div className="px-5 mt-4">
          {/* AI Chat */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
            <div className="flex items-start gap-2 mb-3">
              <BingooAppIcon size={24} glow={false} />
              <div className="flex-1 bg-[#F7F9FC] rounded-xl p-2.5">
                <p className="text-[10px] text-[#0F172A]">Hi! I'll help you build an amazing profile. What's your profession?</p>
              </div>
            </div>
            <div className="flex items-start gap-2 mb-3 flex-row-reverse">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: ORANGE }}><span className="text-white text-[8px] font-black">MD</span></div>
              <div className="flex-1 rounded-xl p-2.5" style={{ background: `${ORANGE}15` }}>
                <p className="text-[10px] text-[#0F172A]">I'm an immigration attorney in NYC</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <BingooAppIcon size={24} glow={false} />
              <div className="flex-1 bg-[#F7F9FC] rounded-xl p-2.5">
                <p className="text-[10px] text-[#0F172A]">Excellent! I've drafted your bio, selected the Law Firm layout, and recommended 3 CTAs. Review below ↓</p>
                <LoadingDots color={ORANGE} size={6} className="mt-1" />
              </div>
            </div>
          </div>
          {/* AI Suggestions */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">AI SUGGESTIONS</p>
            {[
              { type: 'Bio', value: 'Experienced immigration attorney...', icon: 'edit' },
              { type: 'Layout', value: 'Executive Premium (Law Firm)', icon: 'palette' },
              { type: 'CTAs', value: 'Book Consultation, Call, WhatsApp', icon: 'zap' },
            ].map((s) => (
              <div key={s.type} className="flex items-center gap-2 py-2 border-b border-[#E5EAF2] last:border-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ORANGE}15` }}><Icon name={s.icon} size={12} color={ORANGE} /></div>
                <div className="flex-1"><p className="text-[8px] font-bold text-[#64748B]">{s.type}</p><p className="text-[9px] font-bold text-[#0F172A]">{s.value}</p></div>
                <div className="flex gap-1"><div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#22C55E15' }}><Icon name="check" size={10} color="#22C55E" /></div><div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#EF444415' }}><Icon name="alert" size={10} color="#EF4444" /></div></div>
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 text-white text-xs font-black rounded-xl shadow-lg" style={{ background: ORANGE }}>Apply AI Suggestions</button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Profile Quality Score ──
function ProfileQualityScore() {
  return (
    <PhoneFrame label="Profile Quality Score">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <p className="text-white font-black text-sm">Profile Quality Score</p>
          <p className="text-white/50 text-[10px]">Complete your profile to maximize impact</p>
        </div>
        <div className="px-5 mt-4">
          {/* Score Ring */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] text-center mb-3">
            <div className="relative inline-block">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E5EAF2" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={ORANGE} strokeWidth="8" strokeDasharray="264" strokeDashoffset="66" strokeLinecap="round" transform="rotate(-90 50 50)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black" style={{ color: ORANGE }}>75</span>
                <span className="text-[8px] font-bold text-[#64748B]">/ 100</span>
              </div>
            </div>
            <Badge color="#22C55E">GOOD — KEEP GOING!</Badge>
          </div>
          {/* Checklist */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">COMPLETION CHECKLIST</p>
            {[
              { label: 'Profile photo', done: true },
              { label: 'Bio (min 50 chars)', done: true },
              { label: 'Contact information', done: true },
              { label: 'At least 3 social links', done: true },
              { label: 'Practice areas / services', done: false },
              { label: 'NFC device linked', done: false },
              { label: 'Booking enabled', done: false },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-2 py-1.5">
                <div className={`w-5 h-5 rounded flex items-center justify-center ${c.done ? '' : 'border-2 border-[#E5EAF2]'}`} style={c.done ? { background: '#22C55E' } : {}}>
                  {c.done ? <Icon name="check" size={10} color="#FFFFFF" /> : <span className="text-[8px] font-bold text-[#cbd5e1]">+</span>}
                </div>
                <span className={`text-[10px] font-bold ${c.done ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{c.label}</span>
                {!c.done && <span className="ml-auto text-[8px] font-bold" style={{ color: ORANGE }}>+15 pts</span>}
              </div>
            ))}
          </div>
          {/* Smart CTA Recommendations */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2]">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="zap" size={14} color={ORANGE} />
              <p className="text-[9px] font-bold text-[#0F172A]">SMART CTA RECOMMENDATIONS</p>
            </div>
            {['Add "Book Consultation" — 92% of law profiles use this', 'Add "Save Contact" — increases saves by 40%'].map((r) => (
              <div key={r} className="flex items-center gap-2 py-1.5">
                <Icon name="sparkles" size={12} color={ORANGE} />
                <span className="text-[9px] text-[#0F172A] flex-1">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Verified Badges ──
function VerifiedBadges() {
  return (
    <PhoneFrame label="Verified Profile & Business Badges">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <p className="text-white font-black text-sm">Verification Badges</p>
          <p className="text-white/50 text-[10px]">Build trust with verified status</p>
        </div>
        <div className="px-5 mt-4 space-y-3">
          {/* Verified Profile */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
                <span className="font-black text-sm" style={{ color: ORANGE }}>MD</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-black text-sm text-[#0F172A]">Mamadou Diallo</p>
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ background: `${NAVY}10` }}>
                    <Icon name="shield" size={10} color={NAVY} />
                    <span className="text-[7px] font-black" style={{ color: NAVY }}>VERIFIED</span>
                  </div>
                </div>
                <p className="text-[9px] text-[#64748B]">Immigration Attorney</p>
              </div>
            </div>
            <p className="text-[9px] text-[#64748B]">Identity verified via government ID check</p>
          </div>
          {/* Verified Business */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
                <span className="font-black text-sm" style={{ color: ORANGE }}>DL</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-black text-sm text-[#0F172A]">Diallo Law Firm</p>
                  <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full" style={{ background: `${ORANGE}15` }}>
                    <Icon name="checkCircle" size={10} color={ORANGE} />
                    <span className="text-[7px] font-black" style={{ color: ORANGE }}>VERIFIED BUSINESS</span>
                  </div>
                </div>
                <p className="text-[9px] text-[#64748B]">Law Firm · New York, NY</p>
              </div>
            </div>
            <p className="text-[9px] text-[#64748B]">Business verified via state registration & bar association</p>
          </div>
          {/* Privacy Controls */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2]">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="lock" size={14} color={NAVY} />
              <p className="text-[9px] font-bold text-[#0F172A]">PRIVACY CONTROLS</p>
            </div>
            {[
              { label: 'Hide email from public', on: true },
              { label: 'Show phone only to verified users', on: false },
              { label: 'Block search engines', on: false },
              { label: 'Require NFC tap to view', on: false },
            ].map((p) => (
              <div key={p.label} className="flex items-center justify-between py-1.5">
                <span className="text-[9px] font-bold text-[#0F172A]">{p.label}</span>
                <div className="w-8 h-4 rounded-full p-0.5" style={{ background: p.on ? ORANGE : '#E5EAF2' }}>
                  <div className={`w-3 h-3 rounded-full bg-white ${p.on ? 'ml-auto' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── ROI Analytics ──
function ROIAnalytics() {
  return (
    <DesktopFrame label="ROI Analytics — Revenue Attribution" height="h-[600px]">
      <div className="p-5 bg-[#F7F9FC] h-full overflow-y-auto">
        <p className="text-[10px] font-bold text-[#f97316] tracking-wider mb-1">BUSINESS IMPACT</p>
        <h2 className="text-lg font-black text-[#0F172A] mb-4">ROI Analytics</h2>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[
            { label: 'Total Taps', value: '2,847', color: ORANGE, icon: 'nfc' },
            { label: 'Contacts Saved', value: '1,203', color: NAVY, icon: 'users' },
            { label: 'Leads Generated', value: '128', color: '#22C55E', icon: 'message' },
            { label: 'Bookings', value: '47', color: '#3b82f6', icon: 'calendar' },
            { label: 'Revenue Attributed', value: '$24.5K', color: '#8b5cf6', icon: 'trend' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
              <div className="flex items-center justify-between mb-1.5"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}><Icon name={k.icon} size={13} color={k.color} /></div></div>
              <p className="text-base font-black" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[8px] text-[#64748B]">{k.label}</p>
            </div>
          ))}
        </div>
        {/* Funnel */}
        <div className="bg-white rounded-xl p-4 border border-[#E5EAF2] mb-4">
          <p className="text-[10px] font-black text-[#0F172A] mb-3">Conversion Funnel</p>
          <div className="space-y-2">
            {[
              { stage: 'NFC Taps', count: 2847, pct: 100, color: ORANGE },
              { stage: 'Profile Views', count: 2401, pct: 84, color: '#fb923c' },
              { stage: 'Contacts Saved', count: 1203, pct: 42, color: '#3b82f6' },
              { stage: 'Leads', count: 128, pct: 4.5, color: '#22C55E' },
              { stage: 'Bookings', count: 47, pct: 1.7, color: '#8b5cf6' },
              { stage: 'Revenue', count: 24, pct: 0.8, color: NAVY },
            ].map((f) => (
              <div key={f.stage} className="flex items-center gap-3">
                <span className="text-[9px] font-bold text-[#0F172A] w-24">{f.stage}</span>
                <div className="flex-1 h-6 bg-[#F7F9FC] rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg flex items-center px-2" style={{ width: `${f.pct}%`, background: f.color }}>
                    <span className="text-[8px] font-black text-white">{f.count.toLocaleString()}</span>
                  </div>
                </div>
                <span className="text-[8px] font-bold text-[#64748B] w-10 text-right">{f.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        {/* Top Devices */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
            <p className="text-[10px] font-black text-[#0F172A] mb-2">Top Performing Devices</p>
            {[
              { code: 'BG-000001', name: 'Office Desk Card', taps: 1247, leads: 47 },
              { code: 'BG-000003', name: 'Conference Keychain', taps: 892, leads: 28 },
              { code: 'BG-000007', name: 'Pocket Bracelet', taps: 708, leads: 19 },
            ].map((d) => (
              <div key={d.code} className="flex items-center gap-2 py-2 border-b border-[#E5EAF2] last:border-0">
                <Icon name="nfc" size={14} color={ORANGE} />
                <div className="flex-1"><p className="text-[9px] font-bold text-[#0F172A]">{d.name}</p><p className="text-[8px] text-[#64748B]">{d.code}</p></div>
                <div className="text-right"><p className="text-[9px] font-black" style={{ color: ORANGE }}>{d.taps} taps</p><p className="text-[8px] text-[#22C55E]">{d.leads} leads</p></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
            <p className="text-[10px] font-black text-[#0F172A] mb-2">Follow-up Reminders</p>
            {[
              { name: 'Sarah Lee', action: 'Call back', due: 'Today', color: '#EF4444' },
              { name: 'James Smith', action: 'Send proposal', due: 'Tomorrow', color: ORANGE },
              { name: 'Maria Garcia', action: 'Schedule consult', due: 'Jul 12', color: '#3b82f6' },
            ].map((r) => (
              <div key={r.name} className="flex items-center gap-2 py-2 border-b border-[#E5EAF2] last:border-0">
                <Icon name="clock" size={14} color={r.color} />
                <div className="flex-1"><p className="text-[9px] font-bold text-[#0F172A]">{r.name}</p><p className="text-[8px] text-[#64748B]">{r.action}</p></div>
                <Badge color={r.color}>{r.due.toUpperCase()}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

// ── Event Mode ──
function EventMode() {
  return (
    <PhoneFrame label="Event Mode — Conference Networking">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${ORANGE}, #fb923c)` }}>
          <div className="flex items-center justify-between mb-3">
            <Badge color={NAVY}>EVENT MODE ACTIVE</Badge>
            <InfinityMark size={20} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <p className="text-white font-black text-base">TechConf 2026</p>
          <p className="text-white/70 text-[10px]">Day 2 · 47 connections made</p>
        </div>
        <div className="px-5 mt-4">
          {/* Quick Connect */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] text-center mb-3">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">QUICK CONNECT</p>
            <div className="w-20 h-20 mx-auto rounded-2xl p-2" style={{ background: NAVY }}>
              <div className="w-full h-full grid grid-cols-5 gap-px p-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
            <p className="text-[8px] font-bold text-[#64748B] mt-2">Show this QR to exchange contacts</p>
          </div>
          {/* Event Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Taps', value: '47', color: ORANGE },
              { label: 'Saved', value: '32', color: '#22C55E' },
              { label: 'Follow-ups', value: '8', color: '#3b82f6' },
            ].map((s) => (
              <div className="bg-white rounded-xl p-2.5 border border-[#E5EAF2] text-center">
                <p className="text-base font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[8px] text-[#64748B]">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Recent Connections */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2]">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">RECENT CONNECTIONS</p>
            {[
              { name: 'Alex Kumar', company: 'TechStart', time: '2m ago', initial: 'A', color: '#3b82f6' },
              { name: 'Lisa Brown', company: 'Brown Realty', time: '15m ago', initial: 'L', color: '#ec4899' },
              { name: 'David Chen', company: 'Chen Labs', time: '1h ago', initial: 'D', color: '#22C55E' },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-2 py-2 border-b border-[#E5EAF2] last:border-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[9px]" style={{ background: `${c.color}15`, color: c.color }}>{c.initial}</div>
                <div className="flex-1"><p className="text-[9px] font-bold text-[#0F172A]">{c.name}</p><p className="text-[8px] text-[#64748B]">{c.company}</p></div>
                <span className="text-[7px] text-[#64748B]">{c.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Concierge Onboarding ──
function ConciergeOnboarding() {
  return (
    <PhoneFrame label="Concierge Onboarding — Business">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-3">
            <BingooAppIcon size={28} glow={false} />
            <div><p className="text-white font-black text-sm">Concierge Service</p><p className="text-white/50 text-[8px]">White-glove business onboarding</p></div>
          </div>
        </div>
        <div className="px-5 mt-4">
          {/* Dedicated Manager */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-3 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-2 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
              <span className="font-black text-lg" style={{ color: ORANGE }}>SC</span>
            </div>
            <p className="font-black text-sm text-[#0F172A]">Sarah Chen</p>
            <p className="text-[9px] text-[#64748B]">Your dedicated onboarding manager</p>
            <div className="flex justify-center gap-2 mt-3">
              <button className="px-3 py-1.5 text-[9px] font-bold text-white rounded-lg flex items-center gap-1" style={{ background: '#22C55E' }}><Icon name="phone" size={10} color="#FFFFFF" /> Call</button>
              <button className="px-3 py-1.5 text-[9px] font-bold text-white rounded-lg flex items-center gap-1" style={{ background: '#3b82f6' }}><Icon name="mail" size={10} color="#FFFFFF" /> Email</button>
            </div>
          </div>
          {/* Onboarding Plan */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">YOUR ONBOARDING PLAN</p>
            {[
              { step: 'Profile setup & branding', done: true },
              { step: 'Team member accounts', done: true },
              { step: 'NFC device order (50 cards)', done: false, active: true },
              { step: 'Custom card design approval', done: false },
              { step: 'Go-live & training call', done: false },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-2 py-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${s.active ? 'ring-2 ring-[#f97316] ring-offset-1' : ''}`} style={{ background: s.done ? '#22C55E' : s.active ? ORANGE : '#E5EAF2' }}>
                  {s.done ? <Icon name="check" size={10} color="#FFFFFF" /> : s.active ? <LoadingDots color="#FFFFFF" size={3} /> : <span className="text-[7px] font-bold text-[#64748B]">·</span>}
                </div>
                <span className={`text-[9px] font-bold ${s.done ? 'text-[#22C55E]' : s.active ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{s.step}</span>
              </div>
            ))}
          </div>
          {/* Video Placeholder */}
          <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden mb-3">
            <div className="h-28 relative" style={{ background: `linear-gradient(135deg, ${NAVY}, #8b5cf6)` }}>
              <img src={META_GLASS_URL} alt="Meta Glass" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <div className="w-0 h-0 border-l-[10px] border-l-white border-y-[7px] border-y-transparent ml-1" />
                </div>
              </div>
            </div>
            <div className="p-2.5">
              <p className="text-[9px] font-bold text-[#0F172A]">Bingoo + Meta Glass Demo</p>
              <p className="text-[8px] text-[#64748B]">Future of networking — coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export default function MockupStrategicConcepts() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-black text-[#0F172A] mb-1">Strategic Product Direction</p>
        <p className="text-[10px] text-[#64748B] max-w-lg mx-auto">Bingoo is the first complete digital identity business platform — not just an NFC card app</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <AIProfileBuilder />
        <ProfileQualityScore />
        <VerifiedBadges />
        <EventMode />
        <ConciergeOnboarding />
      </div>
      <div className="pt-4">
        <ROIAnalytics />
      </div>
    </div>
  );
}