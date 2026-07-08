import React from 'react';
import { PhoneFrame, Badge } from '@/components/mockups/MockupFrame';
import { BingooLogo } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', ORANGE = '#f97316', BG = '#F7F9FC', MUTED = '#64748B', INK = '#0F172A';

// Plan-specific tool sets — exactly matches subscription plan features
const PLAN_TOOLS = {
  professional: {
    name: 'Professional', price: '$4.99/mo', color: ORANGE,
    tools: [
      { icon: 'users', label: 'Profiles', desc: 'Unlimited', locked: false },
      { icon: 'nfc', label: 'NFC Devices', desc: '5 devices', locked: false },
      { icon: 'qr', label: 'QR Designer', desc: 'Custom colors', locked: false },
      { icon: 'wallet', label: 'Wallet Passes', desc: 'Apple + Google', locked: false },
      { icon: 'chart', label: 'Analytics', desc: 'Full dashboard', locked: false },
      { icon: 'share', label: 'Share Tools', desc: 'All platforms', locked: false },
      { icon: 'message', label: 'Leads CRM', desc: 'Pipeline', locked: false },
      { icon: 'calendar', label: 'Appointments', desc: 'Booking calendar', locked: false },
      { icon: 'palette', label: 'Design Studio', desc: 'Locked', locked: true },
      { icon: 'building', label: 'Team Mgmt', desc: 'Locked', locked: true },
    ],
  },
  business: {
    name: 'Business', price: '$14.99/mo', color: '#22C55E',
    tools: [
      { icon: 'users', label: 'Profiles', desc: 'Unlimited', locked: false },
      { icon: 'nfc', label: 'NFC Devices', desc: 'Unlimited', locked: false },
      { icon: 'qr', label: 'QR Designer', desc: 'Custom + branded', locked: false },
      { icon: 'wallet', label: 'Wallet Passes', desc: 'Apple + Google', locked: false },
      { icon: 'chart', label: 'Analytics', desc: 'Full + export', locked: false },
      { icon: 'share', label: 'Share Tools', desc: 'All platforms', locked: false },
      { icon: 'message', label: 'Leads CRM', desc: 'Pipeline + export', locked: false },
      { icon: 'calendar', label: 'Appointments', desc: 'Booking + reminders', locked: false },
      { icon: 'palette', label: 'Design Studio', desc: 'Custom NFC cards', locked: false },
      { icon: 'building', label: 'Team Mgmt', desc: 'Up to 10 members', locked: false },
      { icon: 'scissors', label: 'Legal Tools', desc: 'Locked', locked: true },
      { icon: 'shop', label: 'Salon Tools', desc: 'Locked', locked: true },
    ],
  },
  salon: {
    name: 'Salon', price: '$19.99/mo', color: '#ec4899',
    tools: [
      { icon: 'users', label: 'Profiles', desc: 'Unlimited', locked: false },
      { icon: 'nfc', label: 'NFC Devices', desc: 'Unlimited', locked: false },
      { icon: 'qr', label: 'QR Designer', desc: 'Custom + branded', locked: false },
      { icon: 'wallet', label: 'Wallet Passes', desc: 'Apple + Google', locked: false },
      { icon: 'chart', label: 'Analytics', desc: 'Full dashboard', locked: false },
      { icon: 'message', label: 'Leads CRM', desc: 'Pipeline', locked: false },
      { icon: 'calendar', label: 'Appointments', desc: 'Booking + stylists', locked: false },
      { icon: 'palette', label: 'Salon Services', desc: 'Menu + pricing', locked: false },
      { icon: 'star', label: 'Loyalty Program', desc: 'Points + rewards', locked: false },
      { icon: 'grid', label: 'Portfolio', desc: 'Before/after gallery', locked: false },
      { icon: 'shield', label: 'Legal Tools', desc: 'Not included', locked: true },
      { icon: 'building', label: 'Team Mgmt', desc: 'Locked', locked: true },
    ],
  },
  lawfirm: {
    name: 'Law Firm', price: '$49.00/mo', color: NAVY,
    tools: [
      { icon: 'users', label: 'Profiles', desc: 'Unlimited', locked: false },
      { icon: 'nfc', label: 'NFC Devices', desc: 'Unlimited', locked: false },
      { icon: 'qr', label: 'QR Designer', desc: 'Custom + branded', locked: false },
      { icon: 'wallet', label: 'Wallet Passes', desc: 'Apple + Google', locked: false },
      { icon: 'chart', label: 'Analytics', desc: 'Full dashboard', locked: false },
      { icon: 'message', label: 'Leads CRM', desc: 'Legal intake forms', locked: false },
      { icon: 'calendar', label: 'Appointments', desc: 'Consultations', locked: false },
      { icon: 'shield', label: 'Practice Areas', desc: 'Immigration/Civil/Criminal', locked: false },
      { icon: 'users', label: 'Team Members', desc: 'Attorneys + bios', locked: false },
      { icon: 'building', label: 'Office Locations', desc: 'Multi-office', locked: false },
      { icon: 'package', label: 'Legal Services', desc: 'Service catalog', locked: false },
      { icon: 'shop', label: 'Salon Tools', desc: 'Not included', locked: true },
    ],
  },
};

