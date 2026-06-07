import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Wifi, Users, BarChart3, Calendar, Star, Shield, Zap, Globe } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import NFCTapMockup from "../components/bingoo/NFCTapMockup";
import FeedbackSection from "../components/bingoo/FeedbackSection";
import { base44 } from "@/api/base44Client";

// ── Bingoo Brand Colors
const B = {
  navy: "#0B2E6B",
  navyDark: "#071d47",
  navyLight: "#1a4a9e",
  orange: "#FF7A00",
  orangeLight: "#FF9A33",
  gold: "#FDBA21",
  goldLight: "#FFD060",
  white: "#FFFFFF",
  slate: "#64748b"
};

const goSignIn = async () => {
  const authed = await base44.auth.isAuthenticated();
  if (authed) window.location.href = '/bingoo';else
  base44.auth.redirectToLogin('/bingoo');
};

const goActivate = async () => {
  const authed = await base44.auth.isAuthenticated();
  if (authed) window.location.href = '/activate-device';else
  base44.auth.redirectToLogin('/activate-device');
};

const features = [
{ icon: <Wifi className="w-6 h-6" />, title: "NFC One-Tap Share", desc: "Tap your card or bracelet — instantly share your entire professional profile." },
{ icon: <BarChart3 className="w-6 h-6" />, title: "Real-Time Analytics", desc: "Track every profile view, link click, lead, and conversion in real-time." },
{ icon: <Calendar className="w-6 h-6" />, title: "Appointment Booking", desc: "Let clients book directly from your profile. No back-and-forth emails." },
{ icon: <Users className="w-6 h-6" />, title: "Lead Generation CRM", desc: "Capture visitor info automatically and manage your pipeline from your dashboard." },
{ icon: <Globe className="w-6 h-6" />, title: "Multi-Language Profiles", desc: "Serve global clients with profiles in English, French, Arabic, and more." },
{ icon: <Shield className="w-6 h-6" />, title: "Enterprise Security", desc: "Bank-level encryption, GDPR compliant, and built for law firms & medical offices." }];


const plans = [
{
  name: "Free",
  price: "$0",
  period: "",
  desc: "Get started today",
  features: ["1 profile", "Public profile link", "Basic contact sharing", "Social links", "QR code", "WhatsApp button"],
  highlight: false,
  cta: "Get Started Free",
  color: B.navy
},
{
  name: "Professional",
  price: "$4.99",
  period: "/mo",
  desc: "For individuals & freelancers",
  features: ["Everything in Free", "Appointment booking", "Lead collection CRM", "Gallery & portfolio", "Full analytics dashboard", "Custom branding & colors", "QR code download", "Up to 5 NFC devices", "Instagram integration", "Save contact button"],
  highlight: true,
  cta: "Get Professional",
  color: B.orange
},
{
  name: "Salon",
  price: "$19.99",
  period: "/mo",
  desc: "Hair, beauty & wellness",
  features: ["Salon business profile", "Staff profiles", "Service menu", "Appointment booking", "WhatsApp booking button", "Instagram showcase", "Google review link", "Up to 10 NFC devices", "Advanced analytics", "Lead export"],
  highlight: false,
  cta: "Get Salon Plan",
  color: B.navy
},
{
  name: "Corporate Team",
  price: "$99",
  period: "/mo",
  desc: "Teams, enterprises & orgs",
  features: ["Employee profiles", "Team NFC cards (up to 50)", "Clock in / clock out", "Attendance dashboard", "Team analytics", "Admin role management", "CRM pipeline", "Lead export", "Advanced analytics", "Priority support"],
  highlight: false,
  cta: "Get Corporate Plan",
  color: B.navyDark
}];


const useCases = [
{ icon: "⚖️", role: "Law Firms", value: "Case intake, consultations & client pipeline" },
{ icon: "🏠", role: "Real Estate", value: "Share listings & book property viewings" },
{ icon: "💇", role: "Salons & Barbers", value: "Booking, portfolio & loyalty program" },
{ icon: "🍽️", role: "Restaurants", value: "Digital menu, reservations & QR ordering" },
{ icon: "🏥", role: "Medical Offices", value: "Appointments, intake forms & records" },
{ icon: "📱", role: "Entrepreneurs", value: "All links, leads & audience analytics" }];


const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

function ScrollReveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}>
      
      {children}
    </motion.div>);

}

