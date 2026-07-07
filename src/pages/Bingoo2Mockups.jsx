import React from 'react';
import { Link } from 'react-router-dom';
import { MockupSection } from '@/components/mockups/MockupFrame';
import { Icon } from '@/components/mockups/BingooIcons';
import MockupLanding from '@/components/mockups/MockupLanding';
import MockupHomeDashboard from '@/components/mockups/MockupHomeDashboard';
import MockupMyProfiles from '@/components/mockups/MockupMyProfiles';
import MockupProfileStudio from '@/components/mockups/MockupProfileStudio';
import MockupNFC from '@/components/mockups/MockupNFC';
import MockupQRWallet from '@/components/mockups/MockupQRWallet';
import MockupLeadsCRM from '@/components/mockups/MockupLeadsCRM';
import MockupAppointments from '@/components/mockups/MockupAppointments';
import MockupAnalytics from '@/components/mockups/MockupAnalytics';
import MockupShop from '@/components/mockups/MockupShop';
import MockupDesignStudio from '@/components/mockups/MockupDesignStudio';
import MockupAdmin from '@/components/mockups/MockupAdmin';

export default function Bingoo2Mockups() {
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Top Banner */}
      <div className="relative overflow-hidden px-6 py-16 text-center" style={{ background: 'linear-gradient(160deg, #0b2149, #071A3D)' }}>
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full opacity-20" style={{ background: '#f97316', filter: 'blur(100px)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-xs font-bold rounded-full mb-5 tracking-widest backdrop-blur-sm border border-white/10">
            <Icon name="sparkles" size={14} color="#f97316" /> MOCKUPS ONLY · NO IMPLEMENTATION
          </span>
          <h1 className="text-4xl font-black text-white mb-3">Bingoo 2.0</h1>
          <p className="text-white/60 text-sm mb-2">The Operating System for Professional Identity</p>
          <p className="text-white/40 text-xs mb-8">12 premium screen mockups — visual design previews before implementation begins.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-xs font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm">
            <Icon name="arrowRight" size={14} color="#FFFFFF" className="rotate-180" /> Back to Current App
          </Link>
        </div>
      </div>

      {/* Design Tokens */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl border border-[#E5EAF2] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="palette" size={16} color="#f97316" />
            <p className="text-xs font-black text-[#0F172A]">Premium Design Tokens</p>
          </div>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {[
              { name: 'Navy', color: '#0b2149' },
              { name: 'Deep Navy', color: '#071A3D' },
              { name: 'Navy Light', color: '#13284f' },
              { name: 'Orange', color: '#f97316' },
              { name: 'Orange Lt', color: '#fb923c' },
              { name: 'Green', color: '#22C55E' },
              { name: 'Blue', color: '#3b82f6' },
              { name: 'Bg', color: '#F7F9FC' },
              { name: 'Border', color: '#E5EAF2' },
              { name: 'Ink', color: '#0F172A' },
            ].map((t) => (
              <div key={t.name} className="text-center">
                <div className="w-full aspect-square rounded-xl border border-[#E5EAF2] mb-1 shadow-sm" style={{ backgroundColor: t.color }} />
                <p className="text-[8px] font-bold text-[#64748B]">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mockup Sections */}
      <MockupSection title="01" subtitle="Landing Page — Full Business Model">
        <MockupLanding />
      </MockupSection>
      <MockupSection title="02" subtitle="Home Dashboard — Selected profile, quick actions, stats">
        <MockupHomeDashboard />
      </MockupSection>
      <MockupSection title="03" subtitle="My Profiles — Multiple profile cards, default badge, quick actions">
        <MockupMyProfiles />
      </MockupSection>
      <MockupSection title="04" subtitle="Profile Studio — Clean tabs: Info, Design, Links, Media, Tools, Share, Settings">
        <MockupProfileStudio />
      </MockupSection>
      <MockupSection title="05" subtitle="NFC Operating Center — Device list, status, lost mode, reassign/replace">
        <MockupNFC />
      </MockupSection>
      <MockupSection title="06" subtitle="QR & Wallet Center — QR design, live watermark, owner-only wallet passes">
        <MockupQRWallet />
      </MockupSection>
      <MockupSection title="07" subtitle="Leads CRM — Pipeline cards, status, source, contact actions, CSV export">
        <MockupLeadsCRM />
      </MockupSection>
      <MockupSection title="08" subtitle="Appointments — Calendar/list, statuses, booking setup">
        <MockupAppointments />
      </MockupSection>
      <MockupSection title="09" subtitle="Analytics — Views, taps, scans, wallet saves, leads, bookings, sources">
        <MockupAnalytics />
      </MockupSection>
      <MockupSection title="10" subtitle="Shop — Premium NFC product catalog with bundles">
        <MockupShop />
      </MockupSection>
      <MockupSection title="11" subtitle="Business Design Studio — Custom NFC with logo, colors, live front/back preview">
        <MockupDesignStudio />
      </MockupSection>
      <MockupSection title="12" subtitle="Admin Manufacturing Orders — Order table, artwork, margin, supplier, status">
        <MockupAdmin />
      </MockupSection>

      {/* Footer */}
      <div className="py-12 text-center" style={{ background: 'linear-gradient(160deg, #0b2149, #071A3D)' }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: '#f97316' }}>
            <span className="text-white font-black text-lg">B</span>
          </div>
          <div>
            <span className="font-black text-base text-white">Bingoo</span>
            <span className="text-xs font-bold ml-1 text-[#f97316]">CONNECT</span>
          </div>
        </div>
        <p className="text-white/50 text-xs mb-2">Bingoo 2.0 — Mockup Set Complete</p>
        <p className="text-white/30 text-[10px] mb-6 max-w-md mx-auto">These are visual design previews only. No database, Stripe, auth, route, or logic changes have been made.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-xs font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm">
          <Icon name="arrowRight" size={14} color="#FFFFFF" className="rotate-180" /> Back to Current App
        </Link>
      </div>
    </div>
  );
}