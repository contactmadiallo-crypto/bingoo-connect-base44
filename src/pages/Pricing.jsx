import { Link } from "react-router-dom";
import { Check, Zap, Building2, Gift } from "lucide-react";
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
      "5 links maximum",
      "Basic profile page",
      "QR code",
      "Total view count",
    ],
    missing: ["Full analytics", "Lead collection", "Custom colors", "Device management", "Export leads"],
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
      "1 digital profile",
      "Unlimited links",
      "Full analytics & insights",
      "Lead collection",
      "Custom colors & layouts",
      "QR code download",
      "Priority support",
    ],
    missing: ["Multiple team profiles", "NFC device management", "Export leads as CSV"],
    cta: "Start Professional",
    href: "/bingoo",
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: "$14.99",
    period: "/month",
    icon: Building2,
    color: "purple",
    features: [
      "Multiple team profiles",
      "Unlimited links",
      "Full analytics & insights",
      "Lead collection",
      "Export leads as CSV",
      "NFC device management",
      "Custom colors & layouts",
      "Priority support",
      "Dedicated account manager",
    ],
    missing: [],
    cta: "Coming Soon",
    href: "/bingoo",
    highlight: false,
    comingSoon: true,
  },
];

export default function Pricing() {
  return (
    <BingooLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-3">Simple, Transparent Pricing</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">Start free, upgrade when you're ready. No hidden fees, no surprises.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const Icon = plan.icon;
            return (
              <div key={plan.id} className={`relative bg-white rounded-3xl border-2 p-8 flex flex-col transition-all hover:shadow-xl ${plan.highlight ? "border-blue-600 shadow-xl shadow-blue-100" : "border-slate-100"}`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow">Most Popular</span>
                  </div>
                )}
                {plan.comingSoon && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-slate-400 text-white text-xs font-black px-4 py-1.5 rounded-full shadow">Coming Soon</span>
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${plan.color === "blue" ? "bg-blue-100" : plan.color === "purple" ? "bg-purple-100" : "bg-slate-100"}`}>
                  <Icon className={`w-7 h-7 ${plan.color === "blue" ? "text-blue-600" : plan.color === "purple" ? "text-purple-600" : "text-slate-600"}`} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">{plan.name}</h2>
                <div className="flex items-end gap-1 mt-2 mb-6">
                  <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 mb-1">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.color === "blue" ? "text-blue-600" : plan.color === "purple" ? "text-purple-600" : "text-slate-500"}`} />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300 line-through">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-200" />{f}
                    </li>
                  ))}
                </ul>

                {plan.comingSoon ? (
                  <Button disabled className="w-full h-12 font-bold text-base bg-slate-100 text-slate-400 cursor-not-allowed">
                    {plan.cta}
                  </Button>
                ) : (
                  <Link to={plan.href}>
                    <Button className={`w-full h-12 font-bold text-base ${plan.highlight ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200" : plan.color === "purple" ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-800"}`}>
                      {plan.cta}
                    </Button>
                  </Link>
                )}
                {plan.id !== "free" && !plan.comingSoon && (
                  <p className="text-center text-xs text-slate-400 mt-3">Payment integration coming soon — start using now free</p>
                )}
              </div>
            );
          })}
        </div>

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