// Animated NFC wave rings
function NFCWaveRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {[0, 1, 2, 3].map((i) =>
      <motion.div
        key={i}
        className="absolute rounded-full border border-white/10"
        style={{ width: 200 + i * 160, height: 200 + i * 160 }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.04, 0.15] }}
        transition={{ duration: 4, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }} />

      )}
    </div>);

}

// Connection lines SVG background
function ConnectionLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06]" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      {[[100, 100, 600, 400], [200, 700, 800, 200], [1100, 100, 400, 600], [900, 750, 200, 300], [600, 50, 900, 500]].map(([x1, y1, x2, y2], i) =>
      <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1"
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 4 + i, repeat: Infinity, delay: i * 1.2, ease: "easeInOut" }} />

      )}
      {[[600, 400], [100, 100], [200, 700], [1100, 100], [900, 750]].map(([cx, cy], i) =>
      <motion.circle key={i} cx={cx} cy={cy} r="4" fill="white"
      animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
      transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.7 }} />

      )}
    </svg>);

}

function FloatingOrb({ style, delay = 0 }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={style}
      animate={{ y: [0, -24, 0], scale: [1, 1.06, 1], x: [0, 12, 0] }}
      transition={{ duration: 7 + delay, repeat: Infinity, ease: "easeInOut", delay }} />);


}

