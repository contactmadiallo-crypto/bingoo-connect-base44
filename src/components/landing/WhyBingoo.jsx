import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  QrCode,
  Shield,
  TrendingUp,
  Users,
  Wifi,
} from "lucide-react";

const B = {
  navy: "#0b2149",
  navyDark: "#071A3D",
  navyLight: "#13284f",
  orange: "#f97316",
  orangeLight: "#fb923c",
  gold: "#FDBA21",
  blue: "#3b82f6",
  green: "#22c55e",
  red: "#ef4444",
  slate: "#64748b",
};

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

const steps = [
  {
    n: 1,
    icon: Wifi,
    title: "Share instantly",
    text: "Tap an NFC device or scan your QR code.",
    color: B.orange,
    visual: (
      <div className="flex items-center justify-center gap-2 py-1">
        <div className="flex h-10 w-14 items-center justify-center rounded-md text-white" style={{ background: `linear-gradient(145deg, ${B.navyDark}, ${B.navyLight})` }}>
          <span className="text-[10px] font-black">∞</span>
        </div>
        <QrCode className="h-7 w-7" style={{ color: B.navy }} />
      </div>
    ),
  },
  {
    n: 2,
    icon: Briefcase,
    title: "Make the introduction",
    text: "Your professional profile opens instantly.",
    color: B.navy,
    visual: (
      <div className="flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: "#edf1f6" }}>
        <div className="flex h-7 w-7 items-center justify-center rounded-full text-[8px] font-black text-white" style={{ background: B.navy }}>JC</div>
        <div className="text-left">
          <p className="text-[9px] font-black" style={{ color: B.navy }}>Jordan Carter</p>
          <p className="text-[8px]" style={{ color: B.slate }}>Business Consultant</p>
        </div>
      </div>
    ),
  },
  {
    n: 3,
    icon: Users,
    title: "Capture the opportunity",
    text: "Turn the interaction into a lead you can manage.",
    color: B.orange,
    visual: (
      <div className="flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: "#edf1f6" }}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-orange-500"><Bell className="h-3 w-3" /></div>
        <div className="text-left">
          <p className="text-[8px] font-black" style={{ color: B.orange }}>New Lead</p>
          <p className="text-[8px]" style={{ color: B.navy }}>Jordan Carter</p>
          <p className="text-[7px]" style={{ color: B.slate }}>Source: NFC Tap</p>
        </div>
      </div>
    ),
  },
  {
    n: 4,
    icon: Bell,
    title: "Stay connected",
    text: "Organize leads and follow up from one place.",
    color: B.blue,
    visual: (
      <div className="flex flex-wrap justify-center gap-1">
        {["New", "Contacted", "Qualified"].map((s, i) => (
          <span key={s} className="rounded-full px-2 py-0.5 text-[8px] font-black text-white" style={{ background: [B.orange, B.blue, B.green][i] }}>{s}</span>
        ))}
      </div>
    ),
  },
  {
    n: 5,
    icon: Calendar,
    title: "Book the next step",
    text: "Let prospects schedule directly from your profile.",
    color: B.gold,
    visual: (
      <div className="flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: "#edf1f6" }}>
        <Calendar className="h-3.5 w-3.5" style={{ color: B.gold }} />
        <div className="text-left">
          <p className="text-[8px] font-black" style={{ color: B.navy }}>Consultation</p>
          <p className="text-[7px]" style={{ color: B.slate }}>Tuesday · 11:30 AM</p>
          <p className="text-[7px] font-black text-emerald-600">Confirmed ✓</p>
        </div>
      </div>
    ),
  },
  {
    n: 6,
    icon: BarChart3,
    title: "Understand what works",
    text: "Track profile views, NFC taps, QR scans and conversions.",
    color: B.green,
    visual: (
      <div className="grid grid-cols-2 gap-1">
        {[["Views", "1,253", B.navy], ["Taps", "486", B.orange], ["Leads", "94", B.blue], ["Conv.", "24%", B.green]].map(([l, v, c]) => (
          <div key={l} className="rounded-md border px-1.5 py-1 text-center" style={{ borderColor: "#edf1f6" }}>
            <p className="text-[10px] font-black leading-none" style={{ color: c }}>{v}</p>
            <p className="text-[7px]" style={{ color: B.slate }}>{l}</p>
          </div>
        ))}
      </div>
    ),
  },
];

