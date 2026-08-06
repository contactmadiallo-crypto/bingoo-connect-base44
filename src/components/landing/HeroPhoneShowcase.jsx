import { motion } from "framer-motion";
import { Bell, Phone, MessageCircle, MapPin, TrendingUp, QrCode, Wifi, Users, Calendar, ArrowRight, ShieldCheck } from "lucide-react";

// Bingoo brand colors
const B = {
  navy: "#0b2149",
  navyDark: "#071A3D",
  navyLight: "#13284f",
  orange: "#f97316",
  orangeLight: "#fb923c",
  gold: "#FDBA21",
  goldLight: "#FFD060",
  white: "#FFFFFF",
};

// Shared iPhone frame wrapper
function PhoneFrame({ children, glow }) {
  return (
    <div className="relative" style={{ transformStyle: "preserve-3d" }}>
      {/* Glow behind phone */}
      {glow && (
        <div className="absolute inset-0 -z-10 rounded-[2.5rem] blur-2xl pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(249,115,22,0.35) 0%, transparent 65%)`, transform: "scale(1.3)" }} />
      )}
      <div className="relative bg-[#0a0a0a] rounded-[2rem] p-[3px]"
        style={{ boxShadow: "0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
        {/* Side buttons */}
        <div className="absolute -left-[3px] top-14 w-[3px] h-6 bg-[#222] rounded-l" />
        <div className="absolute -left-[3px] top-22 w-[3px] h-9 bg-[#222] rounded-l" />
        <div className="absolute -right-[3px] top-18 w-[3px] h-11 bg-[#222] rounded-r" />
        <div className="bg-white rounded-[1.7rem] overflow-hidden" style={{ width: 180 }}>
          {/* Status bar */}
          <div className="bg-[#0a0a0a] flex justify-between items-center px-3.5 pt-1.5 pb-1">
            <span className="text-white text-[7px] font-bold">9:41</span>
            <div className="w-12 h-3.5 bg-black rounded-full border border-[#222]" />
            <span className="text-white text-[7px] font-bold">●●●</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── CENTER: Lost Mode screen ─────────────────────────────────────────────
function LostModeScreen() {
  return (
    <div className="relative" style={{ minHeight: 250 }}>
      {/* Header */}
      <div className="px-3.5 pt-3 pb-2 text-center" style={{ background: `linear-gradient(135deg, ${B.orange} 0%, ${B.orangeLight} 100%)` }}>
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/25 text-white text-[8px] font-black tracking-widest mb-1">
          <Bell className="w-2.5 h-2.5" /> LOST MODE
        </div>
        <p className="text-white text-[11px] font-black leading-tight">This item is reported lost</p>
        <p className="text-white/80 text-[8px] mt-0.5">If found, please help return it</p>
      </div>

      {/* Item card */}
      <div className="px-3 pt-2.5">
        <div className="flex items-center gap-2 rounded-xl p-2" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: B.navy }}>
            <span className="text-base">🧳</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 text-[9px] font-black truncate">Black Suitcase</p>
            <p className="text-slate-400 text-[7px]">BG-000007 · Active</p>
          </div>
        </div>
      </div>

      {/* Finder message */}
      <div className="px-3 pt-2">
        <p className="text-slate-500 text-[7px] font-bold uppercase tracking-wide mb-1">Owner message</p>
        <div className="rounded-lg p-2" style={{ background: "#f1f5f9" }}>
          <p className="text-slate-600 text-[8px] leading-snug">Thank you for finding my item! Please tap below — I've offered a reward.</p>
        </div>
      </div>

      {/* Reward badge */}
      <div className="px-3 pt-2">
        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: `${B.gold}22`, border: `1px solid ${B.gold}44` }}>
          <span className="text-[8px]">🎁</span>
          <span className="text-[8px] font-black" style={{ color: "#b45309" }}>$50 Reward</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 pt-2.5 pb-3 space-y-1.5">
        <button className="w-full py-2 rounded-lg text-white text-[9px] font-black flex items-center justify-center gap-1"
          style={{ background: `linear-gradient(135deg, ${B.orange} 0%, ${B.orangeLight} 100%)` }}>
          <Phone className="w-3 h-3" /> Contact Owner
        </button>
        <button className="w-full py-2 rounded-lg text-[9px] font-black flex items-center justify-center gap-1"
          style={{ background: "rgba(11,33,73,0.06)", border: `1px solid ${B.navy}22`, color: B.navy }}>
          <MapPin className="w-3 h-3" /> Report Found
        </button>
      </div>
    </div>
  );
}

