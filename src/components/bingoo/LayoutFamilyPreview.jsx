import React from "react";

/**
 * LayoutFamilyPreview — CSS-based structural thumbnails for the 8 layout families.
 * Each thumbnail shows a visually distinct layout structure (not just colors).
 * Lightweight: no real layout components rendered, just CSS shapes.
 */

const NAVY = "#0b2149", ORANGE = "#f97316", GOLD = "#FDBA21";

export function LayoutFamilyPreview({ familyId, isSelected }) {
  const accent = isSelected ? ORANGE : "#94a3b8";
  const bg = isSelected ? "rgba(249,115,22,0.06)" : "#f1f5f9";
  const textCol = isSelected ? "#0b2149" : "#64748b";

  // Common tiny avatar circle
  const Avatar = ({ size = 20, color = NAVY, style = {} }) => (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${color}99)`, flexShrink: 0, ...style }} />
  );

  // Common tiny text line
  const Line = ({ w = "70%", h = 3, color = "#cbd5e1", style = {} }) => (
    <div style={{ width: w, height: h, borderRadius: 2, background: color, ...style }} />
  );

  const previews = {
    executive: (
      <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ height: "45%", background: `linear-gradient(135deg, ${NAVY}, #13284f)`, position: "relative" }}>
          <Avatar size={22} color={ORANGE} style={{ position: "absolute", right: 8, bottom: -11, border: "2px solid #fff" }} />
        </div>
        <div style={{ padding: "12px 8px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
          <Line w="50%" h={3} color={NAVY} />
          <Line w="35%" h={2} />
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            <div style={{ width: 28, height: 12, borderRadius: 4, background: NAVY }} />
            <div style={{ width: 28, height: 12, borderRadius: 4, background: `${NAVY}30` }} />
          </div>
        </div>
      </div>
    ),
    creative: (
      <div style={{ borderRadius: 8, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
        <div style={{ height: "60%", background: `linear-gradient(135deg, ${ORANGE}, #fb923c, ${GOLD})`, position: "relative" }}>
          <Avatar size={18} style={{ position: "absolute", left: 8, bottom: -9, border: "2px solid #fff" }} />
          <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E1306C" }} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#25D366" }} />
          </div>
        </div>
        <div style={{ padding: "10px 8px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
          <Line w="60%" h={3} color={ORANGE} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, marginTop: 2 }}>
            <div style={{ height: 14, borderRadius: 3, background: `${ORANGE}30` }} />
            <div style={{ height: 14, borderRadius: 3, background: `${ORANGE}20` }} />
            <div style={{ height: 14, borderRadius: 3, background: `${ORANGE}15` }} />
          </div>
        </div>
      </div>
    ),
    premium_salon: (
      <div style={{ borderRadius: 8, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
        <div style={{ height: "30%", background: `linear-gradient(135deg, #8b5cf6, #a78bfa)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Avatar size={16} color="#8b5cf6" style={{ border: "2px solid #fff" }} />
        </div>
        <div style={{ padding: "6px 8px 4px", display: "flex", flexDirection: "column", gap: 2 }}>
          <Line w="45%" h={3} color="#8b5cf6" />
        </div>
        <div style={{ padding: "0 8px 6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <div style={{ height: 18, borderRadius: 4, background: "#f3e8ff", border: "1px solid #e9d5ff" }} />
          <div style={{ height: 18, borderRadius: 4, background: "#f3e8ff", border: "1px solid #e9d5ff" }} />
          <div style={{ height: 18, borderRadius: 4, background: "#f3e8ff", border: "1px solid #e9d5ff" }} />
          <div style={{ height: 18, borderRadius: 4, background: "#f3e8ff", border: "1px solid #e9d5ff" }} />
        </div>
      </div>
    ),
    modern_law: (
      <div style={{ borderRadius: 8, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
        <div style={{ height: "38%", background: `linear-gradient(135deg, ${NAVY}, #1e3a5f)`, display: "flex", alignItems: "center", padding: "0 8px", gap: 6 }}>
          <Avatar size={18} color="#3b82f6" style={{ border: "2px solid rgba(255,255,255,0.3)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Line w="40px" h={3} color="#fff" />
            <Line w="28px" h={2} color="rgba(255,255,255,0.5)" />
          </div>
        </div>
        <div style={{ padding: "6px 8px 6px", display: "flex", flexDirection: "column", gap: 3 }}>
          <Line w="30%" h={2} color={NAVY} />
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ width: 16, height: 16, borderRadius: 3, background: `${NAVY}15`, border: `1px solid ${NAVY}30` }} />
            <div style={{ width: 16, height: 16, borderRadius: 3, background: `${NAVY}15`, border: `1px solid ${NAVY}30` }} />
            <div style={{ width: 16, height: 16, borderRadius: 3, background: `${NAVY}15`, border: `1px solid ${NAVY}30` }} />
          </div>
        </div>
      </div>
    ),
    corporate: (
      <div style={{ borderRadius: 8, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
        <div style={{ height: "28%", background: `linear-gradient(135deg, ${NAVY}, #13284f)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 30, height: 14, borderRadius: 3, background: "rgba(255,255,255,0.2)" }} />
        </div>
        <div style={{ padding: "6px 8px 4px", display: "flex", justifyContent: "center", gap: 4 }}>
          <Avatar size={14} color={NAVY} />
          <Avatar size={14} color={ORANGE} />
          <Avatar size={14} color={NAVY} />
        </div>
        <div style={{ padding: "0 8px 6px", display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
          <Line w="40%" h={2} color={NAVY} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, width: "100%" }}>
            <div style={{ height: 12, borderRadius: 3, background: `${NAVY}10` }} />
            <div style={{ height: 12, borderRadius: 3, background: `${NAVY}10` }} />
          </div>
        </div>
      </div>
    ),
    aurora: (
      <div style={{ borderRadius: 8, overflow: "hidden", height: "100%", background: `linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)`, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Avatar size={20} color="#fff" style={{ border: "2px solid rgba(255,255,255,0.5)" }} />
          <Line w="50%" h={3} color="#fff" />
          <Line w="35%" h={2} color="rgba(255,255,255,0.6)" />
          <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.3)" }} />
          </div>
        </div>
      </div>
    ),
    minimal: (
      <div style={{ borderRadius: 8, overflow: "hidden", height: "100%", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 8px", gap: 4 }}>
        <Avatar size={18} color={NAVY} />
        <Line w="45%" h={3} color={NAVY} />
        <Line w="30%" h={2} />
        <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
          <div style={{ width: 24, height: 10, borderRadius: 5, background: NAVY }} />
          <div style={{ width: 24, height: 10, borderRadius: 5, border: `1px solid ${NAVY}40` }} />
        </div>
      </div>
    ),
    image_hero: (
      <div style={{ borderRadius: 8, overflow: "hidden", height: "100%", background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ height: "65%", background: `linear-gradient(135deg, ${NAVY}, ${ORANGE})`, position: "relative" }}>
          <div style={{ position: "absolute", bottom: 4, left: 6, display: "flex", flexDirection: "column", gap: 2 }}>
            <Line w="40px" h={3} color="#fff" />
            <Line w="28px" h={2} color="rgba(255,255,255,0.6)" />
          </div>
          <div style={{ position: "absolute", top: 6, right: 6, width: 12, height: 12, borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: "4px solid #fff", marginLeft: 1 }} />
          </div>
        </div>
        <div style={{ padding: "6px 8px 6px", display: "flex", gap: 4, alignItems: "center" }}>
          <Avatar size={14} color={ORANGE} />
          <Line w="40%" h={2} />
        </div>
      </div>
    ),
  };

  return (
    <div style={{
      width: "100%",
      height: 80,
      borderRadius: 10,
      overflow: "hidden",
      background: bg,
      border: isSelected ? `2px solid ${accent}` : "1.5px solid rgba(0,0,0,0.06)",
      boxShadow: isSelected ? `0 0 0 1px ${accent}40` : "none",
      transition: "all 0.2s",
    }}>
      {previews[familyId] || previews.executive}
    </div>
  );
}

export default LayoutFamilyPreview;