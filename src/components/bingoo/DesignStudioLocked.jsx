import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, PenTool, Infinity as InfinityIcon, ArrowRight, Sparkles } from 'lucide-react';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', ORANGE_LIGHT = '#fb923c';

const ELIGIBLE_PLANS = [
  { name: 'Business', color: '#3b82f6' },
  { name: 'Salon', color: '#ec4899' },
  { name: 'Law Firm', color: '#8b5cf6' },
  { name: 'Corporate', color: '#22C55E' },
];

const PREVIEW_FEATURES = [
  'Upload your logo & branding',
  'Choose from 8 card colors',
  'Custom name, tagline & accent',
  'Matte, Glossy or Frosted finish',
  'Bulk ordering (25–500 units)',
  'Live front & back card preview',
];

export default function DesignStudioLocked({ isDark }) {
  const bg = isDark ? '#13162a' : '#fff';
  const cardBg = isDark ? '#1a1d33' : '#F7F9FC';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E5EAF2';
  const ink = isDark ? '#fff' : '#0F172A';
  const muted = isDark ? 'rgba(255,255,255,0.45)' : '#64748B';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor, background: bg }}>
        {/* ── Header ── */}
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}22` }}>
              <PenTool className="w-5 h-5" style={{ color: ORANGE }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-black text-lg">Business Design Studio</h2>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ background: `${ORANGE}22`, color: ORANGE }}>
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              </div>
              <p className="text-white/50 text-xs">Custom NFC Card Designer</p>
            </div>
          </div>
          <InfinityIcon className="w-6 h-6" style={{ color: ORANGE }} />
        </div>

        {/* ── Body ── */}
        <div className="p-6 md:p-8">
          {/* Ghost Preview */}
          <div className="mb-6 flex justify-center">
            <div className="relative rounded-2xl overflow-hidden opacity-40 pointer-events-none select-none"
              style={{ width: 300, height: 189, background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})`, filter: 'grayscale(0.3)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: ORANGE, filter: 'blur(40px)' }} />
              <div className="p-5 flex justify-between items-start">
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-xl" style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})` }} />
                  <div>
                    <div className="h-2.5 w-24 rounded bg-white/80 mb-1.5" />
                    <div className="h-1.5 w-16 rounded bg-white/30" />
                  </div>
                </div>
                <div className="w-12 h-12 bg-white rounded-lg" />
              </div>
              <div className="px-5 mt-10">
                <div className="h-2 w-20 rounded" style={{ background: ORANGE }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <Lock className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Message */}
          <div className="rounded-xl p-4 mb-5 text-center" style={{ background: cardBg, border: `1px solid ${borderColor}` }}>
            <Sparkles className="w-5 h-5 mx-auto mb-2" style={{ color: ORANGE }} />
            <p className="text-sm font-bold mb-1" style={{ color: ink }}>
              Custom business NFC design is available for Business, Salon, Law Firm, and Corporate plans.
            </p>
            <p className="text-xs" style={{ color: muted }}>
              Upgrade your plan to unlock branded NFC cards, keychains, and stickers with your logo and colors.
            </p>
          </div>

          {/* What You'll Get */}
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: muted }}>What you'll get</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PREVIEW_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-medium" style={{ color: ink }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${NAVY}12` }}>
                    <Lock className="w-2.5 h-2.5" style={{ color: NAVY }} />
                  </span>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Eligible Plans */}
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: muted }}>Available on</p>
            <div className="flex flex-wrap gap-2">
              {ELIGIBLE_PLANS.map((p) => (
                <span key={p.name} className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: `${p.color}12`, color: p.color }}>
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link to="/plans">
            <button className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${ORANGE}, #e06800)` }}>
              Upgrade to Unlock <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}