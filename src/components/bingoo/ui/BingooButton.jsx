import React from 'react';
import { Loader2 } from 'lucide-react';

const NAVY = '#0b2149', ORANGE = '#f97316';

const VARIANTS = {
  primary:   { bg: ORANGE, color: '#FFFFFF', border: 'none', hover: '#ea580c' },
  secondary: { bg: NAVY, color: '#FFFFFF', border: 'none', hover: '#13284f' },
  outline:   { bg: 'transparent', color: NAVY, border: `1.5px solid ${NAVY}33`, hover: `${NAVY}08` },
  ghost:     { bg: 'transparent', color: NAVY, border: 'none', hover: `${NAVY}08` },
  danger:    { bg: '#ef4444', color: '#FFFFFF', border: 'none', hover: '#dc2626' },
};

const SIZES = {
  sm: { padding: '6px 14px', fontSize: 13, iconSize: 14 },
  md: { padding: '10px 20px', fontSize: 14, iconSize: 16 },
  lg: { padding: '14px 28px', fontSize: 16, iconSize: 18 },
};

export default function BingooButton({
  children, variant = 'primary', size = 'md', loading = false, disabled = false,
  icon: Icon, iconPosition = 'left', fullWidth = false, onClick, type = 'button', className = '', style = {},
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110 active:scale-[0.98]'} ${className}`}
      style={{ background: v.bg, color: v.color, border: v.border, padding: s.padding, fontSize: s.fontSize, ...style }}
    >
      {loading ? (
        <Loader2 className="animate-spin" style={{ width: s.iconSize, height: s.iconSize }} />
      ) : (
        Icon && iconPosition === 'left' && <Icon style={{ width: s.iconSize, height: s.iconSize }} />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon style={{ width: s.iconSize, height: s.iconSize }} />}
    </button>
  );
}