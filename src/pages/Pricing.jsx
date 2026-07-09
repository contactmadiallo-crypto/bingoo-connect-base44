import { Link } from "react-router-dom";
import { Check, Zap, Building2, Gift, Scissors, Shield, Crown, Users, UtensilsCrossed, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import BingooLayout from "@/components/bingoo/BingooLayout";
import { useBingooTheme } from "@/hooks/useBingooTheme";

const NAVY = '#0b2149', ORANGE = '#f97316';

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Gift,
    color: "slate",
    features: [
      "1 digital profile",
      "Public profile link",
      "Basic contact sharing",
      "Social links",
      "QR code",
      "WhatsApp button",
    ],
    cta: "Get Started Free",
    href: "/bingoo",
    highlight: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: "$4.99",
    period: "/month",
    icon: Zap,
    color: "orange",
    features: [
      "Everything in Free",
      "NFC device management",
      "Lead collection",
      "Analytics dashboard",
      "Portfolio & gallery",
      "Custom branding & layouts",
      "QR code download",
      "Appointment booking",
      "Lost Mode for NFC",
      "Instagram integration",
      "Calendar view",
      "Google & Apple Wallet passes",
    ],
    cta: "Start Professional",
    href: "/plans?highlight=professional",
    highlight: true,
  },
  {
    id: "salon",
    name: "Salon",
    price: "$19.99",
    period: "/month",
    icon: Scissors,
    color: "pink",
    features: [
      "Everything in Professional",
      "Salon business profile",
      "Staff profiles",
      "Services menu",
      "Instagram gallery",
      "Google reviews",
      "WhatsApp booking",
      "Business hours",
      "Advanced analytics",
      "Lead export",
    ],
    cta: "Start Salon",
    href: "/plans?highlight=salon",
    highlight: false,
  },
  {
    id: "lawfirm",
    name: "Law Firm",
    price: "$49",
    period: "/month",
    icon: Shield,
    color: "cyan",
    features: [
      "Everything in Professional",
      "Law firm profile",
      "Practice areas",
      "Attorney profiles",
      "Legal services",
      "Office locations",
      "Lead intake forms",
      "CRM pipeline",
      "Case dashboard",
      "Advanced analytics",
      "Lead export",
    ],
    cta: "Start Law Firm",
    href: "/plans?highlight=lawfirm",
    highlight: false,
  },
];

const comingSoonPlans = [
  { name: "Business", price: "$14.99/mo", tagline: "Small business essentials", icon: Building2 },
  { name: "Restaurant", price: "$29.99/mo", tagline: "Digital menus & reservations", icon: UtensilsCrossed },
  { name: "Corporate", price: "$99/mo", tagline: "Enterprise & attendance", icon: Crown },
  { name: "NGO", price: "TBD", tagline: "Non-profit organizations", icon: Users },
  { name: "Event Planner", price: "TBD", tagline: "Event management", icon: Calendar },
  { name: "Bulk / Enterprise", price: "Custom", tagline: "Large volume & custom", icon: Building2 },
];

