import React from 'react';
import { PhoneFrame, Badge } from '@/components/mockups/MockupFrame';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

function Progress({ step, total }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i < step ? ORANGE : '#E5EAF2' }} />
      ))}
    </div>
  );
}

function Toggle({ on, label }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[11px] font-bold text-[#0F172A]">{label}</span>
      <div className="w-9 h-5 rounded-full p-0.5" style={{ background: on ? ORANGE : '#E5EAF2' }}>
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${on ? 'ml-auto' : ''}`} />
      </div>
    </div>
  );
}

function FormRow({ label, value, icon, countryCode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#64748B] mb-1.5">{label}</p>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-[#E5EAF2]">
        {countryCode && <span className="text-xs font-bold text-[#0F172A] pr-2 border-r border-[#E5EAF2]">{countryCode}</span>}
        {icon && <Icon name={icon} size={14} color={MUTED} />}
        <span className="text-xs font-medium text-[#0F172A]">{value}</span>
      </div>
    </div>
  );
}

// ── Screen 7: Contact Information ──
export function MockupContactInfo() {
  return (
    <PhoneFrame label="7 · Contact Information">
      <div className="min-h-full pb-8 px-5 pt-10" style={{ background: BG }}>
        <Progress step={3} total={4} />
        <p className="font-black text-lg text-[#0F172A] mb-1">Contact Information</p>
        <p className="text-[10px] text-[#64748B] mb-5">Step 3 of 4 — How people can reach you</p>
        <div className="space-y-3 mb-4">
          <FormRow label="Phone Number" value="(212) 555-0192" icon="phone" countryCode="🇺🇸 +1" />
          <FormRow label="WhatsApp" value="(212) 555-0192" icon="message" countryCode="🇺🇸 +1" />
          <FormRow label="Email" value="contact@diallolaw.com" icon="mail" />
          <FormRow label="Website" value="diallolaw.com" icon="globe" />
          <FormRow label="Location" value="New York, NY" icon="mapPin" />
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
          <p className="text-[10px] font-bold text-[#64748B] mb-2">Visibility Controls</p>
          <Toggle on={true} label="Show phone number" />
          <Toggle on={true} label="Show WhatsApp" />
          <Toggle on={false} label="Show email publicly" />
          <Toggle on={true} label="Show location" />
        </div>
        <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
          Continue <Icon name="arrowRight" size={16} color="#FFFFFF" />
        </button>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 8: Choose Profile Theme ──
export function MockupChooseTheme() {
  const layouts = [
    { name: 'Classic', color: '#F7F9FC' },
    { name: 'Dark', color: '#0F172A' },
    { name: 'Magazine', color: NAVY },
    { name: 'Glass', color: '#e0e7ff' },
    { name: 'Luxury', color: '#1a1a2e' },
    { name: 'Corporate', color: '#f1f5f9' },
  ];
  return (
    <PhoneFrame label="8 · Choose Profile Theme">
      <div className="min-h-full pb-8 px-5 pt-10" style={{ background: BG }}>
        <Progress step={4} total={4} />
        <p className="font-black text-lg text-[#0F172A] mb-1">Choose Your Theme</p>
        <p className="text-[10px] text-[#64748B] mb-5">Step 4 of 4 — Design your profile</p>
        {/* Layout Picker */}
        <p className="text-[10px] font-bold text-[#64748B] mb-2">Layout Style</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {layouts.map((l, i) => (
            <div key={l.name} className={`rounded-xl p-2 border-2 cursor-pointer ${i === 2 ? 'border-[#f97316] bg-[#FFF0E5]' : 'border-[#E5EAF2] bg-white'}`}>
              <div className="w-full h-14 rounded-lg mb-1.5" style={{ background: l.color }}>
                <div className="flex items-center justify-center h-full">
                  <div className="w-5 h-5 rounded-full" style={{ background: i === 2 ? ORANGE : `${NAVY}40` }} />
                </div>
              </div>
              <p className={`text-[8px] font-bold text-center ${i === 2 ? 'text-[#f97316]' : 'text-[#64748B]'}`}>{l.name}</p>
            </div>
          ))}
        </div>
        {/* Color Palette */}
        <p className="text-[10px] font-bold text-[#64748B] mb-2">Brand Color</p>
        <div className="flex gap-2 mb-4">
          {['#0b2149', '#f97316', '#22C55E', '#3b82f6', '#ec4899', '#8b5cf6', '#0F172A', '#64748B'].map((c, i) => (
            <div key={c} className={`w-8 h-8 rounded-lg cursor-pointer border-2 ${i === 0 ? 'border-[#0F172A] scale-110' : 'border-white'}`} style={{ background: c }} />
          ))}
        </div>
        {/* Live Preview */}
        <p className="text-[10px] font-bold text-[#64748B] mb-2">Live Preview</p>
        <div className="mx-auto w-full max-w-[180px] bg-white rounded-3xl border-4 border-[#0F172A] overflow-hidden shadow-xl mb-4">
          <div className="h-16" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }} />
          <div className="px-3 pb-3">
            <div className="w-10 h-10 rounded-full border-3 border-white -mt-5 mb-1 flex items-center justify-center" style={{ background: NAVY, borderWidth: 3 }}>
              <span className="font-black text-[10px]" style={{ color: ORANGE }}>DL</span>
            </div>
            <p className="font-black text-[11px] text-[#0F172A]">Diallo Law Firm</p>
            <p className="text-[8px] text-[#64748B] mb-2">Immigration Attorney</p>
            <div className="space-y-1">
              {['phone', 'message', 'mail'].map((ic) => (
                <div key={ic} className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: `${NAVY}08` }}>
                  <Icon name={ic} size={10} color={NAVY} />
                  <span className="text-[8px] font-bold text-[#0F172A]">{ic === 'phone' ? 'Call' : ic === 'message' ? 'WhatsApp' : 'Email'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
          Continue <Icon name="arrowRight" size={16} color="#FFFFFF" />
        </button>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 9: Connect Links ──
export function MockupConnectLinks() {
  const platforms = [
    { icon: 'globe', name: 'Facebook', url: 'facebook.com/diallolaw', color: '#1877F2', on: true },
    { icon: 'globe', name: 'Instagram', url: 'instagram.com/diallolaw', color: '#E4405F', on: true },
    { icon: 'globe', name: 'TikTok', url: '', color: '#000000', on: false },
    { icon: 'globe', name: 'LinkedIn', url: 'linkedin.com/in/diallo', color: '#0A66C2', on: true },
    { icon: 'globe', name: 'YouTube', url: '', color: '#FF0000', on: false },
  ];
  return (
    <PhoneFrame label="9 · Connect Links">
      <div className="min-h-full pb-8 px-5 pt-10" style={{ background: BG }}>
        <Progress step={4} total={4} />
        <p className="font-black text-lg text-[#0F172A] mb-1">Connect Your Links</p>
        <p className="text-[10px] text-[#64748B] mb-5">Step 4 of 4 — Add social & business links</p>
        <div className="space-y-2.5 mb-4">
          {platforms.map((p) => (
            <div key={p.name} className={`bg-white rounded-2xl p-3 border ${p.on ? 'border-[#E5EAF2]' : 'border-[#E5EAF2] opacity-60'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${p.color}15` }}>
                  <Icon name="globe" size={16} color={p.color} />
                </div>
                <span className="flex-1 text-[11px] font-bold text-[#0F172A]">{p.name}</span>
                <div className="w-8 h-5 rounded-full p-0.5" style={{ background: p.on ? ORANGE : '#E5EAF2' }}>
                  <div className={`w-4 h-4 rounded-full bg-white ${p.on ? 'ml-auto' : ''}`} />
                </div>
              </div>
              {p.on && (
                <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg">
                  <span className="text-[10px] font-medium text-[#0F172A]">{p.url || 'Enter URL...'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Custom Link */}
        <div className="bg-white rounded-2xl p-3 border border-dashed border-[#E5EAF2] flex items-center gap-2 cursor-pointer mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${NAVY}10` }}>
            <Icon name="plus" size={16} color={NAVY} />
          </div>
          <span className="text-[11px] font-bold text-[#64748B]">Add Custom Link</span>
        </div>
        <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
          Continue <Icon name="arrowRight" size={16} color="#FFFFFF" />
        </button>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 10: Onboarding Complete ──
export function MockupOnboardingComplete() {
  return (
    <PhoneFrame label="10 · Onboarding Complete">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-12 pb-8 text-center relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          {/* Confetti dots */}
          {[
            { top: '8%', left: '15%', c: ORANGE, s: 6 },
            { top: '12%', left: '75%', c: '#3b82f6', s: 8 },
            { top: '25%', left: '10%', c: '#22C55E', s: 5 },
            { top: '5%', left: '50%', c: '#ec4899', s: 7 },
            { top: '30%', left: '85%', c: ORANGE, s: 6 },
            { top: '18%', left: '35%', c: '#8b5cf6', s: 5 },
          ].map((d, i) => (
            <div key={i} className="absolute rounded-full" style={{ top: d.top, left: d.left, width: d.s, height: d.s, background: d.c }} />
          ))}
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-2xl" style={{ background: `linear-gradient(135deg, ${ORANGE}, #fb923c)` }}>
              <Icon name="check" size={32} color="#FFFFFF" />
            </div>
            <p className="text-white font-black text-xl mb-1">Your Profile is Live!</p>
            <p className="text-white/50 text-[10px]">Bingoo 2.0 — Your digital identity is ready</p>
          </div>
        </div>
        <div className="px-5 -mt-4">
          {/* Profile URL Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] shadow-lg mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
                <span className="font-black text-sm" style={{ color: ORANGE }}>DL</span>
              </div>
              <div className="flex-1">
                <p className="font-black text-sm text-[#0F172A]">Diallo Law Firm</p>
                <p className="text-[10px] text-[#64748B]">bingoo.co/diallo-law</p>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${NAVY}10` }}>
                <Icon name="copy" size={14} color={NAVY} />
              </div>
            </div>
          </div>
          {/* QR Preview */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4 text-center">
            <p className="text-[10px] font-bold text-[#64748B] mb-2">YOUR QR CODE</p>
            <div className="inline-block p-2 bg-white rounded-xl border border-[#E5EAF2]">
              <div className="w-24 h-24 rounded-lg p-1" style={{ background: NAVY }}>
                <div className="w-full h-full rounded grid grid-cols-7 gap-px p-1">
                  {Array.from({ length: 49 }).map((_, i) => {
                    const corners = [0, 6, 42, 48];
                    return <div key={i} className={`rounded-[1px] ${corners.includes(i) || Math.random() > 0.45 ? 'bg-white' : 'bg-transparent'}`} />;
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* CTAs */}
          <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg mb-2" style={{ background: ORANGE }}>View My Profile</button>
          <button className="w-full py-3 text-[#0F172A] text-sm font-bold rounded-xl border border-[#E5EAF2] bg-white mb-4">Go to Dashboard</button>
          {/* Next Steps */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2]">
            <p className="text-[10px] font-bold text-[#64748B] mb-3">RECOMMENDED NEXT STEPS</p>
            {[
              { icon: 'nfc', label: 'Order your NFC Card', desc: 'Tap to share your profile', color: ORANGE },
              { icon: 'qr', label: 'Download your QR Code', desc: 'Print or share digitally', color: '#3b82f6' },
              { icon: 'chart', label: 'Explore analytics tools', desc: 'Track profile performance', color: '#22C55E' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <Icon name={s.icon} size={16} color={s.color} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-[#0F172A]">{s.label}</p>
                  <p className="text-[9px] text-[#64748B]">{s.desc}</p>
                </div>
                <Icon name="chevronRight" size={14} color={MUTED} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}