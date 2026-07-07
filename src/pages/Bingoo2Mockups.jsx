import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MockupSection } from '@/components/mockups/MockupFrame';
import { InfinityMark, BingooAppIcon, BingooWordmark } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

// Original mockups
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

// Onboarding mockups
import { MockupSignupChoice, MockupAccountSetup, MockupProfileType, MockupCreateProfile, MockupUploadPhoto } from '@/components/mockups/onboarding/MockupOnboardingA';
import { MockupContactInfo, MockupChooseTheme, MockupConnectLinks, MockupOnboardingComplete } from '@/components/mockups/onboarding/MockupOnboardingB';
import MockupOnboardingRedesign from '@/components/mockups/onboarding/MockupOnboardingRedesign';

// Identity mockups
import { MockupProfileDetails, MockupPublicProfilePreview } from '@/components/mockups/identity/MockupIdentityScreens';
import ProfileLayoutGallery from '@/components/mockups/profiles/ProfileLayoutGallery';

// NFC mockups
import { MockupActivateNFC, MockupAssignDevice, MockupLostModeSetup, MockupLostModeFinder } from '@/components/mockups/nfc/MockupNFCScreens';

// Business mockups
import { MockupLeadDetail, MockupAppointmentDetail, MockupReviewsDashboard, MockupConnectionsDashboard } from '@/components/mockups/business/MockupBusinessScreens';
import PlanAlignedDashboard from '@/components/mockups/business/PlanAlignedDashboard';
import MockupConnectionsImproved from '@/components/mockups/business/MockupConnectionsImproved';

// Shop mockups
import { MockupProductDetail, MockupCartCheckout } from '@/components/mockups/shop/MockupShopScreens';
import MockupShopCatalog from '@/components/mockups/shop/MockupShopCatalog';

// Admin mockups
import { MockupAdminDashboard, MockupAdminUsers, MockupAdminNFCInventory, MockupAdminOrderDetail, MockupAdminSubscriptions } from '@/components/mockups/admin/MockupAdminScreens';
import MockupAdvancedAdmin from '@/components/mockups/admin/MockupAdvancedAdmin';

// New concept sections
import BrandShowcase from '@/components/mockups/brand/BrandShowcase';
import MockupStrategicConcepts from '@/components/mockups/strategic/MockupStrategicConcepts';
import MockupLandingImproved from '@/components/mockups/MockupLandingImproved';
import MockupTranslationUX from '@/components/mockups/i18n/MockupTranslationUX';

const NAVY = '#0b2149', ORANGE = '#f97316';

const SECTIONS = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'brand', label: 'Brand Identity', icon: 'sparkles' },
  { id: 'onboarding', label: 'Onboarding', icon: 'sparkles' },
  { id: 'identity', label: 'Identity + Layouts', icon: 'users' },
  { id: 'nfc', label: 'NFC / QR / Wallet', icon: 'nfc' },
  { id: 'business', label: 'Business Tools', icon: 'briefcase' },
  { id: 'shop', label: 'Shop / Design', icon: 'shop' },
  { id: 'admin', label: 'Admin', icon: 'building' },
  { id: 'strategic', label: 'Strategic Vision', icon: 'zap' },
  { id: 'homepage', label: 'Homepage', icon: 'home' },
  { id: 'i18n', label: 'Translation', icon: 'globe' },
];

