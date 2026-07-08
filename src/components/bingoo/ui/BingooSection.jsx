import React from 'react';

const NAVY = '#0b2149';

export default function BingooSection({ title, subtitle, action, children, padding = 'md' }) {
  const padMap = { none: 0, sm: 12, md: 16, lg: 24 };
  return (
    <div className="mb-6">
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          <div>
            {title && <h2 className="text-base font-black" style={{ color: NAVY }}>{title}</h2>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: padMap[padding] }}>{children}</div>
    </div>
  );
}