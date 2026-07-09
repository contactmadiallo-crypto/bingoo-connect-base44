import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Rocket, Globe2, Wallet, Languages, Sparkles, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandIcon3D from "@/components/landing/BrandIcon3D";

const B = {
  navy: "#0b2149",
  navyDark: "#071A3D",
  navyLight: "#13284f",
  orange: "#f97316",
  gold: "#FDBA21",
  slate: "#64748b"
};

const nowLive = [
  "NFC cards, keychains, bracelets, stickers and desk stands",
  "Public digital profiles with custom branding and layouts",
  "Lead capture CRM with source tracking and pipeline statuses",
  "Appointment booking from any public profile",
  "Real-time analytics (views, taps, scans, link clicks)",
  "QR code sharing with custom colors and watermark",
  "Lost item mode with finder reporting",
  "Google Wallet pass generation",
  "Multi-language profiles (English / French)"
];

const comingNext = [
  { icon: <Wallet className="w-4 h-4" />, label: "Apple Wallet passes", detail: "iPhone owners carry their Bingoo pass in Apple Wallet" },
  { icon: <Languages className="w-4 h-4" />, label: "More languages", detail: "Arabic, Spanish and auto visitor-language detection" },
  { icon: <Sparkles className="w-4 h-4" />, label: "Restaurant menu builder", detail: "QR menus, table-side ordering and reservations" },
  { icon: <MapPin className="w-4 h-4" />, label: "Real estate listings", detail: "Property galleries and per-listing QR codes" },
  { icon: <ShieldCheck className="w-4 h-4" />, label: "Verified credentials", detail: "Professionals can verify bar IDs, licenses and certifications" },
  { icon: <Rocket className="w-4 h-4" />, label: "Corporate attendance v2", detail: "Geofenced clock-in, team scheduling and analytics" }
];

const futureVision = [
  "An AI lead assistant that drafts follow-ups and qualifies inquiries automatically",
  "Tap-to-pay at the moment of sharing — turn a profile view into a payment instantly",
  "Smart networking rooms where tapping two Bingoo devices connects both owners",
  "Pan-African and global expansion with localized payments, languages and compliance",
  "Verified digital identity for professionals across every industry Bingoo serves"
];

function ScrollReveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

export default function ProjectFutureSection() {
  return (
    <section id="project" className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${B.navyDark} 0%, ${B.navy} 50%, #0f3d8c 100%)` }}>
      {/* Soft ambient orbs */}
      <div className="absolute -top-20 -left-10 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${B.orange}22 0%, transparent 70%)` }} />
      <div className="absolute -bottom-20 -right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${B.gold}1a 0%, transparent 70%)` }} />

      <div className="max-w-6xl mx-auto relative">
        <ScrollReveal className="text-center mb-12">
          <Link to="/" className="flex justify-center mb-6 cursor-pointer" aria-label="Bingoo Connect home">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <BrandIcon3D size={130} />
            </motion.div>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: "rgba(253,186,33,0.15)", border: "1px solid rgba(253,186,33,0.35)", color: B.gold }}>
            <Rocket className="w-4 h-4" /> The project & the future
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">
            Building the world's NFC-powered identity platform
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Bingoo Connect started as a smarter business card. It's becoming the connective tissue between professionals, businesses and the people they meet — one tap at a time.
          </p>
        </ScrollReveal>

        {/* Mission */}
        <ScrollReveal delay={0.1} className="rounded-3xl p-7 md:p-9 mb-10"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <h3 className="font-black text-xl mb-3" style={{ color: B.gold }}>Our mission</h3>
          <p className="text-white/75 leading-relaxed">
            Give every professional and business a single, always-current digital identity they can share with one tap — and turn every meeting, scan and visit into a measurable connection. From the lawyer in Dakar to the salon in New York, Bingoo makes professional presence instant, portable and private.
          </p>
        </ScrollReveal>

        {/* Live now */}
        <ScrollReveal delay={0.15} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <h3 className="font-black text-xl text-white">Live today</h3>
            <span className="text-white/40 text-sm">— what you can use right now</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nowLive.map((item) => (
              <div key={item} className="flex items-start gap-2.5 rounded-xl p-4"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                <span className="text-sm text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Coming next */}
        <ScrollReveal delay={0.2} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: B.gold }} />
            <h3 className="font-black text-xl text-white">Coming next</h3>
            <span className="text-white/40 text-sm">— on the near-term roadmap</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comingNext.map((c) => (
              <motion.div
                key={c.label}
                whileHover={{ y: -4 }}
                className="rounded-2xl p-5"
                style={{ background: "rgba(253,186,33,0.08)", border: `1px solid ${B.gold}33` }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: B.gold + "22", color: B.gold }}>
                    {c.icon}
                  </div>
                  <p className="font-bold text-sm text-white">{c.label}</p>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{c.detail}</p>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Future vision */}
        <ScrollReveal delay={0.25} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <Globe2 className="w-5 h-5" style={{ color: B.orange }} />
            <h3 className="font-black text-xl text-white">Future vision</h3>
            <span className="text-white/40 text-sm">— where Bingoo is heading</span>
          </div>
          <div className="rounded-3xl p-7 md:p-8"
            style={{ background: `linear-gradient(135deg, ${B.orange}18 0%, ${B.navyLight}22 100%)`, border: "1px solid rgba(255,255,255,0.12)" }}>
            <ul className="space-y-4">
              {futureVision.map((v, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black"
                    style={{ background: B.orange, color: "#fff" }}>
                    {i + 1}
                  </span>
                  <span className="text-white/80 leading-relaxed pt-0.5">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.3} className="text-center">
          <p className="text-white/70 text-lg mb-6 max-w-xl mx-auto">
            Be part of the journey from a business card to a global professional identity.
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Button size="lg" onClick={() => window.location.href = '/bingoo'}
              className="font-black text-base px-10 py-6 rounded-2xl shadow-2xl"
              style={{ background: B.orange, color: "#fff", border: "none" }}>
              Create your profile free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}