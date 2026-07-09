import React, { useState } from 'react';
import { Check, Lock, Crown, ArrowRight, Sparkles, Building2, Scissors, Scale, Briefcase, UtensilsCrossed, Users, CalendarHeart, Package, Shield } from 'lucide-react';
import { InfinityMark } from '@/components/mockups/brand/InfinityMark';

const PLAN_JOURNEYS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Sparkles,
    color: '#64748B',
    status: 'active',
    included: ['1 Profile', 'Basic NFC activation', 'QR code', 'Public profile link', 'Basic analytics'],
    locked: ['Custom layouts', 'Appointment booking', 'CRM pipeline', 'Team members', 'Advanced analytics', 'Design Studio'],
    nextAction: null,
    dashboardPreview: 'Basic profile with standard layout, QR sharing, and view counter.',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$4.99',
    period: '/month',
    icon: Crown,
    color: '#f97316',
    status: 'active',
    included: ['3 Profiles', 'All layout options', 'Appointment booking', 'CRM pipeline', 'Advanced analytics', 'Custom branding', 'QR wallet customization'],
    locked: ['Team members', 'Office locations', 'Salon services', 'Legal services', 'Attendance tracking'],
    nextAction: 'Upgrade from Free to unlock layouts, booking, and CRM.',
    dashboardPreview: 'Multi-profile workspace with analytics, lead pipeline, appointment calendar, and design customization.',
  },
  {
    id: 'salon',
    name: 'Salon',
    price: '$19.99',
    period: '/month',
    icon: Scissors,
    color: '#8b5cf6',
    status: 'active',
    included: ['Everything in Professional', 'Salon service catalog', 'Stylist/team management', 'Salon-specific layout', 'Loyalty cards', 'Business hours'],
    locked: ['Legal services', 'Practice areas', 'Office locations'],
    nextAction: 'Perfect for hair salons, nail studios, and beauty professionals.',
    dashboardPreview: 'Service menu, stylist calendar, loyalty program, and salon-branded profile layout.',
  },
  {
    id: 'lawfirm',
    name: 'Law Firm',
    price: '$49.00',
    period: '/month',
    icon: Scale,
    color: '#3b82f6',
    status: 'active',
    included: ['Everything in Professional', 'Practice areas', 'Attorney profiles', 'Legal intake forms', 'Case management', 'Office locations', 'Immigration/civil/criminal fields'],
    locked: ['Salon services'],
    nextAction: 'Built for law firms handling immigration, civil, and criminal cases.',
    dashboardPreview: 'Practice area catalog, attorney directory, legal lead intake with case fields, and multi-office management.',
  },
  {
    id: 'business',
    name: 'Business',
    price: 'Coming Soon',
    period: '',
    icon: Briefcase,
    color: '#0b2149',
    status: 'coming_soon',
    included: [],
    locked: ['Full business suite', 'Team dashboards', 'Advanced CRM', 'Bulk NFC ordering', 'White-label branding'],
    nextAction: 'Coming Soon — join the waitlist to be notified when Business launches.',
    dashboardPreview: 'Full business operations suite with team management, bulk ordering, and white-label options.',
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    price: 'Coming Soon',
    period: '',
    icon: UtensilsCrossed,
    color: '#f97316',
    status: 'coming_soon',
    included: [],
    locked: ['Menu management', 'Table reservations', 'Customer reviews', 'Loyalty program', 'Special offers'],
    nextAction: 'Coming Soon — restaurant management tools in development.',
    dashboardPreview: 'Digital menu, reservation system, customer reviews, and restaurant-branded profile.',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    price: 'Coming Soon',
    period: '',
    icon: Building2,
    color: '#0b2149',
    status: 'coming_soon',
    included: [],
    locked: ['Enterprise team management', 'SSO authentication', 'Bulk provisioning', 'Advanced compliance', 'Custom integrations'],
    nextAction: 'Coming Soon — contact sales for enterprise pilot access.',
    dashboardPreview: 'Enterprise-grade identity management with SSO, bulk NFC provisioning, and compliance controls.',
  },
  {
    id: 'ngo',
    name: 'NGO',
    price: 'Coming Soon',
    period: '',
    icon: Users,
    color: '#10b981',
    status: 'coming_soon',
    included: [],
    locked: ['Donor management', 'Event registration', 'Volunteer coordination', 'Impact tracking'],
    nextAction: 'Coming Soon — nonprofit tools in development.',
    dashboardPreview: 'Donor CRM, event registration, volunteer coordination, and impact analytics.',
  },
  {
    id: 'event',
    name: 'Event Planner',
    price: 'Coming Soon',
    period: '',
    icon: CalendarHeart,
    color: '#ec4899',
    status: 'coming_soon',
    included: [],
    locked: ['Event mode', 'Bulk attendee profiles', 'Networking connections', 'Event analytics'],
    nextAction: 'Coming Soon — event networking features in development.',
    dashboardPreview: 'Event mode with bulk attendee profile creation, networking hub, and real-time event analytics.',
  },
  {
    id: 'enterprise',
    name: 'Bulk / Enterprise',
    price: 'Custom',
    period: '',
    icon: Package,
    color: '#0b2149',
    status: 'contact_sales',
    included: ['Custom volume pricing', 'Dedicated account manager', 'Custom branding', 'API access', 'Bulk NFC manufacturing', 'Priority support'],
    locked: [],
    nextAction: 'Contact sales for custom pricing and volume NFC orders.',
    dashboardPreview: 'Custom enterprise portal with bulk ordering, API integration, and dedicated support.',
  },
  {
    id: 'admin',
    name: 'Admin',
    price: 'Internal',
    period: '',
    icon: Shield,
    color: '#0b2149',
    status: 'internal',
    included: ['Full platform access', 'User management', 'Advanced admin dashboard', 'All plan features', 'Audit logging', 'Support tickets'],
    locked: [],
    nextAction: null,
    dashboardPreview: 'Full platform administration with user management, inventory, manufacturing, and audit controls.',
  },
];

