import React from 'react';
import { PhoneFrame, Badge } from '@/components/mockups/MockupFrame';
import { BingooLogo, InfinityMark } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', MUTED = '#64748B', INK = '#0F172A';

const PLANS = [
  {
    name: 'Free', price: '$0', period: 'forever', color: MUTED,
    tools: [
      { icon: 'users', label: '1 Profile', locked: false },
      { icon: 'nfc', label: '1 NFC Device', locked: false },
      { icon: 'qr', label: 'Basic QR', locked: false },
      { icon: 'chart', label: 'Limited Analytics', locked: false },
      { icon: 'message', label: 'Leads CRM', locked: true },
      { icon: 'calendar', label: 'Appointments', locked: true },
      { icon: 'wallet', label: 'Wallet Passes', locked: true },
      { icon: 'palette', label: 'Design Studio', locked: true },
    ],
    cta: 'Upgrade to Pro — $4.99/mo',
  },
  {
    name: 'Professional', price: '$4.99', period: '/month', color: ORANGE, popular: true,
    tools: [
      { icon: 'users', label: 'Unlimited Profiles', locked: false },
      { icon: 'nfc', label: '5 NFC Devices', locked: false },
      { icon: 'qr', label: 'Custom QR', locked: false },
      { icon: 'wallet', label: 'Apple + Google Wallet', locked: false },
      { icon: 'chart', label: 'Full Analytics', locked: false },
      { icon: 'message', label: 'Leads CRM', locked: false },
      { icon: 'calendar', label: 'Appointments', locked: false },
      { icon: 'palette', label: 'Design Studio', locked: true },
    ],
    cta: 'Current Plan',
  },
  {
    name: 'Salon', price: '$19.99', period: '/month', color: '#ec4899',
    tools: [
      { icon: 'users', label: 'Unlimited Profiles', locked: false },
      { icon: 'nfc', label: 'Unlimited NFC', locked: false },
      { icon: 'qr', label: 'Branded QR', locked: false },
      { icon: 'wallet', label: 'Wallet Passes', locked: false },
      { icon: 'chart', label: 'Full Analytics', locked: false },
      { icon: 'calendar', label: 'Bookings + Stylists', locked: false },
      { icon: 'star', label: 'Salon Services', locked: false },
      { icon: 'star', label: 'Loyalty Program', locked: false },
      { icon: 'palette', label: 'Portfolio Gallery', locked: false },
      { icon: 'shield', label: 'Legal Tools', locked: true },
    ],
    cta: 'Current Plan',
  },
  {
    name: 'Law Firm', price: '$49.00', period: '/month', color: NAVY,
    tools: [
      { icon: 'users', label: 'Unlimited Profiles', locked: false },
      { icon: 'nfc', label: 'Unlimited NFC', locked: false },
      { icon: 'qr', label: 'Branded QR', locked: false },
      { icon: 'wallet', label: 'Wallet Passes', locked: false },
      { icon: 'chart', label: 'Full Analytics', locked: false },
      { icon: 'message', label: 'Legal Intake CRM', locked: false },
      { icon: 'calendar', label: 'Consultations', locked: false },
      { icon: 'shield', label: 'Practice Areas', locked: false },
      { icon: 'users', label: 'Attorney Team', locked: false },
      { icon: 'building', label: 'Office Locations', locked: false },
      { icon: 'shop', label: 'Salon Tools', locked: true },
    ],
    cta: 'Current Plan',
  },
  {
    name: 'Business', price: '$14.99', period: '/month', color: '#22C55E',
    tools: [
      { icon: 'users', label: 'Unlimited Profiles', locked: false },
      { icon: 'nfc', label: 'Unlimited NFC', locked: false },
      { icon: 'qr', label: 'Branded QR', locked: false },
      { icon: 'wallet', label: 'Wallet Passes', locked: false },
      { icon: 'chart', label: 'Full + Export', locked: false },
      { icon: 'message', label: 'Leads CRM', locked: false },
      { icon: 'calendar', label: 'Appointments', locked: false },
      { icon: 'palette', label: 'Design Studio', locked: false },
      { icon: 'building', label: 'Team (10 members)', locked: false },
      { icon: 'scissors', label: 'Legal Tools', locked: true },
      { icon: 'star', label: 'Salon Tools', locked: true },
    ],
    cta: 'Coming Soon',
  },
  {
    name: 'Admin', price: 'All Access', period: '', color: '#EF4444',
    tools: [
      { icon: 'users', label: 'All Profiles', locked: false },
      { icon: 'nfc', label: 'All NFC Devices', locked: false },
      { icon: 'qr', label: 'All QR Tools', locked: false },
      { icon: 'wallet', label: 'All Wallet Passes', locked: false },
      { icon: 'chart', label: 'All Analytics', locked: false },
      { icon: 'message', label: 'All CRM Tools', locked: false },
      { icon: 'calendar', label: 'All Appointments', locked: false },
      { icon: 'palette', label: 'Design Studio', locked: false },
      { icon: 'building', label: 'Team Management', locked: false },
      { icon: 'shield', label: 'Legal Tools', locked: false },
      { icon: 'star', label: 'Salon Tools', locked: false },
      { icon: 'grid', label: 'Admin Dashboard', locked: false },
    ],
    cta: 'Admin Access',
  },
];

