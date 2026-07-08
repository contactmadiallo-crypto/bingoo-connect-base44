import React from 'react';
import { Icon } from './BingooIcons';

const NAVY = '#0b2149';
const NAVY_DEEP = '#071A3D';
const NAVY_LIGHT = '#13284f';
const ORANGE = '#f97316';
const ORANGE_LIGHT = '#fb923c';
const BG = '#F7F9FC';
const BORDER = '#E5EAF2';
const INK = '#0F172A';
const MUTED = '#64748B';

export function PhoneFrame({ children, label }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[360px] h-[720px] bg-[#0F172A] rounded-[3rem] p-[10px] shadow-2xl shadow-[#0b2149]/30">
        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#0F172A] rounded-b-2xl z-20" />
          <div className="w-full h-full overflow-y-auto scrollbar-hide pt-6">
            {children}
          </div>
        </div>
      </div>
      {label && <p className="text-sm font-semibold text-[#64748B]">{label}</p>}
    </div>
  );
}

export function DesktopFrame({ children, label, height = 'h-[720px]' }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-[1000px] bg-white rounded-2xl border border-[#E5EAF2] shadow-xl shadow-[#0b2149]/8 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-[#F7F9FC] border-b border-[#E5EAF2]">
          <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <div className="w-3 h-3 rounded-full bg-[#f97316]" />
          <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
          <div className="flex-1 mx-4 h-6 bg-white rounded-md border border-[#E5EAF2] flex items-center px-3">
            <span className="text-[10px] text-[#64748B] font-medium">bingooconnect.com</span>
          </div>
          <div className="w-6 h-6 rounded bg-[#E5EAF2]" />
        </div>
        <div className={`${height} overflow-y-auto scrollbar-hide`}>
          {children}
        </div>
      </div>
      {label && <p className="text-sm font-semibold text-[#64748B]">{label}</p>}
    </div>
  );
}

