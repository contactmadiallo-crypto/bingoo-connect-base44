import React from "react";
import { StateLabel, TemplateCard, PROFESSIONAL_TEMPLATES } from "./GalleryShared";

export default function ProfessionalTemplatesSection() {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <StateLabel num="2" title="Professional Profile Layout Templates" subtitle="8 distinct templates — each with its own language and CTA, not generic 'Book Appointment'" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PROFESSIONAL_TEMPLATES.map((t, i) => (
          <TemplateCard key={t.id} t={t} num={`P${i + 1}`} />
        ))}
      </div>
    </section>
  );
}