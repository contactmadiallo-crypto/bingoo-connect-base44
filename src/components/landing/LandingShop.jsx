import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Bell, ShoppingCart } from "lucide-react";
import { InfinityMark, BingooLogo as BingooWordmark } from "@/components/bingoo/ui/BingooBrand";
import { PRODUCTS, COLLECTIONS, LANDING_FLAGSHIP_IDS } from "@/lib/shopProducts";

const B = {
  navy: "#0b2149",
  navyDark: "#071A3D",
  navyLight: "#13284f",
  orange: "#f97316",
  orangeLight: "#fb923c",
  gold: "#FDBA21",
  goldLight: "#FFD060",
  premiumBlack: "#090d16",
  slate: "#64748b",
  white: "#FFFFFF",
};

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function ScrollReveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}>
      {children}
    </motion.div>
  );
}

// ── Premium Metal Card Visual (CSS-based) ────────────────────────────
function PremiumMetalCardVisual({ size = "large" }) {
  const cardW = size === "large" ? 340 : 260;
  const cardH = size === "large" ? 214 : 164;
  const markSize = size === "large" ? 72 : 54;

  return (
    <div
      className="relative rounded-2xl flex items-center justify-center"
      style={{
        width: cardW,
        height: cardH,
        background: `
          radial-gradient(ellipse 60% 40% at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 60%),
          linear-gradient(135deg, #090d16 0%, #121622 30%, #0a0e18 60%, #0e1220 100%)
        `,
        boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.8) 1px, rgba(255,255,255,0.8) 2px)" }} />
      <div className="absolute" style={{
        width: markSize * 1.8, height: markSize * 1.8, borderRadius: '50%',
        background: `radial-gradient(circle, ${B.orange}30 0%, transparent 70%)`, filter: 'blur(20px)',
      }} />
      <div className="relative flex flex-col items-center gap-2">
        <InfinityMark size={markSize} color={B.orange} strokeWidth={3.5} glow />
        <span className="font-bold tracking-[0.25em] uppercase" style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>
          Bingoo Connect
        </span>
      </div>
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)" }} />
    </div>
  );
}

