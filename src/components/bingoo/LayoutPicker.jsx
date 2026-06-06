import { Link } from "react-router-dom";

const layouts = [
  // ── FREE ──────────────────────────────────────────────────────
  {
    id: "classic",
    name: "Classic",
    desc: "Cover + card",
    pro: false,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-slate-100">
        <div className="h-10 rounded-t-lg" style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }} />
        <div className="flex-1 bg-white flex flex-col items-center pt-1 px-2 gap-1">
          <div className="w-7 h-7 rounded-full -mt-3.5 border-2 border-white shadow" style={{ background: color }} />
          <div className="w-14 h-1.5 bg-slate-200 rounded" />
          <div className="w-10 h-1 bg-slate-100 rounded" />
          <div className="w-full mt-1 space-y-1">
            <div className="w-full h-2 bg-slate-100 rounded-full" />
            <div className="w-full h-2 bg-slate-100 rounded-full" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "minimal",
    name: "Minimal",
    desc: "Clean, no cover",
    pro: false,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-slate-100 bg-white p-2 gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: color }} />
          <div className="flex flex-col gap-0.5">
            <div className="w-14 h-1.5 bg-slate-200 rounded" />
            <div className="w-10 h-1 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="border-t border-slate-100 pt-1.5 space-y-1">
          <div className="w-full h-2 rounded-full" style={{ background: `${color}22` }} />
          <div className="w-full h-2 bg-slate-100 rounded-full" />
          <div className="w-full h-2 bg-slate-100 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: "card",
    name: "Card Grid",
    desc: "Portfolio grid",
    pro: false,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-slate-50 p-2 gap-1">
        <div className="flex flex-col items-center gap-1 pb-1 border-b border-slate-200">
          <div className="w-7 h-7 rounded-full" style={{ background: color }} />
          <div className="w-12 h-1.5 bg-slate-300 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="h-4 bg-white rounded border border-slate-200" />
          <div className="h-4 bg-white rounded border border-slate-200" />
        </div>
      </div>
    ),
  },
  // ── PRO ───────────────────────────────────────────────────────
  {
    id: "dark",
    name: "Dark",
    desc: "Dark glassmorphism",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-slate-900 p-2 gap-1.5">
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full border-2 border-slate-700" style={{ background: color }} />
          <div className="w-12 h-1.5 bg-slate-600 rounded" />
        </div>
        <div className="space-y-1 mt-1">
          <div className="w-full h-2 rounded-full" style={{ background: color + "44" }} />
          <div className="w-full h-2 bg-slate-700 rounded-full" />
          <div className="w-full h-2 bg-slate-700 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: "bold",
    name: "Bold",
    desc: "Full gradient",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden p-2 gap-1.5" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full bg-white/30 border-2 border-white/50" />
          <div className="w-12 h-1.5 bg-white/60 rounded" />
        </div>
        <div className="space-y-1 mt-1">
          <div className="w-full h-2 bg-white/40 rounded-full" />
          <div className="w-full h-2 bg-white/25 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: "split",
    name: "Split",
    desc: "Side accent bar",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex rounded-lg overflow-hidden border border-slate-100">
        <div className="w-2 flex-shrink-0 rounded-l-lg" style={{ background: color }} />
        <div className="flex-1 bg-white p-1.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: color }} />
            <div className="flex flex-col gap-0.5">
              <div className="w-10 h-1.5 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full" style={{ background: `${color}22` }} />
            <div className="w-full h-1.5 bg-slate-100 rounded-full" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "glassmorphic",
    name: "Glass",
    desc: "Frosted glass",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden p-2 gap-1.5" style={{ background: `linear-gradient(135deg, ${color}33, #e0e7ff)` }}>
        <div className="flex flex-col items-center gap-1 bg-white/40 rounded-lg p-1">
          <div className="w-6 h-6 rounded-full" style={{ background: color }} />
          <div className="w-10 h-1 bg-white/70 rounded" />
        </div>
        <div className="space-y-1 bg-white/20 rounded-lg p-1">
          <div className="w-full h-1.5 bg-white/40 rounded-full" />
          <div className="w-full h-1.5 bg-white/30 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: "gradient",
    name: "Gradient",
    desc: "Flowing colors",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden p-2 gap-1" style={{ background: `linear-gradient(135deg, ${color}22, ${color}88)` }}>
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-6 h-6 rounded-full bg-white/80" />
          <div className="w-10 h-1 bg-white/60 rounded" />
        </div>
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-white/40 rounded-full" />
          <div className="w-full h-1.5 bg-white/25 rounded-full" />
        </div>
      </div>
    ),
  },
  // ── NEW PRO LAYOUTS ─────────────────────────────────────────
  {
    id: "neon",
    name: "Neon",
    desc: "Glowing neon vibes",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-black p-2 gap-1.5">
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          <div className="w-12 h-1.5 rounded" style={{ background: color, opacity: 0.8 }} />
        </div>
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full border" style={{ borderColor: color, opacity: 0.6 }} />
          <div className="w-full h-2 rounded-full border" style={{ borderColor: color, opacity: 0.4 }} />
        </div>
      </div>
    ),
  },
  {
    id: "retro",
    name: "Retro",
    desc: "80s bold style",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-yellow-50 p-2 gap-1.5 border-2 border-black">
        <div className="bg-black text-center py-0.5 rounded">
          <div className="w-6 h-1.5 bg-yellow-300 rounded mx-auto" />
        </div>
        <div className="flex flex-col items-center gap-1 border border-black rounded p-1">
          <div className="w-6 h-6 rounded-full border-2 border-black" style={{ background: color }} />
          <div className="w-10 h-1 bg-black rounded" />
        </div>
        <div className="space-y-0.5">
          <div className="w-full h-2 bg-black rounded" style={{ opacity: 0.8 }} />
          <div className="w-full h-2 border border-black rounded" />
        </div>
      </div>
    ),
  },
  {
    id: "magazine",
    name: "Magazine",
    desc: "Editorial editorial",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-white p-0 gap-0">
        <div className="h-12 relative" style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }}>
          <div className="absolute bottom-0 left-2 right-2 h-px bg-black/10" />
        </div>
        <div className="flex gap-1.5 p-1.5 flex-1">
          <div className="w-8 h-8 rounded-full -mt-4 border-2 border-white flex-shrink-0" style={{ background: color }} />
          <div className="flex flex-col gap-0.5 flex-1 pt-0.5">
            <div className="w-full h-1.5 bg-slate-900 rounded" />
            <div className="w-3/4 h-1 bg-slate-300 rounded" />
            <div className="space-y-0.5 mt-0.5">
              <div className="w-full h-1 bg-slate-100 rounded" />
              <div className="w-full h-1 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "aurora",
    name: "Aurora",
    desc: "Northern lights",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden p-2 gap-1.5" style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
        <div className="h-4 rounded" style={{ background: `linear-gradient(90deg, ${color}88, #a855f788, #06b6d488)` }} />
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full border-2 border-white/30" style={{ background: color }} />
          <div className="w-10 h-1.5 bg-white/40 rounded" />
        </div>
        <div className="space-y-1">
          <div className="w-full h-1.5 rounded-full bg-white/15" />
          <div className="w-full h-1.5 rounded-full bg-white/10" />
        </div>
      </div>
    ),
  },
  {
    id: "minimal_dark",
    name: "Minimal Dark",
    desc: "Clean dark mode",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-zinc-900 p-2 gap-1.5">
        <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
          <div className="w-6 h-6 rounded-lg" style={{ background: color }} />
          <div className="flex flex-col gap-0.5">
            <div className="w-12 h-1.5 bg-white/50 rounded" />
            <div className="w-8 h-1 bg-white/25 rounded" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="w-full h-2 bg-white/10 rounded-lg" />
          <div className="w-full h-2 bg-white/10 rounded-lg" />
          <div className="w-full h-2 rounded-lg" style={{ background: `${color}44` }} />
        </div>
      </div>
    ),
  },
  {
    id: "pastel",
    name: "Pastel",
    desc: "Soft pastel tones",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-pink-50 p-2 gap-1.5">
        <div className="h-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${color}55, #f9a8d455)` }} />
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full -mt-4 border-2 border-white" style={{ background: `${color}88` }} />
          <div className="w-10 h-1.5 bg-pink-300 rounded" />
        </div>
        <div className="space-y-1">
          <div className="w-full h-2 bg-pink-100 rounded-full border border-pink-200" />
          <div className="w-full h-2 bg-purple-100 rounded-full border border-purple-200" />
        </div>
      </div>
    ),
  },
  {
    id: "corporate",
    name: "Corporate",
    desc: "Professional B2B",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-white border border-slate-200 p-0">
        <div className="h-2" style={{ background: color }} />
        <div className="flex items-center gap-2 p-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex-shrink-0" />
          <div className="flex flex-col gap-0.5">
            <div className="w-14 h-1.5 bg-slate-800 rounded" />
            <div className="w-10 h-1 bg-slate-300 rounded" />
          </div>
        </div>
        <div className="flex-1 p-1.5 space-y-1">
          <div className="w-full h-2 bg-slate-100 rounded" />
          <div className="w-full h-2 rounded" style={{ background: `${color}22` }} />
        </div>
      </div>
    ),
  },
  {
    id: "floating",
    name: "Floating",
    desc: "Floating card style",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col items-center justify-center rounded-lg overflow-hidden p-2 gap-1" style={{ background: `radial-gradient(circle at top, ${color}22, #f1f5f9)` }}>
        <div className="bg-white rounded-xl shadow-lg p-2 w-full flex flex-col items-center gap-1 border border-slate-100">
          <div className="w-7 h-7 rounded-full" style={{ background: color }} />
          <div className="w-12 h-1.5 bg-slate-200 rounded" />
          <div className="w-8 h-1 bg-slate-100 rounded" />
        </div>
        <div className="bg-white rounded-xl shadow p-1.5 w-full space-y-1 border border-slate-100">
          <div className="w-full h-1.5 rounded-full bg-slate-100" />
          <div className="w-full h-1.5 rounded-full bg-slate-100" />
        </div>
      </div>
    ),
  },
  // ── 10 NEW PRO LAYOUTS ────────────────────────────────────────
  {
    id: "sunset",
    name: "Sunset",
    desc: "Warm orange gradient",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden p-0" style={{ background: "linear-gradient(160deg,#ff6b35,#f7c59f,#ffe0cc)" }}>
        <div className="flex flex-col items-center pt-3 pb-1 gap-1">
          <div className="w-8 h-8 rounded-full border-2 border-white/60" style={{ background: color }} />
          <div className="w-12 h-1.5 bg-white/70 rounded" />
          <div className="w-8 h-1 bg-white/50 rounded" />
        </div>
        <div className="mx-2 mb-2 flex-1 rounded-xl bg-white/25 p-1.5 space-y-1">
          <div className="w-full h-2 bg-white/40 rounded-full" />
          <div className="w-full h-2 bg-white/30 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: "ocean",
    name: "Ocean",
    desc: "Deep sea vibes",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden" style={{ background: "linear-gradient(160deg,#0077b6,#00b4d8,#90e0ef)" }}>
        <div className="h-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 5px)" }} />
        </div>
        <div className="flex flex-col items-center gap-1 p-2">
          <div className="w-7 h-7 rounded-full border-2 border-white/70 -mt-4" style={{ background: color }} />
          <div className="w-12 h-1.5 bg-white/70 rounded" />
          <div className="w-full h-2 bg-white/20 rounded-full" />
          <div className="w-full h-2 bg-white/20 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: "forest",
    name: "Forest",
    desc: "Nature & earthy tones",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-emerald-950 p-2 gap-1.5">
        <div className="h-5 rounded-lg" style={{ background: "linear-gradient(90deg,#16a34a88,#14532d88)" }} />
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full border-2 border-emerald-400/50" style={{ background: color }} />
          <div className="w-12 h-1.5 bg-emerald-300/60 rounded" />
        </div>
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-emerald-900/80 border border-emerald-700/40" />
          <div className="w-full h-2 rounded-full bg-emerald-900/80 border border-emerald-700/40" />
        </div>
      </div>
    ),
  },
  {
    id: "luxury",
    name: "Luxury",
    desc: "Gold & black prestige",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-zinc-950 p-2 gap-1.5">
        <div className="flex flex-col items-center gap-1 pb-1.5 border-b border-amber-600/40">
          <div className="w-7 h-7 rounded-full border border-amber-500/70" style={{ background: color }} />
          <div className="w-12 h-1.5 rounded" style={{ background: "linear-gradient(90deg,#b45309,#fbbf24)" }} />
          <div className="w-8 h-1 bg-amber-800/40 rounded" />
        </div>
        <div className="space-y-1">
          <div className="w-full h-2 rounded bg-amber-900/30 border border-amber-700/30" />
          <div className="w-full h-2 rounded bg-amber-900/20 border border-amber-700/20" />
        </div>
      </div>
    ),
  },
  {
    id: "bubbly",
    name: "Bubbly",
    desc: "Fun colorful dots",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-white p-2 gap-1.5 relative">
        <div className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-30" style={{ background: color }} />
        <div className="absolute bottom-2 left-1 w-4 h-4 rounded-full opacity-20" style={{ background: "#f472b6" }} />
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="w-8 h-8 rounded-full shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, #f472b6)` }} />
          <div className="w-14 h-1.5 bg-slate-200 rounded-full" />
          <div className="w-10 h-1 bg-slate-100 rounded-full" />
        </div>
        <div className="space-y-1 z-10">
          <div className="w-full h-2 rounded-full" style={{ background: `${color}30` }} />
          <div className="w-full h-2 rounded-full bg-pink-100" />
        </div>
      </div>
    ),
  },
  {
    id: "monochrome",
    name: "Mono",
    desc: "Black & white stark",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-white border-2 border-black p-0">
        <div className="bg-black h-8 flex items-center px-2">
          <div className="w-5 h-5 rounded-full bg-white" />
        </div>
        <div className="flex-1 p-2 space-y-1.5">
          <div className="w-14 h-1.5 bg-black rounded" />
          <div className="w-10 h-1 bg-gray-400 rounded" />
          <div className="w-full h-2 border-2 border-black rounded" />
          <div className="w-full h-2 bg-black rounded" />
        </div>
      </div>
    ),
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    desc: "Futuristic grid lines",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden p-2 gap-1.5" style={{ background: "#0a001f" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(0deg,transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%)", backgroundSize: "50px 50px" }} />
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
          <div className="w-12 h-1.5 rounded" style={{ background: color, opacity: 0.8 }} />
        </div>
        <div className="space-y-1">
          <div className="w-full h-2 rounded border" style={{ borderColor: `${color}88` }} />
          <div className="w-full h-2 rounded" style={{ background: `${color}22`, border: `1px solid ${color}44` }} />
        </div>
      </div>
    ),
  },
  {
    id: "frosted",
    name: "Frosted",
    desc: "iOS-style blur panels",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden p-1.5 gap-1.5" style={{ background: `linear-gradient(135deg,${color}44,${color}22,#e0e7ff88)` }}>
        <div className="rounded-xl p-2 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)" }}>
          <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ background: color }} />
          <div className="flex-1 space-y-0.5">
            <div className="w-full h-1.5 bg-white/70 rounded" />
            <div className="w-2/3 h-1 bg-white/50 rounded" />
          </div>
        </div>
        <div className="rounded-xl p-1.5 space-y-1" style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)" }}>
          <div className="w-full h-1.5 bg-white/60 rounded-full" />
          <div className="w-full h-1.5 bg-white/40 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: "paper",
    name: "Paper",
    desc: "Clean editorial serif",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-amber-50 p-2 gap-1.5 border border-amber-200">
        <div className="border-b-2 border-slate-900 pb-1.5 flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="w-14 h-2 bg-slate-900 rounded-sm" />
            <div className="w-8 h-1 bg-slate-400 rounded-sm" />
          </div>
          <div className="w-6 h-6 rounded-full" style={{ background: color }} />
        </div>
        <div className="space-y-0.5">
          <div className="w-full h-1.5 bg-slate-200 rounded-sm" />
          <div className="w-4/5 h-1.5 bg-slate-200 rounded-sm" />
          <div className="w-full h-2 rounded" style={{ background: `${color}22` }} />
        </div>
      </div>
    ),
  },
  {
    id: "wave",
    name: "Wave",
    desc: "Organic wave shapes",
    pro: true,
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-white">
        <div className="relative h-12" style={{ background: `linear-gradient(135deg,${color},${color}88)` }}>
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="absolute bottom-0 w-full h-4">
            <path d="M0,10 C20,20 40,0 60,10 C80,20 100,5 100,10 L100,20 L0,20 Z" fill="white" />
          </svg>
        </div>
        <div className="flex-1 p-2 pt-0 flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full -mt-3.5 border-2 border-white shadow" style={{ background: color }} />
          <div className="w-12 h-1.5 bg-slate-200 rounded" />
          <div className="w-full h-2 bg-slate-100 rounded-full" />
          <div className="w-full h-2 bg-slate-100 rounded-full" />
        </div>
      </div>
    ),
  },
];

