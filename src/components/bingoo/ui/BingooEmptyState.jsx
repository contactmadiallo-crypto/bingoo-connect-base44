import React from 'react';
import { Inbox } from 'lucide-react';

const NAVY = '#0b2149', ORANGE = '#f97316';

export default function BingooEmptyState({ icon: Icon = Inbox, title, message, action, compact = false }) {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Icon className="text-slate-300 mb-2" style={{ width: 32, height: 32 }} />
        <p className="text-sm font-bold text-slate-400">{title}</p>
        {message && <p className="text-xs text-slate-400 mt-1">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: `${ORANGE}12` }}
      >
        <Icon className="text-slate-400" style={{ width: 28, height: 28 }} />
      </div>
      <h3 className="text-lg font-bold mb-1" style={{ color: NAVY }}>{title}</h3>
      {message && <p className="text-sm text-slate-500 max-w-sm mb-4">{message}</p>}
      {action}
    </div>
  );
}