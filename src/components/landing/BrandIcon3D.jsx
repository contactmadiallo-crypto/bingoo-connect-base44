import { motion } from "framer-motion";

const B = {
  navy: "#0B2E6B",
  navyDark: "#071d47",
  navyLight: "#1a4a9e",
  orange: "#FF7A00",
  gold: "#FDBA21"
};

const BRAND_LOGO = "https://media.base44.com/images/public/692bd9007b93ba81de543346/e30f4e65a_BingooConnectBrand.png";

/**
 * Premium 3D Bingoo brand icon.
 * Uses the official Bingoo Connect logo layered with CSS 3D transforms,
 * perspective, animated glow rings, and a glassmorphic pedestal to create
 * a real sense of depth — not just a flat image with a shadow.
 */
export default function BrandIcon3D({ size = 160, className = "" }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size, perspective: 800 }}>
      {/* Ambient glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${B.orange}55 0%, transparent 70%)` }}
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Outer rotating ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: -6,
          border: `2px dashed ${B.gold}66`,
          maskImage: "linear-gradient(135deg, transparent 20%, black 50%, transparent 80%)",
          WebkitMaskImage: "linear-gradient(135deg, transparent 20%, black 50%, transparent 80%)"
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />

      {/* 3D disc with the brand logo */}
      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          transformStyle: "preserve-3d",
          background: `linear-gradient(145deg, ${B.navy} 0%, ${B.navyLight} 60%, ${B.navyDark} 100%)`,
          boxShadow: [
            `0 20px 40px -10px rgba(11,46,107,0.55)`,
            `0 8px 20px -6px rgba(255,122,0,0.35)`,
            `inset 0 2px 6px rgba(255,255,255,0.18)`,
            `inset 0 -8px 18px rgba(0,0,0,0.35)`
          ].join(", "),
          border: `1.5px solid rgba(255,255,255,0.18)`
        }}
        animate={{ y: [0, -10, 0], rotateY: [0, 8, 0], rotateX: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
        {/* Top highlight gloss */}
        <div
          className="absolute top-1 left-1 right-1 h-1/2 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)",
            maskImage: "linear-gradient(180deg, black, transparent)",
            WebkitMaskImage: "linear-gradient(180deg, black, transparent)"
          }}
        />
        {/* Brand logo (keeps aspect, centered) */}
        <img
          src={BRAND_LOGO}
          alt="Bingoo Connect"
          className="relative z-10 object-contain"
          style={{ width: size * 0.62, height: size * 0.62, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}
        />
        {/* Inner gold ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: size * 0.12,
            border: `1px solid ${B.gold}40`,
            boxShadow: `inset 0 0 18px ${B.gold}25`
          }}
        />
      </motion.div>

      {/* Glassmorphic pedestal / shadow base */}
      <motion.div
        className="absolute rounded-full blur-md"
        style={{
          bottom: -size * 0.12,
          width: size * 0.7,
          height: size * 0.12,
          background: `radial-gradient(ellipse, ${B.navyDark}cc 0%, transparent 70%)`
        }}
        animate={{ scaleX: [1, 0.85, 1], opacity: [0.5, 0.35, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}