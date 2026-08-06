import { motion } from "framer-motion";
import {
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";

const ORANGE = "#f97316";
const NAVY = "#0b2149";

export function ProductProfileScreen() {
  return (
    <div className="min-h-[276px] bg-[#f4f7fb]">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#071A3D] via-[#0b2149] to-[#164387] px-3 pb-3 pt-3 text-center">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "15px 15px" }} />
        <span className="relative inline-flex rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[6px] font-black tracking-[.13em] text-white/65">FICTIONAL DEMO</span>
        <div className="relative mx-auto mt-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-300 text-[12px] font-black text-white shadow-lg">JR</div>
        <p className="relative mt-1.5 text-[11px] font-black text-white">Jordan Reed</p>
        <p className="relative text-[7px] text-white/55">Creative Director · Northstar Studio</p>
        <div className="relative mt-2 flex justify-center gap-1.5">
          {[Phone, Mail, MessageCircle, Globe2].map((Icon, index) => (
            <div key={index} className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"><Icon className="h-3 w-3" /></div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 px-3 py-2.5">
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5"><BriefcaseBusiness className="h-3 w-3 text-orange-500" /><span className="text-[8px] font-black text-slate-800">About</span></div>
          <p className="text-[7px] leading-relaxed text-slate-500">Helping brands turn ideas into memorable digital experiences.</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button className="rounded-lg bg-orange-500 py-2 text-[8px] font-black text-white">Book a Call</button>
          <button className="rounded-lg border border-slate-200 bg-white py-2 text-[8px] font-black text-[#0b2149]">Save Contact</button>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2">
          <div className="flex items-center justify-between"><span className="text-[7px] font-bold text-slate-500">Services</span><span className="text-[7px] font-black text-orange-500">View all</span></div>
          <div className="mt-1.5 flex gap-1">
            {["Branding", "Web", "Strategy"].map((item) => <span key={item} className="rounded-full bg-slate-100 px-1.5 py-1 text-[6px] font-bold text-slate-500">{item}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductLostModeScreen() {
  return (
    <div className="min-h-[276px] bg-[#f4f7fb]">
      <div className="bg-gradient-to-br from-orange-500 to-orange-400 px-3 pb-3 pt-3 text-center">
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-white/20"><ShieldCheck className="h-4 w-4 text-white" /></div>
        <p className="mt-1.5 text-[11px] font-black text-white">This item has been reported lost</p>
        <p className="mt-0.5 text-[7px] text-white/80">Please help return it to its owner.</p>
        <span className="mt-1.5 inline-flex rounded-full bg-white/20 px-2 py-1 text-[7px] font-black text-white">CODE BG-DEMO-104</span>
      </div>

      <div className="space-y-2 px-3 py-2.5">
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <p className="text-[6px] font-black tracking-[.12em] text-slate-400">DEVICE</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-base">🧳</div>
            <div><p className="text-[9px] font-black text-slate-800">Travel Suitcase</p><p className="text-[7px] text-slate-400">NFC Card · Active</p></div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <p className="text-[6px] font-black tracking-[.12em] text-slate-400">CONTACT OWNER</p>
          <div className="mt-1.5 space-y-1.5">
            <button className="flex w-full items-center gap-2 rounded-lg bg-orange-500 px-2 py-2 text-left text-white"><Phone className="h-3 w-3" /><span className="text-[8px] font-black">Call securely</span></button>
            <button className="flex w-full items-center gap-2 rounded-lg bg-emerald-500 px-2 py-2 text-left text-white"><MessageCircle className="h-3 w-3" /><span className="text-[8px] font-black">WhatsApp</span></button>
            <button className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-2 text-left text-slate-700"><Mail className="h-3 w-3" /><span className="text-[8px] font-black">Send email</span></button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 rounded-lg bg-emerald-50 py-1.5 text-[7px] font-black text-emerald-700"><ShieldCheck className="h-3 w-3" /> Owner privacy protected</div>
      </div>
    </div>
  );
}

export function ProductAnalyticsScreen() {
  const bars = [34, 58, 45, 77, 63, 94, 71];
  return (
    <div className="min-h-[276px] bg-gradient-to-br from-[#13284f] to-[#071A3D]">
      <div className="px-3 pb-2 pt-3">
        <div className="flex items-start justify-between"><div><p className="text-[10px] font-black text-white">Overview</p><p className="text-[7px] text-white/40">Last 7 days</p></div><span className="rounded-lg bg-emerald-500/15 px-1.5 py-1 text-[7px] font-black text-emerald-300">+24%</span></div>
      </div>

      <div className="grid grid-cols-3 gap-1 px-3">
        {[[Wifi,"412","Taps"],[QrCode,"287","Scans"],[Users,"86","Leads"]].map(([Icon,value,label]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-center"><Icon className="mx-auto h-3 w-3 text-orange-400" /><p className="mt-0.5 text-[9px] font-black text-white">{value}</p><p className="text-[6px] text-white/35">{label}</p></div>
        ))}
      </div>

      <div className="px-3 pt-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-2">
          <div className="mb-1 flex items-center justify-between"><span className="text-[7px] font-bold text-white/50">Engagement</span><span className="text-[9px] font-black text-white">785</span></div>
          <div className="flex h-14 items-end gap-1">
            {bars.map((height,index) => <motion.div key={index} initial={{height:0}} whileInView={{height:`${height}%`}} viewport={{once:true}} transition={{delay:index*.05,duration:.4}} className="flex-1 rounded-t" style={{background:index===5?ORANGE:"rgba(253,186,33,.55)"}} />)}
          </div>
        </div>
      </div>

      <div className="space-y-1 px-3 pt-2">
        {[[Calendar,"Appointments","12"],[BarChart3,"Conversion","18.4%"],[MapPin,"Top source","NFC"]].map(([Icon,label,value]) => (
          <div key={label} className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[.03] px-2 py-1.5"><Icon className="h-3 w-3 text-orange-400" /><span className="flex-1 text-[7px] font-semibold text-white/55">{label}</span><span className="text-[8px] font-black text-white">{value}</span></div>
        ))}
      </div>

      <div className="px-3 pb-3 pt-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2"><div className="flex h-8 w-8 items-center justify-center rounded bg-white"><QrCode className="h-5 w-5" style={{color:NAVY}} /></div><div className="flex-1"><p className="text-[8px] font-black text-white">Campaign QR</p><p className="text-[7px] text-white/35">Live attribution</p></div><BarChart3 className="h-4 w-4 text-orange-400" /></div>
      </div>
    </div>
  );
}
