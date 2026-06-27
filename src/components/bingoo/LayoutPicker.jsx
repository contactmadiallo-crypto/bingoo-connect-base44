import { Link } from "react-router-dom";
import LayoutMiniPreview from "./LayoutMiniPreview";

// ── Layout catalog metadata (id, name, desc, pro flag) ─────────────────────
// No preview functions here — LayoutMiniPreview renders the REAL layout.
export const layouts = [
  // ── FREE ─────────────────────────────────────────────────
  { id: "classic",         name: "Classic",          desc: "Cover + card",           pro: false },
  { id: "minimal",         name: "Minimal",          desc: "Clean, no cover",        pro: false },
  { id: "card",            name: "Card Grid",        desc: "Portfolio grid",         pro: false },
  // ── PRO ──────────────────────────────────────────────────
  { id: "dark",            name: "Dark",             desc: "Dark glassmorphism",     pro: true  },
  { id: "bold",            name: "Bold",             desc: "Full gradient",          pro: true  },
  { id: "split",           name: "Split",            desc: "Side accent bar",        pro: true  },
  { id: "glassmorphic",    name: "Glass",            desc: "Frosted glass",          pro: true  },
  { id: "gradient",        name: "Gradient",         desc: "Flowing colors",         pro: true  },
  { id: "neon",            name: "Neon",             desc: "Glowing neon vibes",     pro: true  },
  { id: "retro",           name: "Retro",            desc: "80s bold style",         pro: true  },
  { id: "magazine",        name: "Magazine",         desc: "Editorial",              pro: true  },
  { id: "aurora",          name: "Aurora",           desc: "Northern lights",        pro: true  },
  { id: "minimal_dark",    name: "Minimal Dark",     desc: "Clean dark mode",        pro: true  },
  { id: "pastel",          name: "Pastel",           desc: "Soft pastel tones",      pro: true  },
  { id: "corporate",       name: "Corporate",        desc: "Professional B2B",       pro: true  },
  { id: "floating",        name: "Floating",         desc: "Floating card style",    pro: true  },
  { id: "sunset",          name: "Sunset",           desc: "Warm orange gradient",   pro: true  },
  { id: "ocean",           name: "Ocean",            desc: "Deep sea vibes",         pro: true  },
  { id: "forest",          name: "Forest",           desc: "Nature & earthy tones",  pro: true  },
  { id: "luxury",          name: "Luxury",           desc: "Gold & black",           pro: true  },
  { id: "bubbly",          name: "Bubbly",           desc: "Fun colorful",           pro: true  },
  { id: "monochrome",      name: "Mono",             desc: "Black & white stark",    pro: true  },
  { id: "cyberpunk",       name: "Cyberpunk",        desc: "Futuristic",             pro: true  },
  { id: "frosted",         name: "Frosted",          desc: "iOS blur panels",        pro: true  },
  { id: "paper",           name: "Paper",            desc: "Clean editorial serif",  pro: true  },
  { id: "wave",            name: "Wave",             desc: "Organic wave shapes",    pro: true  },
  { id: "glass_3d",        name: "3D Glass",         desc: "Depth & glass layers",   pro: true  },
  { id: "luxury_gold",     name: "Luxury Gold",      desc: "Premium gold prestige",  pro: true  },
  { id: "executive_corp",  name: "Executive",        desc: "C-suite prestige",       pro: true  },
  { id: "neon_tech",       name: "Neon Tech",        desc: "Cybernetic glow",        pro: true  },
  { id: "modern_law",      name: "Modern Law",       desc: "Prestigious legal",      pro: true  },
  { id: "premium_salon",   name: "Premium Salon",    desc: "Chic & elegant",         pro: true  },
  { id: "realtor_luxury",  name: "Realtor",          desc: "Property prestige",      pro: true  },
  { id: "animated_gradient",name: "Animated",        desc: "Living gradient",        pro: true  },
  { id: "video_bg",        name: "Video BG",         desc: "Dynamic video backdrop", pro: true  },
  { id: "parallax",        name: "Parallax",         desc: "Depth scroll layers",    pro: true  },
  { id: "ny_championship", name: "🏀 NY Champ",      desc: "NBA Finals Edition",     pro: true  },
  { id: "lions_teranga",   name: "🦁 Lions",          desc: "World Cup Edition",      pro: true  },
  { id: "portrait",        name: "Portrait",         desc: "Large centered avatar",  pro: true  },
  { id: "image_hero",      name: "Image Hero",       desc: "Full-bleed photo hero",  pro: true  },
  { id: "glass_card",      name: "Glass Card",       desc: "Frosted card",           pro: true  },
  { id: "modern_saas",     name: "Modern SaaS",      desc: "Product landing feel",   pro: true  },
  { id: "executive",       name: "Executive Right",  desc: "Right-aligned avatar",   pro: true  },
  { id: "color_gradient",  name: "Color Gradient",   desc: "Vivid color hero",       pro: true  },
];

export default function LayoutPicker({ value, onChange, color = "#2563eb", plan = "free", isAdmin = false }) {
  const isPro = isAdmin || ["pro", "professional", "business", "salon", "restaurant", "lawfirm", "corporate"].includes(plan);

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {layouts.map((layout) => {
          const locked = layout.pro && !isPro;
          const isSelected = value === layout.id;

          return (
            <div key={layout.id} className="relative">
              {locked ? (
                <Link
                  to="/pricing"
                  className="flex flex-col gap-1.5 rounded-xl transition-all focus:outline-none hover:ring-2 hover:ring-amber-400 hover:ring-offset-1 block"
                >
                  <div className="relative rounded-xl overflow-hidden">
                    <div className="opacity-40 pointer-events-none">
                      <LayoutMiniPreview layoutId={layout.id} color={color} isSelected={false} />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 rounded-xl">
                      <span className="text-base">🔒</span>
                      <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full mt-0.5">PRO</span>
                    </div>
                  </div>
                  <div className="text-center pb-1">
                    <p className="text-xs font-bold text-slate-400 truncate">{layout.name}</p>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => onChange(layout.id)}
                  className={`flex flex-col gap-1.5 rounded-xl transition-all focus:outline-none w-full text-left ${
                    isSelected ? "ring-2 ring-blue-600 ring-offset-2" : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-1"
                  }`}
                >
                  <LayoutMiniPreview layoutId={layout.id} color={color} isSelected={isSelected} />
                  <div className="text-center pb-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? "text-blue-600" : "text-slate-700"}`}>
                      {layout.name}
                    </p>
                    <p className="text-[10px] text-slate-400 hidden sm:block truncate">{layout.desc}</p>
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
            Upgrade to <strong>Pro</strong> to unlock 40+ premium layout styles including NY Championship, Lions of Teranga, Neon, Luxury &amp; more.
          </p>
          <Link to="/pricing" className="text-xs font-black text-amber-600 hover:text-amber-700 whitespace-nowrap">
            Upgrade →
          </Link>
        </div>
      )}
    </div>
  );
}