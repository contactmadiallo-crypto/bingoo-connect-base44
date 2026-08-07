import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Camera,
  Check,
  ChevronRight,
  Laptop,
  Luggage,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Shield,
  ShieldCheck,
  Tag,
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

/* Lost Mode phone mockup — Bingoo visual language */
function LostModePhone() {
  return (
    <div className="relative mx-auto" style={{ width: 260 }}>
      {/* Glow */}
      <div className="absolute -inset-6 rounded-[3rem] pointer-events-none" style={{ background: `radial-gradient(circle, ${B.orange}18 0%, transparent 70%)` }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[2.2rem] border-[3px] p-1.5"
        style={{ borderColor: B.navyLight, background: `linear-gradient(145deg, ${B.navyDark}, ${B.navy})`, boxShadow: "0 30px 60px rgba(11,33,73,.5), 0 0 0 1px rgba(255,255,255,.04) inset" }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-1.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full" style={{ background: B.navyDark }} />

        {/* Screen */}
        <div className="overflow-hidden rounded-[1.8rem]" style={{ background: "#fbfcfe" }}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 pt-5 pb-1">
            <span className="text-[9px] font-bold" style={{ color: B.slate }}>9:41</span>
            <div className="flex items-center gap-1">
              <span className="text-[8px]" style={{ color: B.slate }}>●●●</span>
            </div>
          </div>

          {/* Alert banner */}
          <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: `${B.orange}12`, border: `1px solid ${B.orange}40` }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: B.orange }}
            >
              <Shield className="h-3 w-3 text-white" />
            </motion.div>
            <div>
              <p className="text-[9px] font-black" style={{ color: B.orange }}>LOST MODE ACTIVE</p>
              <p className="text-[8px]" style={{ color: B.slate }}>This item is reported lost</p>
            </div>
          </div>

          {/* Asset card */}
          <div className="mx-3 mb-3">
            <div className="flex items-center gap-2.5 rounded-xl border p-2" style={{ borderColor: "#edf1f6" }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${B.navy}10`, color: B.navy }}>
                <Luggage className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black" style={{ color: B.navy }}>Travel Suitcase</p>
                <p className="text-[8px]" style={{ color: B.slate }}>BG-DEMO-104</p>
              </div>
              <span className="rounded-full px-1.5 py-0.5 text-[7px] font-black text-white" style={{ background: B.orange }}>LOST</span>
            </div>
          </div>

          {/* Owner message */}
          <div className="mx-3 mb-3 rounded-xl border p-2.5" style={{ borderColor: "#edf1f6" }}>
            <p className="mb-1 text-[7px] font-black uppercase tracking-wide" style={{ color: B.slate }}>Owner message</p>
            <p className="text-[8px] leading-snug" style={{ color: B.navy }}>
              “Hi! If you found this item, please reach out — I'd love to get it back. Thank you so much.”
            </p>
          </div>

          {/* Actions */}
          <div className="mx-3 mb-3 grid grid-cols-2 gap-1.5">
            <div className="flex items-center justify-center gap-1 rounded-lg py-1.5" style={{ background: `linear-gradient(135deg, ${B.green}, #16a34a)` }}>
              <MessageCircle className="h-2.5 w-2.5 text-white" />
              <span className="text-[7px] font-black text-white">Contact Owner</span>
            </div>
            <div className="flex items-center justify-center gap-1 rounded-lg py-1.5 border" style={{ borderColor: B.green, color: B.green }}>
              <MessageCircle className="h-2.5 w-2.5" />
              <span className="text-[7px] font-black">WhatsApp</span>
            </div>
            <div className="flex items-center justify-center gap-1 rounded-lg py-1.5 border" style={{ borderColor: B.blue, color: B.blue }}>
              <Mail className="h-2.5 w-2.5" />
              <span className="text-[7px] font-black">Email</span>
            </div>
            <div className="flex items-center justify-center gap-1 rounded-lg py-1.5 border" style={{ borderColor: B.orange, color: B.orange }}>
              <Check className="h-2.5 w-2.5" />
              <span className="text-[7px] font-black">Report Found</span>
            </div>
          </div>

          {/* Privacy indicator */}
          <div className="mx-3 mb-3 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
            <ShieldCheck className="h-2.5 w-2.5" style={{ color: B.green }} />
            <span className="text-[7px] font-bold" style={{ color: B.slate }}>Owner privacy protected</span>
          </div>

          {/* Footer line */}
          <div className="px-3 pb-3 text-center">
            <p className="text-[7px] font-semibold" style={{ color: B.slate }}>Powered by Bingoo Connect</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const recoverySteps = [
  {
    n: 1,
    icon: Tag,
    title: "ATTACH",
    text: "Attach a Bingoo NFC device to your asset.",
    color: B.orange,
    visual: (
      <div className="flex items-center justify-center gap-1.5 py-1">
        <div className="flex h-7 w-9 items-center justify-center rounded-md text-white" style={{ background: `linear-gradient(145deg, ${B.navyDark}, ${B.navyLight})` }}><span className="text-[8px] font-black">∞</span></div>
        <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
        <Luggage className="h-5 w-5" style={{ color: B.navy }} />
      </div>
    ),
  },
  {
    n: 2,
    icon: ShieldCheck,
    title: "PROTECT",
    text: "Assign the device to the asset in Bingoo.",
    color: B.green,
    visual: (
      <div className="flex items-center justify-center gap-1.5 py-1">
        <div className="flex h-7 w-9 items-center justify-center rounded-md text-white" style={{ background: `linear-gradient(145deg, ${B.navyDark}, ${B.navyLight})` }}><span className="text-[8px] font-black">∞</span></div>
        <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
        <span className="rounded-full px-1.5 py-0.5 text-[7px] font-black text-white" style={{ background: B.green }}>Protected</span>
      </div>
    ),
  },
  {
    n: 3,
    icon: Shield,
    title: "LOST MODE",
    text: "If the asset is lost, activate Lost Mode.",
    color: B.red,
    visual: (
      <div className="flex items-center justify-center gap-1.5 py-1">
        <span className="rounded-full px-1.5 py-0.5 text-[7px] font-black text-white" style={{ background: B.green }}>Protected</span>
        <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
        <span className="rounded-full px-1.5 py-0.5 text-[7px] font-black text-white" style={{ background: B.orange }}>Lost Mode Active</span>
      </div>
    ),
  },
  {
    n: 4,
    icon: Wifi,
    title: "FINDER TAPS",
    text: "The finder taps or scans the Bingoo device.",
    color: B.blue,
    visual: (
      <div className="flex items-center justify-center gap-1.5 py-1">
        <div className="relative flex items-center">
          {[0, 1].map((i) => (
            <motion.span key={i} className="absolute left-0 rounded-full border" style={{ width: 6 + i * 6, height: 6 + i * 6, borderColor: `${B.orange}55` }} animate={{ scale: [0.6, 1.1, 0.6], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} />
          ))}
          <Wifi className="relative z-10 h-3 w-3" style={{ color: B.orange }} />
        </div>
        <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
        <div className="flex h-6 w-4 items-center justify-center rounded-sm border" style={{ borderColor: B.navyLight }}><div className="h-4 w-2.5 rounded-sm" style={{ background: B.navy }} /></div>
      </div>
    ),
  },
  {
    n: 5,
    icon: Check,
    title: "RECONNECT",
    text: "The Lost Mode page helps the finder safely contact the owner.",
    color: B.gold,
    visual: (
      <div className="flex items-center justify-center gap-1.5 py-1">
        <span className="rounded-full px-1.5 py-0.5 text-[7px] font-bold text-white" style={{ background: B.blue }}>Finder</span>
        <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
        <span className="rounded-full px-1.5 py-0.5 text-[7px] font-bold text-white" style={{ background: B.green }}>Contact</span>
        <ChevronRight className="h-2.5 w-2.5 text-slate-300" />
        <span className="rounded-full px-1.5 py-0.5 text-[7px] font-bold text-white" style={{ background: B.navy }}>Returned</span>
      </div>
    ),
  },
];

const assets = [
  { icon: Luggage, label: "Luggage" },
  { icon: Tag, label: "Keys" },
  { icon: Package, label: "Backpack" },
  { icon: Laptop, label: "Laptop" },
  { icon: Camera, label: "Camera" },
  { icon: Briefcase, label: "Work Equipment" },
  { icon: Tag, label: "Pet Tag" },
  { icon: Wallet, label: "Wallet" },
];

export default function AssetProtectionLostMode() {
  return (
    <section className="relative overflow-hidden px-4 py-16 md:px-6 md:py-24" style={{ background: `linear-gradient(165deg, ${B.navyDark} 0%, ${B.navy} 45%, ${B.navyLight} 100%)` }}>
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${B.orange}18 0%, transparent 70%)` }} />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full blur-3xl" style={{ background: `radial-gradient(circle, ${B.gold}14 0%, transparent 70%)` }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "36px 36px" }} />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Headline */}
        <motion.div {...reveal} className="mb-12 text-center md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-black" style={{ borderColor: "rgba(255,127,39,.4)", color: B.orange, background: "rgba(255,127,39,.1)" }}>
            <Shield className="h-3.5 w-3.5" /> PROTECT YOUR ASSETS
          </div>
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">
            Lost doesn’t have to mean <span style={{ color: B.orange }}>gone.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg text-white/60">
            Attach a Bingoo NFC device to luggage, keys, equipment or other valuable items. If it is lost, Lost Mode gives the finder a safe way to contact the owner.
          </p>
        </motion.div>

        {/* Split: Phone + Recovery flow */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Left: Phone */}
          <motion.div {...reveal} className="order-1">
            <LostModePhone />
          </motion.div>

          {/* Right: Recovery steps */}
          <motion.div className="order-2" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}>
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[19px] top-2 bottom-2 w-px" style={{ background: `linear-gradient(180deg, ${B.orange}40, transparent)` }} />

              {recoverySteps.map((s) => (
                <motion.div key={s.n} variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }} className="relative mb-4 flex gap-3">
                  <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}40` }}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 rounded-2xl border p-3" style={{ borderColor: "rgba(255,255,255,.08)", background: "rgba(255,255,255,.03)" }}>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[10px] font-black" style={{ color: B.slate }}>{String(s.n).padStart(2, "0")}</span>
                      <h3 className="text-sm font-black text-white">{s.title}</h3>
                    </div>
                    <p className="mb-2 text-xs leading-snug text-white/60">{s.text}</p>
                    <div className="rounded-lg border p-1.5" style={{ borderColor: "rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
                      {s.visual}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Asset examples */}
        <motion.div {...reveal} className="mt-16 text-center md:mt-20">
          <p className="mb-5 text-xs font-black uppercase tracking-[0.2em]" style={{ color: B.gold }}>
            Protect what matters
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {assets.map((a) => (
              <div key={a.label} className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2" style={{ borderColor: "rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)" }}>
                <a.icon className="h-3.5 w-3.5" style={{ color: B.orange }} />
                <span className="text-xs font-bold text-white/80">{a.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Privacy + Finder/Owner cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
          {/* Privacy */}
          <motion.div {...reveal} className="rounded-3xl border p-6" style={{ borderColor: "rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)" }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black" style={{ background: `${B.green}22`, color: B.green }}>
              <ShieldCheck className="h-3 w-3" /> PRIVACY FIRST
            </div>
            <h3 className="mb-2 text-base font-black text-white">Help people reach you without exposing everything.</h3>
            <p className="text-sm leading-relaxed text-white/60">
              Lost Mode can provide a safe contact path while keeping the owner’s private account and dashboard information protected.
            </p>
          </motion.div>

          {/* Finder experience */}
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.05 }} className="rounded-3xl border p-6" style={{ borderColor: "rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)" }}>
            <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-white/40">What the finder sees</p>
            <h3 className="mb-3 text-sm font-black text-white">Found a Bingoo-protected item?</h3>
            <div className="mb-3 flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: "rgba(255,255,255,.08)" }}>
              <Luggage className="h-4 w-4" style={{ color: B.orange }} />
              <div>
                <p className="text-[10px] font-black text-white">Travel Suitcase</p>
                <p className="text-[8px] text-white/50">Lost Mode Active</p>
              </div>
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <span className="rounded-full px-2 py-1 text-[8px] font-black text-white" style={{ background: B.green }}>Contact Owner</span>
              <span className="rounded-full px-2 py-1 text-[8px] font-black text-white" style={{ background: B.blue }}>WhatsApp</span>
              <span className="rounded-full px-2 py-1 text-[8px] font-black text-white" style={{ background: B.orange }}>Email</span>
              <span className="rounded-full px-2 py-1 text-[8px] font-black text-white" style={{ background: B.navyLight }}>Report Found</span>
            </div>
            <p className="text-[10px] font-semibold text-emerald-400">✓ Owner privacy protected</p>
            <p className="mt-1 text-[10px] text-white/50">No Bingoo account required to help return the item.</p>
          </motion.div>

          {/* Owner experience */}
          <motion.div {...reveal} transition={{ ...reveal.transition, delay: 0.1 }} className="rounded-3xl border p-6" style={{ borderColor: "rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)" }}>
            <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-white/40">What the owner sees</p>
            <h3 className="mb-3 text-sm font-black text-white">My Assets</h3>
            <div className="mb-3 flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: "rgba(255,255,255,.08)" }}>
              <Luggage className="h-4 w-4 text-white/70" />
              <div className="flex-1">
                <p className="text-[10px] font-black text-white">Travel Suitcase</p>
                <p className="text-[8px] text-white/50">NFC Device Connected · Lost Mode: Active</p>
              </div>
            </div>
            <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-white/40">Finder report</p>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5"><Check className="h-2.5 w-2.5 text-emerald-400" /><span className="text-[10px] text-white/70">Item Found</span></div>
              <div className="flex items-center gap-1.5"><MapPin className="h-2.5 w-2.5 text-emerald-400" /><span className="text-[10px] text-white/70">Location shared</span></div>
              <div className="flex items-center gap-1.5"><MessageCircle className="h-2.5 w-2.5 text-emerald-400" /><span className="text-[10px] text-white/70">Message received</span></div>
            </div>
          </motion.div>
        </div>

        {/* Value statement + CTA */}
        <motion.div {...reveal} className="mt-16 text-center md:mt-20">
          <h3 className="mx-auto max-w-2xl text-2xl font-black leading-tight text-white md:text-3xl">
            ONE NFC DEVICE. <span style={{ color: B.orange }}>A BETTER CHANCE OF GETTING IT BACK.</span>
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60">
            From travel luggage to business equipment, Bingoo gives physical assets a digital identity that can help them find their way home.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <motion.a href="/my-nfc-devices" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-black text-white" style={{ background: B.orange, boxShadow: `0 8px 24px ${B.orange}40` }}>
              <Shield className="h-4 w-4" /> Protect an Asset <ArrowRight className="h-4 w-4" />
            </motion.a>
            <motion.a href="/shop" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-black" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.2)", color: "#fff" }}>
              Get an NFC Device <ArrowRight className="h-4 w-4" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}