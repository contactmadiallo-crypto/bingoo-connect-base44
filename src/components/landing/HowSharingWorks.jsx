import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  CreditCard,
  QrCode,
  UserPlus,
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

/* Realistic 3D Bingoo NFC card with beveled edges, matte finish, reflection */
function NFC3DCard({ animate = true }) {
  return (
    <motion.div
      className="relative"
      style={{ perspective: 800 }}
      initial={animate ? { rotateY: -18, rotateX: 8, y: 0 } : false}
      animate={animate ? { y: [0, -6, 0] } : undefined}
      transition={animate ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <div
        className="relative rounded-xl"
        style={{
          width: 96,
          height: 60,
          transform: "rotateY(-16deg) rotateX(7deg)",
          transformStyle: "preserve-3d",
          background: `linear-gradient(145deg, ${B.navyDark} 0%, ${B.navy} 55%, ${B.navyLight} 100%)`,
          boxShadow: "0 18px 36px rgba(11,33,73,.45), 0 2px 4px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.12), inset 0 -1px 0 rgba(0,0,0,.4)",
        }}
      >
        {/* Beveled edge highlights */}
        <div className="pointer-events-none absolute inset-0 rounded-xl" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 rounded-t-xl" style={{ background: "linear-gradient(180deg, rgba(255,255,255,.08), transparent)" }} />

        {/* Infinity mark + label */}
        <div className="flex h-full flex-col justify-between p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/90" style={{ letterSpacing: ".05em" }}>Bing∞</span>
            <div className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.gold})` }}>
              <Wifi className="h-2 w-2 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[7px] font-bold text-white/40">CONNECT</span>
              <span className="text-[7px] font-black" style={{ color: B.gold }}>•</span>
              <span className="text-[7px] font-bold text-white/40">SHARE</span>
              <span className="text-[7px] font-black" style={{ color: B.gold }}>•</span>
              <span className="text-[7px] font-bold text-white/40">GROW</span>
            </div>
            <p className="mt-0.5 text-[6px] font-semibold text-white/30">bingoo.africa</p>
          </div>
        </div>

        {/* Subtle reflection sheen */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden"
          initial={animate ? { opacity: 0 } : false}
        >
          <motion.div
            className="absolute -inset-y-2 w-12"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent)" }}
            initial={animate ? { x: -60 } : false}
            animate={animate ? { x: 160 } : undefined}
            transition={animate ? { duration: 2.8, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" } : undefined}
          />
        </motion.div>
      </div>

      {/* Ground shadow */}
      <div className="mx-auto mt-1 h-2 w-20 rounded-full" style={{ background: "radial-gradient(circle, rgba(11,33,73,.35) 0%, transparent 70%)" }} />
    </motion.div>
  );
}

const steps = [
  {
    n: 1,
    icon: UserPlus,
    title: "Create Profile",
    text: "Create your professional profile.",
    color: B.orange,
    visual: (
      <div className="rounded-lg border p-2" style={{ borderColor: "#edf1f6" }}>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: B.navy }}><span className="text-[8px] font-black">TM</span></div>
          <div className="flex-1 text-left">
            <div className="mb-1 h-1.5 w-16 rounded-full bg-slate-200" />
            <div className="h-1 w-12 rounded-full" style={{ background: `${B.slate}40` }} />
          </div>
        </div>
        <div className="mt-1.5 flex gap-1">
          <div className="h-1 flex-1 rounded-full" style={{ background: `${B.orange}50` }} />
          <div className="h-1 flex-1 rounded-full bg-slate-100" />
          <div className="h-1 flex-1 rounded-full bg-slate-100" />
        </div>
      </div>
    ),
  },
  {
    n: 2,
    icon: CreditCard,
    title: "Activate NFC / QR",
    text: "Connect your Bingoo NFC card, keychain, bracelet, sticker or QR code.",
    color: B.navy,
    visual: (
      <div className="flex items-center justify-center gap-1.5 py-1">
        <NFC3DCard animate={false} />
        <ChevronRight className="h-3 w-3 text-slate-300" />
        <QrCode className="h-7 w-7" style={{ color: B.navy }} />
      </div>
    ),
  },
  {
    n: 3,
    icon: Wifi,
    title: "Tap or Scan",
    text: "A physical Bingoo NFC card taps a phone.",
    color: B.orange,
    visual: (
      <div className="flex items-center justify-center gap-2 py-1">
        <NFC3DCard />
        {/* NFC signal pulse */}
        <div className="relative flex items-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute left-0 rounded-full border"
              style={{ width: 8 + i * 8, height: 8 + i * 8, borderColor: `${B.orange}55` }}
              animate={{ scale: [0.6, 1.1, 0.6], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="relative z-10 flex h-3 w-3 items-center justify-center rounded-full" style={{ background: B.orange }}>
            <Wifi className="h-2 w-2 text-white" />
          </motion.div>
        </div>
        {/* Phone */}
        <div className="flex h-14 w-8 items-center justify-center rounded-md border-2" style={{ borderColor: B.navyLight, background: "#fbfcfe" }}>
          <motion.div className="h-8 w-5 rounded-sm" style={{ background: `linear-gradient(145deg, ${B.navy}, ${B.orange})` }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
        </div>
      </div>
    ),
  },
  {
    n: 4,
    icon: Briefcase,
    title: "Profile Opens",
    text: "The fictional public profile opens instantly.",
    color: B.blue,
    visual: (
      <div className="rounded-lg border p-2" style={{ borderColor: "#edf1f6" }}>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: `linear-gradient(135deg, ${B.navy}, ${B.navyLight})` }}><span className="text-[8px] font-black">TM</span></div>
          <div className="text-left">
            <p className="text-[9px] font-black" style={{ color: B.navy }}>Taylor Morgan</p>
            <p className="text-[8px]" style={{ color: B.slate }}>Business Consultant</p>
            <p className="text-[7px] font-semibold" style={{ color: B.orange }}>Morgan Advisory</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    n: 5,
    icon: Bell,
    title: "Capture Connection",
    text: "The interaction becomes a managed lead.",
    color: B.gold,
    visual: (
      <div className="rounded-lg border p-2" style={{ borderColor: "#edf1f6" }}>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-orange-500"><Bell className="h-3 w-3" /></div>
          <div className="text-left">
            <p className="text-[8px] font-black" style={{ color: B.orange }}>New Connection</p>
            <p className="text-[8px]" style={{ color: B.navy }}>Taylor Morgan</p>
            <p className="text-[7px]" style={{ color: B.slate }}>Source: NFC Tap</p>
            <p className="text-[7px] font-black text-emerald-600">Lead saved ✓</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    n: 6,
    icon: BarChart3,
    title: "Follow Up & Grow",
    text: "Track the journey from lead to customer.",
    color: B.green,
    visual: (
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-center gap-1">
          {["Lead", "Contacted", "Qualified", "Appt", "Customer"].map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <span className="rounded-full px-1.5 py-0.5 text-[7px] font-black text-white" style={{ background: [B.orange, B.blue, B.gold, B.navy, B.green][i] }}>{s}</span>
              {i < 4 && <ChevronRight className="h-2 w-2 text-slate-300" />}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {[["NFC Taps", "486"], ["QR Scans", "312"], ["Leads", "94"], ["Bookings", "37"]].map(([l, v]) => (
            <div key={l} className="rounded-md border px-1.5 py-1 text-center" style={{ borderColor: "#edf1f6" }}>
              <p className="text-[10px] font-black leading-none" style={{ color: B.navy }}>{v}</p>
              <p className="text-[7px]" style={{ color: B.slate }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const shareFormats = ["NFC Card", "Keychain", "Bracelet", "Sticker", "Desk Stand", "QR Code"];

export default function HowSharingWorks() {
  return (
    <section className="relative overflow-hidden bg-slate-50 px-4 py-16 md:px-6 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-orange-100/50 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Headline */}
        <motion.div {...reveal} className="mb-12 text-center md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5 text-sm font-black text-orange-500" style={{ boxShadow: "0 4px 14px rgba(255,127,39,.08)" }}>
            <Wifi className="h-3.5 w-3.5" /> HOW SHARING WORKS
          </div>
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl" style={{ color: B.navy }}>
            Share your business in <span style={{ color: B.orange }}>seconds.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: B.slate }}>
            Create your Bingoo profile once, then share it anywhere with NFC or QR. Every connection can become a lead, booking or future customer.
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
                    <span className="text-[10px] font-black" style={{ color: B.slate }}>{String(s.n).padStart(2, "0")}</span>
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

        {/* Share formats row */}
        <motion.div {...reveal} className="mt-14 text-center md:mt-20">
          <p className="mb-5 text-xs font-black uppercase tracking-[0.2em]" style={{ color: B.orange }}>
            Share Bingoo your way
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {shareFormats.map((f) => (
              <span key={f} className="rounded-full border bg-white px-4 py-2 text-xs font-bold" style={{ borderColor: "#e7ecf3", color: B.navy, boxShadow: "0 2px 8px rgba(11,33,73,.04)" }}>
                {f}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Closing line */}
        <motion.div {...reveal} className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-sm font-semibold italic leading-relaxed md:text-base" style={{ color: B.slate }}>
            “No app to download. No contact information to type. Just tap, connect and continue the conversation.”
          </p>
        </motion.div>
      </div>
    </section>
  );
}