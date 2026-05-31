const layouts = [
  {
    id: "classic",
    name: "Classic",
    desc: "Gradient header with centered card",
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-slate-100">
        <div className="h-8 rounded-t-lg" style={{ background: color }} />
        <div className="flex-1 bg-white flex flex-col items-center pt-1 px-2 gap-1">
          <div className="w-6 h-6 rounded-full -mt-3 border-2 border-white shadow" style={{ background: color }} />
          <div className="w-12 h-1.5 bg-slate-200 rounded" />
          <div className="w-8 h-1 bg-slate-100 rounded" />
          <div className="w-full mt-1 space-y-1">
            <div className="w-full h-2 bg-slate-100 rounded-full" />
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
    desc: "Clean white, no cover image",
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden border border-slate-100 bg-white p-2 gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex-shrink-0 border-2" style={{ background: color, borderColor: color }} />
          <div className="flex flex-col gap-0.5">
            <div className="w-14 h-1.5 bg-slate-200 rounded" />
            <div className="w-10 h-1 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="border-t border-slate-100 pt-1.5 space-y-1">
          <div className="w-full h-2 rounded-full" style={{ background: `${color}22` }} />
          <div className="w-full h-2 rounded-full bg-slate-100" />
          <div className="w-full h-2 rounded-full bg-slate-100" />
        </div>
      </div>
    ),
  },
  {
    id: "dark",
    name: "Dark",
    desc: "Dark card with light text",
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden bg-slate-900 p-2 gap-1.5">
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full border-2 border-slate-700" style={{ background: color }} />
          <div className="w-12 h-1.5 bg-slate-600 rounded" />
          <div className="w-8 h-1 bg-slate-700 rounded" />
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
    desc: "Full gradient background",
    preview: (color) => (
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden p-2 gap-1.5" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full bg-white/30 border-2 border-white/50" />
          <div className="w-12 h-1.5 bg-white/60 rounded" />
          <div className="w-8 h-1 bg-white/40 rounded" />
        </div>
        <div className="space-y-1 mt-1">
          <div className="w-full h-2 bg-white/40 rounded-full" />
          <div className="w-full h-2 bg-white/25 rounded-full" />
          <div className="w-full h-2 bg-white/25 rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: "split",
    name: "Split",
    desc: "Side accent bar with content",
    preview: (color) => (
      <div className="w-full h-full flex rounded-lg overflow-hidden border border-slate-100">
        <div className="w-2 flex-shrink-0 rounded-l-lg" style={{ background: color }} />
        <div className="flex-1 bg-white p-1.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: color }} />
            <div className="flex flex-col gap-0.5">
              <div className="w-10 h-1.5 bg-slate-200 rounded" />
              <div className="w-7 h-1 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="space-y-1 mt-0.5">
            <div className="w-full h-1.5 rounded-full" style={{ background: `${color}22` }} />
            <div className="w-full h-1.5 bg-slate-100 rounded-full" />
            <div className="w-full h-1.5 bg-slate-100 rounded-full" />
          </div>
        </div>
      </div>
    ),
  },
];

export { layouts };

export default function LayoutPicker({ value, onChange, color = "#2563eb" }) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-3">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => onChange(layout.id)}
            className={`flex flex-col gap-2 p-0 rounded-xl transition-all focus:outline-none group ${
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
        ))}
      </div>
    </div>
  );
}