import React from 'react';
import { PhoneFrame, Badge, NFCCardVisual } from '@/components/mockups/MockupFrame';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

function Logo({ light }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="absolute top-0 right-0 w-6 h-6 rounded-full opacity-25" style={{ background: ORANGE, filter: 'blur(12px)' }} />
        <svg width="20" height="10" viewBox="0 0 48 24" fill="none" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="relative z-10" style={{ filter: `drop-shadow(0 0 4px ${ORANGE}66)` }}>
          <path d="M 14 12 C 14 6 20 6 24 12 C 28 18 34 18 34 12 C 34 6 28 6 24 12 C 20 18 14 18 14 12 Z" />
        </svg>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className={`font-black text-base tracking-tight ${light ? 'text-white' : 'text-[#0b2149]'}`}>Bing</span>
        <svg width="14" height="7" viewBox="0 0 48 24" fill="none" stroke={light ? '#FFFFFF' : ORANGE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 2 }}>
          <path d="M 14 12 C 14 6 20 6 24 12 C 28 18 34 18 34 12 C 34 6 28 6 24 12 C 20 18 14 18 14 12 Z" />
        </svg>
        <span className={`text-[10px] font-bold ml-1.5 ${light ? 'text-white/50' : 'text-[#f97316]'}`}>CONNECT</span>
      </div>
    </div>
  );
}

function Progress({ step, total }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: i < step ? ORANGE : '#E5EAF2' }} />
      ))}
    </div>
  );
}

function FormField({ label, value, placeholder, icon }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#64748B] mb-1.5">{label}</p>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-[#E5EAF2]">
        {icon && <Icon name={icon} size={14} color={MUTED} />}
        <span className={`text-xs font-medium ${value ? 'text-[#0F172A]' : 'text-[#cbd5e1]'}`}>{value || placeholder}</span>
      </div>
    </div>
  );
}

