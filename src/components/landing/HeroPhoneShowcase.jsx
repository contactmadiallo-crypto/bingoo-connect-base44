import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Calendar,
  Check,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  ShieldCheck,
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
};

function PhoneFrame({ children, glow = false, label }) {
  return (
    <div className="relative">
      {glow && (
        <div
          className="pointer-events-none absolute -inset-12 -z-10 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,.4), transparent 68%)" }}
        />
      )}

      {label && (
        <div className="absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-[#071A3D]/90 px-3 py-1 text-[9px] font-black tracking-[.12em] text-white shadow-lg backdrop-blur-xl">
          {label}
        </div>
      )}

      <div
        className="relative rounded-[2.15rem] bg-[#090909] p-[4px]"
        style={{
          boxShadow:
            "0 38px 80px rgba(0,0,0,.58), 0 0 0 1px rgba(255,255,255,.1), inset 0 1px 0 rgba(255,255,255,.12)",
        }}
      >
        <div className="absolute -left-[3px] top-14 h-7 w-[3px] rounded-l bg-[#242424]" />
        <div className="absolute -left-[3px] top-24 h-10 w-[3px] rounded-l bg-[#242424]" />
        <div className="absolute -right-[3px] top-20 h-12 w-[3px] rounded-r bg-[#242424]" />

        <div className="w-[188px] overflow-hidden rounded-[1.82rem] bg-white">
          <div className="flex items-center justify-between bg-[#090909] px-3.5 pb-1 pt-1.5">
            <span className="text-[7px] font-bold text-white">9:41</span>
            <div className="h-3.5 w-12 rounded-full border border-[#252525] bg-black" />
            <span className="text-[7px] font-bold text-white">●●●</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function SampleProfileScreen() {
  return (
    <div className="min-h-[270px] bg-[#f7f9fc]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#071A3D] via-[#0b2149] to-[#17428c] px-3 pb-3 pt-3 text-center">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
        <span className="relative mb-2 inline-flex rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[6px] font-black tracking-[.13em] text-white/70">
          FICTIONAL DEMO PROFILE
        </span>
        <div className="relative mx-auto mb-1.5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/50 bg-gradient-to-br from-orange-500 to-amber-300 text-[12px] font-black text-white shadow-lg">
          JR
        </div>
        <p className="relative text-[11px] font-black text-white">Jordan Reed</p>
        <p className="relative text-[7px] text-white/60">Creative Director · Northstar Studio</p>
        <div className="relative mt-2 flex justify-center gap-1.5">
          {[Phone, Mail, MessageCircle, Globe2].map((Icon, index) => (
            <div key={index} className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white">
              <Icon className="h-3 w-3" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 px-3 py-2.5">
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5">
            <BriefcaseBusiness className="h-3 w-3 text-orange-500" />
            <span className="text-[8px] font-black text-slate-800">About</span>
          </div>
          <p className="text-[7px] leading-relaxed text-slate-500">
            Helping brands turn ideas into memorable digital experiences.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button className="rounded-lg bg-orange-500 py-2 text-[8px] font-black text-white">Book a Call</button>
          <button className="rounded-lg border border-slate-200 bg-white py-2 text-[8px] font-black text-[#0b2149]">Save Contact</button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2 py-1.5">
          <span className="text-[7px] font-bold text-slate-500">Recent connections</span>
          <span className="text-[8px] font-black text-[#0b2149]">128</span>
        </div>
      </div>
    </div>
  );
}

function LostModeScreen() {
  return (
    <div className="min-h-[270px] bg-white">
      <div className="px-3.5 pb-3 pt-3 text-center" style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})` }}>
        <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-[8px] font-black tracking-widest text-white">
          <Bell className="h-2.5 w-2.5" /> LOST MODE
        </div>
        <p className="text-[11px] font-black leading-tight text-white">This item is reported lost</p>
        <p className="mt-0.5 text-[8px] text-white/80">If found, please help return it</p>
      </div>

      <div className="px-3 pt-2.5">
        <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 p-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b2149] text-base">🧳</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-black text-slate-800">Travel Suitcase</p>
            <p className="text-[7px] text-slate-400">BG-DEMO-104 · Active</p>
          </div>
        </div>
      </div>

      <div className="px-3 pt-2">
        <p className="mb-1 text-[7px] font-bold uppercase tracking-wide text-slate-500">Owner message</p>
        <div className="rounded-lg bg-slate-100 p-2">
          <p className="text-[8px] leading-snug text-slate-600">Thank you for finding this item. Please use the secure options below to contact its owner.</p>
        </div>
      </div>

      <div className="px-3 pt-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[8px] font-black text-emerald-700">
          <ShieldCheck className="h-2.5 w-2.5" /> Owner privacy protected
        </span>
      </div>

      <div className="space-y-1.5 px-3 pb-3 pt-2.5">
        <button className="flex w-full items-center justify-center gap-1 rounded-lg bg-orange-500 py-2 text-[9px] font-black text-white">
          <Phone className="h-3 w-3" /> Contact Owner
        </button>
        <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-[9px] font-black text-[#0b2149]">
          <MapPin className="h-3 w-3" /> Report Found
        </button>
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  const bars = [40, 66, 50, 82, 61, 96, 72];
  const sources = [
    [Wifi, "NFC Taps", "412", B.orange],
    [QrCode, "QR Scans", "287", B.gold],
    [Users, "New Leads", "86", "#60a5fa"],
  ];

  return (
    <div className="min-h-[270px]" style={{ background: `linear-gradient(160deg, ${B.navyLight}, ${B.navyDark})` }}>
      <div className="flex items-start justify-between px-3 pb-2 pt-3">
        <div>
          <p className="text-[10px] font-black text-white">Engagement</p>
          <p className="text-[7px] text-white/40">Last 7 days</p>
        </div>
        <div className="rounded-lg bg-emerald-500/15 px-1.5 py-1 text-[7px] font-black text-emerald-300">+24%</div>
      </div>

      <div className="px-3 pt-1">
        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[7px] font-bold text-white/50">Interactions</span>
            <span className="text-[9px] font-black text-white">785</span>
          </div>
          <div className="flex h-14 items-end justify-between gap-1">
            {bars.map((height, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                whileInView={{ height: `${height}%` }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className="flex-1 rounded-t"
                style={{ background: index === 5 ? `linear-gradient(${B.orange}, ${B.orangeLight})` : `linear-gradient(${B.gold}aa, ${B.gold}44)` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1 px-3 pt-2">
        {sources.map(([Icon, label, value, accent]) => (
          <div key={label} className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[.03] px-2 py-1.5">
            <div className="flex h-4 w-4 items-center justify-center rounded" style={{ background: `${accent}22`, color: accent }}>
              <Icon className="h-2.5 w-2.5" />
            </div>
            <span className="flex-1 text-[8px] font-semibold text-white/60">{label}</span>
            <span className="text-[8px] font-black text-white">{value}</span>
          </div>
        ))}
      </div>

      <div className="px-3 pb-3 pt-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white"><QrCode className="h-5 w-5 text-[#0b2149]" /></div>
          <div className="flex-1">
            <p className="text-[8px] font-black text-white">Campaign QR</p>
            <p className="text-[7px] text-white/40">287 scans</p>
          </div>
          <BarChart3 className="h-4 w-4 text-orange-400" />
        </div>
      </div>
    </div>
  );
}

// ── Subtle world-map / network background ──────────────────────────────────
// Scattered nodes connected by thin lines — very low opacity so it never
// reduces readability of the phones and copy in front.
function WorldMapNetwork() {
  const nodes = [
    [8, 30], [16, 60], [24, 25], [33, 70], [40, 40], [50, 18],
    [58, 55], [66, 28], [74, 68], [82, 38], [90, 25], [95, 60],
    [20, 80], [45, 82], [70, 80], [88, 75],
  ];
  const links = [
    [0, 1], [0, 2], [2, 4], [1, 3], [4, 5], [5, 6], [6, 7],
    [7, 9], [9, 10], [3, 8], [8, 11], [10, 11], [6, 14], [12, 13], [13, 14], [14, 15],
  ];
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.5 }}>
      {links.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="#f97316" strokeWidth="0.15" strokeOpacity="0.18"
          animate={{ strokeOpacity: [0.06, 0.22, 0.06] }}
          transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
        />
      ))}
      {nodes.map(([cx, cy], i) => (
        <motion.circle
          key={i} cx={cx} cy={cy} r="0.4" fill="#fb923c"
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
    </svg>
  );
}

// ── Animated connection lines between NFC card (bottom) and phones ─────────
// Dashed lines that "flow" upward, suggesting data travelling from the
// physical NFC card into the digital profile screens.
function NfcConnectionLines() {
  // NFC card sits at bottom-center (~50%, 88%). Phones are spread across top.
  const endpoints = [
    { x: 22, y: 42, color: B.orange },   // left phone
    { x: 50, y: 30, color: B.gold },     // center phone
    { x: 78, y: 42, color: "#60a5fa" },  // right phone
  ];
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        {endpoints.map((e, i) => (
          <linearGradient key={i} id={`flow-${i}`} x1="50%" y1="100%" x2={`${e.x}%`} y2={`${e.y}%`}>
            <stop offset="0%" stopColor={e.color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={e.color} stopOpacity="0.05" />
          </linearGradient>
        ))}
      </defs>
      {endpoints.map((e, i) => (
        <motion.line
          key={i}
          x1="50" y1="88" x2={e.x} y2={e.y}
          stroke={`url(#flow-${i})`} strokeWidth="0.4" strokeDasharray="2 3"
          animate={{ strokeDashoffset: [10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
        />
      ))}
    </svg>
  );
}

// ── NFC Tap animation — positioned beneath the phones, taps upward ─────────
function OneTapAnimation() {
  return (
    <div className="pointer-events-none absolute bottom-0 left-1/2 z-30 hidden -translate-x-1/2 md:block">
      {/* Ripple rings emanating upward toward center phone */}
      {[0, 1, 2].map((ring) => (
        <motion.span
          key={ring}
          className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-400"
          animate={{ scale: [0.4, 1.6], opacity: [0, 0.7, 0], y: [0, -20, -40] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: ring * 0.5 }}
        />
      ))}

      <motion.div
        animate={{ y: [0, -14, -14, 0], rotate: [-4, 0, 0, -4] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.6, 1] }}
        className="relative h-14 w-20 rounded-xl border border-white/20 bg-gradient-to-br from-white to-slate-100 p-1.5 shadow-2xl"
      >
        <div className="flex h-full items-center gap-1.5 rounded-lg bg-[#0b2149] px-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500 text-white">
            <Wifi className="h-3.5 w-3.5 rotate-90" />
          </div>
          <div>
            <p className="text-[7px] font-black text-white">Bingoo NFC</p>
            <p className="text-[6px] text-white/50">Tap to share</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-300/25 bg-emerald-500/15 px-3 py-1 text-[8px] font-black text-emerald-200 backdrop-blur-xl"
        animate={{ opacity: [0, 0, 1, 1, 0], y: [4, 4, 0, 0, -3] }}
        transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.35, 0.5, 0.75, 1] }}
      >
        <span className="inline-flex items-center gap-1">
          <Check className="h-2.5 w-2.5" /> Profile opened instantly
        </span>
      </motion.div>
    </div>
  );
}

