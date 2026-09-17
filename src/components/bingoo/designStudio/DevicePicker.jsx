import React, { useState } from 'react';
import { PRODUCT_TYPES } from './ProductPreview';
import { PRODUCTS } from '@/lib/shopProducts';

const SHOP_DEVICE_BY_TYPE = {
  card: 'nfc-card',
  keychain: 'nfc-key-fob',
  sticker: 'nfc-sticker',
  bracelet: 'nfc-bracelet',
  tag: 'nfc-silicone-tag',
  stand: 'nfc-table-stand',
};

const shopProductFor = (typeId) => PRODUCTS.find(p => p.id === SHOP_DEVICE_BY_TYPE[typeId]);

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
        {visible.map(p => {
          const shopProduct = shopProductFor(p.id);
          return (
            <button key={p.id} onClick={() => setProductType(p.id)}
              className={`group relative rounded-2xl border p-3 min-h-[150px] flex flex-col text-left overflow-hidden transition-all duration-200 ${productType === p.id ? 'border-orange-500 bg-white shadow-[0_10px_30px_rgba(249,115,22,.16)] ring-1 ring-orange-200' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg'}`}>
              <div className="h-[92px] w-full rounded-xl bg-gradient-to-b from-white to-slate-50 flex items-center justify-center relative overflow-hidden border border-slate-100">
                {shopProduct?.image ? (
                  <img src={shopProduct.image} alt={shopProduct.name || p.label} className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105" />
                ) : (
                  <div className="text-xs font-bold text-slate-400">NFC {p.label}</div>
                )}
                {productType === p.id && <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-orange-500 text-white text-[9px] font-black tracking-wide">SELECTED</span>}
              </div>
              <div className="pt-2.5 w-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-black text-[#0b2149] leading-tight">{shopProduct?.name || `NFC ${p.label}`}</p>
                    <p className="text-[9px] text-slate-400 mt-1">Use as your custom design base</p>
                  </div>
                  <span className={`mt-0.5 text-[9px] font-black ${productType === p.id ? 'text-orange-500' : 'text-slate-300'}`}>{productType === p.id ? '✓' : '→'}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}