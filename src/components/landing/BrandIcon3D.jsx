import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import BingooLogo from "@/components/bingoo/BingooLogo";

const B = {
  navy: "#0B2E6B",
  navyDark: "#071d47",
  navyLight: "#1a4a9e",
  orange: "#FF7A00",
  gold: "#FDBA21"
};

/**
 * Premium interactive 3D Bingoo brand icon.
 * - Tracks the pointer to tilt the disc in 3D (spring-smoothed for buttery motion)
 * - Continuous slow rotation of an outer accent ring + counter-rotating inner ring
 * - Gentle float, top gloss highlight and a glassmorphic pedestal for real depth
 */
export default function BrandIcon3D({ size = 160, className = "" }) {
  const ref = useRef(null);

  // Pointer-driven tilt, normalized to -1..1 on each axis then springed
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const springOpts = { stiffness: 120, damping: 18, mass: 0.6 };
  const sx = useSpring(px, springOpts);
  const sy = useSpring(py, springOpts);
  const rotateY = useTransform(sx, [-1, 1], [-22, 22]);
  const rotateX = useTransform(sy, [-1, 1], [18, -18]);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    px.set(nx * 2);
    py.set(ny * 2);
  };
  const handleLeave = () => { px.set(0); py.set(0); };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size, perspective: 900 }}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${B.orange}55 0%, transparent 70%)` }}
        animate={{ opacity: [0.5, 0.85, 0.5], scale: [1, 1.12, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Outer rotating accent ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -8,
          border: `2px dashed ${B.gold}66`,
          maskImage: "linear-gradient(135deg, transparent 18%, black 50%, transparent 82%)",
          WebkitMaskImage: "linear-gradient(135deg, transparent 18%, black 50%, transparent 82%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner counter-rotating thin ring */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ inset: size * 0.06, border: `1px solid ${B.orange}33` }}
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* 3D disc with brand logo — tilts toward the pointer */}
      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: size,
          height: size,
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          background: `linear-gradient(145deg, ${B.navy} 0%, ${B.navyLight} 60%, ${B.navyDark} 100%)`,
          boxShadow: [
            `0 24px 50px -12px rgba(11,46,107,0.6)`,
            `0 10px 24px -8px rgba(255,122,0,0.4)`,
            `inset 0 2px 8px rgba(255,255,255,0.22)`,
            `inset 0 -10px 22px rgba(0,0,0,0.4)`,
          ].join(", "),
          border: `1.5px solid rgba(255,255,255,0.2)`,
        }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Top highlight gloss */}
        <div
          className="absolute top-1 left-1 right-1 h-1/2 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
            maskImage: "linear-gradient(180deg, black, transparent)",
            WebkitMaskImage: "linear-gradient(180deg, black, transparent)",
          }}
        />
        {/* Brand logo */}
        <div className="relative z-10 flex items-center justify-center"
          style={{ width: size * 0.62, height: size * 0.62, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.45))" }}>
          <BingooLogo className="w-full h-full" animated={false} />
        </div>
        {/* Inner gold ring */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ inset: size * 0.12, border: `1px solid ${B.gold}40`, boxShadow: `inset 0 0 18px ${B.gold}25` }}
        />
      </motion.div>

      {/* Glassmorphic pedestal / shadow base */}
      <motion.div
        className="absolute rounded-full blur-md pointer-events-none"
        style={{
          bottom: -size * 0.12,
          width: size * 0.7,
          height: size * 0.12,
          background: `radial-gradient(ellipse, ${B.navyDark}cc 0%, transparent 70%)`,
        }}
        animate={{ scaleX: [1, 0.86, 1], opacity: [0.5, 0.34, 0.5] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}