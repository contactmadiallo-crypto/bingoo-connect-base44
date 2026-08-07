import { motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  Check,
  ChevronRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
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

function Shell({ children, className = "" }) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border bg-white ${className}`}
      style={{ borderColor: "#e7ecf3", boxShadow: "0 12px 40px rgba(11,33,73,.07)" }}
    >
      {children}
    </div>
  );
}

function Stat({ icon: Icon, label, value, trend, color }) {
  return (
    <div className="rounded-2xl border p-3" style={{ borderColor: "#edf1f6", background: "#fbfcfe" }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${color}16`, color }}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-[10px] font-black text-emerald-600">{trend}</span>
      </div>
      <p className="text-xl font-black leading-none" style={{ color: B.navy }}>{value}</p>
      <p className="mt-1 text-[10px] font-semibold" style={{ color: B.slate }}>{label}</p>
    </div>
  );
}

function DashboardShowcase() {
  const nav = [
    [Briefcase, "My Profile", true],
    [Users, "Leads"],
    [BarChart3, "Analytics"],
    [Calendar, "Appointments"],
    [Wifi, "NFC Devices"],
    [QrCode, "QR Sharing"],
    [Wallet, "Wallet"],
    [Shield, "My Assets"],
  ];

  const quickActions = ["Share My Profile", "Create QR Code", "Add NFC Device", "View Analytics"];

  return (
    <motion.div {...reveal} className="lg:col-span-6">
      <Shell>
        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "#eef2f7", background: "#fbfcfe" }}>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto rounded-lg border px-3 py-1 text-xs font-bold" style={{ borderColor: "#e7ecf3", color: B.slate }}>
            Bingoo Dashboard
          </div>
        </div>

        <div className="flex min-h-[410px]">
          <aside className="hidden w-48 shrink-0 border-r bg-[#fbfcfe] p-4 sm:block" style={{ borderColor: "#eef2f7" }}>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black text-white" style={{ background: `linear-gradient(135deg, ${B.orange}, ${B.gold})` }}>∞</div>
              <span className="font-black" style={{ color: B.navy }}>Bingoo</span>
            </div>
            <div className="space-y-1">
              {nav.map(([Icon, label, active]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold"
                  style={active ? { background: `${B.orange}12`, color: B.orange } : { color: B.slate }}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </div>
              ))}
            </div>
          </aside>

          <div className="min-w-0 flex-1 p-4 md:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold" style={{ color: B.slate }}>Here is what is happening with your business</p>
                <h3 className="mt-1 text-xl font-black md:text-2xl" style={{ color: B.navy }}>One dashboard. Your whole network.</h3>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-xl border px-3 py-2 text-xs font-bold" style={{ borderColor: "#e7ecf3", color: B.navy }}>
                <Sparkles className="h-4 w-4 text-amber-500" /> Live & connected
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat icon={TrendingUp} label="Profile Views" value="1,253" trend="+18%" color={B.blue} />
              <Stat icon={Wifi} label="NFC Taps" value="486" trend="+12%" color={B.orange} />
              <Stat icon={Users} label="Leads" value="94" trend="+24%" color={B.green} />
              <Stat icon={Calendar} label="Appointments" value="37" trend="+9%" color="#7c3aed" />
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr_.9fr]">
              <div className="rounded-2xl border p-4" style={{ borderColor: "#edf1f6" }}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-black" style={{ color: B.navy }}>Engagement — 7 days</p>
                  <span className="text-[10px] font-semibold" style={{ color: B.slate }}>Taps + Views</span>
                </div>
                <div className="flex h-32 items-end gap-2">
                  {[42, 72, 55, 84, 62, 92, 76].map((height, i) => (
                    <div key={i} className="flex flex-1 items-end gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: i * .05, duration: .45 }}
                        className="w-1/2 rounded-t bg-orange-500"
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${Math.min(height + 12, 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: .1 + i * .05, duration: .45 }}
                        className="w-1/2 rounded-t bg-blue-500/70"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border p-4" style={{ borderColor: "#edf1f6" }}>
                <p className="mb-3 text-xs font-black" style={{ color: B.navy }}>Recent Leads</p>
                <div className="space-y-3">
                  {[
                    ["Jordan Miles", "NFC", "New", B.orange],
                    ["Sara Patel", "QR", "Contacted", B.blue],
                    ["Leo Bennett", "Profile", "Qualified", B.green],
                  ].map(([name, source, status, color]) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ background: B.navy }}>{name.split(" ").map(x => x[0]).join("")}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black" style={{ color: B.navy }}>{name}</p>
                        <p className="text-[9px] font-semibold" style={{ color: B.slate }}>{source}</p>
                      </div>
                      <span className="rounded-full px-2 py-1 text-[8px] font-black text-white" style={{ background: color }}>{status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-4 text-white" style={{ background: `linear-gradient(160deg, ${B.navy}, ${B.navyDark})` }}>
                <p className="mb-3 text-xs font-black">Quick Actions</p>
                <div className="space-y-2">
                  {quickActions.map((action) => (
                    <div key={action} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-[10px] font-bold">
                      {action}<ChevronRight className="h-3 w-3 text-white/50" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
              {[
                ["1", "Share", "Tap NFC or scan QR"],
                ["2", "Connect", "Profile opens instantly"],
                ["3", "Capture", "Lead saved automatically"],
                ["4", "Follow up", "Book or message"],
                ["5", "Grow", "Measure what works"],
              ].map(([n, title, text]) => (
                <div key={title} className="rounded-xl border p-3" style={{ borderColor: "#edf1f6", background: "#fbfcfe" }}>
                  <span className="text-[10px] font-black text-orange-500">0{n}</span>
                  <p className="mt-1 text-xs font-black" style={{ color: B.navy }}>{title}</p>
                  <p className="mt-0.5 text-[9px] leading-snug" style={{ color: B.slate }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    </motion.div>
  );
}

function ProfileCard() {
  return (
    <motion.div {...reveal} className="lg:col-span-3">
      <Shell>
        <div className="p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500"><Briefcase className="h-5 w-5" /></div>
            <div><h3 className="font-black" style={{ color: B.navy }}>Professional Profile</h3><p className="text-sm" style={{ color: B.slate }}>Everything someone needs to connect with you.</p></div>
          </div>

          <div className="overflow-visible rounded-2xl border bg-white" style={{ borderColor: "#e7ecf3" }}>
            <div className="relative h-20 rounded-t-2xl" style={{ background: `linear-gradient(135deg, ${B.navy}, ${B.navyLight} 60%, ${B.blue})` }}>
              <div className="absolute inset-0 rounded-t-2xl opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
              <div className="absolute -bottom-8 left-5 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-orange-500 to-amber-300 text-lg font-black text-white shadow-lg">AR</div>
            </div>

            <div className="px-5 pb-5 pt-10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-1.5"><p className="text-lg font-black" style={{ color: B.navy }}>Alex Rivera</p><Check className="h-4 w-4 rounded-full bg-blue-500 p-[2px] text-white" /></div>
                  <p className="text-xs font-semibold" style={{ color: B.slate }}>Brand Strategist · Rivera Studio</p>
                  <p className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: B.slate }}><MapPin className="h-3 w-3" /> Austin, TX</p>
                </div>
                <button className="rounded-xl bg-[#0b2149] px-3 py-2 text-[10px] font-black text-white">Save Contact</button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Branding", "Strategy", "Web Design"].map((x) => <span key={x} className="rounded-full bg-orange-50 px-2 py-1 text-[9px] font-black text-orange-500">{x}</span>)}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1 rounded-xl bg-orange-500 py-2.5 text-[10px] font-black text-white"><Calendar className="h-3 w-3" /> Book Appointment</button>
                <button className="rounded-xl border py-2.5 text-[10px] font-black" style={{ borderColor: "#e7ecf3", color: B.navy }}>Share Profile</button>
              </div>

              <div className="mt-3 flex justify-center gap-2">
                {[Phone, MessageCircle, Mail].map((Icon, i) => <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border" style={{ borderColor: "#e7ecf3", color: B.navy }}><Icon className="h-3.5 w-3.5" /></div>)}
              </div>
            </div>
          </div>
        </div>
      </Shell>
    </motion.div>
  );
}

function NfcCard() {
  return (
    <motion.div {...reveal} className="lg:col-span-3">
      <Shell className="h-full">
        <div className="p-5">
          <div className="mb-4 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500"><Wifi className="h-5 w-5" /></div><div><h3 className="font-black" style={{ color: B.navy }}>One-Tap NFC + QR</h3><p className="text-sm" style={{ color: B.slate }}>Share your business in seconds.</p></div></div>
          <div className="flex min-h-[220px] items-center justify-around rounded-2xl border bg-[#fbfcfe] p-5" style={{ borderColor: "#e7ecf3" }}>
            <motion.div animate={{ y: [0, -5, 0], rotate: [-5, -2, -5] }} transition={{ duration: 3, repeat: Infinity }} className="relative h-24 w-36 rounded-xl p-3 text-white shadow-xl" style={{ background: `linear-gradient(145deg, ${B.navyDark}, ${B.navyLight})`, boxShadow: "0 18px 36px rgba(7,26,61,.25), inset 0 1px 0 rgba(255,255,255,.12)" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-lg font-black">∞</div><p className="mt-2 text-xs font-black">Bingoo</p><Wifi className="absolute right-3 top-3 h-4 w-4 text-orange-400" />
            </motion.div>
            <div className="flex gap-1">{[0,1,2].map(i => <motion.span key={i} animate={{ opacity: [.2,1,.2], scale: [.8,1.2,.8] }} transition={{ repeat: Infinity, duration: 1.4, delay: i*.18 }} className="h-2 w-2 rounded-full bg-orange-500" />)}</div>
            <div className="rounded-2xl border-2 bg-white p-2" style={{ borderColor: B.navy }}><QrCode className="h-20 w-20" style={{ color: B.navy }} /></div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2"><Check className="h-4 w-4 text-emerald-600" /><span className="text-xs font-black" style={{ color: B.navy }}>Profile opened instantly</span></div>
        </div>
      </Shell>
    </motion.div>
  );
}

function LeadCard() {
  const leads = [["Jordan Miles","NFC","New",B.orange],["Sara Patel","QR","Contacted",B.blue],["Leo Bennett","Profile","Qualified",B.green]];
  return (
    <motion.div {...reveal} className="lg:col-span-2">
      <Shell className="h-full"><div className="p-5"><div className="mb-4 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><Users className="h-5 w-5" /></div><div><h3 className="font-black" style={{ color:B.navy }}>Lead Management</h3><p className="text-sm" style={{ color:B.slate }}>Know who connected and what to do next.</p></div></div>
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2"><Bell className="h-4 w-4 text-orange-500" /><span className="text-[10px] font-black" style={{ color:B.navy }}>New lead captured automatically</span></div>
      <div className="space-y-2">{leads.map(([name,source,status,color]) => <div key={name} className="rounded-xl border p-3" style={{ borderColor:"#edf1f6" }}><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-black text-white" style={{ background:B.navy }}>{name.split(" ").map(x=>x[0]).join("")}</div><div className="min-w-0 flex-1"><p className="text-xs font-black" style={{ color:B.navy }}>{name}</p><p className="text-[9px]" style={{ color:B.slate }}>{source} connection</p></div><span className="rounded-full px-2 py-1 text-[8px] font-black text-white" style={{ background:color }}>{status}</span></div></div>)}</div></div></Shell>
    </motion.div>
  );
}

function AppointmentCard() {
  return (
    <motion.div {...reveal} className="lg:col-span-2"><Shell className="h-full"><div className="p-5"><div className="mb-4 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500"><Calendar className="h-5 w-5" /></div><div><h3 className="font-black" style={{ color:B.navy }}>Appointments</h3><p className="text-sm" style={{ color:B.slate }}>Let prospects choose a time that works.</p></div></div>
      <div className="rounded-2xl border p-4" style={{ borderColor:"#edf1f6" }}><div className="mb-3 flex items-center justify-between"><span className="text-xs font-black" style={{ color:B.navy }}>August 2026</span><span className="text-[10px]" style={{ color:B.slate }}>‹  ›</span></div><div className="grid grid-cols-7 gap-1 text-center">{["M","T","W","T","F","S","S"].map((d,i)=><span key={i} className="text-[8px] font-bold" style={{ color:B.slate }}>{d}</span>)}{Array.from({length:14}).map((_,i)=><span key={i} className={`rounded-md py-1 text-[9px] font-bold ${i===3?"bg-orange-500 text-white":""}`} style={i===3?{}:{color:B.navy}}>{i+4}</span>)}</div></div>
      <p className="mb-2 mt-3 text-[9px] font-black uppercase tracking-wide" style={{ color:B.slate }}>Available Aug 7</p><div className="grid grid-cols-3 gap-2">{["9:00 AM","11:30 AM","2:00 PM"].map((t,i)=><div key={t} className="rounded-lg border py-2 text-center text-[9px] font-black" style={{ borderColor:i===1?B.orange:"#e7ecf3", color:i===1?B.orange:B.navy }}>{t}</div>)}</div><div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700"><Check className="h-4 w-4" /> Booking confirmed</div></div></Shell></motion.div>
  );
}

function AnalyticsCard() {
  return (
    <motion.div {...reveal} className="lg:col-span-2"><Shell className="h-full"><div className="p-5"><div className="mb-4 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500"><BarChart3 className="h-5 w-5" /></div><div><h3 className="font-black" style={{ color:B.navy }}>Analytics</h3><p className="text-sm" style={{ color:B.slate }}>See what people tap, scan and respond to.</p></div></div>
      <div className="grid grid-cols-2 gap-2">{[["NFC Taps","486",B.orange],["QR Scans","312",B.blue],["Profile Views","1,253",B.navy],["Conversion","24%",B.green]].map(([l,v,c])=><div key={l} className="rounded-xl border p-3" style={{ borderColor:"#edf1f6" }}><p className="text-lg font-black" style={{ color:c }}>{v}</p><p className="text-[9px] font-semibold" style={{ color:B.slate }}>{l}</p></div>)}</div>
      <div className="mt-3 flex h-24 items-end gap-2 rounded-xl border p-3" style={{ borderColor:"#edf1f6" }}>{[42,70,52,82,64,92,75].map((h,i)=><motion.div key={i} initial={{height:0}} whileInView={{height:`${h}%`}} viewport={{once:true}} transition={{delay:i*.05}} className="flex-1 rounded-t bg-orange-500" />)}</div></div></Shell></motion.div>
  );
}

function GoogleMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.5 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.93 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 16.09 2 19.94 2 24s.85 7.91 2.34 11.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 3.18 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function AppleMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 12.04c-.03-2.6 2.13-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.05-.92-3.37-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.88 2.66 3.22 2.61 1.29-.05 1.78-.83 3.34-.83 1.55 0 2 .83 3.37.81 1.39-.03 2.27-1.28 3.12-2.54.98-1.45 1.38-2.85 1.4-2.92-.03-.01-2.69-1.03-2.71-4.09zM14.6 4.59c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.26.68-2.99 1.54-.66.76-1.23 1.98-1.08 3.15 1.14.09 2.3-.58 3.01-1.44z" />
    </svg>
  );
}

function WalletCard() {
  return (
    <motion.div {...reveal} className="lg:col-span-3">
      <Shell className="h-full">
        <div className="p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600"><Wallet className="h-5 w-5" /></div>
            <div>
              <h3 className="font-black" style={{ color: B.navy }}>Digital Wallet</h3>
              <p className="text-sm" style={{ color: B.slate }}>Your professional identity, always with you.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Google Wallet — available */}
            <div className="flex items-center gap-3 rounded-2xl border bg-white p-4" style={{ borderColor: "#e7ecf3" }}>
              <GoogleMark size={22} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-900">Google Wallet</p>
                <p className="text-[11px] font-medium" style={{ color: B.slate }}>Add to Google Wallet</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0" style={{ color: B.slate }} />
            </div>
            {/* Apple Wallet — coming soon */}
            <div className="flex items-center gap-3 rounded-2xl bg-[#111111] p-4 text-white">
              <AppleMark size={20} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white">Apple Wallet</p>
                <span className="mt-0.5 inline-block rounded-full bg-white px-2 py-0.5 text-[9px] font-black text-slate-700">Coming Soon</span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
            </div>
          </div>
        </div>
      </Shell>
    </motion.div>
  );
}

function AssetCard() {
  const steps = [[Wifi,"NFC Device",B.orange],[Briefcase,"Asset",B.navy],[Shield,"Lost Mode",B.red],[Phone,"Finder contacts owner",B.green]];
  return (
    <motion.div {...reveal} className="lg:col-span-3"><Shell><div className="p-5"><div className="mb-4 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500"><Shield className="h-5 w-5" /></div><div><h3 className="font-black" style={{ color:B.navy }}>Asset Protection</h3><p className="text-sm" style={{ color:B.slate }}>Attach Bingoo NFC to valuables and help them find their way home.</p></div></div>
      <div className="grid grid-cols-4 gap-2 rounded-2xl border p-4" style={{ borderColor:"#edf1f6" }}>{steps.map(([Icon,label,color],i)=><div key={label} className="relative text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full" style={{ background:`${color}14`, color }}><Icon className="h-4 w-4" /></div><p className="mt-2 text-[9px] font-black leading-tight" style={{ color:B.navy }}>{label}</p>{i<3&&<ChevronRight className="absolute -right-2 top-3 h-3 w-3 text-slate-300" />}</div>)}</div><div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2"><Bell className="h-4 w-4 text-red-500" /><div><p className="text-[10px] font-black text-red-600">Lost Mode activated</p><p className="text-[9px]" style={{ color:B.slate }}>Finder can contact the owner safely.</p></div></div></div></Shell></motion.div>
  );
}

export default function EverythingInOnePlace() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
      <div className="pointer-events-none absolute inset-0"><div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-orange-100/40 blur-3xl" /><div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" /></div>
      <div className="relative mx-auto max-w-7xl">
        <motion.div {...reveal} className="mb-10 text-center md:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-black text-orange-500"><Sparkles className="h-4 w-4" /> One Connected Platform</div>
          <h2 className="text-3xl font-black tracking-tight md:text-5xl" style={{ color:B.navy }}>Everything in One Place</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed md:text-lg" style={{ color:B.slate }}>Share your profile, capture leads, book appointments, understand engagement and protect valuable assets — without jumping between different tools.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6 md:gap-5">
          <DashboardShowcase />
          <ProfileCard />
          <NfcCard />
          <LeadCard />
          <AppointmentCard />
          <AnalyticsCard />
          <WalletCard />
          <AssetCard />
        </div>

        <motion.div {...reveal} className="mt-5 grid grid-cols-2 gap-2 rounded-3xl border bg-white p-4 md:grid-cols-5" style={{ borderColor:"#e7ecf3", boxShadow:"0 10px 30px rgba(11,33,73,.05)" }}>
          {[
            [Wifi,"One Tap","Share in seconds"],
            [Users,"More Leads","Capture every opportunity"],
            [BarChart3,"Smart Insights","Know what works"],
            [Calendar,"More Bookings","Automate your schedule"],
            [Shield,"Protect Assets","Peace of mind"],
          ].map(([Icon,title,text])=><div key={title} className="flex items-center gap-3 rounded-2xl px-3 py-2"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500"><Icon className="h-4 w-4" /></div><div><p className="text-xs font-black" style={{ color:B.navy }}>{title}</p><p className="text-[9px]" style={{ color:B.slate }}>{text}</p></div></div>)}
        </motion.div>
      </div>
    </section>
  );
}