// ── LEFT: Dashboard / My Profile ──────────────────────────────────────────
function DashboardScreen() {
  return (
    <div className="relative" style={{ minHeight: 250, background: `linear-gradient(160deg, ${B.navyDark} 0%, ${B.navy} 100%)` }}>
      {/* Profile header */}
      <div className="px-3 pt-3 pb-2.5 text-center">
        <div className="w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${B.orange} 0%, ${B.gold} 100%)`, boxShadow: "0 4px 12px rgba(249,115,22,0.4)" }}>
          <span className="text-white text-sm font-black">A</span>
        </div>
        <p className="text-white text-[10px] font-black">Amadou Diallo</p>
        <p className="text-white/50 text-[7px]">Law Firm · Attorney</p>
      </div>

      {/* Stats row */}
      <div className="px-2.5 grid grid-cols-3 gap-1">
        {[
          { icon: <TrendingUp className="w-2.5 h-2.5" />, val: "1.2k", label: "Views" },
          { icon: <Users className="w-2.5 h-2.5" />, val: "48", label: "Leads" },
          { icon: <Calendar className="w-2.5 h-2.5" />, val: "12", label: "Booked" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg p-1.5 text-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-center mb-0.5" style={{ color: B.gold }}>{s.icon}</div>
            <p className="text-white text-[9px] font-black">{s.val}</p>
            <p className="text-white/40 text-[6px] uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="px-2.5 pt-2 space-y-1">
        {[
          { icon: <QrCode className="w-2.5 h-2.5" />, label: "Share QR Code", accent: B.orange },
          { icon: <Wifi className="w-2.5 h-2.5" />, label: "NFC Devices (3)", accent: B.gold },
          { icon: <ShieldCheck className="w-2.5 h-2.5" />, label: "Verified Profile", accent: "#22c55e" },
        ].map((a) => (
          <div key={a.label} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: a.accent + "22", color: a.accent }}>
              {a.icon}
            </div>
            <span className="text-white/70 text-[8px] font-semibold flex-1">{a.label}</span>
            <ArrowRight className="w-2 h-2 text-white/30" />
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around py-1.5" style={{ background: "rgba(0,0,0,0.25)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {["🏠", "📊", "📅", "⚙️"].map((ic, i) => (
          <span key={i} className="text-[10px] opacity-60">{ic}</span>
        ))}
      </div>
    </div>
  );
}

// ── RIGHT: Analytics / QR / NFC ───────────────────────────────────────────
function AnalyticsScreen() {
  const bars = [40, 65, 50, 80, 60, 95, 70];
  return (
    <div className="relative" style={{ minHeight: 250, background: `linear-gradient(160deg, ${B.navyLight} 0%, ${B.navyDark} 100%)` }}>
      {/* Header */}
      <div className="px-3 pt-3 pb-2">
        <p className="text-white text-[10px] font-black">Analytics</p>
        <p className="text-white/40 text-[7px]">Last 7 days</p>
      </div>

      {/* Chart */}
      <div className="px-3 pt-1">
        <div className="rounded-lg p-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-end justify-between gap-1 h-14">
            {bars.map((h, i) => (
              <motion.div key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                className="flex-1 rounded-t"
                style={{ background: i === 5 ? `linear-gradient(180deg, ${B.orange} 0%, ${B.orangeLight} 100%)` : `linear-gradient(180deg, ${B.gold}99 0%, ${B.gold}55 100%)` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Source breakdown */}
      <div className="px-3 pt-2 space-y-1">
        {[
          { icon: <Wifi className="w-2.5 h-2.5" />, label: "NFC Taps", val: "412", pct: "45%", color: B.orange },
          { icon: <QrCode className="w-2.5 h-2.5" />, label: "QR Scans", val: "287", pct: "31%", color: B.gold },
          { icon: <Users className="w-2.5 h-2.5" />, label: "Direct", val: "226", pct: "24%", color: "#60a5fa" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: s.color + "22", color: s.color }}>
              {s.icon}
            </div>
            <span className="text-white/60 text-[8px] font-semibold flex-1">{s.label}</span>
            <span className="text-white text-[8px] font-black">{s.val}</span>
            <span className="text-white/30 text-[7px]">{s.pct}</span>
          </div>
        ))}
      </div>

      {/* QR mini card */}
      <div className="px-3 pt-2 pb-3">
        <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
            <QrCode className="w-5 h-5" style={{ color: B.navy }} />
          </div>
          <div className="flex-1">
            <p className="text-white text-[8px] font-black">Profile QR</p>
            <p className="text-white/40 text-[7px]">Scan to view</p>
          </div>
          <div className="px-1.5 py-0.5 rounded text-[7px] font-black text-white" style={{ background: B.orange }}>
            Share
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroPhoneShowcase() {
  return (
    <div className="relative flex items-center justify-center" style={{ minHeight: 340, perspective: "1200px" }}>

      {/* LEFT phone — Dashboard */}
      <motion.div
        initial={{ opacity: 0, x: -60, rotateY: 12 }}
        animate={{ opacity: 1, x: 0, rotateY: 12 }}
        transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute z-10 hidden sm:block"
        style={{ transform: "translateX(-38%) translateY(6%) scale(0.82)" }}>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
          <PhoneFrame>
            <DashboardScreen />
          </PhoneFrame>
        </motion.div>
      </motion.div>

      {/* RIGHT phone — Analytics */}
      <motion.div
        initial={{ opacity: 0, x: 60, rotateY: -12 }}
        animate={{ opacity: 1, x: 0, rotateY: -12 }}
        transition={{ duration: 0.9, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute z-10 hidden sm:block"
        style={{ transform: "translateX(38%) translateY(6%) scale(0.82)" }}>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
          <PhoneFrame>
            <AnalyticsScreen />
          </PhoneFrame>
        </motion.div>
      </motion.div>

      {/* CENTER phone — Lost Mode (dominant) */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
          <PhoneFrame glow>
            <LostModeScreen />
          </PhoneFrame>
        </motion.div>
      </motion.div>

      {/* Soft orange glow behind center phone */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,0.30) 0%, transparent 65%)" }} />
      </div>
    </div>
  );
}