// ── Screen 2: Signup Choice ──
export function MockupSignupChoice() {
  const choices = [
    { icon: 'users', title: 'Individual', price: 'Free', desc: 'Personal branding & networking', features: ['1 Profile', 'Basic layouts', 'QR Code'], color: '#3b82f6' },
    { icon: 'briefcase', title: 'Professional', price: '$9.99/mo', desc: 'Enhanced tools for pros', features: ['Unlimited profiles', 'NFC + QR + Wallet', 'Analytics + CRM'], color: ORANGE, popular: true },
    { icon: 'building', title: 'Business', price: '$14.99/mo', desc: 'Team & business tools', features: ['Everything in Pro', 'Team management', 'Design Studio'], color: NAVY },
  ];
  return (
    <PhoneFrame label="2 · Signup Choice">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex justify-center mb-4"><Logo light /></div>
          <p className="text-white font-black text-xl text-center">Choose Your Path</p>
          <p className="text-white/50 text-[10px] text-center mt-1">Select the plan that fits your goals</p>
        </div>
        <div className="px-5 mt-4 space-y-3">
          {choices.map((c) => (
            <div key={c.title} className={`bg-white rounded-2xl p-4 border-2 ${c.popular ? 'border-[#f97316] shadow-lg' : 'border-[#E5EAF2]'}`}>
              {c.popular && <div className="flex justify-end mb-1"><Badge color={ORANGE}>MOST POPULAR</Badge></div>}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}dd)` }}>
                  <Icon name={c.icon} size={20} color="#FFFFFF" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm text-[#0F172A]">{c.title}</p>
                  <p className="text-[10px] text-[#64748B]">{c.desc}</p>
                </div>
                <p className="font-black text-sm" style={{ color: c.color }}>{c.price}</p>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-[#E5EAF2]">
                {c.features.map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Icon name="check" size={12} color={c.color} />
                    <span className="text-[10px] text-[#64748B] font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-[#64748B] mt-6">Already have an account? <span className="font-bold" style={{ color: ORANGE }}>Sign in</span></p>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 3: Account Setup ──
export function MockupAccountSetup() {
  return (
    <PhoneFrame label="3 · Account Setup">
      <div className="min-h-full pb-8 px-5 pt-10" style={{ background: BG }}>
        <div className="flex justify-center mb-5"><Logo /></div>
        <Progress step={1} total={4} />
        <p className="font-black text-lg text-[#0F172A] mb-1">Create Your Account</p>
        <p className="text-[10px] text-[#64748B] mb-5">Step 1 of 4 — Account credentials</p>
        <div className="space-y-3 mb-5">
          <FormField label="Full Name" value="Mamadou Diallo" icon="users" />
          <FormField label="Email" value="mamadou@bingoo.co" icon="mail" />
          <FormField label="Password" value="••••••••••" icon="lock" />
          <FormField label="Confirm Password" value="••••••••••" icon="lock" />
        </div>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E5EAF2]" /><span className="text-[9px] text-[#64748B] font-medium">or sign up with</span><div className="flex-1 h-px bg-[#E5EAF2]" />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button className="flex items-center justify-center gap-2 py-2.5 bg-white rounded-xl border border-[#E5EAF2]">
            <div className="w-4 h-4 rounded bg-[#4285F4] flex items-center justify-center"><span className="text-white text-[8px] font-black">G</span></div>
            <span className="text-[10px] font-bold text-[#0F172A]">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-2.5 bg-[#1c1c1e] rounded-xl">
            <Icon name="sparkles" size={14} color="#FFFFFF" />
            <span className="text-[10px] font-bold text-white">Apple</span>
          </button>
        </div>
        <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
          Continue <Icon name="arrowRight" size={16} color="#FFFFFF" />
        </button>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 4: Choose Profile Type ──
export function MockupProfileType() {
  const types = [
    { icon: 'users', title: 'Personal', desc: 'Networking & personal brand', color: '#3b82f6' },
    { icon: 'briefcase', title: 'Professional', desc: 'Consultants, agents, realtors', color: ORANGE },
    { icon: 'palette', title: 'Salon', desc: 'Stylists, barbers, spas', color: '#ec4899' },
    { icon: 'shield', title: 'Law Firm', desc: 'Attorneys & legal practices', color: NAVY },
    { icon: 'building', title: 'Business', desc: 'Teams & companies', color: '#22C55E' },
    { icon: 'shop', title: 'Restaurant', desc: 'Menus & loyalty programs', color: '#8b5cf6' },
  ];
  return (
    <PhoneFrame label="4 · Choose Profile Type">
      <div className="min-h-full pb-8 px-5 pt-10" style={{ background: BG }}>
        <Progress step={2} total={4} />
        <p className="font-black text-lg text-[#0F172A] mb-1">Choose Profile Type</p>
        <p className="text-[10px] text-[#64748B] mb-5">Step 2 of 4 — What best describes you?</p>
        <div className="grid grid-cols-2 gap-3">
          {types.map((t, i) => (
            <div key={t.title} className={`bg-white rounded-2xl p-4 border-2 ${i === 3 ? 'border-[#f97316] bg-[#FFF0E5]' : 'border-[#E5EAF2]'}`}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3 shadow-sm" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}dd)` }}>
                <Icon name={t.icon} size={20} color="#FFFFFF" />
              </div>
              <p className="font-black text-xs text-[#0F172A] mb-1">{t.title}</p>
              <p className="text-[9px] text-[#64748B] leading-snug">{t.desc}</p>
              {i === 3 && <div className="mt-2"><Badge color={ORANGE}>SELECTED</Badge></div>}
            </div>
          ))}
        </div>
        <button className="w-full py-3 mt-5 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
          Continue <Icon name="arrowRight" size={16} color="#FFFFFF" />
        </button>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 5: Create First Profile ──
