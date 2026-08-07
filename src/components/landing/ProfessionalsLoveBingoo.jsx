import { motion } from "framer-motion";
import {
  Award,
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  Home,
  Scale,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

const metrics = [
  { target: 50000, suffix: "+", label: "Profiles Created", format: "k" },
  { target: 12000, suffix: "+", label: "Leads Captured", format: "k" },
  { target: 40, suffix: "+", label: "Countries Served", format: "" },
  { target: 999, suffix: "%", label: "Platform Uptime", format: "percent" },
];

function CountUp({ target, format, suffix }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setVal(Math.floor(target * ease));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  let display;
  if (format === "k") {
    display = val >= 1000 ? Math.floor(val / 1000) + "K" : val + "";
  } else if (format === "percent") {
    display = (val / 10).toFixed(1);
  } else {
    display = val + "";
  }

  return <span ref={ref}>{display}{suffix}</span>;
}

const testimonials = [
  {
    initials: "AC",
    name: "Avery Collins",
    role: "Real Estate Advisor",
    company: "Northline Realty",
    badge: "Real Estate",
    color: B.blue,
    quote: "Bingoo makes networking much easier. I can share my profile, capture the lead and follow up without juggling different tools.",
  },
  {
    initials: "MB",
    name: "Maya Bennett",
    role: "Business Consultant",
    company: "Bennett Strategy Group",
    badge: "Consulting",
    color: B.orange,
    quote: "The biggest difference is that a tap does not end with a digital card. The connection actually becomes something I can manage.",
  },
  {
    initials: "JB",
    name: "Jordan Brooks",
    role: "Creative Director",
    company: "Studio North",
    badge: "Creative",
    color: B.gold,
    quote: "My portfolio, booking link and contact information are all in one place. It makes every introduction feel more professional.",
  },
  {
    initials: "SC",
    name: "Sophia Carter",
    role: "Attorney",
    company: "Carter Legal Group",
    badge: "Legal",
    color: B.navy,
    quote: "Prospective clients can quickly understand what I do, request a consultation and leave their information without a long back-and-forth.",
  },
  {
    initials: "MR",
    name: "Marcus Reed",
    role: "Sales Director",
    company: "Vertex Solutions",
    badge: "Sales",
    color: B.green,
    quote: "The analytics help us understand where our connections are coming from and which interactions are producing real leads.",
  },
  {
    initials: "OP",
    name: "Olivia Parker",
    role: "Founder",
    company: "Parker & Co.",
    badge: "Business",
    color: B.orangeLight,
    quote: "Bingoo gives us one consistent way to share our team, services and contact information wherever we meet clients.",
  },
];

const industries = [
  { icon: Scale, label: "Law" },
  { icon: Home, label: "Real Estate" },
  { icon: HeartPulse, label: "Healthcare" },
  { icon: Briefcase, label: "Consulting" },
  { icon: BarChart3, label: "Sales" },
  { icon: Sparkles, label: "Creative" },
  { icon: Store, label: "Hospitality" },
  { icon: Users, label: "Finance" },
  { icon: GraduationCap, label: "Education" },
  { icon: ShoppingBag, label: "Small Business" },
  { icon: Building2, label: "Enterprise" },
  { icon: Calendar, label: "Events" },
];

const outcomes = [
  {
    icon: Sparkles,
    title: "Make every introduction count",
    text: "Give people one clear place to understand who you are, what you offer and how to reach you.",
    color: B.orange,
  },
  {
    icon: Briefcase,
    title: "Keep opportunities organized",
    text: "Capture leads, track their source and follow up without losing the conversation.",
    color: B.blue,
  },
  {
    icon: Award,
    title: "Look more professional",
    text: "Use one polished digital identity across NFC, QR, wallet and your public profile.",
    color: B.navy,
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="h-3 w-3 fill-current" style={{ color: B.gold }} />
      ))}
    </div>
  );
}

export default function ProfessionalsLoveBingoo() {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 md:px-6 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-blue-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Headline */}
        <motion.div {...reveal} className="mb-12 text-center md:mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-black text-orange-500">
            <Star className="h-3.5 w-3.5 fill-current" /> PROFESSIONALS LOVE BINGOO
          </div>
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl" style={{ color: B.navy }}>
            Built for the way <span style={{ color: B.orange }}>professionals connect.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: B.slate }}>
            From solo professionals to growing teams, Bingoo helps people share faster, stay organized and turn more introductions into real business opportunities.
          </p>
        </motion.div>

        {/* Metrics strip */}
        <motion.div {...reveal} className="mb-16 md:mb-20">
          <div className="grid grid-cols-2 gap-4 rounded-3xl border p-6 md:grid-cols-4 md:p-8" style={{ borderColor: "#e7ecf3", background: "linear-gradient(145deg, #fbfcfe, #f5f7fb)", boxShadow: "0 8px 32px rgba(11,33,73,.04)" }}>
            {metrics.map((m, i) => (
              <div key={m.label} className="relative text-center">
                {i > 0 && <div className="absolute left-0 top-1/2 hidden h-12 w-px -translate-y-1/2 md:block" style={{ background: "rgba(11,33,73,.06)" }} />}
                <p className="text-3xl font-black tracking-tight md:text-4xl" style={{ background: `linear-gradient(135deg, ${B.navy} 0%, ${B.orange} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  <CountUp target={m.target} format={m.format} suffix={m.suffix} />
                </p>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide md:text-sm" style={{ color: B.slate }}>{m.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial cards */}
        <motion.div
          className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}
              className="flex flex-col rounded-2xl border bg-white p-6"
              style={{ borderColor: "#e7ecf3", boxShadow: "0 8px 28px rgba(11,33,73,.05)" }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: `linear-gradient(135deg, ${t.color}, ${B.navyLight})` }}>
                  {t.initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black" style={{ color: B.navy }}>{t.name}</p>
                  <p className="text-xs" style={{ color: B.slate }}>{t.role}</p>
                </div>
              </div>
              <Stars />
              <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: "#334155" }}>
                {t.quote}
              </p>
              <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: "#edf1f6" }}>
                <span className="text-xs font-bold" style={{ color: B.slate }}>{t.company}</span>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black text-white" style={{ background: t.color }}>{t.badge}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Industry trust row */}
        <motion.div {...reveal} className="mb-16 text-center md:mb-20">
          <p className="mb-5 text-xs font-black uppercase tracking-[0.2em]" style={{ color: B.orange }}>
            Built for professionals across industries
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {industries.map((ind) => (
              <div key={ind.label} className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-2" style={{ borderColor: "#e7ecf3", boxShadow: "0 2px 8px rgba(11,33,73,.03)" }}>
                <ind.icon className="h-3.5 w-3.5" style={{ color: B.orange }} />
                <span className="text-xs font-bold" style={{ color: B.navy }}>{ind.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Outcome cards */}
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {outcomes.map((o) => (
            <motion.div
              key={o.title}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}
              className="rounded-3xl border bg-white p-6"
              style={{ borderColor: "#e7ecf3", boxShadow: "0 12px 40px rgba(11,33,73,.05)" }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${o.color}14`, color: o.color }}>
                <o.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-black" style={{ color: B.navy }}>{o.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: B.slate }}>{o.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}