function PlanJourney({ plan }) {
  return (
    <PhoneFrame label={`${plan.name} — ${plan.price}${plan.period}`}>
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center justify-between mb-3">
            <BingooLogo size={28} light showText={false} />
            <Badge color={plan.color}>{plan.name.toUpperCase()}</Badge>
          </div>
          <p className="text-white font-black text-base">{plan.price}<span className="text-[10px] text-white/40 font-bold">{plan.period}</span></p>
          <p className="text-white/40 text-[9px]">{plan.popular ? 'Most popular plan' : plan.name === 'Admin' ? 'Full platform access' : plan.name === 'Free' ? 'Get started free' : ''}</p>
        </div>
        <div className="px-5 mt-4">
          <p className="text-xs font-black text-[#0F172A] mb-3">Your Tools</p>
          <div className="grid grid-cols-3 gap-2">
            {plan.tools.map((t) => (
              <div key={t.label} className={`rounded-2xl p-2.5 flex flex-col items-center gap-1 border ${t.locked ? 'border-dashed border-[#E5EAF2] opacity-40' : 'border-[#E5EAF2] bg-white'}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: t.locked ? '#F7F9FC' : `${plan.color}15` }}>
                  <Icon name={t.locked ? 'lock' : t.icon} size={16} color={t.locked ? MUTED : plan.color} />
                </div>
                <span className="text-[8px] font-bold text-[#0F172A] text-center">{t.label}</span>
              </div>
            ))}
          </div>
          {/* Upgrade CTA for Free plan */}
          {plan.cta !== 'Current Plan' && plan.cta !== 'Admin Access' && (
            <div className="mt-4 rounded-2xl p-3 border-2 border-dashed" style={{ borderColor: `${ORANGE}40`, background: `${ORANGE}08` }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="sparkles" size={14} color={ORANGE} />
                <p className="text-[9px] font-black" style={{ color: ORANGE }}>UNLOCK MORE</p>
              </div>
              <p className="text-[9px] text-[#64748B] mb-2">Get unlimited profiles, CRM, appointments, and more</p>
              <button className="w-full py-2 text-white text-[10px] font-black rounded-xl" style={{ background: ORANGE }}>{plan.cta}</button>
            </div>
          )}
          {plan.cta === 'Current Plan' && (
            <div className="mt-4 bg-white rounded-2xl p-3 border border-[#E5EAF2] text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Icon name="checkCircle" size={14} color="#22C55E" />
                <span className="text-[10px] font-bold text-[#22C55E]">Active Subscription</span>
              </div>
              <p className="text-[8px] text-[#64748B] mt-1">All {plan.tools.filter(t => !t.locked).length} tools unlocked</p>
            </div>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}

export default function PlanJourneys() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-black text-[#0F172A] mb-1">Plan Journeys — Every Subscription Path</p>
        <p className="text-[10px] text-[#64748B] max-w-lg mx-auto">Each plan shows only its included tools. Professional is $4.99/month. Salon tools never appear for Law Firm. Law Firm tools never appear for Salon. Admin sees everything.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {PLANS.map((plan) => <PlanJourney key={plan.name} plan={plan} />)}
      </div>
    </div>
  );
}