export function MockupCreateProfile() {
  return (
    <PhoneFrame label="5 · Create First Profile">
      <div className="min-h-full pb-8 px-5 pt-10" style={{ background: BG }}>
        <Progress step={3} total={4} />
        <p className="font-black text-lg text-[#0F172A] mb-1">Create Your Profile</p>
        <p className="text-[10px] text-[#64748B] mb-5">Step 3 of 4 — Basic information</p>
        <div className="space-y-3 mb-4">
          <FormField label="Display Name" value="Diallo Law Firm" icon="building" />
          <div>
            <p className="text-[10px] font-bold text-[#64748B] mb-1.5">Username (URL)</p>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border-2 border-[#22C55E]">
              <Icon name="link" size={14} color={MUTED} />
              <span className="text-[10px] text-[#64748B] font-medium">bingoo.co/</span>
              <span className="text-xs font-black text-[#0F172A]">diallo-law</span>
              <div className="ml-auto"><Icon name="checkCircle" size={14} color="#22C55E" /></div>
            </div>
            <p className="text-[9px] text-[#22C55E] font-bold mt-1 flex items-center gap-1"><Icon name="check" size={10} color="#22C55E" /> Available!</p>
          </div>
          <FormField label="Job Title / Role" value="Immigration Attorney" icon="briefcase" />
          <div>
            <p className="text-[10px] font-bold text-[#64748B] mb-1.5">Bio</p>
            <div className="px-3 py-2.5 bg-white rounded-xl border border-[#E5EAF2]">
              <span className="text-[10px] text-[#0F172A]">Experienced immigration attorney serving the NYC community. Specializing in family-based petitions, asylum, and deportation defense.</span>
            </div>
            <p className="text-[8px] text-[#64748B] mt-1 text-right">82/200 characters</p>
          </div>
        </div>
        {/* Live URL Preview */}
        <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2]">
          <p className="text-[9px] font-bold text-[#64748B] mb-2 flex items-center gap-1"><Icon name="eye" size={11} color={MUTED} /> LIVE URL PREVIEW</p>
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F9FC] rounded-lg">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: NAVY }}>
              <span className="text-[8px] font-black" style={{ color: ORANGE }}>DL</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-[#0F172A]">Diallo Law Firm</p>
              <p className="text-[8px] text-[#64748B]">bingoo.co/diallo-law</p>
            </div>
          </div>
        </div>
        <button className="w-full py-3 mt-4 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
          Continue <Icon name="arrowRight" size={16} color="#FFFFFF" />
        </button>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 6: Upload Photo / Logo ──
export function MockupUploadPhoto() {
  return (
    <PhoneFrame label="6 · Upload Photo / Logo">
      <div className="min-h-full pb-8 px-5 pt-10" style={{ background: BG }}>
        <Progress step={3} total={4} />
        <p className="font-black text-lg text-[#0F172A] mb-1">Upload Photo or Logo</p>
        <p className="text-[10px] text-[#64748B] mb-5">Step 3 of 4 — Add your visual identity</p>
        {/* Upload Area */}
        <div className="border-2 border-dashed border-[#E5EAF2] rounded-2xl p-8 text-center bg-white mb-4">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${NAVY}10` }}>
            <Icon name="download" size={28} color={NAVY} />
          </div>
          <p className="font-bold text-xs text-[#0F172A] mb-1">Tap to upload</p>
          <p className="text-[9px] text-[#64748B]">PNG, JPG, SVG · Max 5MB</p>
        </div>
        {/* Preview */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
          <p className="text-[10px] font-bold text-[#64748B] mb-3 flex items-center gap-1"><Icon name="eye" size={11} color={MUTED} /> PREVIEW</p>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
              <span className="font-black text-lg" style={{ color: ORANGE }}>DL</span>
            </div>
            <div className="flex-1">
              <p className="font-black text-sm text-[#0F172A]">Diallo Law Firm</p>
              <p className="text-[10px] text-[#64748B]">Immigration Attorney</p>
            </div>
            <button className="px-3 py-1.5 text-[9px] font-bold border border-[#E5EAF2] rounded-lg text-[#64748B]">Reposition</button>
          </div>
        </div>
        {/* Avatar Shape Picker */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
          <p className="text-[10px] font-bold text-[#64748B] mb-2">Avatar Shape</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: 'Circle', shape: 'rounded-full' },
              { name: 'Rounded', shape: 'rounded-2xl' },
              { name: 'Squircle', shape: 'rounded-xl' },
              { name: 'Card', shape: 'rounded-lg' },
            ].map((s, i) => (
              <div key={s.name} className="text-center">
                <div className={`w-12 h-12 ${s.shape} mx-auto mb-1 border-2 ${i === 0 ? 'border-[#f97316]' : 'border-[#E5EAF2]'}`} style={{ background: i === 0 ? `${ORANGE}20` : `${NAVY}10` }} />
                <span className={`text-[8px] font-bold ${i === 0 ? 'text-[#f97316]' : 'text-[#64748B]'}`}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-3 border border-[#E5EAF2] text-[#64748B] text-sm font-bold rounded-xl bg-white">Skip</button>
          <button className="flex-1 py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
            Continue <Icon name="arrowRight" size={16} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}