// Original numbered screens
const SCREENS = [
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
  { num: '11', section: 'identity', title: 'Home Dashboard — Stats, Quick Actions, Activity', component: <MockupHomeDashboard /> },
  { num: '12', section: 'identity', title: 'My Profiles — Multi-Profile Management', component: <MockupMyProfiles /> },
  { num: '13', section: 'identity', title: 'Profile Details / Manage Profile', component: <MockupProfileDetails /> },
  { num: '14', section: 'identity', title: 'Profile Studio — Info, Design, Links, Media Tabs', component: <MockupProfileStudio /> },
  { num: '15', section: 'identity', title: 'Public Profile Preview — Visitor View', component: <MockupPublicProfilePreview /> },
  { num: '16', section: 'nfc', title: 'NFC Operating Center — Device List & Status', component: <MockupNFC /> },
  { num: '17', section: 'nfc', title: 'Activate NFC Device — Code Entry & Verification', component: <MockupActivateNFC /> },
  { num: '18', section: 'nfc', title: 'Assign Device to Profile — Link & Confirm', component: <MockupAssignDevice /> },
  { num: '19', section: 'nfc', title: 'QR Code Designer & Wallet Center', component: <MockupQRWallet /> },
  { num: '20', section: 'nfc', title: 'Lost Mode Setup — Finder Visibility Controls', component: <MockupLostModeSetup /> },
  { num: '21', section: 'nfc', title: 'Lost Mode Finder Flow — Report & Notify Owner', component: <MockupLostModeFinder /> },
  { num: '22', section: 'business', title: 'Leads CRM — Pipeline Cards & Status', component: <MockupLeadsCRM /> },
  { num: '23', section: 'business', title: 'Lead Detail — Contact, Timeline, Case Notes', component: <MockupLeadDetail /> },
  { num: '24', section: 'business', title: 'Appointments Calendar — Weekly View & Booking', component: <MockupAppointments /> },
  { num: '25', section: 'business', title: 'Appointment Detail — Management & Status', component: <MockupAppointmentDetail /> },
  { num: '26', section: 'business', title: 'Analytics Dashboard — Views, Taps, Sources', component: <MockupAnalytics /> },
  { num: '27', section: 'business', title: 'Reviews Dashboard — Google Reviews & Ratings', component: <MockupReviewsDashboard /> },
  { num: '28', section: 'business', title: 'Connections Dashboard — Saved Contacts & Sources', component: <MockupConnectionsDashboard /> },
  { num: '29', section: 'shop', title: 'NFC Shop Catalog — Premium Product Grid', component: <MockupShop /> },
  { num: '30', section: 'shop', title: 'Product Detail — Features, Quantity, Related', component: <MockupProductDetail /> },
  { num: '31', section: 'shop', title: 'Cart / Checkout — Summary & Secure Payment', component: <MockupCartCheckout /> },
  { num: '32', section: 'shop', title: 'Business Design Studio — Custom NFC Designer & Order', component: <MockupDesignStudio /> },
  { num: '33', section: 'admin', title: 'Admin Dashboard — System Overview & Activity', component: <MockupAdminDashboard /> },
  { num: '34', section: 'admin', title: 'Admin Users / Accounts — Plan & Status Management', component: <MockupAdminUsers /> },
  { num: '35', section: 'admin', title: 'Admin NFC Devices Inventory — Batch Generation', component: <MockupAdminNFCInventory /> },
  { num: '36', section: 'admin', title: 'Admin Manufacturing Orders — Pipeline & Table', component: <MockupAdmin /> },
  { num: '37', section: 'admin', title: 'Admin Order Detail — Timeline, Artwork, Supplier', component: <MockupAdminOrderDetail /> },
  { num: '38', section: 'admin', title: 'Admin Subscriptions & Test Account Controls', component: <MockupAdminSubscriptions /> },
];

// New concept sections — richer multi-screen showcases
const CONCEPT_SECTIONS = [
  { id: 'brand', label: 'Official Brand Identity', subtitle: 'Infinity "oo" mark, loading dots, app icon, NFC stamp, usage examples', component: <BrandShowcase /> },
  { id: 'identity-layouts', label: 'Profile Layout Gallery', subtitle: '8 distinct public profile layouts + desktop preview', component: <ProfileLayoutGallery /> },
  { id: 'onboarding-fix', label: 'Onboarding UX Fix — Screenshot 3 Redesign', subtitle: 'Fixed hierarchy, context, and clutter issues', component: <MockupOnboardingRedesign /> },
  { id: 'plan-features', label: 'Plan-Aligned Feature Access', subtitle: 'Pro, Business, Salon, Law Firm — only included tools shown', component: <PlanAlignedDashboard /> },
  { id: 'connections-improved', label: 'Connections Dashboard — Rich CRM', subtitle: 'Where met, event, relationship type, tags, follow-ups, filters', component: <MockupConnectionsImproved /> },
  { id: 'advanced-admin', label: 'Advanced Admin Dashboard', subtitle: 'Users, subs, revenue, churn, manufacturing, support, audit log — 9 tabs', component: <MockupAdvancedAdmin /> },
  { id: 'shop-catalog', label: 'NFC Shop Catalog — Branded Products', subtitle: '10 products with 3D renders, color options, full detail pages', component: <MockupShopCatalog /> },
  { id: 'strategic', label: 'Strategic Product Direction', subtitle: 'AI builder, quality score, verified badges, ROI, event mode, concierge', component: <MockupStrategicConcepts /> },
  { id: 'homepage', label: 'Improved Homepage', subtitle: 'Full product story: what, how, model, mission, services, plans, privacy', component: <MockupLandingImproved /> },
  { id: 'i18n', label: 'French Translation Coverage', subtitle: 'Bilingual EN/FR screens, coverage matrix, translation audit', component: <MockupTranslationUX /> },
];

