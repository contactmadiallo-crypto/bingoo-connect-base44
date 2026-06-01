import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, useAnimation } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const features = [
  { icon: "📇", title: "Digital Business Card", desc: "Share your full profile with one tap — no paper, no printing." },
  { icon: "📊", title: "Real-Time Analytics", desc: "See every profile view, every click, every lead — in real time." },
  { icon: "💬", title: "Instant WhatsApp", desc: "One button. Customer lands in your WhatsApp chat immediately." },
  { icon: "📅", title: "Save Contact", desc: "Visitors download your contact card directly to their phone." },
  { icon: "💼", title: "Multi-Profile Teams", desc: "One dashboard for your entire team of 50 employees." },
  { icon: "🌍", title: "Built for Africa", desc: "Designed for Senegal, Mali, Côte d'Ivoire, Ghana, and beyond." },
];

const plans = [
  { name: "Free", price: "$0", period: "", desc: "Get started today", features: ["1 profile", "Basic links", "Basic analytics", "Bingoo branding"], highlight: false },
  { name: "Pro", price: "$4.99", period: "/month", desc: "For professionals", features: ["Unlimited links", "Full analytics", "Custom colors", "Contact collection", "No Bingoo branding"], highlight: true },
  { name: "Business", price: "$9.99", period: "/month", desc: "For teams", features: ["Team accounts (up to 50)", "Lead capture CRM", "Booking system", "Priority support", "Custom domain"], highlight: false },
];

const useCases = [
  { emoji: "🏠", role: "Real Estate Agent", value: "Share listings + book viewings" },
  { emoji: "⚖️", role: "Lawyer", value: "Professional profile + consultations" },
  { emoji: "🍽️", role: "Restaurant", value: "Digital menu + table orders" },
  { emoji: "💇", role: "Barber / Salon", value: "Booking + portfolio" },
  { emoji: "📱", role: "Influencer", value: "All links + audience tracking" },
  { emoji: "🏥", role: "Doctor / Clinic", value: "Appointments + patient info" },
];

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } };

function ScrollReveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function FloatingOrb({ className, style, delay = 0 }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={style}
      animate={{ y: [0, -20, 0], scale: [1, 1.05, 1], x: [0, 15, 0] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function GradientMesh() {
  return (
    <motion.div
      className="absolute inset-0 opacity-20 pointer-events-none"
      style={{
        background: `
          radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.6), transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.4), transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.3), transparent 60%)
        `,
        backgroundSize: "200% 200%"
      }}
      animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
  );
}

function NFCTapMockup() {
  const cardCtrl = useAnimation();
  const profileCtrl = useAnimation();
  const rippleCtrl = useAnimation();
  const glowCtrl = useAnimation();

  useEffect(() => {
    let cancelled = false;
    async function loop() {
      while (!cancelled) {
        // Reset
        cardCtrl.set({ x: 90, y: -30, rotateY: 35, rotateX: -10, rotateZ: -12, z: 0, opacity: 1 });
        profileCtrl.set({ y: "100%", opacity: 0 });
        rippleCtrl.set({ scale: 0, opacity: 0 });
        glowCtrl.set({ opacity: 0, scale: 0.8 });
        await new Promise(r => setTimeout(r, 600));

        // Card floats
        await cardCtrl.start({ y: -50, rotateY: 28, rotateX: -8, transition: { duration: 1.2, ease: "easeOut" } });
        await new Promise(r => setTimeout(r, 400));

        // Card taps phone
        await cardCtrl.start({ x: 10, y: -10, rotateY: 5, rotateX: 0, rotateZ: -3, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } });

        // Ripple + glow on tap
        rippleCtrl.start({ scale: [0, 2.2], opacity: [0.7, 0], transition: { duration: 0.6, ease: "easeOut" } });
        glowCtrl.start({ opacity: [0, 0.8, 0], scale: [0.8, 1.3, 1], transition: { duration: 0.7 } });

        // Profile slides up
        await profileCtrl.start({ y: "0%", opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 } });

        await new Promise(r => setTimeout(r, 2800));

        // Card retreats
        cardCtrl.start({ x: 90, y: -30, rotateY: 35, rotateX: -10, rotateZ: -12, transition: { duration: 0.7, ease: "easeIn" } });
        // Profile slides down
        await profileCtrl.start({ y: "100%", opacity: 0, transition: { duration: 0.4, ease: "easeIn" } });

        await new Promise(r => setTimeout(r, 800));
      }
    }
    loop();
    return () => { cancelled = true; };
  }, []);

  const profileRows = [
    { delay: 0.05, content: (
      <div className="flex flex-col items-center pt-3 pb-2">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xl border-2 border-white shadow">👤</div>
        <p className="font-black text-slate-900 text-xs mt-1 leading-tight">Amadou Diallo</p>
        <p className="text-blue-600 text-[9px] font-semibold">Real Estate · Dakar</p>
      </div>
    )},
    { delay: 0.12, content: (
      <div className="grid grid-cols-3 gap-1 px-3 mb-2">
        {["💬","📞","📧"].map(ic => (
          <div key={ic} className="bg-blue-50 rounded-lg py-1.5 text-center text-sm">{ic}</div>
        ))}
      </div>
    )},
    { delay: 0.19, content: (
      <div className="px-3 space-y-1">
        {["🏠 View Listings","📅 Book Meeting"].map(b => (
          <div key={b} className="bg-slate-50 border border-slate-100 rounded-lg py-1 px-2 text-[9px] text-slate-700 font-medium text-center">{b}</div>
        ))}
      </div>
    )},
  ];

  return (
    <div className="relative flex items-center justify-center" style={{ perspective: "900px", height: 340 }}>
      {/* iPhone frame */}
      <div className="relative z-10" style={{ transformStyle: "preserve-3d" }}>
        {/* Phone body */}
        <div className="relative w-48 bg-slate-900 rounded-[2.2rem] p-[3px] shadow-2xl shadow-blue-900/60" style={{ boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
          {/* Side buttons */}
          <div className="absolute -left-[3px] top-16 w-[3px] h-7 bg-slate-700 rounded-l" />
          <div className="absolute -left-[3px] top-24 w-[3px] h-10 bg-slate-700 rounded-l" />
          <div className="absolute -right-[3px] top-20 w-[3px] h-12 bg-slate-700 rounded-r" />
          {/* Screen */}
          <div className="bg-white rounded-[2rem] overflow-hidden" style={{ minHeight: 260 }}>
            {/* Status bar */}
            <div className="bg-slate-900 flex justify-between items-center px-4 pt-2 pb-1">
              <span className="text-white text-[8px] font-semibold">9:41</span>
              <div className="w-14 h-4 bg-black rounded-full" />
              <div className="flex gap-1">
                <span className="text-white text-[8px]">●●●</span>
              </div>
            </div>
            {/* Profile area — clipping container */}
            <div className="relative overflow-hidden" style={{ minHeight: 240 }}>
              {/* Idle background */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }}>
                  <div className="w-8 h-8 rounded-full border-2 border-blue-200 flex items-center justify-center">
                    <span className="text-blue-300 text-xs">📶</span>
                  </div>
                </motion.div>
              </div>
              {/* Ripple */}
              <motion.div
                animate={rippleCtrl}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-blue-400 z-20"
              />
              {/* Profile slides up */}
              <motion.div
                animate={profileCtrl}
                className="absolute inset-0 bg-white z-10 flex flex-col"
              >
                {/* Cover */}
                <div className="h-14 bg-gradient-to-br from-blue-500 to-blue-700 relative flex-shrink-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-white border-2 border-white shadow-lg flex items-center justify-center text-xl"
                  >👤</motion.div>
                </div>
                {/* Staggered profile content */}
                <div className="pt-7">
                  {profileRows.map((row, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + row.delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {row.content}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* NFC tap glow on phone */}
        <motion.div
          animate={glowCtrl}
          className="absolute inset-0 rounded-[2.2rem] bg-blue-400/40 blur-xl -z-10"
        />
      </div>

      {/* NFC Card — 3D floating */}
      <motion.div
        animate={cardCtrl}
        className="absolute z-20 w-32 h-20 rounded-2xl shadow-2xl flex flex-col items-center justify-center cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e3a5f 100%)",
          transformStyle: "preserve-3d",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          right: 0,
          top: "15%",
        }}
      >
        {/* Card shine */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)", height: "100%" }} />
        </div>
        {/* NFC chip */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6], boxShadow: ["0 0 6px rgba(96,165,250,0.4)", "0 0 16px rgba(96,165,250,0.8)", "0 0 6px rgba(96,165,250,0.4)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-4 rounded border border-blue-400/60 bg-blue-900/50 mb-1.5"
        />
        <span className="text-white/80 text-[8px] font-bold tracking-widest">BINGOO</span>
        <span className="text-blue-400/70 text-[7px] tracking-wide">NFC · CONNECT</span>
        {/* Waves */}
        <div className="absolute right-2 top-2 flex flex-col gap-0.5 opacity-40">
          {[0,1,2].map(i => (
            <motion.div
              key={i}
              className="border-r-2 border-t-2 border-blue-400 rounded-tr"
              style={{ width: 4 + i * 3, height: 4 + i * 3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const targets = [10000, 5, 20, 4.99];
  const labels = ["Profiles Created", "Countries in Africa", "NFC Card (one-time $)", "Starting at $/mo"];

  useEffect(() => {
    if (!statsVisible) return;
    const duration = 1500;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts(targets.map(t => Math.floor(t * ease)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [statsVisible]);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-4 py-3 md:px-6 md:py-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.03 }}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-lg">B</span>
            </div>
            <span className="text-xl font-black text-slate-900">Bingoo<span className="text-blue-600">Connect</span></span>
          </motion.div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {["features", "pricing", "use-cases"].map(id => (
              <motion.a key={id} href={`#${id}`} className="hover:text-blue-600 transition-colors capitalize"
                whileHover={{ y: -1 }}>
                {id.replace("-", " ")}
              </motion.a>
            ))}
          </div>
          <div className="flex gap-2">
            <Link to="/bingoo">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:border-blue-300 hidden sm:inline-flex">Sign In</Button>
              </motion.div>
            </Link>
            <Link to="/bingoo">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 text-xs sm:text-sm">Get Started</Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-16 md:py-24 px-4 md:px-6 min-h-[90vh] flex items-center">
        {/* Gradient mesh background */}
        <GradientMesh />
        {/* Animated background dots */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }}
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        {/* Floating orbs with cascading delays */}
        <FloatingOrb delay={0} className="w-96 h-96 bg-blue-400/40 top-[-10%] left-[-10%]" />
        <FloatingOrb delay={2} className="w-72 h-72 bg-violet-500/30 bottom-[-5%] right-[-5%]" />
        <FloatingOrb delay={4} className="w-48 h-48 bg-cyan-400/25 top-1/2 left-1/3" />
        <FloatingOrb delay={1} className="w-64 h-64 bg-blue-500/20 bottom-1/4 left-[20%]" />
        <FloatingOrb delay={3} className="w-56 h-56 bg-violet-600/15 top-[30%] right-[10%]" />

        <motion.div className="max-w-6xl mx-auto relative w-full" style={{ y: heroY, opacity: heroOpacity }}>
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur hover:bg-white/20">
                🌍 Africa's #1 NFC Digital Identity Platform
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              One Tap.<br />
              Your Entire<br />
              <motion.span
                className="text-blue-200"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Business World.
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-base md:text-xl text-blue-100 mb-8 max-w-xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              The smart NFC card that opens your digital profile — with analytics, leads, bookings, and everything you need to grow in Africa.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
            >
              <Link to="/bingoo" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-bold text-base md:text-lg px-6 md:px-8 py-5 md:py-6 rounded-2xl shadow-xl">
                    Create Free Profile <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/p/demo" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" className="w-full sm:w-auto bg-white/20 hover:bg-white/30 border-2 border-white text-white font-bold text-base md:text-lg px-6 md:px-8 py-5 md:py-6 rounded-2xl shadow-lg backdrop-blur-sm">
                    👀 See Live Demo
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* NFC Tap Mockup */}
          <motion.div
            className="mt-16 md:mt-20 flex justify-center"
            style={{ y: phoneY }}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <NFCTapMockup />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <motion.section
        className="bg-slate-900 text-white py-10 px-6"
        onViewportEnter={() => setStatsVisible(true)}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: counts[0].toLocaleString() + "+", label: "Profiles Created" },
            { val: counts[1] + " Countries", label: "Across Africa" },
            { val: "$" + counts[2], label: "NFC Card (one-time)" },
            { val: "$" + counts[3].toFixed(2) + "/mo", label: "Starting Plan" },
          ].map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 0.1}>
              <p className="text-3xl font-black text-blue-400">{s.val}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      {/* Background enhancement */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white to-transparent pointer-events-none" />
      
      <section id="features" className="py-14 md:py-24 px-4 md:px-6 bg-slate-50 relative">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-10 md:mb-14">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100">Features</Badge>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Everything your card opens</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">The NFC card is $20. The platform is what creates the recurring value.</p>
          </ScrollReveal>
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 cursor-default transition-shadow"
              >
                <motion.div
                  className="text-4xl mb-4"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                >
                  {f.icon}
                </motion.div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-14 md:py-24 px-4 md:px-6 relative bg-gradient-to-b from-white via-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-10 md:mb-14">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100">Who uses Bingoo?</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Built for every professional</h2>
          </ScrollReveal>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {useCases.map((u) => (
              <motion.div
                key={u.role}
                variants={fadeUp}
                whileHover={{ scale: 1.03, backgroundColor: "#eff6ff" }}
                className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 cursor-default"
              >
                <motion.span
                  className="text-3xl"
                  whileHover={{ scale: 1.3, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {u.emoji}
                </motion.span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{u.role}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{u.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-14 md:py-24 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-10 md:mb-14">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500 text-lg">NFC card sold separately for $20 one-time payment.</p>
          </ScrollReveal>
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            {plans.map((p, i) => (
              <motion.div
                key={p.name}
                variants={fadeUp}
                whileHover={{ y: p.highlight ? -8 : -5 }}
                className={`rounded-2xl p-6 md:p-8 border-2 transition-colors ${p.highlight ? "border-blue-500 bg-blue-600 text-white shadow-2xl shadow-blue-200 md:scale-105" : "border-slate-200 bg-white hover:border-blue-200"}`}
              >
                {p.highlight && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Badge className="mb-3 bg-white text-blue-600 border-0">Most Popular</Badge>
                  </motion.div>
                )}
                <p className={`text-sm font-medium mb-1 ${p.highlight ? "text-blue-100" : "text-slate-500"}`}>{p.desc}</p>
                <h3 className={`font-black text-2xl mb-1 ${p.highlight ? "text-white" : "text-slate-900"}`}>{p.name}</h3>
                <div className="my-4">
                  <motion.span
                    className={`text-4xl font-black ${p.highlight ? "text-white" : "text-slate-900"}`}
                    animate={p.highlight ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {p.price}
                  </motion.span>
                  <span className={p.highlight ? "text-blue-200" : "text-slate-400"}>{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, fi) => (
                    <motion.li
                      key={f}
                      className={`flex items-center gap-2 text-sm ${p.highlight ? "text-blue-100" : "text-slate-600"}`}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: fi * 0.07 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${p.highlight ? "text-blue-200" : "text-blue-500"}`} />
                      {f}
                    </motion.li>
                  ))}
                </ul>
                <Link to="/bingoo">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button className={`w-full font-bold ${p.highlight ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                      {p.name === "Free" ? "Get Started Free" : `Start ${p.name}`}
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-14 md:py-24 px-4 md:px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white text-center overflow-hidden">
        <GradientMesh />
        <FloatingOrb delay={0} className="w-72 h-72 bg-blue-400/30 top-[-20%] left-[-10%]" />
        <FloatingOrb delay={2} className="w-56 h-56 bg-violet-500/25 bottom-[-10%] right-[-5%]" />
        <div className="max-w-2xl mx-auto relative">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Ready to grow your business?</h2>
            <p className="text-blue-100 text-base md:text-lg mb-8">Join thousands of professionals across Africa using Bingoo Connect.</p>
            <Link to="/bingoo">
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-base md:text-lg px-8 md:px-10 py-5 md:py-6 rounded-2xl shadow-xl">
                  Create Your Profile Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">B</div>
            <span className="text-white font-bold">BingooConnect</span>
            <span>— Africa's Digital Identity Platform</span>
          </div>
          <p>© 2026 Bingoo Connect · bingoo.africa</p>
        </div>
      </footer>
    </div>
  );
}