import React from 'react';
import { InfinityMark } from '@/components/bingoo/ui/BingooBrand';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function FactoryProductMedia({ product, className = '', compact = false, showLabel = false, selectedColor = null }) {
  const active = product?.availability === 'active';
  const hasProductImage = Boolean(product?.image);

  // Never recolor or tint the approved factory photograph in CSS.
  // If an approved true-color photo exists for a selected variant, use it.
  // Otherwise keep the original product photograph unchanged.
  const variantImage = selectedColor && product?.variantImages?.[selectedColor];
  const imageSrc = variantImage || product?.image;

  if (active && hasProductImage) {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center ${className}`}
        style={{ background: 'transparent' }}
      >
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain"
          style={compact ? { padding: 6 } : undefined}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: 'linear-gradient(180deg,#fbfcfe 0%,#f1f5f9 100%)' }}
    >
      <div className="text-center px-5">
        <div
          className="mx-auto mb-3 flex items-center justify-center rounded-2xl"
          style={{ width: compact ? 42 : 62, height: compact ? 42 : 62, background: NAVY }}
        >
          <InfinityMark size={compact ? 22 : 32} color={ORANGE} strokeWidth={3.2} />
        </div>
        {showLabel && (
          <>
            <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Production media pending</p>
            <p className="text-[10px] text-slate-400 mt-1">This device is not presented as a finished product yet.</p>
          </>
        )}
      </div>
    </div>
  );
}
