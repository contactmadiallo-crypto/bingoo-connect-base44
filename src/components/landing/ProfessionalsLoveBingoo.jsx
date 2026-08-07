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
  { icon: Briefcase, label: "Consultants", color: B.orange },
  { icon: Scale, label: "Lawyers", color: B.navy },
  { icon: HeartPulse, label: "Health pros", color: "#ef4444" },
  { icon: Store, label: "Retailers", color: B.orange },
  { icon: GraduationCap, label: "Educators", color: B.blue },
  { icon: Home, label: "Realtors", color: B.navy },
  { icon: Calendar, label: "Stylists", color: B.orange },
  { icon: Building2, label: "Agencies", color: B.blue },
  { icon: ShoppingBag, label: "Creators", color: B.orange },
  { icon: Users, label: "Networkers", color: B.navy },
  { icon: Award, label: "Coaches", color: B.blue },
  { icon: Sparkles, label: "Founders", color: B.orange },
];

export default function ProfessionalsLoveBingoo() {
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
            <Sparkles className="h-4 w-4" /> BUILT FOR PEOPLE WHO CONNECT
          </div>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl" style={{ color: B.navy }}>
            Professionals love Bingoo.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: B.slate }}>
            One identity that adapts to every profession. Share, capture and follow up from a single smart profile.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {professionals.map((p, i) => (
            <motion.div
              key={p.label}
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
              <p className="text-sm font-black" style={{ color: B.navy }}>{p.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}