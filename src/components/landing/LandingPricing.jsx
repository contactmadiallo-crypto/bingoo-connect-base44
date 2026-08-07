import { useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Plus, Equal } from "lucide-react";
import { PLAN_CONFIG, CUSTOMER_PLAN_IDS, PLAN_FEATURES, PLAN_PRICES_USD } from "@/lib/planPermissions";

const B = {
  navy: "#0b2149",
  navyDark: "#071A3D",
  navyLight: "#13284f",
  orange: "#f97316",
  orangeLight: "#fb923c",
  gold: "#FDBA21",
  goldLight: "#FFD060",
  slate: "#64748b",
};

const plans = CUSTOMER_PLAN_IDS.map((id) => {
  const c = PLAN_CONFIG[id];
  const price = PLAN_PRICES_USD[id];
  const allFeatures = PLAN_FEATURES[id] || [];
  const features = allFeatures.slice(0, 8);
  const isContactSales = c.status === "contact_sales";
  return {
    name: c.label,
    price: isContactSales ? "Custom" : price === 0 ? "$0" : `$${price}`,
    period: isContactSales || price === 0 ? "" : "/mo",
    desc: c.tagline,
    features,
    highlight: id === "professional",
    cta: id === "free" ? "Get Started Free" : isContactSales ? "Contact Sales" : `Get ${c.label}`,
    color: c.color?.text || B.navy,
    contactSales: isContactSales,
    id,
  };
});

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

function ScrollReveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

export default function LandingPricing() {
  useLayoutEffect(() => {
    const legacyUseCasesSection = document.getElementById("use-cases");
    if (legacyUseCasesSection) legacyUseCasesSection.remove();
  }, []);

  return (
    <section id="pricing" className="py-16 md:py-24 px-4 md:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <ScrollReveal className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: B.gold + "20", color: "#b45309", border: `1px solid ${B.gold}40` }}>
            Simple Pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: B.navy }}>
            Start with the platform.
          </h2>
          <p className="text-2xl md:text-3xl font-black mb-3" style={{ color: B.orange }}>
            Add the device that fits your world.
          </p>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Your Bingoo plan powers your software and business tools. Your Bingoo NFC device is the physical hardware people tap to connect with you.
          </p>
        </ScrollReveal>

        {/* ── How it works: Plan + Device = Experience ── */}
        <ScrollReveal delay={0.1} className="mb-12">
          <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 md:gap-3 items-stretch max-w-4xl mx-auto">
            {/* Plan */}
            <div className="rounded-2xl p-6 text-center border-2 flex flex-col justify-center" style={{ borderColor: B.navy + "30", background: "#f8fafc" }}>
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: B.navy + "12" }}>
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-black text-base mb-1" style={{ color: B.navy }}>Bingoo Plan</h3>
              <p className="text-slate-500 text-sm">Your software & business tools</p>
              <p className="text-xs text-slate-400 mt-2">Profile features, leads, analytics, appointments</p>
            </div>
            {/* Plus */}
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: B.orange + "15" }}>
                <Plus className="w-5 h-5" style={{ color: B.orange }} />
              </div>
            </div>
            {/* Device */}
            <div className="rounded-2xl p-6 text-center border-2 flex flex-col justify-center" style={{ borderColor: B.orange + "30", background: "#fff7ed" }}>
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: B.orange + "12" }}>
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="font-black text-base mb-1" style={{ color: B.navy }}>Bingoo Device</h3>
              <p className="text-slate-500 text-sm">How people tap or find you</p>
              <p className="text-xs text-slate-400 mt-2">NFC cards, tags, stands, asset protection</p>
            </div>
            {/* Equals */}
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: B.gold + "15" }}>
                <Equal className="w-5 h-5" style={{ color: B.gold }} />
              </div>
            </div>
            {/* Experience */}
            <div className="rounded-2xl p-6 text-center border-2 flex flex-col justify-center" style={{ borderColor: B.gold + "40", background: `linear-gradient(135deg, ${B.navy} 0%, ${B.navyLight} 100%)` }}>
              <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.1)" }}>
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-black text-base mb-1 text-white">Complete Bingoo Experience</h3>
              <p className="text-white/60 text-sm">Smart identity, always connected</p>
            </div>
          </div>
          <p className="text-center text-slate-400 text-sm mt-4 max-w-lg mx-auto">
            NFC hardware is optional — you can also share your profile via QR code without purchasing a device.
          </p>
        </ScrollReveal>

        {/* ── Plan cards ── */}
        <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
          {plans.map((p) => (
            <motion.div key={p.name} variants={fadeUp}
              whileHover={{ y: p.highlight ? -10 : -6 }}
              className="rounded-2xl p-7 border-2 transition-all relative flex flex-col"
              style={{
                borderColor: p.highlight ? B.orange : "#e2e8f0",
                background: p.highlight ? `linear-gradient(145deg, ${B.navy}, ${B.navyLight})` : "#fff",
                boxShadow: p.highlight ? `0 24px 60px rgba(255,122,0,0.25)` : "none",
              }}>
              {p.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black"
                  style={{ background: B.orange, color: "#fff" }}>
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <p className="text-sm font-semibold mb-1" style={{ color: p.highlight ? "rgba(255,255,255,0.5)" : B.slate }}>{p.desc}</p>
                <h3 className="font-black text-xl mb-3" style={{ color: p.highlight ? "#fff" : B.navy }}>{p.name}</h3>
                <div>
                  <span className="text-4xl font-black" style={{ color: p.highlight ? B.gold : B.navy }}>{p.price}</span>
                  <span className="text-sm ml-1" style={{ color: p.highlight ? "rgba(255,255,255,0.4)" : B.slate }}>{p.period}</span>
                </div>
              </div>
              <div className="h-px my-4" style={{ background: p.highlight ? "rgba(255,255,255,0.1)" : "#f1f5f9" }} />
              <ul className="space-y-2.5 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm"
                    style={{ color: p.highlight ? "rgba(255,255,255,0.75)" : "#64748b" }}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: p.highlight ? B.gold : B.orange }} />
                    {f}
                  </li>
                ))}
              </ul>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button onClick={() => (window.location.href = p.id === "free" ? "/bingoo" : p.contactSales ? "/contact-support" : "/plans")}
                  className="w-full font-bold"
                  style={{ background: p.highlight ? B.orange : B.navy, color: "#fff", border: "none" }}>
                  {p.cta}
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Browse All Plans CTA ── */}
        <ScrollReveal delay={0.2} className="text-center mt-10">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Button size="lg" onClick={() => (window.location.href = "/plans")}
              className="font-black text-base px-10 py-6 rounded-2xl"
              style={{ background: B.navy, color: "#fff", border: "none" }}>
              Browse All Plans <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}