export { layouts };

export default function LayoutPicker({ value, onChange, color = "#2563eb", plan = "free", isAdmin = false }) {
  const isPro = isAdmin || plan === "pro" || plan === "professional" || plan === "business" || plan === "salon" || plan === "restaurant" || plan === "lawfirm" || plan === "corporate";
  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {layouts.map((layout) => {
          const locked = layout.pro && !isPro;
          return (
            <div key={layout.id} className="relative">
              {locked ? (
                <Link
                  to="/pricing"
                  className="flex flex-col gap-2 p-0 rounded-xl transition-all focus:outline-none hover:ring-2 hover:ring-amber-400 hover:ring-offset-1 block"
                >
                  <div className="w-full aspect-[3/2] rounded-xl overflow-hidden shadow-sm relative">
                    <div className="opacity-40 w-full h-full">{layout.preview(color)}</div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 rounded-xl">
                      <span className="text-base">🔒</span>
                      <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full mt-0.5">PRO</span>
                    </div>
                  </div>
                  <div className="text-center pb-1">
                    <p className="text-xs font-bold text-slate-400">{layout.name}</p>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => onChange(layout.id)}
                  className={`flex flex-col gap-2 p-0 rounded-xl transition-all focus:outline-none w-full ${
                    value === layout.id ? "ring-2 ring-blue-600 ring-offset-2" : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-1"
                  }`}
                >
                  <div className="w-full aspect-[3/2] rounded-xl overflow-hidden shadow-sm">
                    {layout.preview(color)}
                  </div>
                  <div className="text-center pb-1">
                    <p className={`text-xs font-bold ${value === layout.id ? "text-blue-600" : "text-slate-700"}`}>
                      {layout.name}
                    </p>
                    <p className="text-[10px] text-slate-400 hidden sm:block">{layout.desc}</p>
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
            Upgrade to <strong>Pro</strong> to unlock 26+ premium layout styles including Neon, Sunset, Luxury, Cyberpunk & more.
          </p>
          <Link to="/pricing" className="text-xs font-black text-amber-600 hover:text-amber-700 whitespace-nowrap">
            Upgrade →
          </Link>
        </div>
      )}
    </div>
  );
}