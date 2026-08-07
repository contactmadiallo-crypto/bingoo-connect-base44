import { motion } from "framer-motion";
import {
  BarChart3,
  BadgeCheck,
  Bell,
  Check,
  Calendar,
  ChevronDown,
  Globe2,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  TrendingUp,
  Users,
  Wifi,
} from "lucide-react";

const B = {
  navy: "#0b2149",
  navyDark: "#050A14",
  navyMid: "#0B1324",
  navyLight: "#13284f",
  orange: "#FF7F27",
  orangeLight: "#fb923c",
  gold: "#FDBA21",
  green: "#22c55e",
  red: "#ef4444",
};

function PhoneFrame({ children, glow = false, label }) {
  return (
    <div className="relative">
      {glow && (
        <div
          className="pointer-events-none absolute -inset-10 -z-10 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(255,127,39,.42), transparent 66%)" }}
        />
      )}
      {label && (
        <div className="absolute -top-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-[#050A14]/90 px-3 py-1 text-[8px] font-black tracking-[.14em] text-white shadow-lg backdrop-blur-xl">
          {label}
        </div>
      )}
      <div
        className="relative rounded-[2.1rem] bg-[#060608] p-[3.5px]"
        style={{ boxShadow: "0 34px 70px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08), inset 0 1px 0 rgba(255,255,255,.1)" }}
      >
        <div className="absolute -left-[3px] top-14 h-7 w-[3px] rounded-l bg-[#1c1c1c]" />
        <div className="absolute -left-[3px] top-24 h-10 w-[3px] rounded-l bg-[#1c1c1c]" />
        <div className="absolute -right-[3px] top-20 h-12 w-[3px] rounded-r bg-[#1c1c1c]" />
        <div className="relative w-[176px] select-none overflow-hidden rounded-[1.75rem] bg-white">
          <div className="flex items-center justify-between bg-[#060608] px-3 pb-1 pt-1.5">
            <span className="text-[7px] font-bold text-white">9:41</span>
            <div className="h-3 w-11 rounded-full border border-[#1f1f1f] bg-black" />
            <span className="text-[7px] font-bold text-white">●●●</span>
          </div>
          {children}
          {/* Diagonal glass sheen — realism */}
          <div className="pointer-events-none absolute inset-0 rounded-[1.75rem]"
            style={{ background: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.14) 48%, transparent 58%)" }} />
        </div>
      </div>
    </div>
  );
}

