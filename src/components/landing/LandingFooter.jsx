import { motion } from "framer-motion";
import { ChevronRight, LifeBuoy, Shield, Wifi, Wallet } from "lucide-react";
import { InfinityMark, BingooLogo as BingooWordmark } from "@/components/bingoo/ui/BingooBrand";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

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
  { titleKey: "footer_product", links: [
    { key: "footer_profile", href: "/" }, { key: "footer_nfc_sharing", href: "/#features" },
    { key: "footer_qr_sharing", href: "/#features" }, { key: "footer_leads", href: "/#features" },
    { key: "footer_appointments", href: "/#features" }, { key: "footer_analytics", href: "/#features" },
    { key: "footer_wallet", href: "/#features" },
  ]},
  { titleKey: "footer_solutions", links: [
    { key: "footer_professionals", href: "/#use-cases" }, { key: "footer_business_teams", href: "/#use-cases" },
    { key: "footer_law_firms", href: "/#use-cases" }, { key: "footer_real_estate", href: "/#use-cases" },
    { key: "footer_creators", href: "/#use-cases" }, { key: "footer_events", href: "/#use-cases" },
  ]},
  { titleKey: "footer_resources", links: [
    { key: "footer_pricing", href: "/plans" }, { key: "footer_shop", href: "/shop" },
    { key: "footer_contact_support_link", href: "/contact-support" }, { key: "footer_privacy", href: "/privacy" },
    { key: "footer_terms", href: "/terms" }, { key: "footer_data_deletion", href: "/data-deletion" },
  ]},
  { titleKey: "footer_company", links: [
    { key: "footer_about_home", href: "/" }, { key: "footer_contact", href: "/contact" },
  ]},
];

const trustRow = [
  { icon: Shield, key: "footer_no_app" }, { icon: Wifi, key: "footer_nfc_qr" },
  { icon: Wallet, key: "footer_wallet_support" }, { icon: LifeBuoy, key: "footer_for_pros" },
];

export default function LandingFooter() {
  const { language, setLanguage } = useI18n();
  const toggleLang = () => setLanguage(language === "en" ? "fr" : "en");
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
              {t("footer_brand_copy",language)}
            </p>

            {/* Support block */}
            <div className="mt-6 rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,.08)", background: "rgba(255,255,255,.03)" }}>
              <p className="mb-1 text-xs font-black uppercase tracking-wide text-white/40">{t("footer_need_help",language)}</p>
              <a href="/contact-support" className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors hover:text-orange-400" style={{ color: B.orangeLight }}>
                {t("footer_contact_support",language)} <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {columns.map((col) => (
              <div key={col.titleKey}>
                <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-white/80">{t(col.titleKey,language)}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.key}>
                      <a href={link.href} className="text-xs text-white/50 transition-colors hover:text-orange-400">
                        {t(link.key,language)}
                      </a>
                    </li>
                  ))}
                  {col.titleKey === "footer_company" && (
                    <li>
                      <button onClick={toggleLang} className="text-xs font-semibold text-white/50 transition-colors hover:text-orange-400">
                        {language === "en" ? "🇫🇷 Français" : "🇺🇸 English"}
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
            <div key={item.key} className="inline-flex items-center gap-1.5">
              <item.icon className="h-3.5 w-3.5" style={{ color: B.orangeLight }} />
              <span className="text-xs font-semibold text-white/50">{t(item.key,language)}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom legal bar */}
      <div className="border-t border-white/5 px-4 py-5 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} Bingoo Connect</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <a href="/privacy" className="text-white/40 transition-colors hover:text-white/70">{t("footer_privacy",language)}</a>
            <a href="/terms" className="text-white/40 transition-colors hover:text-white/70">{t("footer_terms",language)}</a>
            <a href="/data-deletion" className="text-white/40 transition-colors hover:text-white/70">{t("footer_data_deletion",language)}</a>
            <button onClick={toggleLang} className="text-white/40 transition-colors hover:text-white/70 font-semibold">
              {language === "en" ? "🇫🇷 FR" : "🇺🇸 EN"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}