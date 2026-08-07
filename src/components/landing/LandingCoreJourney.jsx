import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, QrCode, ScanLine, ShieldCheck, Sparkles, Users, BarChart3, CalendarCheck2 } from "lucide-react";

const B = {
  navy: "#0b2149",
  navyDark: "#071A3D",
  orange: "#f97316",
  gold: "#FDBA21",
  slate: "#64748b",
};

const steps = [
  {
    icon: ScanLine,
    number: "01",
    title: "Tap or scan",
    text: "Use a Bingoo NFC device or QR code to start the interaction.",
  },
  {
    icon: BriefcaseBusiness,
    number: "02",
    title: "Bingoo opens",
    text: "The right experience appears instantly — profile, business flow or asset recovery.",
  },
  {
    icon: Users,
    number: "03",
    title: "The relationship continues",
    text: "Save a contact, capture a lead, book an appointment, follow up or recover an item.",
  },
];

const pillars = [
  {
    icon: QrCode,
    title: "Share",
    text: "NFC, QR and wallet-ready identity sharing.",
    accent: B.orange,
  },
  {
    icon: CalendarCheck2,
    title: "Convert",
    text: "Turn interest into contacts, leads and bookings.",
    accent: B.gold,
  },
  {
    icon: BriefcaseBusiness,
    title: "Manage",
    text: "Keep profiles, devices and relationships organized.",
    accent: B.navy,
  },
  {
    icon: BarChart3,
    title: "Measure",
    text: "Understand taps, scans, views and engagement.",
    accent: "#2563eb",
  },
];

export default function LandingCoreJourney() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-black text-orange-500">
            <Sparkles className="h-4 w-4" /> THE BINGOO CONNECTION LAYER
          </div>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl" style={{ color: B.navy }}>
            From a physical interaction to a digital relationship.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: B.slate }}>
            Bingoo connects people, businesses and physical things through one smart identity platform.
          </p>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.08 }}
              className="relative rounded-3xl border bg-white p-6 md:p-7"
              style={{ borderColor: "#e2e8f0", boxShadow: "0 12px 36px rgba(11,33,73,.06)" }}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-black tracking-[0.18em] text-slate-300">{step.number}</span>
              </div>
              <h3 className="text-xl font-black" style={{ color: B.navy }}>{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: B.slate }}>{step.text}</p>
              {index < steps.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-white p-1 text-orange-500 shadow lg:block" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-2xl border bg-[#fbfcfe] p-5"
              style={{ borderColor: "#e7ecf3" }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${pillar.accent}14`, color: pillar.accent }}>
                <pillar.icon className="h-4 w-4" />
              </div>
              <p className="font-black" style={{ color: B.navy }}>{pillar.title}</p>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: B.slate }}>{pillar.text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 rounded-3xl border bg-[#071A3D] p-6 md:grid-cols-[1.3fr_.7fr] md:items-center md:p-8" style={{ borderColor: "rgba(255,255,255,.06)" }}>
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-orange-400">
              <ShieldCheck className="h-4 w-4" /> One ecosystem, different outcomes
            </div>
            <h3 className="text-2xl font-black text-white">Profile devices connect people. Asset devices help reconnect owners with lost items.</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
              The same Bingoo platform can open a professional profile or a Lost Mode recovery experience depending on the device and context.
            </p>
          </div>
          <div className="grid gap-2 text-sm font-bold text-white/80">
            <div className="rounded-2xl bg-white/[.06] px-4 py-3">Profile → Contact → Lead → Booking</div>
            <div className="rounded-2xl bg-white/[.06] px-4 py-3">Asset → Lost Mode → Finder → Owner</div>
          </div>
        </div>
      </div>
    </section>
  );
}