// ── Curated Product Card (landing version) ────────────────────────────
function CuratedProductCard({ product }) {
  const collection = COLLECTIONS.find(c => c.id === product.collection);
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="rounded-2xl border-2 bg-white flex flex-col transition-all"
      style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div className="relative bg-slate-50 flex items-center justify-center overflow-hidden rounded-t-2xl" style={{ height: 180 }}>
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white"
            style={{ background: B.orange }}>
            {product.badge}
          </span>
        )}
        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: B.slate }}>{product.bestFor}</p>
        <h3 className="font-black text-base mb-2" style={{ color: B.navy }}>{product.name}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">{product.tagline}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black" style={{ color: B.orange }}>${product.price.toFixed(2)}</span>
          <Button
            className="font-bold rounded-xl text-white text-sm px-4"
            style={{ background: B.navy }}
            onClick={() => (window.location.href = `/product/${product.id}`)}>
            View Device <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingShop() {
  const flagshipProducts = LANDING_FLAGSHIP_IDS
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

  return (
    <section id="shop" className="py-16 md:py-24 px-4 md:px-6" style={{ background: "#f8fafc" }}>
      <div className="max-w-6xl mx-auto">
        {/* ── Section header ── */}
        <ScrollReveal className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: B.navy + "10", color: B.navy, border: `1px solid ${B.navy}20` }}>
            Bingoo Devices
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: B.navy }}>
            Choose the Bingoo device built for how you connect.
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
            From professional networking to business counters and asset protection, every Bingoo NFC device connects to the same smart identity platform.
          </p>
          <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto">
            One profile. Multiple devices. Update your information anytime without replacing your NFC device.
          </p>
        </ScrollReveal>

        {/* ── Featured: Premium Metal Card ── */}
        <ScrollReveal delay={0.15} className="mb-12">
          <div className="relative rounded-3xl overflow-hidden"
            style={{ background: `linear-gradient(145deg, ${B.premiumBlack} 0%, ${B.navyDark} 50%, ${B.navyLight} 100%)` }}>
            <div className="absolute pointer-events-none" style={{ width: 400, height: 400, top: "-30%", left: "-10%", background: `radial-gradient(circle, ${B.orange}18 0%, transparent 70%)`, filter: "blur(40px)" }} />
            <div className="absolute pointer-events-none" style={{ width: 300, height: 300, bottom: "-20%", right: "-5%", background: `radial-gradient(circle, ${B.gold}12 0%, transparent 70%)`, filter: "blur(30px)" }} />

            <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-5"
                  style={{ background: `${B.gold}22`, color: B.goldLight, border: `1px solid ${B.gold}44` }}>
                  ★ Featured Device
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                  Bingoo Premium Metal Card
                </h3>
                <p className="text-white/60 text-lg mb-6 leading-relaxed">
                  Matte black metal. One orange infinity mark. Nothing else.
                </p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    "One tap sharing — no app required for the recipient",
                    "Connected to your Bingoo profile instantly",
                    "Update your profile without changing the card",
                    "Brushed metal finish with engraved infinity mark",
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: B.gold }} />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                  <Button size="lg" onClick={() => (window.location.href = "/product/nfc-metal-card")}
                    className="font-black text-base px-8 py-5 rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${B.orange} 0%, ${B.gold} 100%)`, color: "#fff", border: "none" }}>
                    View Premium Card <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </div>
              <div className="flex justify-center">
                <PremiumMetalCardVisual size="large" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Curated Flagship Products ── */}
        <ScrollReveal delay={0.1} className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: B.orange }} />
            <h3 className="font-black text-lg" style={{ color: B.navy }}>Featured Bingoo Devices</h3>
          </div>
          <p className="text-slate-400 text-sm">A curated selection from the full Bingoo NFC collection.</p>
        </ScrollReveal>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}>
          {flagshipProducts.map((product) => (
            <CuratedProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        {/* ── Profile Device vs Asset Device comparison ── */}
        <ScrollReveal delay={0.1} className="mb-12">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-3xl p-7 border-2" style={{ borderColor: B.orange + "30", background: "#fff" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4"
                style={{ background: B.orange + "15", color: B.orange }}>
                Profile Device
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm font-bold flex-wrap" style={{ color: B.navy }}>
                <span>Tap</span><ArrowRight className="w-4 h-4" style={{ color: B.orange }} />
                <span>Profile</span><ArrowRight className="w-4 h-4" style={{ color: B.orange }} />
                <span>Contact</span><ArrowRight className="w-4 h-4" style={{ color: B.orange }} />
                <span>Lead</span><ArrowRight className="w-4 h-4" style={{ color: B.orange }} />
                <span>Booking</span>
              </div>
              <p className="text-slate-500 text-sm mb-3">Profile devices open your professional Bingoo profile when tapped.</p>
              <div className="flex flex-wrap gap-2">
                {["NFC Card", "Metal Card", "Keychain", "Bracelet", "Sticker"].map((item) => (
                  <span key={item} className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: B.navy + "08", color: B.navy }}>{item}</span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl p-7 border-2" style={{ borderColor: "#ef444430", background: "#fff" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4"
                style={{ background: "#ef444415", color: "#ef4444" }}>
                Asset Device
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm font-bold flex-wrap" style={{ color: B.navy }}>
                <span>Tap / Scan</span><ArrowRight className="w-4 h-4" style={{ color: "#ef4444" }} />
                <span>Lost Mode</span><ArrowRight className="w-4 h-4" style={{ color: "#ef4444" }} />
                <span>Finder</span><ArrowRight className="w-4 h-4" style={{ color: "#ef4444" }} />
                <span>Owner Reconnected</span>
              </div>
              <p className="text-slate-500 text-sm mb-3">Asset devices open a Lost Mode recovery page. NFC + QR recovery, not GPS tracking.</p>
              <div className="flex flex-wrap gap-2">
                {["Luggage Tag", "Pet Collar Tag", "Silicone Tag", "Key Fob"].map((item) => (
                  <span key={item} className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: B.navy + "08", color: B.navy }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-slate-400 text-sm mt-4">
            Both belong to the same Bingoo Connect ecosystem.
          </p>
        </ScrollReveal>

        {/* ── Full Shop CTA ── */}
        <ScrollReveal delay={0.2} className="text-center">
          <h3 className="font-black text-xl md:text-2xl mb-2" style={{ color: B.navy }}>Looking for something specific?</h3>
          <p className="text-slate-500 text-base mb-6">Explore the complete Bingoo NFC device collection — all collections, all form factors.</p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Button size="lg" onClick={() => (window.location.href = "/shop")}
              className="font-black text-base px-10 py-5 rounded-2xl"
              style={{ background: B.navy, color: "#fff", border: "none" }}>
              Explore All Bingoo Devices <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}