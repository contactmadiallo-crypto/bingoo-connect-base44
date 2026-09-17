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
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {visible.map(p => (
          <button key={p.id} onClick={() => setProductType(p.id)}
            className={`rounded-xl border-2 p-3 min-h-20 flex flex-col items-center justify-center gap-2 transition-all ${productType === p.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
            <ProductTypeIcon typeId={p.id} active={productType === p.id} />
            <span className="text-[10px] font-bold text-center leading-tight">{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}