export default function Landing() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {base44.auth.isAuthenticated().then(setAuthed);}, []);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const [statsVisible, setStatsVisible] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (!statsVisible) return;
    const targets = [10000, 50, 4, 99];
    const duration = 1800;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts(targets.map((t) => Math.floor(t * ease)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [statsVisible]);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: "#f8fafc" }}>

      {/* ── NAVBAR */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ background: "rgba(11,46,107,0.97)", borderColor: "rgba(255,255,255,0.08)" }}>
        
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
            <img src="https://media.base44.com/images/public/692bd9007b93ba81de543346/e30f4e65a_BingooConnectBrand.png"

            alt="Bingoo Connect"
            className="h-10 w-auto object-contain" />
            
          </motion.div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-white/70">
            {[["features", "Features"], ["use-cases", "Industries"], ["pricing", "Pricing"], ["shop", "Shop"]].map(([id, label]) =>
            <motion.a key={id} href={`#${id}`} className="hover:text-white transition-colors" whileHover={{ y: -1 }}>
                {label}
              </motion.a>
            )}
          </div>

          {/* CTA */}
          <div className="flex gap-2 items-center">
            {authed ?
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button size="sm" onClick={() => window.location.href = '/bingoo'}
              className="font-bold text-sm"
              style={{ background: B.orange, color: "#fff", border: "none" }}>
                  My Dashboard →
                </Button>
              </motion.div> :

            <>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="ghost" size="sm" onClick={goSignIn}
                className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:inline-flex font-semibold">
                    Sign In
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button size="sm" onClick={goSignIn}
                className="font-bold text-sm px-4"
                style={{ background: B.orange, color: "#fff", border: "none" }}>
                    Get Started Free
                  </Button>
                </motion.div>
              </>
            }
          </div>
        </div>
      </motion.nav>

      {/* ── HERO */}
      <section ref={heroRef} className="relative overflow-hidden flex items-center min-h-screen py-20 px-4 md:px-6"
      style={{ background: `linear-gradient(145deg, ${B.navyDark} 0%, ${B.navy} 45%, #0f3d8c 70%, #0a2a5e 100%)` }}>

        <NFCWaveRings />
        <ConnectionLines />

        {/* Floating orbs */}
        <FloatingOrb delay={0} style={{ width: 500, height: 500, top: "-15%", left: "-10%", background: `radial-gradient(circle, rgba(255,122,0,0.18) 0%, transparent 70%)` }} />
        <FloatingOrb delay={2} style={{ width: 400, height: 400, bottom: "-10%", right: "-8%", background: `radial-gradient(circle, rgba(253,186,33,0.14) 0%, transparent 70%)` }} />
        <FloatingOrb delay={4} style={{ width: 250, height: 250, top: "30%", right: "20%", background: `radial-gradient(circle, rgba(255,154,51,0.1) 0%, transparent 70%)` }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "36px 36px" }} />

        <motion.div className="max-w-7xl mx-auto w-full relative" style={{ y: heroY, opacity: heroOpacity }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
                style={{ background: "rgba(253,186,33,0.15)", border: "1px solid rgba(253,186,33,0.35)", color: B.gold }}>
                  <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>📡</motion.span>
                  NFC-Powered Business Identity Platform
                </div>
              </motion.div>

              <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-white"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                
                One Tap.<br />
                <span style={{ color: B.gold }}>Your Entire</span><br />
                Business World.
              </motion.h1>

              <motion.p
                className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}>
                
                The smart NFC card & platform that opens your digital profile — for law firms, salons, restaurants, realtors, consultants & every professional growing their business.
              </motion.p>

              {/* Tagline pills */}
              <motion.div className="flex flex-wrap gap-2 mb-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                {["CONNECT", "SHARE", "GROW", "SUCCEED"].map((word, i) =>
                <motion.span key={word}
                className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest"
                style={{ background: [B.orange, B.gold, "#22c55e", "#ef4444"][i] + "22", color: [B.orange, B.gold, "#22c55e", "#ef4444"][i], border: `1px solid ${[B.orange, B.gold, "#22c55e", "#ef4444"][i]}44` }}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}>
                    {word}
                  </motion.span>
                )}
              </motion.div>

              <motion.div className="flex flex-col sm:flex-row gap-3 mb-6"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}>
                
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" onClick={goSignIn}
                  className="w-full sm:w-auto font-black text-base px-8 py-6 rounded-2xl shadow-2xl"
                  style={{ background: B.orange, color: "#fff" }}>
                    Create Free Profile <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>

              </motion.div>

              {/* Device activation */}
              <motion.div className="flex flex-col sm:flex-row gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                <motion.div onClick={goActivate} whileHover={{ scale: 1.03, y: -1 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full cursor-pointer transition-colors"
                style={{ background: "rgba(253,186,33,0.1)", border: "1px solid rgba(253,186,33,0.3)" }}>
                  <span className="text-lg">📦</span>
                  <span className="text-white/70 text-sm font-semibold">Already have a device?</span>
                  <span className="text-sm font-black flex items-center gap-1" style={{ color: B.gold }}>
                    Activate here <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </motion.div>


              </motion.div>
            </div>

            {/* Right: NFC Mockup + Product Images */}
            <motion.div
              className="flex flex-col items-center gap-6"
              style={{ y: phoneY }}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              
              <NFCTapMockup />

              {/* Product showcase strip */}
              <motion.div
                className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}>
                
                <span className="text-white/50 text-xs font-bold tracking-widest uppercase">Available as</span>
                {["💳 Card", "🔑 Keychain", "⌚ Bracelet", "🏷️ Badge"].map((item, i) =>
                <motion.span key={item}
                className="text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + i * 0.1 }}>
                    {item}
                  </motion.span>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS BAR */}
      <motion.section
        className="py-12 px-6"
        style={{ background: B.navyDark }}
        onViewportEnter={() => setStatsVisible(true)}
        viewport={{ once: true }}>
        
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
          { val: counts[0].toLocaleString() + "+", label: "Profiles Created" },
          { val: counts[1] + "+", label: "Countries Served" },
          { val: counts[2] + " Plans", label: "For Every Business" },
          { val: "$" + counts[3] + "/mo", label: "Corporate Plan" }].
          map((s, i) =>
          <ScrollReveal key={s.label} delay={i * 0.1}>
              <p className="text-3xl font-black" style={{ color: B.gold }}>{s.val}</p>
              <p className="text-white/50 text-sm mt-1 font-medium">{s.label}</p>
            </ScrollReveal>
          )}
        </div>
      </motion.section>



      {/* ── BINGOO LOGO BRAND SECTION */}
      <section className="py-16 px-6" style={{ background: "#f1f5f9" }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: B.navy }}>
              Trusted by Professionals Worldwide
            </h2>
            <p className="text-slate-500 text-lg">NFC cards, keychains, bracelets & badges — all powered by Bingoo Connect</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://media.base44.com/images/public/692bd9007b93ba81de543346/5bf500988_BingooconnectNFCBRAND.png"
                alt="Bingoo NFC Products"
                className="w-full object-cover" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FEATURES */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: B.navy + "10", color: B.navy, border: `1px solid ${B.navy}20` }}>
              Platform Features
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: B.navy }}>
              Everything your business needs
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">From one NFC tap to a complete business growth platform.</p>
          </ScrollReveal>
          <motion.div className="grid md:grid-cols-3 gap-6"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {features.map((f, i) =>
            <motion.div key={f.title} variants={fadeUp}
            whileHover={{ y: -6, boxShadow: "0 24px 48px rgba(11,46,107,0.12)" }}
            className="rounded-2xl p-7 border transition-all cursor-default"
            style={{ borderColor: "#e2e8f0", background: "#fff" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
              style={{ background: [B.navy, B.orange, B.gold, B.navy, B.orange, B.gold][i] + "15", color: [B.navy, B.orange, B.gold, B.navy, B.orange, B.gold][i] }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: B.navy }}>{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── USE CASES */}
      <section id="use-cases" className="py-16 md:py-24 px-4 md:px-6" style={{ background: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: B.orange + "15", color: B.orange, border: `1px solid ${B.orange}30` }}>
              Who uses Bingoo?
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: B.navy }}>
              Built for every industry
            </h2>
          </ScrollReveal>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {useCases.map((u) =>
            <motion.div key={u.role} variants={fadeUp}
            whileHover={{ scale: 1.03, borderColor: B.orange }}
            className="flex items-center gap-4 bg-white rounded-2xl p-5 border-2 cursor-default transition-all"
            style={{ borderColor: "#e2e8f0" }}>
                <span className="text-4xl">{u.icon}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: B.navy }}>{u.role}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{u.value}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING */}
      <section id="pricing" className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: B.gold + "20", color: "#b45309", border: `1px solid ${B.gold}40` }}>
              Simple Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: B.navy }}>
              Plans for every professional
            </h2>
            <p className="text-slate-500 text-lg">NFC device sold separately for $20 one-time. No hidden fees.</p>
          </ScrollReveal>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {plans.map((p, i) =>
            <motion.div key={p.name} variants={fadeUp}
            whileHover={{ y: p.highlight ? -10 : -6 }}
            className="rounded-2xl p-7 border-2 transition-all relative flex flex-col"
            style={{
              borderColor: p.highlight ? B.orange : "#e2e8f0",
              background: p.highlight ? `linear-gradient(145deg, ${B.navy}, ${B.navyLight})` : "#fff",
              boxShadow: p.highlight ? `0 24px 60px rgba(255,122,0,0.25)` : "none"
            }}>
                {p.highlight &&
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-black"
              style={{ background: B.orange, color: "#fff" }}>
                    Most Popular
                  </div>
              }
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-1" style={{ color: p.highlight ? "rgba(255,255,255,0.5)" : B.slate }}>{p.desc}</p>
                  <h3 className="font-black text-xl mb-3" style={{ color: p.highlight ? "#fff" : B.navy }}>{p.name}</h3>
                  <div>
                    <span className="text-4xl font-black" style={{ color: p.highlight ? B.gold : B.navy }}>{p.price}</span>
                    <span className="text-sm ml-1" style={{ color: p.highlight ? "rgba(255,255,255,0.4)" : B.slate }}>{p.period}</span>
                  </div>
                </div>
                <div className="h-px my-4" style={{ background: p.highlight ? "rgba(255,255,255,0.1)" : "#f1f5f9" }} />
                <ul className="space-y-2.5 mb-6 flex-1">
                  {p.features.map((f) =>
                <li key={f} className="flex items-start gap-2 text-sm"
                style={{ color: p.highlight ? "rgba(255,255,255,0.75)" : "#64748b" }}>
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: p.highlight ? B.gold : B.orange }} />
                      {f}
                    </li>
                )}
                </ul>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button onClick={() => window.location.href = p.name === "Free" ? '/bingoo' : '/plans'}
                className="w-full font-bold"
                style={{
                  background: p.highlight ? B.orange : B.navy,
                  color: "#fff",
                  border: "none"
                }}>
                    {p.cta}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── SHOP */}
      <section id="shop" className="py-16 md:py-24 px-4 md:px-6" style={{ background: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: B.navy + "10", color: B.navy, border: `1px solid ${B.navy}20` }}>
              📦 Shop
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: B.navy }}>
              Get your Bingoo device
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">One-time purchase. Tap to share your profile instantly — forever.</p>
          </ScrollReveal>
          <motion.div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6"
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {[
            { emoji: "💳", name: "NFC Card", price: "$20", desc: "Classic wallet-size card. Sleek, durable, reusable.", tag: "Most Popular" },
            { emoji: "🔑", name: "NFC Keychain", price: "$20", desc: "Attach to your keys. Always ready to share.", tag: null },
            { emoji: "⌚", name: "NFC Bracelet", price: "$25", desc: "Wear your digital identity on your wrist.", tag: "New" }].
            map((item, i) =>
            <motion.div key={item.name} variants={fadeUp}
            whileHover={{ y: -6, borderColor: B.orange }}
            className="relative bg-white rounded-3xl border-2 p-7 flex flex-col items-center text-center transition-all"
            style={{ borderColor: "#e2e8f0" }}>
                {item.tag &&
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1 rounded-full text-white"
              style={{ background: item.tag === "New" ? B.gold : B.orange }}>
                    {item.tag}
                  </span>
              }
                <div className="text-6xl mb-4">{item.emoji}</div>
                <h3 className="font-black text-xl mb-1" style={{ color: B.navy }}>{item.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{item.desc}</p>
                <p className="text-3xl font-black mb-5" style={{ color: B.orange }}>{item.price}</p>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full">
                  <Button className="w-full font-bold rounded-xl text-white"
                style={{ background: B.navy }}
                onClick={() => window.location.href = '/shop'}>
                    Order Now →
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Bulk order CTA */}
          <ScrollReveal delay={0.2}>
            <div className="mt-10 rounded-3xl p-7 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ background: `linear-gradient(135deg, ${B.navy} 0%, ${B.navyLight} 100%)` }}>
              <div>
                <p className="font-black text-white text-lg">Bulk order for your team or event?</p>
                <p className="text-white/60 text-sm mt-1">Volume discounts for teams, companies, and event organizers.</p>
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button onClick={() => window.location.href = '/shop'}
                className="font-bold whitespace-nowrap"
                style={{ background: B.orange, color: "#fff", border: "none" }}>
                  Browse All Products →
                </Button>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <FeedbackSection />

      {/* ── BOTTOM CTA */}
      <section className="relative py-20 px-4 md:px-6 text-center overflow-hidden"
      style={{ background: `linear-gradient(145deg, ${B.navyDark} 0%, ${B.navy} 50%, #0f3d8c 100%)` }}>
        <ConnectionLines />
        <FloatingOrb delay={0} style={{ width: 400, height: 400, top: "-20%", left: "-10%", background: `radial-gradient(circle, ${B.orange}20 0%, transparent 70%)` }} />
        <FloatingOrb delay={2} style={{ width: 350, height: 350, bottom: "-15%", right: "-5%", background: `radial-gradient(circle, ${B.gold}18 0%, transparent 70%)` }} />
        <div className="max-w-3xl mx-auto relative">
          <ScrollReveal>

            
            <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">
              Ready to grow your business?
            </h2>
            <p className="text-white/60 text-lg mb-3">Join thousands of professionals worldwide.</p>
            <div className="flex justify-center gap-6 mb-8 text-sm font-black tracking-widest" style={{ color: B.gold }}>
              {["CONNECT", "•", "SHARE", "•", "GROW", "•", "SUCCEED"].map((w, i) =>
              <span key={i} style={{ opacity: w === "•" ? 0.3 : 1 }}>{w}</span>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" onClick={goSignIn}
              className="font-black text-base md:text-lg px-10 py-6 rounded-2xl shadow-2xl"
              style={{ background: B.orange, color: "#fff" }}>
                Create Your Profile Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER */}
      <footer className="py-10 px-6 text-sm" style={{ background: B.navyDark }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/40 text-xs font-semibold tracking-wider">Connect • Share • Grow • Succeed</span>
          <div className="flex flex-wrap justify-center gap-5 text-white/40 text-xs">
            <a href="/shop" className="hover:text-white/70 transition-colors">Shop</a>
            <a href="/plans" className="hover:text-white/70 transition-colors">Pricing</a>
            <a href="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white/70 transition-colors">Terms of Service</a>
            <a href="/data-deletion" className="hover:text-white/70 transition-colors">Data Deletion</a>
            <a href="/contact-support" className="hover:text-white/70 transition-colors">Contact</a>
          </div>
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Bingoo Connect · bingoo.africa</p>
        </div>
      </footer>
    </div>);

}