function PlanDashboard({ planKey }) {
  const plan = PLAN_TOOLS[planKey];
  return (
    <PhoneFrame label={`${plan.name} Plan — $${plan.price}`}>
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, #071A3D)` }}>
          <div className="flex items-center justify-between mb-3">
            <BingooLogo size={28} light showText={false} />
            <Badge color={plan.color}>{plan.name.toUpperCase()}</Badge>
          </div>
          <p className="text-white font-black text-sm">Your Tools</p>
          <p className="text-white/40 text-[9px]">Only features included in your plan are shown</p>
        </div>
        <div className="px-5 mt-4">
          <div className="grid grid-cols-3 gap-2">
            {plan.tools.map((t) => (
              <div key={t.label} className={`rounded-2xl p-2.5 flex flex-col items-center gap-1 border ${t.locked ? 'border-dashed border-[#E5EAF2] opacity-50' : 'border-[#E5EAF2] bg-white'}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: t.locked ? '#F7F9FC' : `${plan.color}15` }}>
                  <Icon name={t.locked ? 'lock' : t.icon} size={16} color={t.locked ? MUTED : plan.color} />
                </div>
                <span className="text-[8px] font-bold text-[#0F172A] text-center">{t.label}</span>
                <span className="text-[7px] text-[#64748B] text-center">{t.desc}</span>
              </div>
            ))}
          </div>
          {plan.tools.some(t => t.locked) && (
            <div className="mt-4 bg-white rounded-2xl p-3 border border-[#E5EAF2]">
              <p className="text-[9px] font-bold text-[#64748B] mb-1">LOCKED FEATURES</p>
              <p className="text-[9px] text-[#0F172A]">{plan.tools.filter(t => t.locked).length} features not included in {plan.name} plan</p>
              <button className="w-full py-2 mt-2 text-[9px] font-black text-white rounded-lg" style={{ background: plan.color }}>Upgrade to Unlock</button>
            </div>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}

// Admin view — sees all tools
function AdminAllTools() {
  const allTools = Object.values(PLAN_TOOLS).flatMap(p => p.tools).filter((t, i, arr) => arr.findIndex(x => x.label === t.label) === i);
  return (
    <PhoneFrame label="Admin View — All Tools Unlocked">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, #071A3D)` }}>
          <div className="flex items-center justify-between mb-3">
            <BingooLogo size={28} light showText={false} />
            <Badge color="#EF4444">ADMIN</Badge>
          </div>
          <p className="text-white font-black text-sm">All Platform Tools</p>
          <p className="text-white/40 text-[9px]">Admin can access every feature across all plans</p>
        </div>
        <div className="px-5 mt-4">
          <div className="grid grid-cols-3 gap-2">
            {allTools.map((t) => (
              <div key={t.label} className="rounded-2xl p-2.5 flex flex-col items-center gap-1 border border-[#E5EAF2] bg-white">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name={t.icon} size={16} color={NAVY} /></div>
                <span className="text-[8px] font-bold text-[#0F172A] text-center">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export default function PlanAlignedDashboard() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-black text-[#0F172A] mb-1">Plan-Aligned Feature Access</p>
        <p className="text-[10px] text-[#64748B] max-w-lg mx-auto">Each plan sees only its included tools. Salon tools never appear for Law Firm profiles. Law Firm tools never appear for Salon profiles. Locked states show upgrade path. Admin sees everything.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <PlanDashboard planKey="professional" />
        <PlanDashboard planKey="business" />
        <PlanDashboard planKey="salon" />
        <PlanDashboard planKey="lawfirm" />
        <AdminAllTools />
      </div>
    </div>
  );
}