// ── LEFT: Emma Carter fictional professional profile ──────────────────────
function ProfileScreen() {
  return (
    <div className="min-h-[258px] bg-[#f7f9fc]">
      {/* Header */}
      <div className="relative overflow-hidden px-3 pb-3 pt-3 text-center"
        style={{ background: `linear-gradient(150deg, ${B.navyDark} 0%, ${B.navy} 55%, #1540a0 100%)` }}>
        <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
        <div className="relative mx-auto mb-1.5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/40 text-[13px] font-black text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${B.orange} 0%, ${B.gold} 100%)` }}>
          EC
        </div>
        <div className="relative flex items-center justify-center gap-1">
          <p className="text-[11px] font-black text-white">Emma Carter</p>
          <BadgeCheck className="h-3 w-3" fill="#fff" stroke="#1d4ed8" strokeWidth={2} />
        </div>
        <p className="relative text-[7px] text-white/70">Creative Director</p>
        <p className="relative text-[7px] text-white/50">Northstar Studio</p>
        <div className="relative mt-1 flex items-center justify-center gap-1 text-white/60">
          <MapPin className="h-2.5 w-2.5" />
          <span className="text-[7px]">New York, NY</span>
        </div>
      </div>

      {/* Services */}
      <div className="px-3 pt-2">
        <p className="mb-1 text-[6px] font-bold uppercase tracking-wide text-slate-400">Services</p>
        <div className="flex flex-wrap gap-1">
          {["Branding", "Web Design", "Strategy"].map((s) => (
            <span key={s} className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[6px] font-bold text-slate-600">{s}</span>
          ))}
        </div>
      </div>

      {/* Portfolio thumbnails */}
      <div className="px-3 pt-2">
        <p className="mb-1 text-[6px] font-bold uppercase tracking-wide text-slate-400">Portfolio</p>
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-8 rounded-md" style={{ background: `linear-gradient(135deg, ${[B.orange, B.gold, "#60a5fa"][i]}99, ${[B.navy, B.orange, B.gold][i]}99)` }} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-1.5 px-3 py-2">
        <button className="flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[8px] font-black text-white"
          style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})`, boxShadow: "0 2px 8px rgba(255,127,39,0.35)" }}>
          <Calendar className="h-3 w-3" /> Book Appointment
        </button>
        <div className="grid grid-cols-2 gap-1.5">
          <button className="rounded-lg py-1.5 text-[7px] font-black text-white" style={{ background: B.navy }}>Save Contact</button>
          <button className="rounded-lg border border-slate-200 bg-white py-1.5 text-[7px] font-black text-[#0b2149]">Share</button>
        </div>
        {/* Social row */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          {[Linkedin, Instagram, Globe2].map((Icon, i) => (
            <div key={i} className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm">
              <Icon className="h-3 w-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CENTER: Lost Mode ─────────────────────────────────────────────────────
function LostModeScreen() {
  return (
    <div className="min-h-[258px] bg-white">
      {/* Header — red gradient with texture */}
      <div className="relative overflow-hidden px-3 pb-3 pt-3 text-center" style={{ background: `linear-gradient(135deg, ${B.red} 0%, #dc2626 100%)` }}>
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
        <div className="relative mb-1 inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-[8px] font-black tracking-widest text-white">
          <Bell className="h-2.5 w-2.5" /> LOST MODE
        </div>
        <p className="relative text-[11px] font-black leading-tight text-white">This item is reported lost</p>
        <p className="relative mt-0.5 text-[8px] text-white/80">If found, please help return it</p>
      </div>

      {/* Reward badge */}
      <div className="px-3 pt-2">
        <div className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1">
          <span className="text-[10px]">🎁</span>
          <span className="text-[7px] font-black text-amber-700">REWARD $50</span>
        </div>
      </div>

      {/* Luggage card */}
      <div className="px-3 pt-2">
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg text-lg shadow-sm" style={{ background: `linear-gradient(135deg, ${B.navy}, ${B.navyLight})` }}>🧳</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-black text-slate-800">Travel Suitcase</p>
            <p className="text-[7px] text-slate-400">BG-DEMO-104 · Active</p>
          </div>
          <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[6px] font-black text-red-600">LOST</span>
        </div>
      </div>

      {/* Owner message */}
      <div className="px-3 pt-2">
        <p className="mb-1 text-[7px] font-bold uppercase tracking-wide text-slate-500">Owner Message</p>
        <div className="rounded-lg bg-slate-100 p-2">
          <p className="text-[8px] leading-snug text-slate-600">Thank you for finding this item. Please use a secure option below to contact me.</p>
        </div>
      </div>

      {/* Contact buttons */}
      <div className="space-y-1.5 px-3 pt-2">
        <div className="grid grid-cols-2 gap-1.5">
          <button className="flex items-center justify-center gap-1 rounded-lg py-1.5 text-[8px] font-black text-white" style={{ background: B.orange }}>
            <Phone className="h-3 w-3" /> Call
          </button>
          <button className="flex items-center justify-center gap-1 rounded-lg py-1.5 text-[8px] font-black text-white" style={{ background: B.green }}>
            <MessageCircle className="h-3 w-3" /> WhatsApp
          </button>
        </div>
        <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 text-[8px] font-black text-[#0b2149]">
          <Mail className="h-3 w-3" /> Email Owner
        </button>
      </div>

      {/* Report found */}
      <div className="px-3 pb-3 pt-2">
        <button className="flex w-full items-center justify-center gap-1 rounded-lg border-2 border-dashed py-1.5 text-[8px] font-black text-slate-500" style={{ borderColor: "#cbd5e1" }}>
          <MapPin className="h-3 w-3" /> Report Found
        </button>
      </div>
    </div>
  );
}

