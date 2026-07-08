import React from 'react';

const NAVY = '#0b2149';

export default function BingooCard({ children, header, footer, onClick, padding = 'md', className = '', style = {} }) {
  const padMap = { none: 0, sm: 12, md: 16, lg: 24 };
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 ${isClickable ? 'cursor-pointer hover:border-slate-300 hover:shadow-lg transition-all duration-200' : ''} ${className}`}
      style={style}
    >
      {header && (
        <div className="px-4 py-3 border-b border-slate-100 font-bold text-sm" style={{ color: NAVY }}>
          {header}
        </div>
      )}
      <div style={{ padding: padMap[padding] }}>{children}</div>
      {footer && (
        <div className="px-4 py-3 border-t border-slate-100">{footer}</div>
      )}
    </div>
  );
}