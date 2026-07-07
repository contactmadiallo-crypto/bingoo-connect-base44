import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MockupSection } from '@/components/mockups/MockupFrame';
import { Icon } from '@/components/mockups/BingooIcons';

// Existing mockups
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

// New onboarding mockups
import { MockupSignupChoice, MockupAccountSetup, MockupProfileType, MockupCreateProfile, MockupUploadPhoto } from '@/components/mockups/onboarding/MockupOnboardingA';
import { MockupContactInfo, MockupChooseTheme, MockupConnectLinks, MockupOnboardingComplete } from '@/components/mockups/onboarding/MockupOnboardingB';

// New identity mockups
import { MockupProfileDetails, MockupPublicProfilePreview } from '@/components/mockups/identity/MockupIdentityScreens';

// New NFC mockups
import { MockupActivateNFC, MockupAssignDevice, MockupLostModeSetup, MockupLostModeFinder } from '@/components/mockups/nfc/MockupNFCScreens';

// New business mockups
import { MockupLeadDetail, MockupAppointmentDetail, MockupReviewsDashboard, MockupConnectionsDashboard } from '@/components/mockups/business/MockupBusinessScreens';

// New shop mockups
import { MockupProductDetail, MockupCartCheckout } from '@/components/mockups/shop/MockupShopScreens';

// New admin mockups
import { MockupAdminDashboard, MockupAdminUsers, MockupAdminNFCInventory, MockupAdminOrderDetail, MockupAdminSubscriptions } from '@/components/mockups/admin/MockupAdminScreens';

const SECTIONS = [
  { id: 'all', label: 'All Screens', icon: 'grid' },
  { id: 'onboarding', label: 'Onboarding', icon: 'sparkles', count: 10 },
  { id: 'identity', label: 'Identity', icon: 'users', count: 5 },
  { id: 'nfc', label: 'NFC / QR / Wallet', icon: 'nfc', count: 6 },
  { id: 'business', label: 'Business Tools', icon: 'briefcase', count: 7 },
  { id: 'shop', label: 'Shop / Design', icon: 'shop', count: 4 },
  { id: 'admin', label: 'Admin', icon: 'building', count: 6 },
];

const SCREENS = [
  // ONBOARDING
  { num: '01', section: 'onboarding', title: 'Landing Page — Full Business Model', component: <MockupLanding /> },
  { num: '02', section: 'onboarding', title: 'Signup Choice — Individual, Professional, Business', component: <MockupSignupChoice /> },
  { num: '03', section: 'onboarding', title: 'Account Setup — Credentials & OAuth', component: <MockupAccountSetup /> },
  { num: '04', section: 'onboarding', title: 'Choose Profile Type — Industry Selection', component: <MockupProfileType /> },
  { num: '05', section: 'onboarding', title: 'Create First Profile — Name, Username, Bio', component: <MockupCreateProfile /> },
  { num: '06', section: 'onboarding', title: 'Upload Photo / Logo — Avatar & Shape', component: <MockupUploadPhoto /> },
  { num: '07', section: 'onboarding', title: 'Contact Information — Phone, WhatsApp, Email', component: <MockupContactInfo /> },
  { num: '08', section: 'onboarding', title: 'Choose Profile Theme — Layout & Color', component: <MockupChooseTheme /> },
  { num: '09', section: 'onboarding', title: 'Connect Links — Social Platforms & Custom', component: <MockupConnectLinks /> },
  { num: '10', section: 'onboarding', title: 'Onboarding Complete — Launch Profile', component: <MockupOnboardingComplete /> },
  // IDENTITY
  { num: '11', section: 'identity', title: 'Home Dashboard — Stats, Quick Actions, Activity', component: <MockupHomeDashboard /> },
  { num: '12', section: 'identity', title: 'My Profiles — Multi-Profile Management', component: <MockupMyProfiles /> },
  { num: '13', section: 'identity', title: 'Profile Details / Manage Profile', component: <MockupProfileDetails /> },
  { num: '14', section: 'identity', title: 'Profile Studio — Info, Design, Links, Media Tabs', component: <MockupProfileStudio /> },
  { num: '15', section: 'identity', title: 'Public Profile Preview — Visitor View', component: <MockupPublicProfilePreview /> },
  // NFC / QR / WALLET
  { num: '16', section: 'nfc', title: 'NFC Operating Center — Device List & Status', component: <MockupNFC /> },
  { num: '17', section: 'nfc', title: 'Activate NFC Device — Code Entry & Verification', component: <MockupActivateNFC /> },
  { num: '18', section: 'nfc', title: 'Assign Device to Profile — Link & Confirm', component: <MockupAssignDevice /> },
  { num: '19', section: 'nfc', title: 'QR Code Designer & Wallet Center', component: <MockupQRWallet /> },
  { num: '20', section: 'nfc', title: 'Lost Mode Setup — Finder Visibility Controls', component: <MockupLostModeSetup /> },
  { num: '21', section: 'nfc', title: 'Lost Mode Finder Flow — Report & Notify Owner', component: <MockupLostModeFinder /> },
  // BUSINESS TOOLS
  { num: '22', section: 'business', title: 'Leads CRM — Pipeline Cards & Status', component: <MockupLeadsCRM /> },
  { num: '23', section: 'business', title: 'Lead Detail — Contact, Timeline, Case Notes', component: <MockupLeadDetail /> },
  { num: '24', section: 'business', title: 'Appointments Calendar — Weekly View & Booking', component: <MockupAppointments /> },
  { num: '25', section: 'business', title: 'Appointment Detail — Management & Status', component: <MockupAppointmentDetail /> },
  { num: '26', section: 'business', title: 'Analytics Dashboard — Views, Taps, Sources', component: <MockupAnalytics /> },
  { num: '27', section: 'business', title: 'Reviews Dashboard — Google Reviews & Ratings', component: <MockupReviewsDashboard /> },
  { num: '28', section: 'business', title: 'Connections Dashboard — Saved Contacts & Sources', component: <MockupConnectionsDashboard /> },
  // SHOP / DESIGN STUDIO
  { num: '29', section: 'shop', title: 'NFC Shop Catalog — Premium Product Grid', component: <MockupShop /> },
  { num: '30', section: 'shop', title: 'Product Detail — Features, Quantity, Related', component: <MockupProductDetail /> },
  { num: '31', section: 'shop', title: 'Cart / Checkout — Summary & Secure Payment', component: <MockupCartCheckout /> },
  { num: '32', section: 'shop', title: 'Business Design Studio — Custom NFC Designer & Order', component: <MockupDesignStudio /> },
  // ADMIN
  { num: '33', section: 'admin', title: 'Admin Dashboard — System Overview & Activity', component: <MockupAdminDashboard /> },
  { num: '34', section: 'admin', title: 'Admin Users / Accounts — Plan & Status Management', component: <MockupAdminUsers /> },
  { num: '35', section: 'admin', title: 'Admin NFC Devices Inventory — Batch Generation', component: <MockupAdminNFCInventory /> },
  { num: '36', section: 'admin', title: 'Admin Manufacturing Orders — Pipeline & Table', component: <MockupAdmin /> },
  { num: '37', section: 'admin', title: 'Admin Order Detail — Timeline, Artwork, Supplier', component: <MockupAdminOrderDetail /> },
  { num: '38', section: 'admin', title: 'Admin Subscriptions & Test Account Controls', component: <MockupAdminSubscriptions /> },
];

