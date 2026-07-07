import React from 'react';
import { PhoneFrame, Badge } from '@/components/mockups/MockupFrame';
import { BingooLogo, InfinityMark } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

// ── UX Fix Note Card ──
export function UXFixNote() {
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl p-5 border border-[#E5EAF2] mb-8">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ORANGE}15` }}>
          <Icon name="alert" size={20} color={ORANGE} />
        </div>
        <div>
          <p className="text-xs font-black text-[#0F172A] mb-1">UX Fix — Screenshot 3 Onboarding Flow</p>
          <p className="text-[10px] text-[#64748B] mb-3">Issues identified: cluttered form fields, confusing repeated actions, unclear selected-profile context, poor visual hierarchy. Fixed below with: single-column progressive disclosure, selected profile type badge shown persistently, one primary CTA per step, clear progress context.</p>
          <div className="flex flex-wrap gap-2">
            {['✓ Clearer hierarchy', '✓ Profile context visible', '✓ One CTA per step', '✓ Reduced clutter'].map((t) => (
              <span key={t} className="text-[9px] font-bold px-2 py-1 rounded-lg" style={{ background: '#E8F9EE', color: '#22C55E' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Redesigned Onboarding Step ──
export default function MockupOnboardingRedesign() {
  return (
    <div className="flex flex-col items-center gap-6">
      <UXFixNote />
      <div className="flex flex-wrap justify-center gap-6">
        {/* Step 1: Account — Clean hierarchy */}
        <PhoneFrame label="Fixed · Step 1 — Account (Clean)">
          <div className="min-h-full pb-8 px-5 pt-10" style={{ background: BG }}>
            <div className="flex justify-center mb-4"><BingooLogo size={32} showText /></div>
            {/* Progress — clear, labeled */}
            <div className="flex items-center gap-1.5 mb-1">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex-1 h-1.5 rounded-full" style={{ background: n <= 1 ? ORANGE : '#E5EAF2' }} />
              ))}
            </div>
            <div className="flex justify-between mb-5">
              <span className="text-[9px] font-bold text-[#0F172A]">Step 1: Account</span>
              <span className="text-[9px] font-bold text-[#64748B]">1 of 4</span>
            </div>
            {/* Selected profile context — persistent badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-5" style={{ background: `${NAVY}08` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: NAVY }}>
                <Icon name="shield" size={14} color={ORANGE} />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold text-[#0F172A]">Law Firm Profile Selected</p>
                <p className="text-[8px] text-[#64748B]">Tap to change profile type</p>
              </div>
              <Icon name="chevronRight" size={14} color={MUTED} />
            </div>
            {/* Single-column form — clean hierarchy */}
            <div className="space-y-3 mb-5">
              <div>
                <p className="text-[10px] font-bold text-[#64748B] mb-1">Full Name</p>
                <div className="px-3 py-2.5 bg-white rounded-xl border border-[#E5EAF2] text-[11px] font-medium text-[#0F172A]">Mamadou Diallo</div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#64748B] mb-1">Email</p>
                <div className="px-3 py-2.5 bg-white rounded-xl border border-[#E5EAF2] text-[11px] font-medium text-[#0F172A]">mamadou@bingoo.co</div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#64748B] mb-1">Password</p>
                <div className="px-3 py-2.5 bg-white rounded-xl border border-[#E5EAF2] text-[11px] font-medium text-[#0F172A]">••••••••••</div>
                <p className="text-[8px] text-[#64748B] mt-1 flex items-center gap-1"><Icon name="check" size={10} color="#22C55E" /> 8+ characters with numbers</p>
              </div>
            </div>
            {/* One primary CTA — no competing actions */}
            <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
              Continue to Profile Setup <Icon name="arrowRight" size={16} color="#FFFFFF" />
            </button>
            <p className="text-center text-[9px] text-[#64748B] mt-3">Already have an account? <span className="font-bold" style={{ color: ORANGE }}>Sign in</span></p>
          </div>
        </PhoneFrame>

        {/* Step 2: Profile Info — Progressive disclosure */}
        <PhoneFrame label="Fixed · Step 2 — Profile Info (Context)">
          <div className="min-h-full pb-8 px-5 pt-10" style={{ background: BG }}>
            <div className="flex justify-center mb-4"><BingooLogo size={32} showText /></div>
            <div className="flex items-center gap-1.5 mb-1">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex-1 h-1.5 rounded-full" style={{ background: n <= 2 ? ORANGE : '#E5EAF2' }} />
              ))}
            </div>
            <div className="flex justify-between mb-5">
              <span className="text-[9px] font-bold text-[#0F172A]">Step 2: Profile Info</span>
              <span className="text-[9px] font-bold text-[#64748B]">2 of 4</span>
            </div>
            {/* Profile type context */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: `${NAVY}08` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: NAVY }}><Icon name="shield" size={14} color={ORANGE} /></div>
              <p className="text-[9px] font-bold text-[#0F172A] flex-1">Law Firm Profile</p>
              <Badge color={ORANGE}>CHANGE</Badge>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <p className="text-[10px] font-bold text-[#64748B] mb-1">Display Name</p>
                <div className="px-3 py-2.5 bg-white rounded-xl border border-[#E5EAF2] text-[11px] font-medium text-[#0F172A]">Diallo Law Firm</div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#64748B] mb-1">Profile URL</p>
                <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white rounded-xl border-2 border-[#22C55E]">
                  <span className="text-[10px] text-[#64748B]">bingoo.co/</span>
                  <span className="text-[11px] font-black text-[#0F172A]">diallo-law</span>
                  <div className="ml-auto"><Icon name="checkCircle" size={14} color="#22C55E" /></div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#64748B] mb-1">Practice Areas (optional)</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Immigration', 'Civil', 'Criminal'].map((p, i) => (
                    <div key={p} className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold border ${i < 2 ? 'text-white border-transparent' : 'text-[#64748B] border-[#E5EAF2] bg-white'}`} style={i < 2 ? { background: NAVY } : {}}>{p}</div>
                  ))}
                </div>
              </div>
            </div>
            <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
              Continue to Contact <Icon name="arrowRight" size={16} color="#FFFFFF" />
            </button>
          </div>
        </PhoneFrame>

        {/* Step 3: Design — One choice at a time */}
        <PhoneFrame label="Fixed · Step 3 — Design (One Choice)">
          <div className="min-h-full pb-8 px-5 pt-10" style={{ background: BG }}>
            <div className="flex justify-center mb-4"><BingooLogo size={32} showText /></div>
            <div className="flex items-center gap-1.5 mb-1">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex-1 h-1.5 rounded-full" style={{ background: n <= 3 ? ORANGE : '#E5EAF2' }} />
              ))}
            </div>
            <div className="flex justify-between mb-5">
              <span className="text-[9px] font-bold text-[#0F172A]">Step 3: Design</span>
              <span className="text-[9px] font-bold text-[#64748B]">3 of 4</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: `${NAVY}08` }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: NAVY }}><Icon name="shield" size={14} color={ORANGE} /></div>
              <p className="text-[9px] font-bold text-[#0F172A] flex-1">Diallo Law Firm</p>
            </div>
            {/* Single choice — not overwhelming grid */}
            <p className="text-[10px] font-bold text-[#64748B] mb-2">Choose your layout</p>
            <div className="space-y-2 mb-4">
              {[
                { name: 'Executive', desc: 'Formal, navy & orange', selected: true },
                { name: 'Minimal', desc: 'Clean, white background' },
                { name: 'Dark Premium', desc: 'Sleek dark theme' },
              ].map((l) => (
                <div key={l.name} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${l.selected ? 'border-[#f97316] bg-[#FFF0E5]' : 'border-[#E5EAF2] bg-white'}`}>
                  <div className="w-10 h-10 rounded-lg" style={{ background: l.selected ? `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` : '#F7F9FC' }}>
                    {l.selected && <div className="flex items-center justify-center h-full"><InfinityMark size={16} color={ORANGE} /></div>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-[10px] font-black ${l.selected ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{l.name}</p>
                    <p className="text-[8px] text-[#64748B]">{l.desc}</p>
                  </div>
                  {l.selected ? (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: ORANGE }}><Icon name="check" size={12} color="#FFFFFF" /></div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#E5EAF2]" />
                  )}
                </div>
              ))}
            </div>
            <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
              Continue to Launch <Icon name="arrowRight" size={16} color="#FFFFFF" />
            </button>
          </div>
        </PhoneFrame>
      </div>
    </div>
  );
}