// ── RIGHT: Analytics & Dashboard ──────────────────────────────────────────
function AnalyticsScreen() {
  const bars = [42, 68, 52, 84, 60, 96, 74];
  const stats = [
    [Wifi, "NFC Taps", "1,253", B.orange],
    [QrCode, "QR Scans", "842", B.gold],
    [Users, "Leads", "324", "#60a5fa"],
    [Calendar, "Booked", "28", B.green],
  ];
  // Pie segments: NFC 45, QR 30, Direct 15, Other 10
  const pie = [
    { val: 45, color: B.orange },
    { val: 30, color: B.gold },
    { val: 15, color: "#60a5fa" },
    { val: 10, color: "#94a3b8" },
  ];

  return (
    <div className="min-h-[258px]" style={{ background: `linear-gradient(160deg, ${B.navyMid} 0%, ${B.navyDark} 100%)` }}>
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <div>
          <p className="text-[10px] font-black text-white">Dashboard</p>
          <p className="text-[7px] text-white/40">Last 7 days</p>
        </div>
        <div className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[7px] font-black text-emerald-300">+24%</div>
      </div>

      {/* 4 stat tiles */}
      <div className="grid grid-cols-2 gap-1 px-2.5">
        {stats.map(([Icon, label, value, accent]) => (
          <div key={label} className="rounded-lg border border-white/8 bg-white/[.04] p-1.5">
            <div className="flex items-center gap-1">
              <div className="flex h-3.5 w-3.5 items-center justify-center rounded" style={{ background: `${accent}22`, color: accent }}>
                <Icon className="h-2 w-2" />
              </div>
              <span className="text-[6px] font-bold text-white/50">{label}</span>
            </div>
            <p className="mt-0.5 text-[10px] font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="px-2.5 pt-1.5">
        <div className="rounded-lg border border-white/8 bg-white/[.04] p-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[7px] font-bold text-white/50">Profile Views</span>
            <BarChart3 className="h-2.5 w-2.5 text-orange-400" />
          </div>
          <div className="flex h-12 items-end justify-between gap-1">
            {bars.map((h, i) => (
              <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }} className="flex-1 rounded-t"
                style={{ background: i === 5 ? `linear-gradient(${B.orange}, ${B.orangeLight})` : `linear-gradient(${B.gold}aa, ${B.gold}44)` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Pie chart — Top Sources */}
      <div className="px-2.5 pt-1.5 pb-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[.04] p-2">
          {/* SVG donut */}
          <div className="relative h-10 w-10 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
              {(() => {
                let offset = 0;
                return pie.map((s, i) => {
                  const dash = s.val;
                  const el = (
                    <motion.circle key={i} cx="18" cy="18" r="14" fill="none" stroke={s.color} strokeWidth="6"
                      strokeDasharray={`${dash} ${100 - dash}`} strokeDashoffset={-offset}
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} />
                  );
                  offset += dash;
                  return el;
                });
              })()}
            </svg>
          </div>
          <div className="flex-1 space-y-0.5">
            {pie.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                <span className="text-[7px] text-white/60 flex-1">{["NFC Taps", "QR Scans", "Direct", "Other"][i]}</span>
                <span className="text-[7px] font-black text-white">{s.val}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Subtle world-map / network background ─────────────────────────────────
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
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.55 }}>
      {links.map(([a, b], i) => (
        <motion.line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="#3b82f6" strokeWidth="0.12" strokeOpacity="0.16"
          animate={{ strokeOpacity: [0.05, 0.2, 0.05] }}
          transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }} />
      ))}
      {nodes.map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r="0.4" fill="#60a5fa"
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }} />
      ))}
    </svg>
  );
}

