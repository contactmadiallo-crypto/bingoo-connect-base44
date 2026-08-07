import React from 'react';
import { InfinityMark } from '@/components/bingoo/ui/BingooBrand';

const NAVY = '#0b2149';
const ORANGE = '#f97316';
const GOLD = '#FDBA21';

function BrandPlate({ product, compact = false }) {
  const round = ['keychain', 'tag', 'bracelet'].includes(product.category);
  return (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${round ? 'rounded-full' : 'rounded-xl'}`}
      style={{
        width: compact ? (round ? 38 : 66) : (round ? 58 : 92),
        height: compact ? (round ? 38 : 34) : (round ? 58 : 46),
        background: 'linear-gradient(145deg,#070a10,#111722)',
        border: '1px solid rgba(255,255,255,.08)',
        boxShadow: '0 8px 24px rgba(0,0,0,.28)',
      }}>
      <InfinityMark size={compact ? 20 : 30} color={GOLD} strokeWidth={3.2} glow />
    </div>
  );
}

export default function FactoryProductMedia({ product, className = '', compact = false, showLabel = true }) {
  const active = product?.availability === 'active';
  const hasLegacyImage = Boolean(product?.image);

  if (!active || !hasLegacyImage) {
    return (
      <div className={`relative overflow-hidden flex items-center justify-center ${className}`}
        style={{ background: 'linear-gradient(180deg,#fbfcfe 0%,#f3f6fa 100%)' }}>
        <div className="text-center px-5">
          <div className="mx-auto mb-3 flex items-center justify-center rounded-2xl"
            style={{ width: compact ? 44 : 64, height: compact ? 44 : 64, background: NAVY }}>
            <InfinityMark size={compact ? 24 : 34} color={ORANGE} strokeWidth={3.2} />
          </div>
          {showLabel && (
            <>
              <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">Factory sample pending</p>
              <p className="text-[10px] text-slate-400 mt-1">Not shown as a sellable device until production media is approved.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: 'linear-gradient(180deg,#ffffff 0%,#f6f8fb 100%)' }}>
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-contain"
        style={{ padding: compact ? 6 : 18 }}
      />
      <BrandPlate product={product} compact={compact} />
      {showLabel && (
        <div className="absolute left-3 bottom-3 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em]"
          style={{ background: 'rgba(255,255,255,.92)', color: NAVY, border: '1px solid #e2e8f0' }}>
          Bingoo production preview
        </div>
      )}
    </div>
  );
}
