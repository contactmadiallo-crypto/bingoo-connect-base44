import React from 'react';
import { CreditCard, Tag, Watch, Award, StickyNote, Monitor } from 'lucide-react';

const NAVY = '#0b2149', ORANGE = '#f97316';

const TYPE_ICONS = {
  card: CreditCard, keychain: Tag, bracelet: Watch,
  stand: Monitor, badge: Award, sticker: StickyNote,
};

const STATUS_CONFIG = {
  available: { label: 'Available', variant: 'slate' },
  assigned:  { label: 'Assigned', variant: 'blue' },
  active:    { label: 'Active', variant: 'green' },
  lost:      { label: 'Lost', variant: 'red' },
  disabled:  { label: 'Disabled', variant: 'slate' },
  replaced:  { label: 'Replaced', variant: 'amber' },
};

import BingooBadge from './BingooBadge';

export default function BingooDeviceCard({ device, profileName, onClick, actions }) {
  const Icon = TYPE_ICONS[device.device_type] || CreditCard;
  const status = STATUS_CONFIG[device.status] || STATUS_CONFIG.available;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 p-4 ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md transition-all' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${NAVY}08` }}
        >
          <Icon style={{ width: 20, height: 20, color: NAVY }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-sm truncate" style={{ color: NAVY }}>{device.device_code}</p>
            <BingooBadge variant={status.variant}>{status.label}</BingooBadge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 capitalize">{device.device_type}</p>
          {profileName && (
            <p className="text-xs font-medium text-slate-400 mt-1 truncate">→ {profileName}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">{actions}</div>}
    </div>
  );
}