// ── Animated connection lines: NFC card → phones ─────────────────────────
function NfcConnectionLines() {
  const endpoints = [
    { x: 22, y: 42, color: B.orange },
    { x: 50, y: 30, color: B.gold },
    { x: 78, y: 42, color: "#60a5fa" },
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
        <motion.line key={i} x1="50" y1="86" x2={e.x} y2={e.y}
          stroke={`url(#flow-${i})`} strokeWidth="0.4" strokeDasharray="2 3"
          animate={{ strokeDashoffset: [10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: i * 0.3 }} />
      ))}
    </svg>
  );
}

// ── Premium NFC Card + 6-second tap animation cycle ───────────────────────
// Loop: card floats → moves to center phone → orange NFC rings → phone glows
// → profile opens → card returns. Repeats forever.
function NfcCardAndStatus() {
  // 6-second cycle keyframes (times: 0, 0.25, 0.5, 0.72, 1)
  const cardY = [0, -10, -150, -150, 0];
  const cardScale = [1, 1.02, 1.1, 1.1, 1];
  const cardRotate = [-6, -4, 0, 0, -6];
  const cardShadow = "0 18px 44px rgba(0,0,0,0.55), 0 0 28px rgba(255,127,39,0.30)";

  return (
    <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2">
      {/* Expanding NFC rings — fire during the "tap" phase (0.42–0.72) */}
      {[0, 1, 2].map((ring) => (
        <motion.span key={ring}
          className="absolute left-1/2 top-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-orange-400"
          animate={{ scale: [0.3, 0.3, 2.2, 2.2, 0.3], opacity: [0, 0, 0.75, 0, 0], y: [0, 0, -150, -150, 0] }}
          transition={{ duration: 6, repeat: Infinity, times: [0, 0.42, 0.6, 0.72, 0.8], delay: ring * 0.12, ease: "easeOut" }} />
      ))}

      {/* Premium physical NFC card — beveled, matte, embossed, rim-lit */}
      <motion.div
        animate={{ y: cardY, scale: cardScale, rotate: cardRotate }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.25, 0.5, 0.72, 1] }}
        className="relative h-14 w-24 rounded-[10px] p-[2px]"
        style={{ background: `linear-gradient(135deg, #1a2942 0%, ${B.navyDark} 45%, ${B.navyLight} 100%)`, boxShadow: cardShadow }}>
        {/* Beveled inner surface */}
        <div className="relative flex h-full items-center gap-1.5 overflow-hidden rounded-[8px] px-1.5"
          style={{ background: `linear-gradient(140deg, ${B.navyLight} 0%, ${B.navyDark} 60%, #0a1830 100%)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.5)" }}>
          {/* Orange rim lighting — top edge */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,127,39,0.7), transparent)" }} />
          {/* NFC antenna coils — etched detail */}
          <svg className="pointer-events-none absolute right-1 top-1 opacity-35" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5">
            <path d="M12 2 C18 2 22 6 22 12 C22 18 18 22 12 22" /><path d="M12 6 C15 6 18 9 18 12 C18 15 15 18 12 18" />
          </svg>
          {/* Embossed infinity logo */}
          <div className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: `linear-gradient(135deg, ${B.orange} 0%, ${B.orangeLight} 100%)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.3), 0 1px 3px rgba(255,127,39,0.4)" }}>
            <svg width="16" height="8" viewBox="0 0 48 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
              <path d="M 14 12 C 14 6 20 6 24 12 C 28 18 34 18 34 12 C 34 6 28 6 24 12 C 20 18 14 18 14 12 Z" />
            </svg>
          </div>
          <div>
            <p className="text-[7px] font-black text-white" style={{ textShadow: "0 1px 1px rgba(0,0,0,0.5)" }}>Bingoo</p>
            <p className="text-[5px] font-bold tracking-wider text-orange-400">CONNECT</p>
          </div>
          {/* Diagonal sheen */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.10) 50%, transparent 60%)" }} />
        </div>
      </motion.div>

      {/* Status pill — "Profile opens" during tap phase */}
      <motion.div
        className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-[#050A14]/85 px-3 py-1 shadow-xl backdrop-blur-xl"
        animate={{ opacity: [0, 0, 1, 1, 0], y: [4, 4, -150, -150, 4], scale: [0.9, 0.9, 1, 1, 0.9] }}
        transition={{ duration: 6, repeat: Infinity, times: [0, 0.42, 0.55, 0.72, 0.85] }}>
        <span className="flex items-center gap-1 rounded-full bg-orange-500/20 px-1.5 py-0.5 text-[7px] font-black text-orange-300">
          <Wifi className="h-2 w-2" /> TAP
        </span>
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500">
          <Check className="h-2 w-2 text-white" />
        </span>
        <span className="text-[7px] font-bold text-white/80">Profile opens instantly</span>
      </motion.div>
    </div>
  );
}