export default function Bingoo2Mockups() {
  const [activeSection, setActiveSection] = useState('all');
  const visibleScreens = activeSection === 'all' ? SCREENS : SCREENS.filter(s => s.section === activeSection);

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Top Banner */}
      <div className="relative overflow-hidden px-6 py-16 text-center" style={{ background: 'linear-gradient(160deg, #0b2149, #071A3D)' }}>
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full opacity-20" style={{ background: '#f97316', filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: '#3b82f6', filter: 'blur(120px)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-xs font-bold rounded-full mb-5 tracking-widest backdrop-blur-sm border border-white/10">
            <Icon name="sparkles" size={14} color="#f97316" /> MOCKUPS ONLY · NO IMPLEMENTATION
          </span>
          <h1 className="text-4xl font-black text-white mb-3">Bingoo 2.0</h1>
          <p className="text-white/60 text-sm mb-2">The Operating System for Professional Identity</p>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm mb-8">
            <Icon name="grid" size={16} color="#f97316" />
            <span className="text-white font-black text-sm">Product Journey — {SCREENS.length} Screens</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {SECTIONS.slice(1).map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <Icon name={s.icon} size={12} color="#f97316" />
                <span className="text-white/70 text-[10px] font-bold">{s.label}</span>
                <span className="text-white/30 text-[9px]">({s.count})</span>
              </div>
            ))}
          </div>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-xs font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm">
            <Icon name="arrowRight" size={14} color="#FFFFFF" className="rotate-180" /> Back to Current App
          </Link>
        </div>
      </div>

      {/* Section Filter (Sticky) */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-[#E5EAF2] px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2 flex-wrap">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSection === s.id ? 'text-white shadow-md' : 'text-[#64748B] bg-[#F7F9FC] hover:bg-[#EFF3F9]'}`}
              style={activeSection === s.id ? { background: '#0b2149' } : {}}
            >
              <Icon name={s.icon} size={14} color={activeSection === s.id ? '#f97316' : '#64748B'} />
              {s.label}
              {s.count && <span className={`text-[9px] ${activeSection === s.id ? 'text-white/50' : 'text-[#cbd5e1]'}`}>{s.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Design Tokens */}
      {activeSection === 'all' && (
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
      )}

      {/* Screens */}
      <div className="pb-16">
        {visibleScreens.map((screen) => (
          <MockupSection key={screen.num} title={screen.num} subtitle={screen.title}>
            {screen.component}
          </MockupSection>
        ))}
      </div>

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
        <p className="text-white/50 text-xs mb-2">Bingoo 2.0 — {SCREENS.length} Screen Mockups Complete</p>
        <p className="text-white/30 text-[10px] mb-6 max-w-md mx-auto">These are visual design previews only. No database, Stripe, auth, route, or logic changes have been made.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-xs font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm">
          <Icon name="arrowRight" size={14} color="#FFFFFF" className="rotate-180" /> Back to Current App
        </Link>
      </div>
    </div>
  );
}