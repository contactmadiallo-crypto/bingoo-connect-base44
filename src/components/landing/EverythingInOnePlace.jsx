import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight, BarChart3, Calendar, Check, Clock, Mail, MapPin, MessageCircle,
  Phone, QrCode, Shield, TrendingUp, Users, Wifi, Wallet, Apple, Bell,
  Briefcase, Building2, Star, ChevronRight, FileText, Package, KeyRound,
  Camera, Laptop, Backpack, Sparkles,
} from "lucide-react";

// ── Bingoo brand palette ──────────────────────────────────────────────────
const B = {
  navy: "#0b2149", navyDark: "#071A3D", navyLight: "#13284f",
  orange: "#f97316", orangeLight: "#fb923c",
  gold: "#FDBA21", goldLight: "#FFD060",
  white: "#FFFFFF", slate: "#64748b", softBlue: "#3b82f6", green: "#22c55e",
  red: "#ef4444",
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// ── Section wrapper with viewport reveal ───────────────────────────────────
function RevealCard({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

// ── Card shell ─────────────────────────────────────────────────────────────
function CardShell({ children, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-white ${className}`}
      style={{ borderColor: "#e7ecf3", boxShadow: "0 4px 24px rgba(11,33,73,0.06)" }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, desc, accent = B.navy }) {
  return (
    <div className="flex items-start gap-3 p-5 pb-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: accent + "14", color: accent }}>
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-black leading-tight" style={{ color: B.navy }}>{title}</h3>
        <p className="mt-0.5 text-sm leading-snug" style={{ color: B.slate }}>{desc}</p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN DASHBOARD SHOWCASE (large centerpiece)
// ════════════════════════════════════════════════════════════════════════════
function DashboardShowcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const navItems = [
    { icon: Briefcase, label: "My Profile", active: true },
    { icon: Users, label: "Leads" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Calendar, label: "Appointments" },
    { icon: Wifi, label: "NFC Devices" },
    { icon: QrCode, label: "QR Sharing" },
    { icon: Wallet, label: "Wallet" },
    { icon: Shield, label: "My Assets" },
  ];

  return (
    <RevealCard>
      <CardShell className="lg:col-span-6">
        {/* Browser top bar */}
        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "#eef2f7", background: "#fbfcfe" }}>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-lg border px-3 py-1 text-xs font-medium" style={{ borderColor: "#e7ecf3", color: B.slate }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: B.green }} />
            Bingoo Dashboard
          </div>
        </div>

        {/* Dashboard body */}
        <div className="flex" ref={ref}>
          {/* Sidebar */}
          <div className="hidden sm:flex w-44 shrink-0 flex-col gap-1 border-r p-3" style={{ borderColor: "#eef2f7", background: "#fbfcfe" }}>
            <div className="mb-3 flex items-center gap-2 px-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.gold})` }}>
                <span className="text-xs font-black text-white">B∞</span>
              </div>
              <span className="text-xs font-black" style={{ color: B.navy }}>Bingoo</span>
            </div>
            {navItems.map((n) => (
              <div key={n.label}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold"
                style={n.active
                  ? { background: B.orange + "14", color: B.orange }
                  : { color: B.slate }}>
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 md:p-5">
            {/* Greeting */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: B.slate }}>Welcome back</p>
                <p className="text-lg font-black" style={{ color: B.navy }}>Dashboard Overview</p>
              </div>
              <div className="hidden md:flex items-center gap-2 rounded-lg border px-3 py-1.5" style={{ borderColor: "#e7ecf3" }}>
                <Sparkles className="h-3.5 w-3.5" style={{ color: B.gold }} />
                <span className="text-xs font-bold" style={{ color: B.navy }}>All systems active</span>
              </div>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Profile Views", val: "1,253", trend: "+18%", icon: TrendingUp, color: B.softBlue },
                { label: "NFC Taps", val: "486", trend: "+12%", icon: Wifi, color: B.orange },
                { label: "Leads", val: "94", trend: "+24%", icon: Users, color: B.green },
                { label: "Booked", val: "37", trend: "+9%", icon: Calendar, color: B.gold },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="rounded-xl border p-3" style={{ borderColor: "#eef2f7", background: "#fbfcfe" }}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: s.color + "18", color: s.color }}>
                      <s.icon className="h-3 w-3" />
                    </div>
                    <span className="text-[10px] font-black" style={{ color: B.green }}>{s.trend}</span>
                  </div>
                  <p className="text-lg font-black leading-none" style={{ color: B.navy }}>{s.val}</p>
                  <p className="mt-0.5 text-[10px] font-medium" style={{ color: B.slate }}>{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Mini chart + leads list */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Chart */}
              <div className="rounded-xl border p-3" style={{ borderColor: "#eef2f7" }}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: B.slate }}>Engagement (7d)</p>
                <div className="flex items-end gap-1.5 h-16">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <motion.div key={i}
                      initial={{ height: 0 }}
                      animate={inView ? { height: `${h}%` } : {}}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                      className="flex-1 rounded-t"
                      style={{ background: i === 5 ? `linear-gradient(180deg, ${B.orange}, ${B.orangeLight})` : B.navy + "30" }} />
                  ))}
                </div>
              </div>
              {/* Leads list */}
              <div className="rounded-xl border p-3" style={{ borderColor: "#eef2f7" }}>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: B.slate }}>Recent Leads</p>
                <div className="space-y-1.5">
                  {[
                    { name: "J. Martinez", src: "NFC", status: "New", c: B.orange },
                    { name: "S. Patel", src: "QR", status: "Contacted", c: B.softBlue },
                    { name: "L. Diallo", src: "Profile", status: "Qualified", c: B.green },
                  ].map((l, i) => (
                    <motion.div key={l.name}
                      initial={{ opacity: 0, x: 12 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.4 + i * 0.12 }}
                      className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-black text-white" style={{ background: B.navy }}>
                          {l.name[0]}
                        </div>
                        <span className="font-semibold" style={{ color: B.navy }}>{l.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold" style={{ color: B.slate }}>{l.src}</span>
                        <span className="rounded-full px-1.5 py-0.5 text-[8px] font-black text-white" style={{ background: l.c }}>{l.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardShell>
    </RevealCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  CARD 1 — PROFESSIONAL PROFILE
// ════════════════════════════════════════════════════════════════════════════
function ProfileCard() {
  return (
    <RevealCard delay={0.05} className="md:col-span-1 lg:col-span-3">
      <CardShell>
        <CardHeader icon={<Briefcase className="h-5 w-5" />} title="Professional Profile"
          desc="Your professional identity, always ready to share." accent={B.orange} />
        <div className="px-5 pb-5">
          {/* Mini profile */}
          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "#e7ecf3" }}>
            {/* Cover */}
            <div className="relative h-14" style={{ background: `linear-gradient(135deg, ${B.navy} 0%, ${B.navyLight} 60%, ${B.softBlue} 100%)` }}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
            </div>
            <div className="px-4 pb-4">
              <div className="-mt-7 mb-2 flex items-end justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white text-sm font-black text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.gold})` }}>AR</div>
                <button className="rounded-lg px-2.5 py-1 text-[10px] font-black text-white" style={{ background: B.navy }}>Save Contact</button>
              </div>
              <p className="text-sm font-black" style={{ color: B.navy }}>Alex Rivera</p>
              <p className="text-[11px] font-medium" style={{ color: B.slate }}>Brand Strategist · Rivera Studio</p>
              <div className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: B.slate }}>
                <MapPin className="h-2.5 w-2.5" /> Austin, TX
              </div>

              {/* Services */}
              <div className="mt-2.5 flex flex-wrap gap-1">
                {["Branding", "Strategy", "Web"].map((s) => (
                  <span key={s} className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: B.orange + "14", color: B.orange }}>{s}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <button className="flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-black text-white" style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})` }}>
                  <Calendar className="h-3 w-3" /> Book
                </button>
                <button className="rounded-lg border py-1.5 text-[10px] font-black" style={{ borderColor: "#e7ecf3", color: B.navy }}>Share</button>
              </div>

              {/* Socials */}
              <div className="mt-2.5 flex items-center justify-center gap-1.5">
                {[Phone, MessageCircle, Mail].map((Icon, i) => (
                  <div key={i} className="flex h-6 w-6 items-center justify-center rounded-full border" style={{ borderColor: "#e7ecf3", color: B.slate }}>
                    <Icon className="h-3 w-3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardShell>
    </RevealCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  CARD 2 — ONE-TAP NFC + QR
// ════════════════════════════════════════════════════════════════════════════
function NfcQrCard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <RevealCard delay={0.1} className="md:col-span-1 lg:col-span-3">
      <CardShell>
        <CardHeader icon={<Wifi className="h-5 w-5" />} title="One-Tap NFC + QR"
          desc="Share everything with one tap or scan." accent={B.orange} />
        <div ref={ref} className="relative px-5 pb-5">
          <div className="relative flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: "#e7ecf3", background: "#fbfcfe" }}>
            {/* NFC card */}
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={inView ? { y: [0, -4, 0] } : {}}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex h-16 w-24 flex-col justify-center rounded-lg p-2"
                style={{ background: `linear-gradient(135deg, ${B.navyDark}, ${B.navyLight})`, boxShadow: "0 6px 16px rgba(11,33,73,0.25), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.orangeLight})` }}>
                  <span className="text-[8px] font-black text-white">∞</span>
                </div>
                <p className="mt-1 text-[7px] font-black text-white">Bingoo</p>
                {/* NFC signal pulse */}
                <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                  {[0, 1].map((i) => (
                    <motion.div key={i}
                      className="absolute rounded-full border"
                      style={{ borderColor: B.orange, width: 14, height: 14, top: -7, left: -7 }}
                      animate={inView ? { scale: [1, 2.2], opacity: [0.7, 0] } : {}}
                      transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }} />
                  ))}
                  <Wifi className="relative h-3 w-3" style={{ color: B.orange }} />
                </div>
              </motion.div>
              <span className="text-[9px] font-bold" style={{ color: B.slate }}>NFC Card</span>
            </div>

            {/* Arrow / signal flow */}
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div key={i}
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: B.orange }}
                  animate={inView ? { opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] } : {}}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>

            {/* QR code */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-lg border-2 bg-white p-1.5" style={{ borderColor: B.navy }}>
                <div className="grid grid-cols-5 gap-0.5 h-full w-full">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="rounded-[1px]" style={{ background: (i * 7 + 3) % 3 === 0 ? B.navy : "transparent" }} />
                  ))}
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded bg-white">
                  <span className="text-[7px] font-black" style={{ color: B.orange }}>∞</span>
                </div>
              </div>
              <span className="text-[9px] font-bold" style={{ color: B.slate }}>QR Code</span>
            </div>
          </div>

          {/* Phone result */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: B.green + "30", background: B.green + "08" }}>
            <div className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: B.green }}>
              <Check className="h-3 w-3 text-white" />
            </div>
            <span className="text-[10px] font-bold" style={{ color: B.navy }}>Profile opened instantly</span>
          </motion.div>
        </div>
      </CardShell>
    </RevealCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  CARD 3 — LEAD MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════
