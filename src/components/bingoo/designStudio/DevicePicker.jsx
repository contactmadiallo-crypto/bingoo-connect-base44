import React, { useState } from 'react';
import { PRODUCT_TYPES, ProductPreview } from './ProductPreview';

const THUMB_PROPS = {
  cardColor: '#F8FAFC',
  accentColor: '#f97316',
  logoUrl: null,
  nameText: '',
  holderName: '',
  roleText: '',
  phone: '',
  email: '',
  website: '',
  tagline: '',
  removeBranding: false,
  finish: 'Matte',
  isDark: false,
  brandPattern: { enabled: false },
  templateId: 'minimal',
};

export default function DevicePicker({ productType, setProductType }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? PRODUCT_TYPES : PRODUCT_TYPES.slice(0, 6);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-sm text-[#0b2149]"><span className="mr-1">1.</span>Choose Your Device</h3>
        {PRODUCT_TYPES.length > 6 && (
          <button onClick={() => setExpanded(v => !v)} className="text-[11px] font-bold text-[#f97316] hover:underline">
            {expanded ? 'Show less' : 'View all'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {visible.map(p => {
          const active = productType === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setProductType(p.id)}
              className={`relative rounded-xl border-2 px-2 py-2.5 min-h-[104px] flex flex-col items-center justify-between transition-all ${active ? 'border-orange-500 bg-orange-50 shadow-[0_4px_14px_rgba(249,115,22,.10)]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className="h-[68px] w-full rounded-lg bg-gradient-to-b from-white to-slate-50 flex items-center justify-center overflow-hidden">
                <div style={{ transform: 'scale(0.28)', transformOrigin: 'center' }}>
                  <ProductPreview {...THUMB_PROPS} productType={p.id} side="front" />
                </div>
              </div>
              <span className={`text-[10px] font-black leading-tight mt-1 ${active ? 'text-[#0b2149]' : 'text-slate-700'}`}>{p.id === 'keychain' ? 'Key Fob' : p.label}</span>
              {active && <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
