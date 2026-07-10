import { useRef } from "react";
import { Link } from "react-router-dom";
import LayoutMiniPreview from "./LayoutMiniPreview";

// ── 15 curated layouts — structurally unique ─────────────────────────────────
export const layouts = [
  { id: "classic",      name: "Classic",       desc: "Cover + centered overlap", pro: false },
  { id: "minimal",      name: "Minimal",       desc: "Horizontal accent header",  pro: false },
  { id: "card",         name: "Card",          desc: "Slim strip + floating card", pro: false },
  { id: "image_hero",   name: "Image Hero",    desc: "Full-bleed photo, avatar BR", pro: true },
  { id: "glassmorphic", name: "Glass",         desc: "Frosted glass on gradient",  pro: true },
  { id: "dark",         name: "Dark Premium",  desc: "Cinematic dark + glow ring", pro: true },
  { id: "aurora",       name: "Aurora",        desc: "Northern-lights gradient",   pro: true },
  { id: "magazine",     name: "Magazine",      desc: "Editorial photo header",     pro: true },
  { id: "executive",    name: "Executive",     desc: "Right-aligned avatar",       pro: true },
  { id: "premium_salon", name: "Salon / Service", desc: "Service menu, stylist showcase", pro: true },
  { id: "modern_law",   name: "Law Firm",      desc: "Practice areas, attorney profiles", pro: true },
  { id: "corporate",    name: "Business Team", desc: "Team directory, company branding", pro: true },
  { id: "modern_saas",  name: "Split",         desc: "Accent bar + horizontal row", pro: true },
  { id: "bold",         name: "Bold Gradient", desc: "Color hero + wave divider",  pro: true },
  { id: "neon",         name: "Neon",          desc: "Glow ring on near-black",    pro: true },
  { id: "retro",        name: "Retro",         desc: "80s editorial serif header", pro: true },
  { id: "floating",        name: "Floating",          desc: "Detached radial bg card",    pro: true },
  { id: "luxury_gold",     name: "Luxury Gold",       desc: "Gold ring, dark prestige",   pro: true },
  { id: "ny_championship", name: "NY Championship",   desc: "Bold sports-style header",   pro: true },
  { id: "lions_teranga",   name: "Lions de la Téranga", desc: "Heritage pride edition",   pro: true },
];

export default function LayoutPicker({ value, onChange, color = "#2563eb", plan = "free", isAdmin = false }) {
  const isPro = isAdmin || ["pro", "professional", "business", "salon", "restaurant", "lawfirm", "corporate"].includes(plan);
  const scrollRef = useRef(null);

  return (
    <div>
      {/* ── Swipe carousel: 1 large card on mobile, ~2 on tablet/desktop ── */}
      <div
        ref={scrollRef}
        className="scrollbar-hide"
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          overflowY: "visible",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 12,
          paddingTop: 4,
          paddingLeft: 2,
          paddingRight: 2,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {layouts.map((layout) => {
          const locked = layout.pro && !isPro;
          const isSelected = value === layout.id;

          return (
            <LayoutCard
              key={layout.id}
              layout={layout}
              color={color}
              isSelected={isSelected}
              locked={locked}
              onSelect={() => onChange(layout.id)}
            />
          );
        })}
      </div>

      {!isPro && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <span className="text-sm">✨</span>
          <p className="text-xs text-amber-700 font-semibold flex-1">
            Upgrade to <strong>Professional</strong> to unlock 12 premium layouts.
          </p>
          <Link to="/pricing" className="text-xs font-black text-amber-600 hover:text-amber-700 whitespace-nowrap">
            Upgrade →
          </Link>
        </div>
      )}
    </div>
  );
}

function LayoutCard({ layout, color, isSelected, locked, onSelect }) {
  // Mobile: calc(85vw - 24px) ≈ 1 card + peek of next
  // Tablet/desktop: 180px ≈ 2 per page in a ~400px container
  const CARD_W = "min(190px, calc(82vw - 20px))";
  const PREVIEW_H = 260; // px — tall enough to appreciate layout structure

  const inner = (
    <>
      {/* Preview thumbnail */}
      <div
        style={{
          borderRadius: 14,
          overflow: "hidden",
          height: PREVIEW_H,
          position: "relative",
          boxShadow: isSelected
            ? `0 0 0 3px ${color}, 0 6px 24px rgba(0,0,0,0.22)`
            : "0 2px 12px rgba(0,0,0,0.13)",
          transition: "box-shadow 0.2s",
          border: isSelected ? "none" : "1.5px solid rgba(0,0,0,0.08)",
        }}
      >
        <LayoutMiniPreview
          layoutId={layout.id}
          isSelected={isSelected}
          previewHeight={PREVIEW_H}
        />

        {locked && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.38)",
            borderRadius: 12,
          }}>
            <span style={{ fontSize: 22 }}>🔒</span>
            <span style={{
              marginTop: 4, fontSize: 11, fontWeight: 900,
              color: "#92400e", background: "#fef3c7",
              padding: "2px 8px", borderRadius: 999,
            }}>Professional</span>
          </div>
        )}

        {isSelected && (
          <div style={{
            position: "absolute", top: 8, right: 8,
            width: 20, height: 20, borderRadius: "50%",
            background: "#2563eb", display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(37,99,235,0.5)",
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5.5l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{ marginTop: 7, textAlign: "center" }}>
        <p style={{
          fontSize: 12, fontWeight: 700, margin: 0,
          color: isSelected ? "#2563eb" : "#1e293b",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {layout.name}
        </p>
        <p style={{
          fontSize: 12, margin: "1px 0 0",
          color: "#94a3b8",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {layout.desc}
        </p>
      </div>
    </>
  );

  const wrapperStyle = {
    flexShrink: 0,
    width: CARD_W,
    minWidth: CARD_W,
    scrollSnapAlign: "start",
  };

  if (locked) {
    return (
      <div style={wrapperStyle}>
        <Link to="/pricing" style={{ textDecoration: "none", display: "block" }}>
          {inner}
        </Link>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <button
        onClick={onSelect}
        style={{
          background: "none", border: "none", padding: 0,
          cursor: "pointer", width: "100%", textAlign: "center",
          display: "block",
        }}
      >
        {inner}
      </button>
    </div>
  );
}