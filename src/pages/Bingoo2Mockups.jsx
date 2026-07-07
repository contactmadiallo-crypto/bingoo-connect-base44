import React from 'react';
import { Link } from 'react-router-dom';
import { MockupSection } from '@/components/mockups/MockupFrame';
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
      <div className="bg-gradient-to-br from-[#0A1F52] via-[#071A3D] to-[#0A1F52] px-6 py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-[#FF7A00]/20 text-[#FF7A00] text-xs font-semibold rounded-full mb-4">
            MOCKUPS ONLY · NO IMPLEMENTATION
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Bingoo 2.0
          </h1>
          <p className="text-white/70 text-sm md:text-base mb-2">
            The Operating System for Professional Identity
          </p>
          <p className="text-white/50 text-xs mb-6">
            12 screen mockups — visual design previews before implementation begins.
          </p>
          <Link to="/" className="inline-block px-5 py-2 bg-white/10 text-white text-xs font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
            ← Back to Current App
          </Link>
        </div>
      </div>

      {/* Design Tokens Reference */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-[#E5EAF2] p-5">
          <p className="text-xs font-bold text-[#0F172A] mb-3">Design Tokens</p>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {[
              { name: 'Navy', color: '#0A1F52' },
              { name: 'Deep Navy', color: '#071A3D' },
              { name: 'Orange', color: '#FF7A00' },
              { name: 'Green', color: '#22C55E' },
              { name: 'Red', color: '#EF4444' },
              { name: 'Bg', color: '#F7F9FC' },
              { name: 'Card', color: '#FFFFFF' },
              { name: 'Border', color: '#E5EAF2' },
              { name: 'Dark', color: '#0F172A' },
              { name: 'Muted', color: '#64748B' },
            ].map((t) => (
              <div key={t.name} className="text-center">
                <div className="w-full aspect-square rounded-lg border border-[#E5EAF2] mb-1" style={{backgroundColor: t.color}} />
                <p className="text-[8px] text-[#64748B]">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mockup Sections */}
      <MockupSection title="01" subtitle="Landing Page — Premium hero, OS positioning, NFC product visuals">
        <MockupLanding />
      </MockupSection>

      <MockupSection title="02" subtitle="Home Dashboard — Selected profile, quick actions, stats, activity">
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
      <div className="bg-[#0A1F52] py-8 text-center">
        <p className="text-white/50 text-xs mb-2">
          Bingoo 2.0 — Mockup Set Complete
        </p>
        <p className="text-white/30 text-[10px]">
          These are visual design previews only. No database, Stripe, auth, route, or logic changes have been made.
        </p>
        <Link to="/" className="inline-block mt-4 px-5 py-2 bg-white/10 text-white text-xs font-medium rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
          ← Back to Current App
        </Link>
      </div>
    </div>
  );
}