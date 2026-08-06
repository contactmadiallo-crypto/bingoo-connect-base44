import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Calendar,
  MapPin,
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

function PhoneFrame({ children, glow = false }) {
  return (
    <div className="relative">
      {glow && (
        <div
          className="pointer-events-none absolute -inset-10 -z-10 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,.42), transparent 68%)" }}
        />
      )}

      <div
        className="relative rounded-[2rem] bg-[#090909] p-[4px]"
        style={{
          boxShadow:
            "0 34px 70px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.09), inset 0 1px 0 rgba(255,255,255,.1)",
        }}
      >
        <div className="absolute -left-[3px] top-14 h-7 w-[3px] rounded-l bg-[#242424]" />
        <div className="absolute -left-[3px] top-24 h-10 w-[3px] rounded-l bg-[#242424]" />
        <div className="absolute -right-[3px] top-20 h-12 w-[3px] rounded-r bg-[#242424]" />

        <div className="w-[184px] overflow-hidden rounded-[1.7rem] bg-white">
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

function LostModeScreen() {
  return (
    <div className="min-h-[260px] bg-white">
      <div
        className="px-3.5 pb-3 pt-3 text-center"
        style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})` }}
      >
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
            <p className="truncate text-[9px] font-black text-slate-800">Black Suitcase</p>
            <p className="text-[7px] text-slate-400">BG-000007 · Active</p>
          </div>
        </div>
      </div>

      <div className="px-3 pt-2">
        <p className="mb-1 text-[7px] font-bold uppercase tracking-wide text-slate-500">Owner message</p>
        <div className="rounded-lg bg-slate-100 p-2">
          <p className="text-[8px] leading-snug text-slate-600">
            Thank you for finding my item. Please tap below — I have offered a reward.
          </p>
        </div>
      </div>

      <div className="px-3 pt-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-black text-amber-700">
          🎁 $50 Reward
        </span>
      </div>

      <div className="space-y-1.5 px-3 pb-3 pt-2.5">
        <button
          className="flex w-full items-center justify-center gap-1 rounded-lg py-2 text-[9px] font-black text-white"
          style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})` }}
        >
          <Phone className="h-3 w-3" /> Contact Owner
        </button>
        <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-[9px] font-black text-[#0b2149]">
          <MapPin className="h-3 w-3" /> Report Found
        </button>
      </div>
    </div>
  );
}

function DashboardScreen() {
  const stats = [
    [TrendingUp, "1.2k", "Views"],
    [Users, "48", "Leads"],
    [Calendar, "12", "Booked"],
  ];

  const actions = [
    [QrCode, "Share QR Code", B.orange],
    [Wifi, "NFC Devices (3)", B.gold],
    [ShieldCheck, "Verified Profile", "#22c55e"],
  ];

  return (
    <div
      className="relative min-h-[260px]"
      style={{ background: `linear-gradient(160deg, ${B.navyDark}, ${B.navy})` }}
    >
      <div className="px-3 pb-2.5 pt-3 text-center">
        <div
          className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white"
          style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.gold})` }}
        >
          AD
        </div>
        <p className="text-[10px] font-black text-white">Abdoulaye Diallo</p>
        <p className="text-[7px] text-white/50">Founder · Bingoo Connect</p>
      </div>

      <div className="grid grid-cols-3 gap-1 px-2.5">
        {stats.map(([Icon, value, label]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-center">
            <Icon className="mx-auto mb-0.5 h-2.5 w-2.5 text-amber-300" />
            <p className="text-[9px] font-black text-white">{value}</p>
            <p className="text-[6px] uppercase tracking-wide text-white/40">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1 px-2.5 pt-2">
        {actions.map(([Icon, label, accent]) => (
          <div key={label} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
            <div className="flex h-4 w-4 items-center justify-center rounded" style={{ background: `${accent}22`, color: accent }}>
              <Icon className="h-2.5 w-2.5" />
            </div>
            <span className="flex-1 text-[8px] font-semibold text-white/70">{label}</span>
            <ArrowRight className="h-2 w-2 text-white/30" />
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-around border-t border-white/10 bg-black/20 py-1.5 text-[10px] opacity-70">
        <span>⌂</span><span>▥</span><span>◫</span><span>⚙</span>
      </div>
    </div>
  );
}

function AnalyticsScreen() {
  const bars = [40, 66, 50, 82, 61, 96, 72];
  const sources = [
    [Wifi, "NFC Taps", "412", B.orange],
    [QrCode, "QR Scans", "287", B.gold],
    [Users, "Direct", "226", "#60a5fa"],
  ];

  return (
    <div
      className="min-h-[260px]"
      style={{ background: `linear-gradient(160deg, ${B.navyLight}, ${B.navyDark})` }}
    >
      <div className="px-3 pb-2 pt-3">
        <p className="text-[10px] font-black text-white">Analytics</p>
        <p className="text-[7px] text-white/40">Last 7 days</p>
      </div>

      <div className="px-3 pt-1">
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="flex h-14 items-end justify-between gap-1">
            {bars.map((height, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                whileInView={{ height: `${height}%` }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className="flex-1 rounded-t"
                style={{
                  background:
                    index === 5
                      ? `linear-gradient(${B.orange}, ${B.orangeLight})`
                      : `linear-gradient(${B.gold}aa, ${B.gold}44)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1 px-3 pt-2">
        {sources.map(([Icon, label, value, accent]) => (
          <div key={label} className="flex items-center gap-1.5">
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
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white">
            <QrCode className="h-5 w-5 text-[#0b2149]" />
          </div>
          <div className="flex-1">
            <p className="text-[8px] font-black text-white">Profile QR</p>
            <p className="text-[7px] text-white/40">Scan to connect</p>
          </div>
          <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[7px] font-black text-white">Share</span>
        </div>
      </div>
    </div>
  );
}

export default function HeroPhoneShowcase() {
  return (
    <div className="relative mx-auto h-[390px] w-full max-w-[620px] overflow-visible" style={{ perspective: "1200px" }}>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="h-72 w-72 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(249,115,22,.28), transparent 68%)" }}
        />
      </div>

      {/* Static outer wrappers own layout transforms. Motion can no longer overwrite them. */}
      <div className="absolute left-1/2 top-14 z-10 hidden -translate-x-[118%] -rotate-[9deg] scale-[.82] md:block">
        <motion.div
          initial={{ opacity: 0, x: -45 }}
          animate={{ opacity: 0.82, x: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5.7, repeat: Infinity, ease: "easeInOut" }}>
            <PhoneFrame><DashboardScreen /></PhoneFrame>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute left-1/2 top-14 z-10 hidden translate-x-[18%] rotate-[9deg] scale-[.82] md:block">
        <motion.div
          initial={{ opacity: 0, x: 45 }}
          animate={{ opacity: 0.82, x: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6.1, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
            <PhoneFrame><AnalyticsScreen /></PhoneFrame>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute left-1/2 top-2 z-20 -translate-x-1/2 scale-[1.04]">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4.7, repeat: Infinity, ease: "easeInOut" }}>
            <PhoneFrame glow><LostModeScreen /></PhoneFrame>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
