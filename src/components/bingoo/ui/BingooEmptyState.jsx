import React from 'react';
import { Inbox } from 'lucide-react';

const NAVY = '#0b2149', ORANGE = '#f97316';

export default function BingooEmptyState({ icon: Icon = Inbox, title, message, action, compact = false, isDark = false }) {
  const titleColor  = isDark ? '#fff' : NAVY;
  const messageColor = isDark ? 'rgba(255,255,255,0.45)' : '#64748b';

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5"
          style={{ background: isDark ? 'rgba(249,115,22,0.10)' : 'rgba(249,115,22,0.08)' }}>
          <Icon style={{ width: 24, height: 24, color: isDark ? 'rgba(255,255,255,0.25)' : '#cbd5e1' }} />
        </div>
        <p className="text-sm font-bold" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>{title}</p>
        {message && <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }}>{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      {/* Premium gradient halo */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-3xl blur-lg opacity-30"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, #FDBA21)` }} />
        <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
            border: `2px solid ${isDark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.10)'}`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(11,33,73,0.06)',
          }}>
          <Icon style={{ width: 32, height: 32, color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }} />
        </div>
      </div>
      <h3 className="text-base font-bold mb-1.5" style={{ color: titleColor }}>{title}</h3>
      {message && <p className="text-sm max-w-sm mb-5 leading-relaxed" style={{ color: messageColor }}>{message}</p>}
      {action}
    </div>
  );
}