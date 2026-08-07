import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { InfinityMark, BingooLogo as BingooWordmark } from "@/components/bingoo/ui/BingooBrand";
import { PRODUCTS } from "@/lib/shopProducts";

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

// ── Product categorization by user need ──────────────────────────────
const CATEGORIES = [
  {
    id: "profile",
    label: "Profile & Networking",
    headline: "Share your professional profile anywhere.",
    bestFor: "Individual professionals, networking, meetings and events.",
    productIds: ["nfc-card", "nfc-keychain", "nfc-bracelet", "nfc-sticker"],
  },
  {
    id: "premium",
    label: "Premium Professional",
    headline: "Make the first impression premium.",
    bestFor: "Executives and professionals who want flagship hardware.",
    productIds: ["nfc-metal-card", "nfc-wood-card"],
  },
  {
    id: "business",
    label: "Business & Teams",
    headline: "Turn every physical location into a connection point.",
    bestFor: "Front desks, offices, salons, restaurants and teams.",
    productIds: ["nfc-table-stand", "nfc-phone-stand"],
  },
  {
    id: "asset",
    label: "Asset Protection",
    headline: "Give valuable items a digital identity.",
    bestFor: "Luggage, pets, bags, keys and portable valuables.",
    productIds: ["nfc-luggage-tag", "nfc-pet-collar", "nfc-silicone-tag", "nfc-key-fob"],
  },
];

// ── Selector tabs ────────────────────────────────────────────────────
const SELECTOR_TABS = [
  { id: "all", label: "Share My Profile", highlight: ["profile", "premium"] },
  { id: "premium", label: "Look More Premium", highlight: ["premium"] },
  { id: "business", label: "Connect My Business", highlight: ["business"] },
  { id: "asset", label: "Protect My Assets", highlight: ["asset"] },
];

// ── Custom copy per product (simplified for beginners) ──────────────
const PRODUCT_COPY = {
  "nfc-card": { bestFor: "Professional networking", copy: "Your everyday digital business card. Tap a phone to open your Bingoo profile instantly." },
  "nfc-keychain": { bestFor: "Everyday carry", copy: "Keep your professional profile with your keys and share wherever you go." },
  "nfc-bracelet": { bestFor: "Events & networking", copy: "Wear your Bingoo profile and share with a quick tap." },
  "nfc-sticker": { bestFor: "Flexible sharing", copy: "Create a permanent Bingoo tap point on an approved surface." },
  "nfc-metal-card": { bestFor: "Premium networking", copy: "Brushed metal NFC card with a single orange infinity mark. Built to impress." },
  "nfc-wood-card": { bestFor: "Natural premium", copy: "Real walnut wood card with a warm, distinctive professional identity." },
  "nfc-table-stand": { bestFor: "Front desks & counters", copy: "Place Bingoo at the counter so customers can tap to open your business profile." },
  "nfc-phone-stand": { bestFor: "Desks & workspaces", copy: "Combine a useful phone stand with a permanent Bingoo connection point." },
  "nfc-luggage-tag": { bestFor: "Suitcases & travel bags", copy: "Attach a Bingoo tag to your luggage. If lost, a finder can tap to open Lost Mode recovery." },
  "nfc-pet-collar": { bestFor: "Pet identification & recovery", copy: "Attach Bingoo to a pet collar so a finder has a simple way to access the recovery experience." },
  "nfc-silicone-tag": { bestFor: "Bags & equipment", copy: "A flexible NFC tag for assets that do not need a traditional card." },
  "nfc-key-fob": { bestFor: "Keys & portable assets", copy: "Compact NFC identification for items that travel with you." },
};

