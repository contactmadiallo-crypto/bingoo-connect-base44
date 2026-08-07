import { motion } from "framer-motion";
import { ChevronRight, LifeBuoy, Shield, Wifi, Wallet } from "lucide-react";
import { InfinityMark, BingooLogo as BingooWordmark } from "@/components/bingoo/ui/BingooBrand";

const B = {
  navy: "#0b2149",
  navyDark: "#071A3D",
  navyLight: "#13284f",
  orange: "#f97316",
  orangeLight: "#fb923c",
  gold: "#FDBA21",
  slate: "#64748b",
};

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

const columns = [
  {
    title: "Product",
    links: [
      { label: "Profile", href: "/" },
      { label: "NFC Sharing", href: "/#features" },
      { label: "QR Sharing", href: "/#features" },
      { label: "Lead Management", href: "/#features" },
      { label: "Appointments", href: "/#features" },
      { label: "Analytics", href: "/#features" },
      { label: "Google Wallet", href: "/#features" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Professionals", href: "/#use-cases" },
      { label: "Business Teams", href: "/#use-cases" },
      { label: "Law Firms", href: "/#use-cases" },
      { label: "Real Estate", href: "/#use-cases" },
      { label: "Creators", href: "/#use-cases" },
      { label: "Events", href: "/#use-cases" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Pricing", href: "/plans" },
      { label: "Shop", href: "/shop" },
      { label: "Contact Support", href: "/contact-support" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Data Deletion", href: "/data-deletion" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About / Home", href: "/" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const trustRow = [
  { icon: Shield, text: "No app required to receive your profile" },
  { icon: Wifi, text: "NFC + QR sharing" },
  { icon: Wallet, text: "Google Wallet support" },
  { icon: LifeBuoy, text: "Built for professionals and teams" },
];

export default function LandingFooter({ lang, toggleLang }) {
  return (
    <footer className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${B.navyDark} 0%, ${B.navy} 100%)` }}>
      {/* Subtle top border */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${B.orange}40, transparent)` }} />

      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${B.orange}10 0%, transparent 70%)` }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        {/* Brand + Columns */}
        <div className="grid gap-10 lg:grid-cols-[1.5fr_3fr]">
          {/* Brand area */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${B.orange} 0%, ${B.orangeLight} 100%)`, boxShadow: `0 4px 14px ${B.orange}55` }}>
                <InfinityMark size={18} color="#fff" strokeWidth={3.2} glow />
              </div>
              <BingooWordmark size="text-xl" light stacked={false} />
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/60">
              Smart identity, professional connections and NFC-powered sharing — all in one platform.
            </p>

            {/* Support block */}
            <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,.08)", background: "rgba(255,255,255,.03)" }}>
              <p className="mb-1 text-xs font-black uppercase tracking-wide text-white/40">Need help?</p>
              <a href="/contact-support" className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-orange-400" style={{ color: B.orangeLight }}>
                Contact Bingoo Support <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-white/80">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="text-xs text-white/50 transition-colors hover:text-orange-400">
                        {link.label}
                      </a>
                    </li>
                  ))}
                  {col.title === "Company" && (
                    <li>
                      <button onClick={toggleLang} className="text-xs font-semibold text-white/50 transition-colors hover:text-orange-400">
                        {lang === "en" ? "🇫🇷 Français" : "🇺🇸 English"}
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Trust row */}
        <motion.div {...reveal} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/5 pt-6">
          {trustRow.map((item) => (
            <div key={item.text} className="inline-flex items-center gap-1.5">
              <item.icon className="h-3.5 w-3.5" style={{ color: B.orangeLight }} />
              <span className="text-xs font-semibold text-white/50">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom legal bar */}
      <div className="border-t border-white/5 px-4 py-5 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Bingoo Connect</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <a href="/privacy" className="text-white/40 transition-colors hover:text-white/70">Privacy Policy</a>
            <a href="/terms" className="text-white/40 transition-colors hover:text-white/70">Terms of Service</a>
            <a href="/data-deletion" className="text-white/40 transition-colors hover:text-white/70">Data Deletion</a>
            <button onClick={toggleLang} className="text-white/40 transition-colors hover:text-white/70 font-semibold">
              {lang === "en" ? "🇫🇷 FR" : "🇺🇸 EN"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}