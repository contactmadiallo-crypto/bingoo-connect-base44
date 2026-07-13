import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import BingooLayout from "@/components/bingoo/BingooLayout";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { PLAN_CONFIG, CUSTOMER_PLAN_IDS, PLAN_FEATURES, PLAN_PRICES_USD, CONTACT_SALES_PLANS } from "@/lib/planPermissions";

const NAVY = '#0b2149', ORANGE = '#f97316';

// Plans derived from PLAN_CONFIG — single source of truth in planPermissions.js
// No hardcoded prices, names, or features. Everything comes from PLAN_CONFIG.
const plans = CUSTOMER_PLAN_IDS.map(id => {
  const c = PLAN_CONFIG[id];
  const price = PLAN_PRICES_USD[id];
  const features = (PLAN_FEATURES[id] || []).slice(0, 10);
  const isContactSales = CONTACT_SALES_PLANS.includes(id);
  const Icon = c.icon;
  return {
    id,
    name: c.label,
    price: isContactSales ? 'Custom' : price === 0 ? '$0' : `$${price}`,
    period: isContactSales ? '' : price === 0 ? 'forever' : '/month',
    icon: Icon,
    colorText: c.color.text,
    colorBg: c.color.bg,
    features,
    cta: id === 'free' ? 'Get Started Free' : isContactSales ? 'Contact Sales' : `Start ${c.label}`,
    href: id === 'free' ? '/bingoo' : isContactSales ? '/contact-support' : `/plans?highlight=${id}`,
    highlight: id === 'professional',
    contactSales: isContactSales,
  };
});

export default function Pricing() {
  const { isDark } = useBingooTheme();

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/50" : "text-slate-500";
  const bodyText = isDark ? "text-white/70" : "text-slate-700";
  const cardBg = isDark ? "bg-white/[0.05]" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-slate-100";

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

        {/* Plans Grid — all 6 plans from PLAN_CONFIG */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {plans.map(plan => {
            const Icon = plan.icon;
            return (
              <div key={plan.id} className={`relative ${cardBg} rounded-2xl md:rounded-3xl border-2 p-5 md:p-6 flex flex-col transition-all hover:shadow-xl ${plan.highlight ? "" : cardBorder}`}
                style={plan.highlight ? { borderColor: ORANGE, boxShadow: isDark ? "0 12px 40px rgba(249,115,22,0.15)" : "0 12px 40px rgba(249,115,22,0.12)" } : {}}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg" style={{ background: ORANGE }}>Most Popular</span>
                  </div>
                )}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: plan.colorBg + "22" }}>
                  <Icon className="w-6 h-6" style={{ color: plan.colorText }} />
                </div>
                <h2 className={`text-xl font-black ${headText}`}>{plan.name}</h2>
                <div className="flex items-end gap-1 mt-2 mb-4">
                  <span className={`text-3xl font-black ${headText}`}>{plan.price}</span>
                  <span className={`mb-1 text-sm ${mutedText}`}>{plan.period}</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${bodyText}`}>
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.colorText }} />
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

        {/* View All Plans link */}
        <div className="text-center mt-8 md:mt-10">
          <Link to="/plans">
            <Button className="h-11 font-bold text-sm text-white border-none" style={{ background: NAVY }}>
              View All Plans <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Trust footer */}
        <div className="mt-10 md:mt-12 text-center rounded-2xl md:rounded-3xl p-6 md:p-8"
          style={{ background: isDark ? "rgba(11,33,73,0.3)" : "rgba(11,33,73,0.04)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(11,33,73,0.1)"}` }}>
          <h3 className={`text-lg md:text-xl font-black mb-2 ${headText}`}>Need a custom plan for your organization?</h3>
          <p className={`mb-4 ${mutedText}`}>We offer custom pricing for large teams, agencies, and enterprises.</p>
          <Link to="/contact-support">
            <Button variant="outline" className={isDark ? "border-white/15 text-white/70 hover:bg-white/8" : "border-slate-200 text-slate-700 hover:bg-slate-50"}>Contact Sales</Button>
          </Link>
        </div>
      </div>
    </BingooLayout>
  );
}