export default function HeroPhoneShowcase() {
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-[650px] overflow-visible" style={{ perspective: "1200px" }}>
      {/* Soft orange glow behind center phone */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-80 w-80 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(249,115,22,.27), transparent 68%)" }} />
      </div>

      {/* Subtle world-map / network background */}
      <WorldMapNetwork />

      {/* Animated connection lines: NFC card → phones */}
      <NfcConnectionLines />

      {/* LEFT phone — Dashboard / fictional professional profile */}
      <div className="absolute left-1/2 top-20 z-10 hidden -translate-x-[126%] -rotate-[10deg] scale-[.82] md:block">
        <motion.div initial={{ opacity: 0, x: -45 }} animate={{ opacity: .88, x: 0 }} transition={{ duration: .8, delay: .2 }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5.7, repeat: Infinity, ease: "easeInOut" }}>
            <PhoneFrame label="ONE-TAP PROFILE"><SampleProfileScreen /></PhoneFrame>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT phone — Analytics & Dashboard */}
      <div className="absolute left-1/2 top-20 z-10 hidden translate-x-[26%] rotate-[10deg] scale-[.82] md:block">
        <motion.div initial={{ opacity: 0, x: 45 }} animate={{ opacity: .88, x: 0 }} transition={{ duration: .8, delay: .3 }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6.1, repeat: Infinity, ease: "easeInOut", delay: .8 }}>
            <PhoneFrame label="LIVE ANALYTICS"><AnalyticsScreen /></PhoneFrame>
          </motion.div>
        </motion.div>
      </div>

      {/* CENTER phone — Lost Mode (dominant) */}
      <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 scale-[1.06]">
        <motion.div initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, delay: .1 }}>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4.7, repeat: Infinity, ease: "easeInOut" }}>
            <PhoneFrame glow label="ASSET RECOVERY"><LostModeScreen /></PhoneFrame>
          </motion.div>
        </motion.div>
      </div>

      {/* NFC Tap animation — beneath the phones, tapping upward */}
      <OneTapAnimation />

      {/* Bottom caption pill */}
      <div className="absolute -bottom-3 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#071A3D]/75 px-4 py-2 text-[9px] font-bold text-white/65 shadow-xl backdrop-blur-xl md:flex">
        <Wifi className="h-3 w-3 text-orange-400" /> Tap once · Share instantly · Capture every lead
      </div>
    </div>
  );
}