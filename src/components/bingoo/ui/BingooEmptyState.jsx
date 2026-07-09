import React from 'react';
import { Inbox } from 'lucide-react';

const NAVY = '#0b2149', ORANGE = '#f97316';

export default function BingooEmptyState({ icon: Icon = Inbox, title, message, action, compact = false, isDark = false }) {
  const iconBg      = isDark ? `${ORANGE}15` : `${ORANGE}12`;
  const iconColor   = isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8';
  const titleColor  = isDark ? '#fff' : NAVY;
  const messageColor = isDark ? 'rgba(255,255,255,0.45)' : '#64748b';

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Icon className="mb-2" style={{ width: 32, height: 32, color: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }} />
        <p className="text-sm font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>{title}</p>
        {message && <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }}>{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: iconBg }}>
        <Icon style={{ width: 28, height: 28, color: iconColor }} />
      </div>
      <h3 className="text-lg font-bold mb-1" style={{ color: titleColor }}>{title}</h3>
      {message && <p className="text-sm max-w-sm mb-4" style={{ color: messageColor }}>{message}</p>}
      {action}
    </div>
  );
}