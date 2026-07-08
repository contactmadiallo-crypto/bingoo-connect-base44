import React from 'react';

const NAVY = '#0b2149', ORANGE = '#f97316';

const VARIANTS = {
  orange:   { bg: `${ORANGE}18`, color: ORANGE },
  navy:     { bg: `${NAVY}12`, color: NAVY },
  green:    { bg: '#22C55E18', color: '#16a34a' },
  red:      { bg: '#EF444418', color: '#dc2626' },
  amber:    { bg: '#F59E0B18', color: '#d97706' },
  blue:     { bg: '#3B82F618', color: '#2563eb' },
  purple:   { bg: '#8B5CF618', color: '#7c3aed' },
  slate:    { bg: '#F1F5F9', color: '#64748b' },
};

export default function BingooBadge({ children, variant = 'orange', size = 'md', dot = false, className = '' }) {
  const v = VARIANTS[variant] || VARIANTS.orange;
  const sizes = { sm: 'text-[9px] px-1.5 py-0.5', md: 'text-[10px] px-2 py-0.5', lg: 'text-xs px-2.5 py-1' };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-md tracking-wider uppercase whitespace-nowrap ${sizes[size]} ${className}`}
      style={{ background: v.bg, color: v.color }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: v.color }} />}
      {children}
    </span>
  );
}