export function MockupSection({ title, subtitle, children }) {
  return (
    <div className="py-16 px-4 md:px-8 border-b border-[#E5EAF2]">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#0b2149] to-[#13284f] text-white text-xs font-bold rounded-full mb-3 tracking-wider">
            SCREEN {title}
          </span>
          <h3 className="text-2xl font-bold text-[#0F172A] mb-1">{subtitle}</h3>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
}

export function MobileBottomNav({ active = 'Home' }) {
  const items = [
    { icon: 'home', label: 'Home' },
    { icon: 'users', label: 'Profiles' },
    { icon: 'nfc', label: 'NFC' },
    { icon: 'briefcase', label: 'Business' },
    { icon: 'more', label: 'More' },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-lg border-t border-[#E5EAF2] flex items-center justify-around px-2 z-10 safe-bottom">
      {items.map((item) => {
        const isActive = active === item.label;
        return (
          <div key={item.label} className="flex flex-col items-center gap-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-xl ${isActive ? 'bg-[#f97316]' : ''}`}>
              <Icon name={item.icon} size={18} color={isActive ? '#FFFFFF' : '#64748B'} />
            </div>
            <span className={`text-[9px] font-bold ${isActive ? 'text-[#f97316]' : 'text-[#64748B]'}`}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Product Visuals ──────────────────────────────────────────

export function NFCCardVisual({ name = 'Bingoo', role = '', color = NAVY, accent = ORANGE, width = 240 }) {
  const h = width * 0.63;
  return (
    <div
      className="rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between p-5"
      style={{ width, height: h, background: `linear-gradient(135deg, ${color}, ${NAVY_DEEP})` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: accent, filter: 'blur(40px)' }} />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: accent }}>
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <p className="text-white font-bold text-sm">{name}</p>
          {role && <p className="text-white/50 text-[10px]">{role}</p>}
        </div>
        <div className="w-12 h-12 bg-white rounded-lg p-1.5">
          <div className="w-full h-full rounded grid grid-cols-5 gap-px p-0.5" style={{ background: NAVY }}>
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between relative z-10">
        <span className="font-bold text-[10px] tracking-wider" style={{ color: accent }}>BING∞ CONNECT</span>
        <Icon name="nfc" size={14} color="rgba(255,255,255,0.3)" />
      </div>
    </div>
  );
}

export function NFCKeychainVisual({ width = 100 }) {
  const h = width * 1.4;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-2xl shadow-xl relative overflow-hidden p-3 flex flex-col items-center gap-2" style={{ width, height: h, background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="w-4 h-4 rounded-full border-2 border-white/20" />
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: ORANGE }}>
          <span className="text-white font-bold text-[10px]">B</span>
        </div>
        <Icon name="nfc" size={20} color="rgba(255,255,255,0.4)" />
      </div>
    </div>
  );
}

export function NFCStickerVisual({ width = 90 }) {
  return (
    <div className="rounded-full shadow-xl flex flex-col items-center justify-center gap-1 relative overflow-hidden" style={{ width, height: width, background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ORANGE }}>
        <span className="text-white font-bold text-xs">B</span>
      </div>
      <Icon name="nfc" size={18} color="rgba(255,255,255,0.4)" />
    </div>
  );
}

export function NFCBraceletVisual({ width = 120 }) {
  const h = width * 0.45;
  return (
    <div className="rounded-full shadow-xl flex items-center justify-center gap-2 px-4" style={{ width, height: h, background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: ORANGE }}>
        <span className="text-white font-bold text-[8px]">B</span>
      </div>
      <Icon name="nfc" size={14} color="rgba(255,255,255,0.4)" />
    </div>
  );
}

export function NFCStandVisual({ width = 100 }) {
  const h = width * 0.7;
  return (
    <div className="shadow-xl relative overflow-hidden rounded-lg flex flex-col items-center justify-center gap-1" style={{ width, height: h, background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})`, clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: ORANGE }}>
        <span className="text-white font-bold text-[10px]">B</span>
      </div>
      <Icon name="nfc" size={16} color="rgba(255,255,255,0.4)" />
    </div>
  );
}

export function NFCBadgeVisual({ width = 90 }) {
  const h = width * 1.3;
  return (
    <div className="rounded-xl shadow-xl relative overflow-hidden flex flex-col items-center justify-center gap-2 p-2" style={{ width, height: h, background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
      <div className="w-1 h-3 bg-white/20 rounded" />
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ORANGE }}>
        <span className="text-white font-bold text-[10px]">B</span>
      </div>
      <Icon name="nfc" size={16} color="rgba(255,255,255,0.4)" />
    </div>
  );
}

export function WalletPassVisual({ type = 'google', name = 'Mamadou Diallo', role = 'Attorney' }) {
  const isGoogle = type === 'google';
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ width: 280, background: isGoogle ? '#1a1a2e' : '#1c1c1e' }}>
      <div className="px-5 py-4" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: ORANGE }}>
                <span className="text-white font-bold text-[10px]">B</span>
              </div>
              <span className="text-white font-bold text-xs">Bingoo Connect</span>
            </div>
            <p className="text-white font-bold text-sm">{name}</p>
            <p className="text-white/50 text-[10px]">{role}</p>
          </div>
          <Icon name="nfc" size={16} color="rgba(255,255,255,0.3)" />
        </div>
        <div className="flex gap-1.5">
          {['Phone', 'Email', 'WhatsApp', 'Website', 'LinkedIn'].map((l) => (
            <div key={l} className="px-2 py-1 bg-white/10 rounded-md text-[8px] text-white font-medium">{l}</div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-3" style={{ background: isGoogle ? '#15152a' : '#111' }}>
        <span className="text-white/40 text-[9px] font-medium">{isGoogle ? 'GOOGLE WALLET' : 'APPLE WALLET'}</span>
        <Icon name={isGoogle ? 'globe' : 'sparkles'} size={14} color={isGoogle ? '#4285F4' : '#FFFFFF'} />
      </div>
    </div>
  );
}

// ── Shared UI atoms ──────────────────────────────────────────

export function StatCard({ icon, value, label, color = NAVY, bg = '#F0F4FA' }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5EAF2] p-3 text-center">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5" style={{ background: bg }}>
        <Icon name={icon} size={16} color={color} />
      </div>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
      <p className="text-[9px] text-[#64748B] font-medium">{label}</p>
    </div>
  );
}

export function Badge({ children, color = ORANGE, bg = null }) {
  return (
    <span
      className="px-2 py-0.5 text-[8px] font-bold rounded-md tracking-wider"
      style={{ color, background: bg || `${color}18` }}
    >
      {children}
    </span>
  );
}

export function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <p className="text-xs font-bold text-[#0F172A]">{children}</p>
      <div className="flex-1 h-px bg-[#E5EAF2]" />
    </div>
  );
}