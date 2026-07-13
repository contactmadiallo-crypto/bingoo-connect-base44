import React from "react";
import { StateLabel, TemplateCard, BUSINESS_TEMPLATES } from "./GalleryShared";

export default function BusinessTemplatesSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <StateLabel num="3" title="Business Profile Layout Templates" subtitle="10 distinct templates — each with its own industry language and CTA" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {BUSINESS_TEMPLATES.map((t, i) => (
          <TemplateCard key={t.id} t={t} num={`B${i + 1}`} />
        ))}
      </div>
    </section>
  );
}