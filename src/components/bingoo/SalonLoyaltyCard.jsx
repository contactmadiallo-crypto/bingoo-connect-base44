import { useState } from "react";
import { Star, Gift } from "lucide-react";

// Simple client-side loyalty stamp card stored in localStorage per profile
export default function SalonLoyaltyCard({ profileId, color = "#0B2E6B", isDark }) {
  const key = `bingoo_loyalty_${profileId}`;
  const MAX = 10;

  const [stamps, setStamps] = useState(() => {
    try { return parseInt(localStorage.getItem(key) || "0"); } catch { return 0; }
  });
  const [redeemed, setRedeemed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const addStamp = () => {
    if (stamps >= MAX) return;
    const next = stamps + 1;
    setStamps(next);
    try { localStorage.setItem(key, String(next)); } catch {}
    if (next === MAX) setTimeout(() => setShowHint(true), 400);
  };

  const redeem = () => {
    setStamps(0);
    setRedeemed(true);
    setShowHint(false);
    try { localStorage.setItem(key, "0"); } catch {}
    setTimeout(() => setRedeemed(false), 4000);
  };

  const hexRgb = (hex, a = 1) => {
    if (!hex || hex.length < 7) return `rgba(0,0,0,${a})`;
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>🎁</span>
        <span style={{ fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8" }}>Loyalty Card</span>
      </div>

      <div style={{
        padding: "20px", borderRadius: 20,
        background: isDark ? "rgba(255,255,255,0.05)" : hexRgb(color, 0.04),
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${hexRgb(color, 0.15)}`,
      }}>
        {redeemed ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 16, color: isDark ? "#fff" : "#0f172a" }}>Reward Redeemed!</p>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}>Show this to your stylist. New card started!</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: isDark ? "#fff" : "#0f172a" }}>Collect {MAX} stamps</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: isDark ? "rgba(255,255,255,0.45)" : "#64748b" }}>Get your {MAX}th visit FREE ✨</p>
              </div>
              <span style={{ fontWeight: 900, fontSize: 13, color: color }}>{stamps}/{MAX}</span>
            </div>

            {/* Stamp grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
              {Array.from({ length: MAX }).map((_, i) => (
                <div key={i} onClick={addStamp} style={{
                  aspectRatio: "1", borderRadius: 12, cursor: i < stamps ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: i < stamps
                    ? `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.7)})`
                    : isDark ? "rgba(255,255,255,0.07)" : hexRgb(color, 0.06),
                  border: i < stamps ? "none" : isDark ? "1.5px dashed rgba(255,255,255,0.15)" : `1.5px dashed ${hexRgb(color, 0.25)}`,
                  transition: "transform 0.15s",
                  transform: i === stamps - 1 ? "scale(1.08)" : "scale(1)",
                }}>
                  {i < stamps
                    ? <Star size={18} fill="#fff" color="#fff" />
                    : <span style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.2)" : hexRgb(color, 0.3) }}>{i + 1}</span>
                  }
                </div>
              ))}
            </div>

            {stamps < MAX ? (
              <p style={{ margin: 0, fontSize: 11, textAlign: "center", color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8" }}>
                Tap a stamp after each visit • {MAX - stamps} more to go!
              </p>
            ) : (
              <button onClick={redeem} style={{
                width: "100%", padding: "12px", borderRadius: 14, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${color}, ${hexRgb(color, 0.8)})`,
                color: "#fff", fontWeight: 900, fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: `0 6px 20px ${hexRgb(color, 0.4)}`,
              }}>
                <Gift size={16} /> Redeem Free Service!
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}