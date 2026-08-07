import { motion } from "framer-motion";
import { Briefcase, Camera, Code2, QrCode, Users, Calendar, Phone, Mail, Globe2 } from "lucide-react";

const B = {
  navy: "#0b2149",
  navyDark: "#071A3D",
  navyLight: "#13284f",
  orange: "#f97316",
  gold: "#FDBA21",
  slate: "#64748b",
};

const profiles = [
  {
    category: "Professional",
    title: "Executive Premium",
    name: "James Carter",
    role: "Founder · Carter Enterprises",
    initials: "JC",
    bg: "linear-gradient(160deg,#071A3D,#13284f)",
    accent: "#f97316",
    type: "executive",
  },
  {
    category: "Creative",
    title: "Creative / Influencer",
    name: "Sophia Kim",
    role: "Content Creator",
    initials: "SK",
    bg: "linear-gradient(160deg,#ec4899,#7c3aed)",
    accent: "#ffffff",
    type: "creative",
  },
  {
    category: "Creative",
    title: "Rich Media",
    name: "Maya Rivers",
    role: "Photographer · Filmmaker",
    initials: "MR",
    bg: "linear-gradient(160deg,#111827,#4c1d95)",
    accent: "#a855f7",
    type: "media",
  },
  {
    category: "Professional",
    title: "Minimal NFC Card",
    name: "Robert Jones",
    role: "Software Engineer",
    initials: "RJ",
    bg: "#ffffff",
    accent: "#0b2149",
    type: "minimal",
  },
  {
    category: "Business",
    title: "Event Networking",
    name: "Alex Kumar",
    role: "CTO · TechStart",
    initials: "AK",
    bg: "linear-gradient(160deg,#f97316,#fb923c)",
    accent: "#ffffff",
    type: "event",
  },
  {
    category: "Business",
    title: "Business Team",
    name: "Carter Enterprises",
    role: "Technology · Consulting",
    initials: "CE",
    bg: "#ffffff",
    accent: "#f97316",
    type: "team",
  },
];

function ProfilePreview({ profile }) {
  const dark = profile.bg !== "#ffffff";
  const text = dark ? "#ffffff" : B.navy;
  const muted = dark ? "rgba(255,255,255,.62)" : "#64748b";

  if (profile.type === "event") {
    return (
      <div className="flex h-full flex-col items-center justify-between p-4 text-center" style={{ background: profile.bg, color: text }}>
        <span className="rounded-full bg-[#0b2149] px-2 py-1 text-[8px] font-black tracking-wide text-white">TECH CONF 2026</span>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-black text-orange-500">{profile.initials}</div>
        <div><p className="text-sm font-black">{profile.name}</p><p className="text-[9px] opacity-75">{profile.role}</p></div>
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white"><QrCode className="h-16 w-16 text-[#0b2149]" /></div>
        <button className="w-full rounded-xl bg-white py-2 text-[10px] font-black text-orange-500">Exchange Contact</button>
      </div>
    );
  }

  if (profile.type === "team") {
    return (
      <div className="flex h-full flex-col p-4" style={{ background: profile.bg, color: text }}>
        <div className="text-center"><p className="text-xs font-black">{profile.name}</p><p className="text-[8px] text-slate-400">{profile.role}</p></div>
        <div className="mt-4 grid grid-cols-2 gap-2">{["About","Services","Team","Portfolio","Contact","Careers"].map(x => <div key={x} className="rounded-lg border border-slate-200 py-2 text-center text-[8px] font-bold">{x}</div>)}</div>
        <div className="mt-4"><p className="text-[8px] font-black uppercase tracking-wide text-slate-400">Our Team</p><div className="mt-2 flex gap-2">{["JC","MD","SL","RK"].map((x,i)=><div key={x} className="flex h-7 w-7 items-center justify-center rounded-full text-[8px] font-black text-white" style={{ background:[B.orange,"#ef4444","#0ea5e9","#22c55e"][i] }}>{x}</div>)}</div></div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4" style={{ background: profile.bg, color: text }}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black" style={{ background: dark ? "rgba(255,255,255,.12)" : "#f1f5f9", color: dark ? "#fff" : B.navy }}>{profile.initials}</div>
      <div className="mt-3 text-center"><p className="text-sm font-black">{profile.name}</p><p className="text-[9px]" style={{ color: muted }}>{profile.role}</p></div>

      {profile.type === "creative" && (
        <div className="mt-4 grid grid-cols-4 gap-2">{[Camera, Globe2, Mail, Calendar].map((Icon,i)=><div key={i} className="flex h-9 items-center justify-center rounded-xl bg-white/15"><Icon className="h-4 w-4" /></div>)}</div>
      )}

      {profile.type === "media" && (
        <div className="mt-4 grid grid-cols-3 gap-2">{["#8b5cf6","#ec4899","#f97316","#3b82f6","#22c55e","#eab308"].map(c=><div key={c} className="h-11 rounded-xl" style={{ background:c }} />)}</div>
      )}

      {(profile.type === "executive" || profile.type === "minimal") && (
        <div className="mt-4 space-y-2">{[
          [Phone,"Call"],[Mail,"Email"],[Globe2,"Website"]
        ].map(([Icon,label])=><div key={label} className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: dark?"rgba(255,255,255,.1)":"#e2e8f0", background: dark?"rgba(255,255,255,.06)":"#f8fafc" }}><Icon className="h-3.5 w-3.5" /><span className="text-[9px] font-bold">{label}</span></div>)}</div>
      )}

      <button className="mt-auto rounded-xl py-2 text-[10px] font-black" style={{ background: dark ? "rgba(255,255,255,.14)" : B.navy, color: "#fff" }}>
        {profile.type === "media" ? "View Portfolio" : profile.type === "creative" ? "Book a Collab" : "Connect"}
      </button>
    </div>
  );
}

export default function ProfileForEveryProfession() {
  return (
    <section className="relative overflow-hidden px-4 py-16 md:px-6 md:py-24" style={{ background: B.navyDark }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, #3b82f6 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="relative mx-auto max-w-7xl">
        <motion.div initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 text-sm font-black uppercase tracking-[.18em] text-orange-400">Profile Templates</div>
            <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">A profile for every profession.</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">Choose a style that fits how you work. Every template keeps contact, booking, services and sharing easy to understand.</p>
          </div>
          <div className="flex flex-wrap gap-2">{["All","Professional","Business","Creative"].map((x,i)=><span key={x} className="rounded-full border px-4 py-2 text-xs font-black" style={{ background:i===0?B.orange:"transparent", borderColor:i===0?B.orange:"rgba(255,255,255,.16)", color:"#fff" }}>{x}</span>)}</div>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {profiles.map((profile,index)=>(
            <motion.div key={profile.title} initial={{ opacity:0,y:24 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:index*.06 }} whileHover={{ y:-8 }} className="group">
              <div className="h-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-2xl transition-transform duration-300 group-hover:scale-[1.015]">
                <ProfilePreview profile={profile} />
              </div>
              <div className="mt-3 text-center"><p className="text-sm font-black text-white">{profile.title}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/35">{profile.category}</p></div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} className="mt-12 flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[.05] p-5 backdrop-blur md:flex-row md:px-7">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white"><Users className="h-5 w-5" /></div><div><p className="font-black text-white">One profile. Your way.</p><p className="text-sm text-white/55">Switch templates without losing your links, leads or contact information.</p></div></div>
          <div className="flex items-center gap-2 text-sm font-black text-orange-400"><Briefcase className="h-4 w-4" /> Professionals · Teams · Creators · Events</div>
        </motion.div>
      </div>
    </section>
  );
}
