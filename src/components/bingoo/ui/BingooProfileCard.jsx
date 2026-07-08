import React from 'react';

const NAVY = '#0b2149', ORANGE = '#f97316';

import BingooBadge from './BingooBadge';

const PLAN_BADGES = {
  free:         { label: 'Free', variant: 'slate' },
  professional: { label: 'Professional', variant: 'orange' },
  pro:          { label: 'Professional', variant: 'orange' },
  salon:        { label: 'Salon', variant: 'purple' },
  lawfirm:      { label: 'Law Firm', variant: 'blue' },
  business:     { label: 'Business', variant: 'navy' },
  corporate:    { label: 'Corporate', variant: 'green' },
};

export default function BingooProfileCard({ profile, onClick, actions }) {
  const planBadge = PLAN_BADGES[profile?.plan] || PLAN_BADGES.free;
  const initials = (profile?.display_name || '?').charAt(0).toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md transition-all' : ''}`}
    >
      <div className="h-20 relative" style={{ background: profile?.cover_color || NAVY }}>
        {profile?.cover_photo && (
          <img src={profile.cover_photo} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="px-4 pb-4 -mt-8">
        <div className="w-14 h-14 rounded-full border-3 border-white bg-slate-200 overflow-hidden flex items-center justify-center font-black text-lg" style={{ color: NAVY, borderWidth: 3, borderStyle: 'solid' }}>
          {profile?.profile_photo ? (
            <img src={profile.profile_photo} alt={profile.display_name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm truncate" style={{ color: NAVY }}>{profile?.display_name || 'Unnamed'}</p>
            <BingooBadge variant={planBadge.variant} size="sm">{planBadge.label}</BingooBadge>
          </div>
          {profile?.job_title && (
            <p className="text-xs text-slate-500 truncate">{profile.job_title}</p>
          )}
          {profile?.username && (
            <p className="text-xs font-medium mt-1" style={{ color: ORANGE }}>/{profile.username}</p>
          )}
        </div>
        {actions && <div className="flex gap-2 mt-3">{actions}</div>}
      </div>
    </div>
  );
}