import { motion } from "framer-motion";
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  GraduationCap,
  HeartPulse,
  Home,
  Scale,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const B = {
  navy: "#0b2149",
  orange: "#f97316",
  blue: "#3b82f6",
  slate: "#64748b",
};

const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

const professionals = [
  { icon: Briefcase, key: "landing_prof_consultants", color: B.orange },
  { icon: Scale, key: "landing_prof_lawyers", color: B.navy },
  { icon: HeartPulse, key: "landing_prof_health", color: "#ef4444" },
  { icon: Store, key: "landing_prof_retailers", color: B.orange },
  { icon: GraduationCap, key: "landing_prof_educators", color: B.blue },
  { icon: Home, key: "landing_prof_realtors", color: B.navy },
  { icon: Calendar, key: "landing_prof_stylists", color: B.orange },
  { icon: Building2, key: "landing_prof_agencies", color: B.blue },
  { icon: ShoppingBag, key: "landing_prof_creators", color: B.orange },
  { icon: Users, key: "landing_prof_networkers", color: B.navy },
  { icon: Award, key: "landing_prof_coaches", color: B.blue },
  { icon: Sparkles, key: "landing_prof_founders", color: B.orange },
];

export default function ProfessionalsLoveBingoo() {
  const { language } = useI18n();
  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          {...reveal}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-black text-orange-500">
            <Sparkles className="h-4 w-4" /> {t("landing_built_for_connectors",language)}
          </div>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl" style={{ color: B.navy }}>
            {t("landing_professionals_love",language)}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: B.slate }}>
            {t("landing_professionals_copy",language)}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {professionals.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border bg-[#fbfcfe] p-5 text-center"
              style={{ borderColor: "#e7ecf3" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: `${p.color}14`, color: p.color }}
              >
                <p.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-black" style={{ color: B.navy }}>{t(p.key,language)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}