export default function PlanJourneyPanel({ isDark, currentPlan }) {
  const [selected, setSelected] = useState(currentPlan || 'free');
  const active = PLAN_JOURNEYS.find(p => p.id === selected) || PLAN_JOURNEYS[0];

  const t = {
    card: isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200',
    text: isDark ? 'text-white' : 'text-slate-900',
    sub: isDark ? 'text-white/50' : 'text-slate-500',
    locked: isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-100',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <InfinityMark className="w-6 h-6" />
        <div>
          <h2 className={`text-xl font-black ${t.text}`}>Plan Journeys</h2>
          <p className={`text-sm ${t.sub}`}>Explore what each plan unlocks — pick your path</p>
        </div>
      </div>

      {/* Plan selector pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {PLAN_JOURNEYS.map(p => (
          <button key={p.id} onClick={() => setSelected(p.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selected === p.id ? 'text-white shadow-md' : isDark ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-500'
            }`}
            style={selected === p.id ? { background: p.color } : {}}>
            <p.icon className="w-3.5 h-3.5" />
            {p.name}
            {p.status === 'coming_soon' && <span className="text-[9px] opacity-70">Soon</span>}
          </button>
        ))}
      </div>

      {/* Active plan detail */}
      <div className={`rounded-2xl border p-5 space-y-4 ${t.card}`}>
        {/* Plan header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${active.color}15` }}>
              <active.icon className="w-6 h-6" style={{ color: active.color }} />
            </div>
            <div>
              <h3 className={`text-lg font-black ${t.text}`}>{active.name}</h3>
              <p className={`text-sm font-bold ${active.status === 'coming_soon' ? 'text-amber-500' : active.status === 'contact_sales' ? 'text-blue-500' : ''}`} style={active.status === 'active' ? { color: active.color } : {}}>
                {active.price}{active.period}
              </p>
            </div>
          </div>
          {active.status === 'coming_soon' && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Coming Soon</span>
          )}
          {active.status === 'active' && currentPlan === active.id && (
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-100 text-green-700">Your Plan</span>
          )}
        </div>

        {/* Dashboard preview */}
        <div className={`rounded-xl p-3 ${t.locked}`}>
          <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${t.sub}`}>Dashboard Preview</p>
          <p className={`text-xs ${t.sub}`}>{active.dashboardPreview}</p>
        </div>

        {/* Included tools */}
        {active.included.length > 0 && (
          <div>
            <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${t.sub}`}>Included Tools</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {active.included.map(tool => (
                <div key={tool} className="flex items-center gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span className={t.text}>{tool}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked tools */}
        {active.locked.length > 0 && (
          <div>
            <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${t.sub}`}>Locked / Not Included</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {active.locked.map(tool => (
                <div key={tool} className="flex items-center gap-2 text-xs">
                  <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className={t.sub}>{tool}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next action */}
        {active.nextAction && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
            <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: active.color }} />
            <p className={`text-xs font-semibold ${t.text}`}>{active.nextAction}</p>
          </div>
        )}
      </div>
    </div>
  );
}