function LeadsCard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const leads = [
    { initials: "JM", name: "Jordan Miles", src: "NFC", status: "New", color: B.orange, note: "Interested in branding package" },
    { initials: "SP", name: "Sara Patel", src: "QR", status: "Contacted", color: B.softBlue, note: "Follow-up sent · 2d ago" },
    { initials: "LB", name: "Leo Bennett", src: "Profile", status: "Qualified", color: B.green, note: "Ready to book consultation" },
  ];

  return (
    <RevealCard delay={0.05} className="md:col-span-1 lg:col-span-3">
      <CardShell>
        <CardHeader icon={<Users className="h-5 w-5" />} title="Lead Management"
          desc="Turn every connection into an opportunity." accent={B.navy} />
        <div ref={ref} className="px-5 pb-5">
          {/* New lead notification */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="mb-3 flex items-center gap-2 rounded-xl border px-3 py-2"
            style={{ borderColor: B.orange + "30", background: B.orange + "08" }}>
            <Bell className="h-3.5 w-3.5" style={{ color: B.orange }} />
            <span className="text-[10px] font-bold" style={{ color: B.navy }}>New lead captured via NFC tap</span>
          </motion.div>

          {/* Lead list */}
          <div className="space-y-2">
            {leads.map((l, i) => (
              <motion.div key={l.name}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.12 }}
                className="rounded-xl border p-3" style={{ borderColor: "#e7ecf3" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ background: B.navy }}>
                      {l.initials}
                    </div>
                    <div>
                      <p className="text-xs font-black" style={{ color: B.navy }}>{l.name}</p>
                      <p className="text-[9px] font-medium" style={{ color: B.slate }}>{l.note}</p>
                    </div>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[8px] font-black text-white" style={{ background: l.color }}>{l.status}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 border-t pt-2" style={{ borderColor: "#eef2f7" }}>
                  <span className="flex items-center gap-1 text-[9px] font-bold" style={{ color: B.slate }}>
                    <Wifi className="h-2.5 w-2.5" /> {l.src}
                  </span>
                  <ChevronRight className="h-3 w-3" style={{ color: B.slate }} />
                  <span className="text-[9px] font-medium" style={{ color: B.slate }}>Source tracked</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardShell>
    </RevealCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  CARD 4 — APPOINTMENTS
// ════════════════════════════════════════════════════════════════════════════
function AppointmentsCard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <RevealCard delay={0.1} className="md:col-span-1 lg:col-span-3">
      <CardShell>
        <CardHeader icon={<Calendar className="h-5 w-5" />} title="Appointments"
          desc="Let prospects book you instantly." accent={B.gold} />
        <div ref={ref} className="px-5 pb-5">
          {/* Mini calendar */}
          <div className="rounded-2xl border p-3" style={{ borderColor: "#e7ecf3" }}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-black" style={{ color: B.navy }}>August 2026</p>
              <div className="flex gap-1">
                <ChevronRight className="h-3 w-3 rotate-180" style={{ color: B.slate }} />
                <ChevronRight className="h-3 w-3" style={{ color: B.slate }} />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} className="text-[8px] font-bold" style={{ color: B.slate }}>{d}</span>
              ))}
              {Array.from({ length: 14 }).map((_, i) => {
                const day = i + 4;
                const isToday = day === 7;
                const hasSlot = [5, 9, 12].includes(day);
                return (
                  <div key={i} className="relative flex h-6 items-center justify-center">
                    <span className={`text-[9px] font-bold ${isToday ? "text-white" : ""}`}
                      style={isToday ? { background: B.orange, borderRadius: 4, padding: "1px 4px" } : { color: B.navy }}>
                      {day}
                    </span>
                    {hasSlot && <span className="absolute bottom-0 h-1 w-1 rounded-full" style={{ background: B.green }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available times */}
          <p className="mt-3 mb-1.5 text-[9px] font-bold uppercase tracking-wide" style={{ color: B.slate }}>Available Aug 7</p>
          <div className="grid grid-cols-3 gap-1.5">
            {["9:00 AM", "11:30 AM", "2:00 PM"].map((t, i) => (
              <motion.div key={t}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="rounded-lg border py-1.5 text-center text-[9px] font-bold"
                style={{ borderColor: i === 1 ? B.orange : "#e7ecf3", color: i === 1 ? B.orange : B.navy, background: i === 1 ? B.orange + "10" : "#fbfcfe" }}>
                {t}
              </motion.div>
            ))}
          </div>

          {/* Booking confirmation */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
            className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2"
            style={{ borderColor: B.green + "30", background: B.green + "08" }}>
            <div className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: B.green }}>
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-[10px] font-bold" style={{ color: B.navy }}>Consultation booked — Aug 7, 11:30 AM</span>
          </motion.div>
        </div>
      </CardShell>
    </RevealCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  CARD 5 — ANALYTICS (wider)
// ════════════════════════════════════════════════════════════════════════════
function AnalyticsCard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const stats = [
    { label: "NFC Taps", val: "486", color: B.orange },
    { label: "QR Scans", val: "312", color: B.softBlue },
    { label: "Profile Views", val: "1,253", color: B.navy },
    { label: "Leads", val: "94", color: B.green },
    { label: "Appointments", val: "37", color: B.gold },
    { label: "Conversion", val: "24%", color: B.red },
  ];

  return (
    <RevealCard delay={0.05} className="md:col-span-2 lg:col-span-6">
      <CardShell>
        <CardHeader icon={<BarChart3 className="h-5 w-5" />} title="Analytics"
          desc="Know what is working — across every channel." accent={B.softBlue} />
        <div ref={ref} className="px-5 pb-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="rounded-xl border p-3" style={{ borderColor: "#eef2f7", background: "#fbfcfe" }}>
                <p className="text-xl font-black leading-none" style={{ color: s.color }}>{s.val}</p>
                <p className="mt-1 text-[10px] font-medium" style={{ color: B.slate }}>{s.label}</p>
                {/* mini bar */}
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "#eef2f7" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${60 + i * 6}%` } : {}}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                    className="h-full rounded-full" style={{ background: s.color }} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Weekly chart */}
          <div className="mt-4 rounded-xl border p-4" style={{ borderColor: "#eef2f7" }}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-black" style={{ color: B.navy }}>Weekly Engagement</p>
              <div className="flex items-center gap-3 text-[9px] font-bold">
                <span className="flex items-center gap-1" style={{ color: B.slate }}><span className="h-2 w-2 rounded-full" style={{ background: B.orange }} /> Taps</span>
                <span className="flex items-center gap-1" style={{ color: B.slate }}><span className="h-2 w-2 rounded-full" style={{ background: B.softBlue }} /> Views</span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2 h-24">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                const tapH = [35, 55, 40, 70, 50, 85, 60][i];
                const viewH = [50, 70, 55, 85, 65, 95, 75][i];
                return (
                  <div key={d} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full items-end justify-center gap-0.5 h-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={inView ? { height: `${tapH}%` } : {}}
                        transition={{ delay: 0.2 + i * 0.07, duration: 0.5 }}
                        className="w-1/2 rounded-t" style={{ background: B.orange }} />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={inView ? { height: `${viewH}%` } : {}}
                        transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
                        className="w-1/2 rounded-t" style={{ background: B.softBlue }} />
                    </div>
                    <span className="text-[8px] font-bold" style={{ color: B.slate }}>{d}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardShell>
    </RevealCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  CARD 6 — DIGITAL WALLET
// ════════════════════════════════════════════════════════════════════════════
function WalletCard() {
  return (
    <RevealCard delay={0.05} className="md:col-span-1 lg:col-span-3">
      <CardShell>
        <CardHeader icon={<Wallet className="h-5 w-5" />} title="Digital Wallet"
          desc="Your professional identity, always with you." accent={B.navy} />
        <div className="px-5 pb-5 space-y-3">
          {/* Google Wallet pass */}
          <div className="relative overflow-hidden rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${B.navy} 0%, ${B.navyLight} 100%)` }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "10px 10px" }} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wide text-white/50">Google Wallet</p>
                <p className="mt-1 text-sm font-black text-white">Alex Rivera</p>
                <p className="text-[10px] text-white/60">Brand Strategist</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.gold})` }}>
                <span className="text-[10px] font-black text-white">∞</span>
              </div>
            </div>
            <div className="relative mt-3 flex gap-1.5">
              {[Phone, Mail, MapPin].map((Icon, i) => (
                <div key={i} className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-2.5 w-2.5 text-white/70" />
                </div>
              ))}
            </div>
          </div>

          {/* Apple Wallet pass — Coming Soon */}
          <div className="relative overflow-hidden rounded-2xl border-2 p-4" style={{ borderColor: "#1a1a1a", background: "#1a1a1a" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wide text-white/40">Apple Wallet</p>
                <p className="mt-1 text-sm font-black text-white">Alex Rivera</p>
                <p className="text-[10px] text-white/50">Rivera Studio</p>
              </div>
              <Apple className="h-5 w-5 text-white/80" />
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
              <span className="rounded-full px-2 py-0.5 text-[8px] font-black text-white" style={{ background: B.gold }}>Coming Soon</span>
              <span className="text-[9px] font-bold text-white/40">In development</span>
            </div>
          </div>
        </div>
      </CardShell>
    </RevealCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  CARD 7 — ASSET PROTECTION
// ════════════════════════════════════════════════════════════════════════════
function AssetCard() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const flow = [
    { icon: Wifi, label: "NFC Device", color: B.orange },
    { icon: Backpack, label: "Asset", color: B.navy },
    { icon: Shield, label: "Lost Mode", color: B.red },
    { icon: Phone, label: "Finder → Owner", color: B.green },
  ];

  const assets = [
    { icon: Backpack, label: "Backpack" },
    { icon: KeyRound, label: "Keys" },
    { icon: Camera, label: "Camera" },
    { icon: Laptop, label: "Laptop" },
    { icon: Package, label: "Suitcase" },
  ];

  return (
    <RevealCard delay={0.1} className="md:col-span-1 lg:col-span-3">
      <CardShell>
        <CardHeader icon={<Shield className="h-5 w-5" />} title="Asset Protection"
          desc="Protect more than your network." accent={B.red} />
        <div ref={ref} className="px-5 pb-5">
          {/* Flow diagram */}
          <div className="rounded-2xl border p-4" style={{ borderColor: "#e7ecf3", background: "#fbfcfe" }}>
            <div className="flex items-center justify-between">
              {flow.map((f, i) => (
                <div key={f.label} className="flex flex-1 flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.2 + i * 0.2 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{ background: f.color + "18", color: f.color }}>
                    <f.icon className="h-4 w-4" />
                  </motion.div>
                  <span className="text-center text-[8px] font-bold leading-tight" style={{ color: B.navy }}>{f.label}</span>
                  {i < flow.length - 1 && (
                    <div className="absolute" style={{ left: `${(i + 1) * 25}%` }}>
                      <ArrowRight className="h-3 w-3" style={{ color: B.slate }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lost mode status */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9 }}
            className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2"
            style={{ borderColor: B.red + "30", background: B.red + "08" }}>
            <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: B.red }}>
              <Bell className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black" style={{ color: B.red }}>Lost Mode Activated</p>
              <p className="text-[9px] font-medium" style={{ color: B.slate }}>Finder can contact you safely</p>
            </div>
          </motion.div>

          {/* Asset chips */}
          <p className="mt-3 mb-1.5 text-[9px] font-bold uppercase tracking-wide" style={{ color: B.slate }}>Protectable Assets</p>
          <div className="flex flex-wrap gap-1.5">
            {assets.map((a, i) => (
              <motion.div key={a.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1 + i * 0.08 }}
                className="flex items-center gap-1 rounded-lg border px-2 py-1"
                style={{ borderColor: "#e7ecf3", background: "#fff" }}>
                <a.icon className="h-2.5 w-2.5" style={{ color: B.slate }} />
                <span className="text-[9px] font-bold" style={{ color: B.navy }}>{a.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardShell>
    </RevealCard>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN SECTION
// ════════════════════════════════════════════════════════════════════════════
export default function EverythingInOnePlace() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-6 bg-white">
      {/* Soft background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${B.orange}10, transparent 70%)` }} />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${B.softBlue}10, transparent 70%)` }} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section intro */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-12 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: B.orange + "14", color: B.orange, border: `1px solid ${B.orange}30` }}>
            <Sparkles className="h-4 w-4" /> One Connected Platform
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight" style={{ color: B.navy }}>
            Everything in One Place
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: B.slate }}>
            Your profile, connections, leads, appointments, analytics and assets — connected in one professional platform.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5">
          {/* Main dashboard — full width */}
          <DashboardShowcase />

          {/* Row 2 */}
          <ProfileCard />
          <NfcQrCard />

          {/* Row 3 */}
          <LeadsCard />
          <AppointmentsCard />

          {/* Analytics — full width */}
          <AnalyticsCard />

          {/* Row 5 */}
          <WalletCard />
          <AssetCard />
        </div>
      </div>
    </section>
  );
}