const benefits = [
  {
    icon: Wifi,
    title: "Share without friction",
    desc: "No paper cards. No typing contact information. One tap or scan gives people access to your professional identity.",
    visual: (
      <div className="flex items-center justify-center gap-2">
        <div className="flex h-9 w-12 items-center justify-center rounded-md text-white" style={{ background: `linear-gradient(145deg, ${B.navyDark}, ${B.navyLight})` }}><span className="text-[9px] font-black">∞</span></div>
        <ArrowRight className="h-3 w-3 text-slate-300" />
        <div className="flex h-9 w-6 items-center justify-center rounded-md border" style={{ borderColor: "#e7ecf3" }}><div className="h-7 w-3 rounded-sm" style={{ background: B.navyLight }} /></div>
        <ArrowRight className="h-3 w-3 text-slate-300" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: `${B.orange}16`, color: B.orange }}><Briefcase className="h-4 w-4" /></div>
      </div>
    ),
  },
  {
    icon: TrendingUp,
    title: "Never lose the connection",
    desc: "Capture leads, understand where they came from and keep every professional opportunity organized.",
    visual: (
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {["New", "Contacted", "Qualified", "Customer"].map((s, i) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="rounded-full px-2 py-1 text-[8px] font-black text-white" style={{ background: [B.orange, B.blue, B.green, B.navy][i] }}>{s}</span>
            {i < 3 && <ChevronRight className="h-2.5 w-2.5 text-slate-300" />}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Turn engagement into growth",
    desc: "Bookings and analytics help you understand which interactions are creating real business opportunities.",
    visual: (
      <div className="flex h-16 items-end gap-1.5 rounded-lg border p-2" style={{ borderColor: "#edf1f6" }}>
        {[40, 65, 50, 80, 60, 90, 72].map((h, i) => (
          <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex-1 rounded-t" style={{ background: B.orange }} />
        ))}
      </div>
    ),
  },
];

export default function WhyBingoo() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Headline */}
        <motion.div {...reveal} className="mb-12 text-center md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-black text-orange-500">
            <Sparkles /> WHY BINGOO?
          </div>
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl" style={{ color: B.navy }}>
            One connection can become
            <br />
            your <span style={{ color: B.orange }}>next customer.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: B.slate }}>
            Bingoo brings your professional profile, contact sharing, lead capture, appointments and engagement tools together — so every introduction has the potential to become a real business opportunity.
          </p>
        </motion.div>

        {/* Workflow */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div className="absolute left-0 right-0 top-1/2 hidden h-px lg:block" style={{ background: `linear-gradient(90deg, transparent, ${B.orange}40, transparent)` }} />

          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 md:gap-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          >
            {steps.map((s) => (
              <motion.div
                key={s.n}
                variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}
                className="relative"
              >
                <div className="h-full overflow-hidden rounded-2xl border bg-white p-4" style={{ borderColor: "#e7ecf3", boxShadow: "0 8px 24px rgba(11,33,73,.05)" }}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${s.color}14`, color: s.color }}>
                      <s.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black" style={{ color: B.slate }}>STEP {s.n}</span>
                  </div>
                  <h3 className="mb-1 text-sm font-black" style={{ color: B.navy }}>{s.title}</h3>
                  <p className="mb-3 text-[11px] leading-snug" style={{ color: B.slate }}>{s.text}</p>
                  <div className="rounded-xl border p-2" style={{ borderColor: "#edf1f6", background: "#fbfcfe" }}>
                    {s.visual}
                  </div>
                </div>
                {/* Mobile vertical connector */}
                <div className="flex justify-center lg:hidden">
                  <div className="h-4 w-px" style={{ background: `${B.orange}40` }} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Second row — business value */}
        <motion.div {...reveal} className="mb-8 mt-16 text-center md:mt-20">
          <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: B.orange }}>
            From a simple tap to a business relationship
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.1 }}
              className="overflow-hidden rounded-3xl border bg-white p-6"
              style={{ borderColor: "#e7ecf3", boxShadow: "0 12px 40px rgba(11,33,73,.06)" }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${B.orange}14`, color: B.orange }}>
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-black" style={{ color: B.navy }}>{b.title}</h3>
              <p className="mb-4 text-sm leading-relaxed" style={{ color: B.slate }}>{b.desc}</p>
              <div className="rounded-2xl border p-3" style={{ borderColor: "#edf1f6", background: "#fbfcfe" }}>
                {b.visual}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Asset protection bridge */}
        <motion.div
          {...reveal}
          className="relative mt-12 overflow-hidden rounded-3xl p-8 md:mt-16 md:p-12"
          style={{ background: `linear-gradient(145deg, ${B.navyDark} 0%, ${B.navy} 50%, ${B.navyLight} 100%)` }}
        >
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full" style={{ background: `radial-gradient(circle, ${B.orange}22 0%, transparent 70%)` }} />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black" style={{ borderColor: "rgba(255,255,255,0.2)", color: B.gold }}>
                <Shield className="h-3.5 w-3.5" /> ASSET PROTECTION
              </div>
              <h3 className="mb-4 text-2xl font-black leading-tight text-white md:text-3xl">
                Your connections aren't the only things worth protecting.
              </h3>
              <p className="mb-6 max-w-lg text-sm leading-relaxed text-white/70">
                Attach a Bingoo NFC device to luggage, equipment, keys or other valuable assets. If something is lost, Lost Mode helps a finder safely reconnect the item with its owner.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Luggage", "Keys", "Laptop", "Camera", "Equipment"].map((t) => (
                  <span key={t} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>{t}</span>
                ))}
              </div>
              <motion.a
                href="/shop"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white"
                style={{ background: B.orange, boxShadow: `0 8px 24px ${B.orange}40` }}
              >
                Explore Asset Protection <ArrowRight className="h-4 w-4" />
              </motion.a>
            </div>

            {/* Asset flow */}
            <div className="flex flex-col gap-3">
              {[
                [Wifi, "Bingoo NFC Device", B.orange],
                [Briefcase, "Protected Asset", "#ffffff"],
                [Shield, "Lost Mode", B.gold],
                [Users, "Finder", "#ffffff"],
                [Check, "Owner Reconnected", B.green],
              ].map(([Icon, label, color], i, arr) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${color === "#ffffff" ? "rgba(255,255,255,0.1)" : color + "22"}`, color }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-white/85">{label}</span>
                  {i < arr.length - 1 && <ChevronRight className="ml-auto h-4 w-4 text-white/30" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Sparkles({ className = "" }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
    </svg>
  );
}