// ── Category badge colors ────────────────────────────────────────────
const BADGE_STYLES = {
  "Best Seller": { bg: B.orange + "22", color: B.orange, border: B.orange + "44" },
  "Premium": { bg: B.gold + "22", color: "#b45309", border: B.gold + "44" },
  "Eco": { bg: "#16a34a22", color: "#16a34a", border: "#16a34a44" },
  "Wearable": { bg: B.navy + "22", color: B.navy, border: B.navy + "44" },
  "Counter": { bg: B.navy + "22", color: B.navy, border: B.navy + "44" },
  "Desk": { bg: B.navy + "22", color: B.navy, border: B.navy + "44" },
  "Travel": { bg: "#ef444422", color: "#ef4444", border: "#ef444444" },
  "Pet Safety": { bg: "#16a34a22", color: "#16a34a", border: "#16a34a44" },
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
      {/* Brushed metal texture lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.8) 1px, rgba(255,255,255,0.8) 2px)",
        }}
      />
      {/* Subtle orange glow behind infinity mark */}
      <div
        className="absolute"
        style={{
          width: markSize * 1.8,
          height: markSize * 1.8,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${B.orange}30 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />
      {/* Infinity mark + wordmark */}
      <div className="relative flex flex-col items-center gap-2">
        <InfinityMark size={markSize} color={B.orange} strokeWidth={3.5} glow />
        <span className="font-bold tracking-[0.25em] uppercase" style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>
          Bingoo Connect
        </span>
      </div>
      {/* Premium edge highlight */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)" }} />
    </div>
  );
}

// ── Product Card ────────────────────────────────────────────────────
function ProductCard({ product, highlighted }) {
  const copy = PRODUCT_COPY[product.id] || { bestFor: "", copy: product.tagline };
  const badgeStyle = product.badge ? BADGE_STYLES[product.badge] : null;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      className="rounded-2xl border-2 bg-white flex flex-col transition-all"
      style={{
        borderColor: highlighted ? B.orange : "#e2e8f0",
        boxShadow: highlighted ? `0 12px 40px ${B.orange}25` : "0 1px 3px rgba(0,0,0,0.04)",
      }}>
      {/* Product image */}
      <div className="relative bg-slate-50 flex items-center justify-center overflow-hidden rounded-t-2xl" style={{ height: 200 }}>
        {product.badge && badgeStyle && (
          <span
            className="absolute top-3 left-3 z-10 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}` }}>
            {product.badge}
          </span>
        )}
        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4" />
      </div>
      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: B.slate }}>{copy.bestFor}</p>
        <h3 className="font-black text-base mb-2" style={{ color: B.navy }}>{product.name}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">{copy.copy}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black" style={{ color: B.orange }}>${product.price.toFixed(2)}</span>
          <Button
            className="font-bold rounded-xl text-white text-sm px-4"
            style={{ background: highlighted ? B.orange : B.navy }}
            onClick={() => (window.location.href = `/product/${product.id}`)}>
            View Device <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingShop() {
  const [activeTab, setActiveTab] = useState("all");

  const getHighlightedCategoryIds = () => {
    const tab = SELECTOR_TABS.find((t) => t.id === activeTab);
    return tab ? tab.highlight : [];
  };

  const highlightedIds = getHighlightedCategoryIds();

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

        {/* ── Product Selector ── */}
        <ScrollReveal delay={0.1} className="mb-12">
          <p className="text-center text-xs font-black uppercase tracking-widest mb-4" style={{ color: B.slate }}>
            What do you want to do?
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {SELECTOR_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-5 py-2.5 rounded-full text-sm font-bold transition-all"
                  style={{
                    background: isActive ? B.orange : "#fff",
                    color: isActive ? "#fff" : B.navy,
                    border: `2px solid ${isActive ? B.orange : "#e2e8f0"}`,
                    boxShadow: isActive ? `0 6px 20px ${B.orange}30` : "none",
                  }}>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* ── Featured: Premium Metal Card ── */}
        <ScrollReveal delay={0.15} className="mb-12">
          <div className="relative rounded-3xl overflow-hidden"
            style={{ background: `linear-gradient(145deg, ${B.premiumBlack} 0%, ${B.navyDark} 50%, ${B.navyLight} 100%)` }}>
            {/* Glow accents */}
            <div className="absolute pointer-events-none" style={{ width: 400, height: 400, top: "-30%", left: "-10%", background: `radial-gradient(circle, ${B.orange}18 0%, transparent 70%)`, filter: "blur(40px)" }} />
            <div className="absolute pointer-events-none" style={{ width: 300, height: 300, bottom: "-20%", right: "-5%", background: `radial-gradient(circle, ${B.gold}12 0%, transparent 70%)`, filter: "blur(30px)" }} />

            <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 md:p-12">
              {/* Left: copy */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-5"
                  style={{ background: `${B.gold}22`, color: B.goldLight, border: `1px solid ${B.gold}44` }}>
                  ★ Featured Device
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                  Bingoo Premium Metal Card
                </h3>
                <p className="text-white/60 text-lg mb-6 leading-relaxed">
                  Your professional identity, built into a premium NFC card.
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
              {/* Right: premium card visual */}
              <div className="flex justify-center">
                <PremiumMetalCardVisual size="large" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Product Categories ── */}
        {CATEGORIES.map((cat, ci) => {
          const products = cat.productIds.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
          const isHighlighted = highlightedIds.includes(cat.id);

          return (
            <div key={cat.id} className="mb-12 last:mb-0">
              <ScrollReveal delay={ci * 0.05} className="mb-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: isHighlighted ? B.orange : B.navy }} />
                  <h3 className="font-black text-lg" style={{ color: B.navy }}>{cat.label}</h3>
                  {isHighlighted && (
                    <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: B.orange + "22", color: B.orange }}>
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-slate-700 font-semibold text-base mb-1">{cat.headline}</p>
                <p className="text-slate-400 text-sm">Best for: {cat.bestFor}</p>
              </ScrollReveal>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                style={cat.productIds.length === 2 ? { maxWidth: "640px" } : undefined}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} highlighted={isHighlighted} />
                ))}
              </motion.div>
            </div>
          );
        })}

        {/* ── Profile Device vs Asset Device Comparison ── */}
        <ScrollReveal delay={0.1} className="mt-12">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Profile Device */}
            <div className="rounded-3xl p-7 border-2" style={{ borderColor: B.orange + "30", background: "#fff" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4"
                style={{ background: B.orange + "15", color: B.orange }}>
                Profile Device
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm font-bold" style={{ color: B.navy }}>
                <span>Tap</span><ArrowRight className="w-4 h-4" style={{ color: B.orange }} />
                <span>Professional Profile</span><ArrowRight className="w-4 h-4" style={{ color: B.orange }} />
                <span>Connect</span><ArrowRight className="w-4 h-4" style={{ color: B.orange }} />
                <span>Lead</span>
              </div>
              <p className="text-slate-500 text-sm mb-3">Tap → Professional Profile → Connect → Lead</p>
              <div className="flex flex-wrap gap-2">
                {["NFC Card", "Metal Card", "Wood Card", "Keychain", "Bracelet", "Sticker"].map((item) => (
                  <span key={item} className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: B.navy + "08", color: B.navy }}>{item}</span>
                ))}
              </div>
            </div>
            {/* Asset Device */}
            <div className="rounded-3xl p-7 border-2" style={{ borderColor: "#ef444430", background: "#fff" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4"
                style={{ background: "#ef444415", color: "#ef4444" }}>
                Asset Device
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm font-bold" style={{ color: B.navy }}>
                <span>Tap</span><ArrowRight className="w-4 h-4" style={{ color: "#ef4444" }} />
                <span>Lost Mode / Asset Page</span><ArrowRight className="w-4 h-4" style={{ color: "#ef4444" }} />
                <span>Finder</span><ArrowRight className="w-4 h-4" style={{ color: "#ef4444" }} />
                <span>Owner Reconnected</span>
              </div>
              <p className="text-slate-500 text-sm mb-3">Tap → Lost Mode → Finder → Owner Reconnected</p>
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

        {/* ── Asset Hardware Spotlight: Luggage Tag ── */}
        <ScrollReveal delay={0.15} className="mt-12">
          <div className="rounded-3xl overflow-hidden p-8 md:p-10 flex flex-col md:flex-row items-center gap-8"
            style={{ background: `linear-gradient(135deg, ${B.navyDark} 0%, ${B.navy} 100%)` }}>
            <div className="w-full md:w-1/3 max-w-[260px]">
              <div className="rounded-2xl bg-white/5 p-6 flex items-center justify-center" style={{ height: 200 }}>
                <img
                  src={PRODUCTS.find((p) => p.id === "nfc-luggage-tag")?.image}
                  alt="NFC Luggage Tag"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4"
                style={{ background: "#ef444422", color: "#f87171" }}>
                Asset Spotlight
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3">Travel with a smarter way back.</h3>
              <p className="text-white/60 text-base mb-5 leading-relaxed">
                Attach a Bingoo NFC luggage tag to your suitcase. If it's lost, anyone who taps or scans opens the Lost Mode recovery experience — with NFC, QR, and asset recovery built in.
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                {["NFC + QR", "Lost Mode", "Asset Recovery"].map((tag) => (
                  <span key={tag} className="text-xs font-bold px-3 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>{tag}</span>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Button size="lg" onClick={() => (window.location.href = "/product/nfc-luggage-tag")}
                  className="font-bold px-7 py-4 rounded-xl"
                  style={{ background: B.orange, color: "#fff", border: "none" }}>
                  View Luggage Tag <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Full Shop CTA ── */}
        <ScrollReveal delay={0.2} className="mt-12 text-center">
          <h3 className="font-black text-xl md:text-2xl mb-2" style={{ color: B.navy }}>Looking for something specific?</h3>
          <p className="text-slate-500 text-base mb-6">Explore the complete Bingoo NFC collection.</p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Button size="lg" onClick={() => (window.location.href = "/shop")}
              className="font-black text-base px-10 py-5 rounded-2xl"
              style={{ background: B.navy, color: "#fff", border: "none" }}>
              View All Devices <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  );
}