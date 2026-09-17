import React, { useState } from 'react';
import { PRODUCT_TYPES, ProductTypeIcon } from './ProductPreview';

export default function DevicePicker({ productType, setProductType }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? PRODUCT_TYPES : PRODUCT_TYPES.slice(0, 6);
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-sm text-[#0b2149]"><span className="mr-1">1.</span>Choose Your Device</h3>
        <button onClick={() => setExpanded(v => !v)} className="text-[11px] font-bold text-[#f97316] hover:underline">
          {expanded ? 'Show less' : 'View all'}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {visible.map(p => (
          <button key={p.id} onClick={() => setProductType(p.id)}
            className={`group relative rounded-2xl border p-3.5 min-h-[132px] flex flex-col text-left overflow-hidden transition-all duration-200 ${productType === p.id ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-white shadow-[0_8px_24px_rgba(249,115,22,.12)] ring-1 ring-orange-200' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg'}`}>
            <div className="h-[76px] w-full rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative overflow-hidden">
              <div className={`transition-transform duration-200 group-hover:scale-110 ${productType === p.id ? 'scale-110' : 'scale-100'}`}><ProductTypeIcon typeId={p.id} active={productType === p.id} /></div>
              {productType === p.id && <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-black flex items-center justify-center">✓</span>}
            </div>
            <div className="pt-2.5 flex items-center justify-between gap-2 w-full">
              <div><p className="text-[12px] font-black text-[#0b2149] leading-tight">NFC {p.label}</p><p className="text-[9px] text-slate-400 mt-1">Customize this device</p></div>
              <span className={`text-[9px] font-black uppercase tracking-wide ${productType === p.id ? 'text-orange-500' : 'text-slate-300'}`}>{productType === p.id ? 'Selected' : 'Choose'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}