import { Link } from "react-router-dom";
import { Check, Zap, Building2, Gift, Scissors, Shield, Crown, Users, UtensilsCrossed, Calendar, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import BingooLayout from "@/components/bingoo/BingooLayout";

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
    color: "blue",
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

const colorMap = {
  slate: { bg: "bg-slate-100", text: "text-slate-600", check: "text-slate-500", border: "border-slate-100" },
  blue:  { bg: "bg-blue-100",  text: "text-blue-600",  check: "text-blue-600",  border: "border-blue-600" },
  pink:  { bg: "bg-pink-100",  text: "text-pink-600",  check: "text-pink-600",  border: "border-pink-100" },
  cyan:  { bg: "bg-cyan-100",  text: "text-cyan-600",  check: "text-cyan-600",  border: "border-cyan-100" },
};

export default function Pricing() {
  return (
    <BingooLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-3">Simple, Transparent Pricing</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Start free, upgrade when you're ready. No hidden fees, no surprises.</p>
        </div>

        {/* Active Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(plan => {
            const Icon = plan.icon;
            const c = colorMap[plan.color] || colorMap.slate;
            return (
              <div key={plan.id} className={`relative bg-white rounded-3xl border-2 p-6 flex flex-col transition-all hover:shadow-xl ${plan.highlight ? `${c.border} shadow-xl shadow-blue-100` : "border-slate-100"}`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow">Most Popular</span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${c.bg}`}>
                  <Icon className={`w-6 h-6 ${c.text}`} />
                </div>
                <h2 className="text-xl font-black text-slate-900">{plan.name}</h2>
                <div className="flex items-end gap-1 mt-2 mb-4">
                  <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 mb-1 text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.check}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to={plan.href}>
                  <Button className={`w-full h-11 font-bold text-sm ${plan.highlight ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200" : "bg-slate-100 hover:bg-slate-200 text-slate-800"}`}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Plans */}
        <div className="mt-12">
          <div className="text-center mb-6">
            <h3 className="text-xl font-black text-slate-900 mb-1">More Plans Coming Soon</h3>
            <p className="text-slate-500 text-sm">We're building specialized plans for more industries.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {comingSoonPlans.map(p => {
              const Icon = p.icon;
              return (
                <div key={p.name} className="bg-white rounded-2xl border-2 border-slate-100 p-4 flex flex-col items-center text-center relative">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-black text-white bg-slate-400">Soon</div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="font-bold text-sm text-slate-700">{p.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.price}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{p.tagline}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-12 text-center bg-blue-50 rounded-3xl p-8">
          <h3 className="text-xl font-black text-slate-900 mb-2">Need a custom plan for your organization?</h3>
          <p className="text-slate-500 mb-4">We offer custom pricing for large teams, agencies, and enterprises.</p>
          <a href="mailto:hello@bingooconnect.com">
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-100">Contact Sales</Button>
          </a>
        </div>
      </div>
    </BingooLayout>
  );
}