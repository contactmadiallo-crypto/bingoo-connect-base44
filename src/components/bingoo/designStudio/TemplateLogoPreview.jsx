import React from 'react';
import { TEMPLATES } from './studioConstants';
import { ProductPreview } from './ProductPreview';

export default function TemplateLogoPreview({ previewProps }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-sm text-[#0b2149]">Template Preview with Your Logo</h3>
        <button className="text-[11px] font-bold text-[#f97316] hover:underline">View all</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TEMPLATES.map(t => (
          <div key={t.id} className="rounded-xl border border-slate-100 p-3 flex flex-col items-center bg-slate-50">
            <div className="h-28 flex items-center justify-center overflow-hidden">
              <div style={{ transform: 'scale(0.38)', transformOrigin: 'center' }}>
                <ProductPreview {...previewProps} templateId={t.id} cardColor={t.cardColor} accentColor={t.accentColor} finish={t.finish} side="front" />
              </div>
            </div>
            <p className="text-[11px] font-bold mt-2">{t.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}