export default function HeroPhoneShowcase() {
  return (
    <div className="relative mx-auto h-[430px] w-full max-w-[640px] overflow-visible" style={{ perspective: "1200px" }}>
      {/* Orange glow behind center phone */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,127,39,.30), transparent 68%)" }} />
      </div>
      {/* Soft floor shadow under center phone */}
      <div className="pointer-events-none absolute left-1/2 top-[264px] -translate-x-1/2">
        <div className="h-3 w-32 rounded-full blur-md" style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.45), transparent 70%)" }} />
      </div>

      {/* Blue world-map network */}
      <WorldMapNetwork />

      {/* Connection lines */}
      <NfcConnectionLines />

      {/* LEFT phone — Emma Carter profile (peeks on mobile, full on desktop) */}
      <div className="absolute left-1/2 top-20 z-10 -translate-x-[116%] -rotate-[8deg] scale-[.55] opacity-80 sm:scale-[.7] sm:opacity-90 md:-translate-x-[126%] md:-rotate-[10deg] md:scale-[.8] md:opacity-90">
        <motion.div initial={{ opacity: 0, x: -45 }} animate={{ opacity: .9, x: 0 }} transition={{ duration: .8, delay: .2 }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5.7, repeat: Infinity, ease: "easeInOut" }}>
            <PhoneFrame label="ONE-TAP PROFILE"><ProfileScreen /></PhoneFrame>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT phone — Analytics dashboard (peeks on mobile, full on desktop) */}
      <div className="absolute left-1/2 top-20 z-10 translate-x-[16%] rotate-[8deg] scale-[.55] opacity-80 sm:scale-[.7] sm:opacity-90 md:translate-x-[26%] md:rotate-[10deg] md:scale-[.8] md:opacity-90">
        <motion.div initial={{ opacity: 0, x: 45 }} animate={{ opacity: .9, x: 0 }} transition={{ duration: .8, delay: .3 }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6.1, repeat: Infinity, ease: "easeInOut", delay: .8 }}>
            <PhoneFrame label="LIVE ANALYTICS"><AnalyticsScreen /></PhoneFrame>
          </motion.div>
        </motion.div>
      </div>

      {/* CENTER phone — Lost Mode (dominant). Pulses + vibrates during NFC tap phase */}
      <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 scale-[1.05]">
        <motion.div initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, delay: .1 }}>
          <motion.div animate={{ y: [0, -10, 0], scale: [1, 1, 1.015, 1, 1], filter: ["brightness(1)", "brightness(1)", "brightness(1.18)", "brightness(1)", "brightness(1)"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.55, 0.72, 1] }}>
            <PhoneFrame glow label="ASSET RECOVERY"><LostModeScreen /></PhoneFrame>
          </motion.div>
        </motion.div>
      </div>

      {/* NFC card + status pill — bottom center */}
      <NfcCardAndStatus />
    </div>
  );
}