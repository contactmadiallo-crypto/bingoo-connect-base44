import { useRef } from "react";
import { Link } from "react-router-dom";
import LayoutMiniPreview from "./LayoutMiniPreview";

// ── Layout catalog — ordered by visual family ────────────────────────────────
export const layouts = [
  // FREE
  { id: "classic",          name: "Classic",          desc: "Cover + overlapping avatar", pro: false },
  { id: "minimal",          name: "Minimal",          desc: "Compact horizontal header",  pro: false },
  { id: "card",             name: "Card",             desc: "Floating identity card",      pro: false },
  // PRO — cover-based
  { id: "portrait",         name: "Portrait",         desc: "Large centered avatar",       pro: true  },
  { id: "image_hero",       name: "Image Hero",       desc: "Full-bleed photo hero",       pro: true  },
  { id: "magazine",         name: "Magazine",         desc: "Editorial image layout",      pro: true  },
  { id: "executive",        name: "Executive",        desc: "Right-aligned avatar",        pro: true  },
  // PRO — gradient / color
  { id: "bold",             name: "Bold",             desc: "Vivid gradient + wave",       pro: true  },
  { id: "color_gradient",   name: "Color Pop",        desc: "Vivid color hero",            pro: true  },
  { id: "sunset",           name: "Sunset",           desc: "Warm orange gradient",        pro: true  },
  { id: "ocean",            name: "Ocean",            desc: "Deep blue gradient",          pro: true  },
  { id: "wave",             name: "Wave",             desc: "Wave SVG divider",            pro: true  },
  { id: "gradient",         name: "Gradient",         desc: "Flowing mesh gradient",       pro: true  },
  // PRO — glass / frosted
  { id: "glassmorphic",     name: "Glass",            desc: "Frosted glass panels",        pro: true  },
  { id: "frosted",          name: "Frosted",          desc: "iOS blur header",             pro: true  },
  { id: "glass_3d",         name: "3D Glass",         desc: "Deep glass layers",           pro: true  },
  // PRO — dark
  { id: "dark",             name: "Dark",             desc: "Cinematic dark + glow",       pro: true  },
  { id: "neon",             name: "Neon",             desc: "Glow effects, neon borders",  pro: true  },
  { id: "aurora",           name: "Aurora",           desc: "Northern lights gradient",    pro: true  },
  { id: "minimal_dark",     name: "Minimal Dark",     desc: "Clean dark list interface",   pro: true  },
  { id: "luxury",           name: "Luxury",           desc: "Gold & black prestige",       pro: true  },
  { id: "neon_tech",        name: "Neon Tech",        desc: "Cybernetic glow",             pro: true  },
  // PRO — business
  { id: "split",            name: "Split",            desc: "Side accent bar",             pro: true  },
  { id: "modern_saas",      name: "Modern SaaS",      desc: "Horizontal product header",   pro: true  },
  { id: "corporate",        name: "Corporate",        desc: "Professional B2B layout",     pro: true  },
  { id: "executive_corp",   name: "Executive Corp",   desc: "C-suite dark prestige",       pro: true  },
  { id: "modern_law",       name: "Modern Law",       desc: "Prestigious legal layout",    pro: true  },
  { id: "luxury_gold",      name: "Luxury Gold",      desc: "Premium gold prestige",       pro: true  },
  // PRO — fun / editorial
  { id: "pastel",           name: "Pastel",           desc: "Soft pink/lavender tones",    pro: true  },
  { id: "bubbly",           name: "Bubbly",           desc: "Playful bubble decorations",  pro: true  },
  { id: "floating",         name: "Floating",         desc: "Detached floating card",      pro: true  },
  { id: "retro",            name: "Retro",            desc: "80s bold editorial",          pro: true  },
  { id: "paper",            name: "Paper",            desc: "Clean editorial serif",       pro: true  },
  { id: "monochrome",       name: "Mono",             desc: "Black & white stark",         pro: true  },
  { id: "cyberpunk",        name: "Cyberpunk",        desc: "Futuristic glitch style",     pro: true  },
  { id: "forest",           name: "Forest",           desc: "Nature green gradient",       pro: true  },
  { id: "premium_salon",    name: "Salon",            desc: "Chic & elegant salon feel",   pro: true  },
  { id: "realtor_luxury",   name: "Realtor",          desc: "Property prestige layout",    pro: true  },
  { id: "animated_gradient",name: "Animated",         desc: "Living aurora gradient",      pro: true  },
  { id: "video_bg",         name: "Video BG",         desc: "Dynamic video backdrop",      pro: true  },
  { id: "parallax",         name: "Parallax",         desc: "Depth scroll layers",         pro: true  },
  // PRO — special edition
  { id: "ny_championship",  name: "🏀 NY Champ",       desc: "NBA Finals Edition",          pro: true  },
  { id: "lions_teranga",    name: "🦁 Lions",           desc: "World Cup Edition",           pro: true  },
];

// Card dimensions
const CARD_W = 116; // px
const CARD_GAP = 12; // px

export default function LayoutPicker({ value, onChange, color = "#2563eb", plan = "free", isAdmin = false }) {
  const isPro = isAdmin || ["pro", "professional", "business", "salon", "restaurant", "lawfirm", "corporate"].includes(plan);
  const scrollRef = useRef(null);

  return (
    <div>
      {/* ── Swipe carousel ──────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: CARD_GAP,
          overflowX: "auto",
          overflowY: "visible",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 10,
          paddingTop: 4,
          // Hide scrollbar cross-browser
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="scrollbar-hide"
      >
        {layouts.map((layout) => {
          const locked = layout.pro && !isPro;
          const isSelected = value === layout.id;

          return (
            <div
              key={layout.id}
              style={{
                flexShrink: 0,
                width: CARD_W,
                scrollSnapAlign: "start",
              }}
            >
              {locked ? (
                <Link
                  to="/pricing"
                  className="block focus:outline-none"
                  style={{ textDecoration: "none" }}
                >
                  <div style={{ position: "relative", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ opacity: 0.4, pointerEvents: "none" }}>
                      <LayoutMiniPreview layoutId={layout.id} color={color} isSelected={false} />
                    </div>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.08)", borderRadius: 10 }}>
                      <span style={{ fontSize: 16 }}>🔒</span>
                      <span style={{ fontSize: 9, fontWeight: 900, color: "#92400e", background: "#fef3c7", padding: "2px 7px", borderRadius: 999, marginTop: 3 }}>PRO</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 5 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{layout.name}</p>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => onChange(layout.id)}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", width: "100%", textAlign: "center" }}
                >
                  <div style={{
                    borderRadius: 10,
                    outline: isSelected ? "2.5px solid #2563eb" : "none",
                    outlineOffset: 2,
                    boxShadow: isSelected ? "0 0 0 2.5px #2563eb" : "none",
                    transition: "box-shadow 0.15s, outline 0.15s",
                  }}>
                    <LayoutMiniPreview layoutId={layout.id} color={color} isSelected={isSelected} />
                  </div>
                  <div style={{ marginTop: 5 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: isSelected ? "#2563eb" : "#374151", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {layout.name}
                    </p>
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!isPro && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <span className="text-base">✨</span>
          <p className="text-xs text-amber-700 font-semibold flex-1">
            Upgrade to <strong>Pro</strong> to unlock 40+ premium layout styles.
          </p>
          <Link to="/pricing" className="text-xs font-black text-amber-600 hover:text-amber-700 whitespace-nowrap">
            Upgrade →
          </Link>
        </div>
      )}
    </div>
  );
}