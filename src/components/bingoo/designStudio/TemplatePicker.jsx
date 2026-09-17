import React from 'react';
import { TEMPLATES } from './studioConstants';

export default function TemplatePicker({ activeTemplate, onSelect }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-sm text-[#0b2149]"><span className="mr-1">2.</span>Select a Template</h3>
        <button className="text-[11px] font-bold text-[#f97316] hover:underline">View all</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => onSelect(t)}
            className={`rounded-xl border-2 p-1.5 transition-all ${activeTemplate === t.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="h-12 rounded-lg relative overflow-hidden" style={{ background: t.cardColor }}>
              <div className="absolute right-0 top-0 w-1/2 h-full opacity-30" style={{ background: t.accentColor, clipPath: 'polygon(100% 0,100% 100%,0 100%)' }} />
            </div>
            <p className="text-[10px] font-bold mt-1 text-center">{t.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}