export default function Bingoo2Mockups() {
  const [activeSection, setActiveSection] = useState('all');

  const visibleScreens = activeSection === 'all' ? SCREENS : SCREENS.filter(s => s.section === activeSection);

  // Map filter section IDs to concept section IDs
  const conceptFilterMap = {
    brand: ['brand'],
    onboarding: ['onboarding-fix'],
    identity: ['identity-layouts'],
    nfc: [],
    business: ['plan-features', 'connections-improved'],
    shop: ['shop-catalog'],
    admin: ['advanced-admin'],
    strategic: ['strategic'],
    homepage: ['homepage'],
    i18n: ['i18n'],
  };

  const visibleConcepts = activeSection === 'all'
    ? CONCEPT_SECTIONS
    : CONCEPT_SECTIONS.filter(c => (conceptFilterMap[activeSection] || []).includes(c.id));

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Top Banner */}
      <div className="relative overflow-hidden px-6 py-14 text-center" style={{ background: 'linear-gradient(160deg, #0b2149, #071A3D)' }}>
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full opacity-20" style={{ background: '#f97316', filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: '#3b82f6', filter: 'blur(120px)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BingooAppIcon size={56} glow={true} imageUrl="https://media.base44.com/images/public/692bd9007b93ba81de543346/8792d3cda_generated_image.png" />
            <BingooWordmark size="text-4xl" textColor="#FFFFFF" infinityColor={ORANGE} light />
          </div>
          <p className="text-white/60 text-sm mb-2">The Operating System for Professional Identity</p>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm mb-6">
            <Icon name="grid" size={16} color={ORANGE} />
            <span className="text-white font-black text-sm">Product Journey — {SCREENS.length} Screens + {CONCEPT_SECTIONS.length} Concept Sections</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-2xl mx-auto">
            {SECTIONS.slice(1).map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${activeSection === s.id ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/10'}`}
              >
                <Icon name={s.icon} size={12} color={ORANGE} />
                <span className="text-white/70 text-[10px] font-bold">{s.label}</span>
              </button>
            ))}
          </div>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-xs font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm">
            <Icon name="arrowRight" size={14} color="#FFFFFF" className="rotate-180" /> Back to Current App
          </Link>
        </div>
      </div>

      {/* Section Filter (Sticky) */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-[#E5EAF2] px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 flex-wrap">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSection === s.id ? 'text-white shadow-md' : 'text-[#64748B] bg-[#F7F9FC] hover:bg-[#EFF3F9]'}`}
              style={activeSection === s.id ? { background: '#0b2149' } : {}}
            >
              <Icon name={s.icon} size={14} color={activeSection === s.id ? '#f97316' : '#64748B'} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Concept Sections */}
      {visibleConcepts.length > 0 && (
        <div className="py-8 px-4 md:px-8 space-y-12">
          {visibleConcepts.map((cs) => (
            <div key={cs.id} className="max-w-[1100px] mx-auto">
              <div className="text-center mb-8">
                <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-[#0b2149] to-[#13284f] text-white text-xs font-bold rounded-full mb-3 tracking-wider">
                  CONCEPT · {cs.label.toUpperCase()}
                </span>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-1">{cs.label}</h3>
                <p className="text-[#64748B] text-sm">{cs.subtitle}</p>
              </div>
              <div className="flex justify-center">{cs.component}</div>
            </div>
          ))}
        </div>
      )}

      {/* Original Numbered Screens */}
      {visibleScreens.length > 0 && (
        <div className="pb-16">
          {visibleScreens.map((screen) => (
            <MockupSection key={screen.num} title={screen.num} subtitle={screen.title}>
              {screen.component}
            </MockupSection>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="py-12 text-center" style={{ background: 'linear-gradient(160deg, #0b2149, #071A3D)' }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <BingooAppIcon size={40} glow={true} imageUrl="https://media.base44.com/images/public/692bd9007b93ba81de543346/8792d3cda_generated_image.png" />
          <div>
            <span className="font-black text-base text-white">Bing</span>
            <InfinityMark size={16} color={ORANGE} strokeWidth={2.5} className="inline-block ml-0.5" />
          </div>
        </div>
        <p className="text-white/50 text-xs mb-2">Bingoo 2.0 — {SCREENS.length} Screens + {CONCEPT_SECTIONS.length} Concept Sections</p>
        <p className="text-white/30 text-[10px] mb-6 max-w-md mx-auto">These are visual design previews only. No database, Stripe, auth, route, or logic changes have been made.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-xs font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm">
          <Icon name="arrowRight" size={14} color="#FFFFFF" className="rotate-180" /> Back to Current App
        </Link>
      </div>
    </div>
  );
}