export default function Pricing() {
  const { isDark } = useBingooTheme();

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/50" : "text-slate-500";
  const bodyText = isDark ? "text-white/70" : "text-slate-700";
  const cardBg = isDark ? "bg-white/[0.05]" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-slate-100";

  const colorMap = {
    slate:   { bg: isDark ? "bg-white/8" : "bg-slate-100",  text: isDark ? "text-white/60" : "text-slate-600", check: isDark ? "text-white/40" : "text-slate-500" },
    orange:  { bg: isDark ? "bg-orange-500/15" : "bg-orange-100", text: isDark ? "text-orange-400" : "text-orange-600", check: isDark ? "text-orange-400" : "text-orange-600" },
    pink:    { bg: isDark ? "bg-pink-500/15" : "bg-pink-100",  text: isDark ? "text-pink-400" : "text-pink-600",  check: isDark ? "text-pink-400" : "text-pink-600" },
    cyan:    { bg: isDark ? "bg-cyan-500/15" : "bg-cyan-100",  text: isDark ? "text-cyan-400" : "text-cyan-600",  check: isDark ? "text-cyan-400" : "text-cyan-600" },
  };

  return (
    <BingooLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.08)", color: ORANGE, border: `1px solid ${isDark ? "rgba(249,115,22,0.25)" : "rgba(249,115,22,0.2)"}` }}>
            Simple Pricing
          </div>
          <h1 className={`text-3xl md:text-4xl font-black mb-3 ${headText}`}>Plans for every professional</h1>
          <p className={`text-base md:text-lg max-w-xl mx-auto ${mutedText}`}>Start free, upgrade when you're ready. No hidden fees, no surprises.</p>
        </div>

        {/* Active Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {plans.map(plan => {
            const Icon = plan.icon;
            const c = colorMap[plan.color] || colorMap.slate;
            return (
              <div key={plan.id} className={`relative ${cardBg} rounded-2xl md:rounded-3xl border-2 p-5 md:p-6 flex flex-col transition-all hover:shadow-xl ${plan.highlight ? "" : cardBorder}`}
                style={plan.highlight ? { borderColor: ORANGE, boxShadow: isDark ? "0 12px 40px rgba(249,115,22,0.15)" : "0 12px 40px rgba(249,115,22,0.12)" } : {}}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg" style={{ background: ORANGE }}>Most Popular</span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${c.bg}`}>
                  <Icon className={`w-6 h-6 ${c.text}`} />
                </div>
                <h2 className={`text-xl font-black ${headText}`}>{plan.name}</h2>
                <div className="flex items-end gap-1 mt-2 mb-4">
                  <span className={`text-3xl font-black ${headText}`}>{plan.price}</span>
                  <span className={`mb-1 text-sm ${mutedText}`}>{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${bodyText}`}>
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.check}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to={plan.href}>
                  <Button className={`w-full h-11 font-bold text-sm ${plan.highlight ? "text-white border-none" : isDark ? "bg-white/8 hover:bg-white/12 text-white border border-white/10" : "bg-slate-100 hover:bg-slate-200 text-slate-800"}`}
                    style={plan.highlight ? { background: ORANGE } : {}}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Plans */}
        <div className="mt-10 md:mt-12">
          <div className="text-center mb-6">
            <h3 className={`text-lg md:text-xl font-black mb-1 ${headText}`}>More Plans Coming Soon</h3>
            <p className={`text-sm ${mutedText}`}>We're building specialized plans for more industries.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {comingSoonPlans.map(p => {
              const Icon = p.icon;
              return (
                <div key={p.name} className={`${cardBg} rounded-2xl border-2 ${cardBorder} p-3 md:p-4 flex flex-col items-center text-center relative`}>
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black text-white" style={{ background: "#94a3b8" }}>Soon</div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${isDark ? "bg-white/8" : "bg-slate-100"}`}>
                    <Icon className={`w-5 h-5 ${isDark ? "text-white/30" : "text-slate-400"}`} />
                  </div>
                  <p className={`font-bold text-sm ${headText}`}>{p.name}</p>
                  <p className={`text-xs mt-0.5 ${mutedText}`}>{p.price}</p>
                  <p className={`text-[10px] mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>{p.tagline}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-10 md:mt-12 text-center rounded-2xl md:rounded-3xl p-6 md:p-8"
          style={{ background: isDark ? "rgba(11,33,73,0.3)" : "rgba(11,33,73,0.04)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(11,33,73,0.1)"}` }}>
          <h3 className={`text-lg md:text-xl font-black mb-2 ${headText}`}>Need a custom plan for your organization?</h3>
          <p className={`mb-4 ${mutedText}`}>We offer custom pricing for large teams, agencies, and enterprises.</p>
          <a href="mailto:hello@bingooconnect.com">
            <Button variant="outline" className={isDark ? "border-white/15 text-white/70 hover:bg-white/8" : "border-slate-200 text-slate-700 hover:bg-slate-50"}>Contact Sales</Button>
          </a>
        </div>
      </div>
    </BingooLayout>
  );
}