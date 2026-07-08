import React from 'react';
import { InfinityMark, BingooWordmark, LoadingDots, BingooAppIcon, BingooStamp, BingooLogo } from '@/components/mockups/brand/InfinityMark';
import { PhoneFrame, DesktopFrame } from '@/components/mockups/MockupFrame';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

// ── OAuth Login Mockup with Bingoo Brand ──
function OAuthLoginMockup() {
  return (
    <PhoneFrame label="OAuth / Login — Infinity Brand">
      <div className="min-h-full flex flex-col items-center justify-center px-6 pb-8" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        {/* Logo */}
        <div className="mb-8 text-center">
          <BingooAppIcon size={72} glow={true} />
          <div className="mt-4"><BingooWordmark size="text-2xl" light textColor="#FFFFFF" infinityColor={ORANGE} showConnect /></div>
          <p className="text-white/40 text-[10px] mt-1.5 font-medium">The Operating System for Professional Identity</p>
        </div>
        {/* Login Card */}
        <div className="w-full max-w-[260px] bg-white rounded-2xl p-5 shadow-2xl">
          <p className="text-xs font-black text-[#0F172A] mb-1">Welcome Back</p>
          <p className="text-[9px] text-[#64748B] mb-4">Sign in to your Bingoo account</p>
          <div className="space-y-2 mb-3">
            <div className="px-3 py-2.5 bg-[#F7F9FC] rounded-xl text-[10px] font-medium text-[#cbd5e1]">Email address</div>
            <div className="px-3 py-2.5 bg-[#F7F9FC] rounded-xl text-[10px] font-medium text-[#cbd5e1]">Password</div>
          </div>
          <button className="w-full py-2.5 text-white text-xs font-black rounded-xl shadow-lg" style={{ background: ORANGE }}>Sign In</button>
          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-[#E5EAF2]" /><span className="text-[8px] text-[#64748B] font-bold">OR</span><div className="flex-1 h-px bg-[#E5EAF2]" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1.5 py-2 bg-white rounded-xl border border-[#E5EAF2]"><div className="w-3.5 h-3.5 rounded bg-[#4285F4] flex items-center justify-center"><span className="text-white text-[7px] font-black">G</span></div><span className="text-[9px] font-bold text-[#0F172A]">Google</span></button>
            <button className="flex items-center justify-center gap-1.5 py-2 bg-[#1c1c1e] rounded-xl"><Icon name="sparkles" size={12} color="#FFFFFF" /><span className="text-[9px] font-bold text-white">Apple</span></button>
          </div>
        </div>
        <p className="text-white/30 text-[9px] mt-6">Don't have an account? <span className="font-bold" style={{ color: ORANGE }}>Sign up free</span></p>
      </div>
    </PhoneFrame>
  );
}

// ── Loading / Welcome Screen ──
function LoadingScreenMockup() {
  return (
    <PhoneFrame label="Loading / Welcome — Animated Dots">
      <div className="min-h-full flex flex-col items-center justify-center px-6 pb-8" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-20" style={{ background: ORANGE, filter: 'blur(60px)' }} />
        <div className="relative z-10 text-center">
          <BingooAppIcon size={80} glow={true} />
          <div className="mt-5"><BingooWordmark size="text-2xl" light textColor="#FFFFFF" infinityColor={ORANGE} showConnect /></div>
          <div className="mt-6 flex justify-center"><LoadingDots color={ORANGE} size={10} /></div>
          <p className="text-white/40 text-[10px] mt-4 font-medium">Loading your digital identity...</p>
        </div>
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <InfinityMark size={32} color="rgba(255,255,255,0.15)" strokeWidth={1.5} />
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Dashboard Shell with Infinity Brand ──
function DashboardShellMockup() {
  return (
    <PhoneFrame label="Dashboard Shell — Infinity Nav Brand">
      <div className="min-h-full pb-20" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-5" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center justify-between mb-4">
            <BingooLogo size={32} light showText={false} />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center"><Icon name="bell" size={16} color="#FFFFFF" /></div>
            </div>
          </div>
          <p className="text-white/40 text-[10px] font-medium">Good morning</p>
          <p className="text-white font-black text-base">Mamadou Diallo</p>
        </div>
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] flex items-center gap-3">
            <BingooAppIcon size={36} glow={false} />
            <div className="flex-1">
              <p className="font-black text-sm text-[#0F172A]">Diallo Law Firm</p>
              <p className="text-[10px] text-[#64748B]">Law Firm Plan · bingoo.co/diallo-law</p>
            </div>
          </div>
        </div>
        <div className="px-5 mt-4 grid grid-cols-3 gap-2">
          {[
            { icon: 'share', label: 'Share', color: ORANGE },
            { icon: 'nfc', label: 'Devices', color: NAVY },
            { icon: 'chart', label: 'Analytics', color: '#22C55E' },
          ].map((a) => (
            <div key={a.label} className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 border border-[#E5EAF2]">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${a.color}15` }}><Icon name={a.icon} size={16} color={a.color} /></div>
              <span className="text-[9px] font-bold text-[#0F172A]">{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── NFC Product with Stamp ──
function NFCProductMockup() {
  return (
    <PhoneFrame label="NFC Product — Infinity Stamp Brand">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <p className="text-white font-black text-sm mb-4">NFC Business Card</p>
          {/* 3D Card Visual with Infinity Stamp */}
          <div className="flex justify-center">
            <div className="rounded-2xl shadow-2xl p-5 flex flex-col justify-between relative overflow-hidden" style={{ width: 220, height: 138, background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-15" style={{ background: ORANGE, filter: 'blur(30px)' }} />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <BingooStamp size={32} color={ORANGE} showText={false} variant="outline" />
                  <p className="text-white font-bold text-xs mt-2">Diallo Law Firm</p>
                  <p className="text-white/50 text-[8px]">Immigration Attorney</p>
                </div>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className="font-bold text-[8px] tracking-wider" style={{ color: ORANGE }}>BING∞</span>
                <Icon name="nfc" size={14} color="rgba(255,255,255,0.3)" />
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 mt-4">
          <p className="font-black text-base text-[#0F172A]">NFC Business Card</p>
          <p className="text-2xl font-black mt-1" style={{ color: ORANGE }}>$19.99</p>
          <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg mt-3 flex items-center justify-center gap-2" style={{ background: ORANGE }}>
            <Icon name="shop" size={16} color="#FFFFFF" /> Add to Cart
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Main Brand Showcase Section ──
export default function BrandShowcase() {
  return (
    <div className="space-y-12">
      {/* Brand Identity Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: `${ORANGE}15` }}>
          <InfinityMark size={16} color={ORANGE} />
          <span className="text-xs font-black tracking-wider" style={{ color: ORANGE }}>OFFICIAL BRAND IDENTITY</span>
        </div>
        <div className="flex flex-col items-center gap-3 mb-3">
          <BingooAppIcon size={56} glow={true} imageUrl="https://media.base44.com/images/public/692bd9007b93ba81de543346/8792d3cda_generated_image.png" />
          <BingooWordmark size="text-4xl" textColor={NAVY} infinityColor={ORANGE} showConnect />
        </div>
        <p className="text-[#64748B] text-sm max-w-lg mx-auto">The "oo" in Bingoo forms an infinity symbol — representing endless connections, limitless professional identity, and the permanent link between you and your network.</p>
      </div>

      {/* Brand Elements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Wordmark */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] text-center">
          <p className="text-[9px] font-bold text-[#64748B] mb-3 tracking-wider">WORDMARK</p>
          <div className="flex items-center justify-center h-16"><BingooWordmark size="text-2xl" textColor={NAVY} infinityColor={ORANGE} /></div>
        </div>
        {/* Infinity Mark */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] text-center">
          <p className="text-[9px] font-bold text-[#64748B] mb-3 tracking-wider">INFINITY "oo" MARK</p>
          <div className="flex items-center justify-center h-16"><InfinityMark size={48} color={ORANGE} strokeWidth={3} glow={true} /></div>
        </div>
        {/* Loading Dots */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] text-center">
          <p className="text-[9px] font-bold text-[#64748B] mb-3 tracking-wider">LOADING DOTS</p>
          <div className="flex items-center justify-center h-16"><LoadingDots color={ORANGE} size={12} /></div>
        </div>
        {/* App Icon */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] text-center">
          <p className="text-[9px] font-bold text-[#64748B] mb-3 tracking-wider">APP ICON / FAVICON</p>
          <div className="flex items-center justify-center h-16"><BingooAppIcon size={48} glow={true} /></div>
        </div>
      </div>

      {/* Print/Stamp Variants */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2]">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="package" size={16} color={NAVY} />
          <p className="text-xs font-black text-[#0F172A]">NFC Print / Stamp Variants — For Physical Products</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Outline — Light', variant: 'outline', color: NAVY, bg: '#F7F9FC' },
            { label: 'Filled — Navy', variant: 'filled', color: NAVY, bg: '#F7F9FC' },
            { label: 'Outline — Orange', variant: 'outline', color: ORANGE, bg: '#FFF0E5' },
            { label: 'Filled — Orange', variant: 'filled', color: ORANGE, bg: '#FFF0E5' },
            { label: 'Embossed — White', variant: 'outline', color: '#FFFFFF', bg: NAVY },
          ].map((v) => (
            <div key={v.label} className="rounded-xl p-4 text-center" style={{ background: v.bg }}>
              <div className="flex justify-center mb-2"><BingooStamp size={44} color={v.color} variant={v.variant} showText={false} /></div>
              <p className="text-[8px] font-bold" style={{ color: v.color === '#FFFFFF' ? '#FFFFFF' : MUTED }}>{v.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Examples */}
      <div>
        <p className="text-xs font-black text-[#0F172A] mb-4 text-center tracking-wider">BRAND USAGE ACROSS THE APP</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <OAuthLoginMockup />
          <LoadingScreenMockup />
          <NFCProductMockup />
        </div>
        <div className="mt-6">
          <DashboardShellMockup />
        </div>
      </div>
    </div>
  );
}