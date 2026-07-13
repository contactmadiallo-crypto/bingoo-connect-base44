import React from "react";
import { PhoneFrame, StateLabel, ActiveBadge, ComingSoonBadge, MiniProfilePreview, PROFESSIONAL_TEMPLATES } from "./GalleryShared";

export default function TemplateDetailSection() {
  const t = PROFESSIONAL_TEMPLATES[1]; // Creator template
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <StateLabel num="6" title="Template Detail Screen" subtitle="Large preview, category, best for, included sections, CTA type, active badge, and Use This Template button" />
      <div className="flex flex-wrap gap-8 justify-center items-start">
        {/* Large preview */}
        <PhoneFrame width={240} height={420} label="State 14 · Template Detail — Creator">
          <MiniProfilePreview t={t} />
        </PhoneFrame>

        {/* Detail panel */}
        <div className="flex-1 min-w-[280px] max-w-md space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">{t.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(249,115,22,0.08)", color: "#c2410c" }}>{t.category}</span>
                {t.status === "coming_soon" ? <ComingSoonBadge /> : <ActiveBadge />}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">Best For</p>
              <p className="text-sm font-semibold text-slate-700">{t.bestFor}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1">CTA Type</p>
              <div className="flex flex-wrap gap-2">
                {t.ctas.map(cta => (
                  <span key={cta} className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: t.colors.accent }}>{cta}</span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-2">Included Sections</p>
              <div className="space-y-1.5">
                {(t.sections || []).map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ background: t.colors.accent }}>✓</div>
                    <span className="text-xs font-medium text-slate-600">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-2">Visual Style</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl" style={{ background: t.colors.cover }} />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: t.colors.accent }} /><span className="text-[10px] font-medium text-slate-500">Accent</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border border-slate-200" style={{ background: t.colors.bg }} /><span className="text-[10px] font-medium text-slate-500">Background</span></div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[9px] font-bold text-slate-400">Avatar</p>
                  <p className="text-[10px] font-semibold text-slate-600 capitalize">{t.avatarShape}</p>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full py-3.5 rounded-xl text-white font-black text-sm shadow-lg" style={{ background: "linear-gradient(135deg, #f97316, #fb923c)", boxShadow: "0 6px 20px rgba(249,115,22,0.3)" }}>
            ✓ Use This Template
          </button>
        </div>
      </div>
    </section>
  );
}