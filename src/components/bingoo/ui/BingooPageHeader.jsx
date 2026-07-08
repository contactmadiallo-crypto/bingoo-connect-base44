import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NAVY = '#0b2149', ORANGE = '#f97316';

export default function BingooPageHeader({ title, subtitle, actions, showBack = false, onBack }) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate(-1));

  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3 min-w-0">
        {showBack && (
          <button
            onClick={handleBack}
            className="mt-0.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" style={{ color: NAVY }} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-black tracking-tight truncate" style={{ color: NAVY }}>{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </div>
  );
}