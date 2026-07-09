import React from 'react';

// Custom Bingoo icon set — premium stroke-based SVGs, 24x24 viewBox.
// Distinctive style: 1.75 stroke, rounded caps, clean geometric forms.

const icons = {
  home: (<><path d="M3 10.5L12 4l9 6.5" /><path d="M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" /></>),
  users: (<><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 3.5c1.5 0.7 2.5 2.2 2.5 4s-1 3.3-2.5 4" /><path d="M16.5 14.2c2.8 0.5 4.5 2.9 4.5 5.8" /></>),
  nfc: (<><path d="M6 8.5c-1.5 2-1.5 5 0 7" /><path d="M9 6c-2.5 3-2.5 9 0 12" /><path d="M12 4c-3.5 4.5-3.5 11.5 0 16" /><path d="M15 6c2.5 3 2.5 9 0 12" /><path d="M18 8.5c1.5 2 1.5 5 0 7" /></>),
  briefcase: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /><path d="M3 12h18" /></>),
  qr: (<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3z M18 14h3 M14 18h3 M18 18v3 M21 18v3" /></>),
  wallet: (<><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18" /><rect x="15" y="13" width="4" height="3" rx="1" fill="currentColor" stroke="none" /></>),
  calendar: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" /><path d="M8 3v4 M16 3v4" /></>),
  chart: (<><path d="M4 20V4" /><path d="M4 20h16" /><rect x="7" y="12" width="3" height="6" rx="0.5" fill="currentColor" stroke="none" /><rect x="12" y="8" width="3" height="10" rx="0.5" fill="currentColor" stroke="none" /><rect x="17" y="14" width="3" height="4" rx="0.5" fill="currentColor" stroke="none" /></>),
  shop: (<><path d="M5 8h14l-1.5 12.5a1 1 0 01-1 0.5H7.5a1 1 0 01-1-0.5L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></>),
  palette: (<><path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-2-1-3 1-2 2-2h2a4 4 0 004-4c0-3.9-4-7-9-7z" /><circle cx="7.5" cy="11" r="1.2" fill="currentColor" stroke="none" /><circle cx="10" cy="7.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="14" cy="7.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="16.5" cy="11" r="1.2" fill="currentColor" stroke="none" /></>),
  settings: (<><circle cx="12" cy="12" r="3" /><path d="M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2" /></>),
  bell: (<><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 20a2 2 0 004 0" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="M16 16l4 4" /></>),
  plus: (<><path d="M12 5v14 M5 12h14" /></>),
  chevronRight: (<><path d="M9 5l7 7-7 7" /></>),
  chevronDown: (<><path d="M5 9l7 7 7-7" /></>),
  arrowRight: (<><path d="M5 12h14 M13 6l6 6-6 6" /></>),
  phone: (<><path d="M6 3h3l2 5-2.5 1.5a11 11 0 005 5L16 12l5 2v3a2 2 0 01-2 2A16 16 0 014 5a2 2 0 012-2z" /></>),
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>),
  message: (<><path d="M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H9l-4 3v-3H4a1 1 0 01-1-1V6a1 1 0 011-1z" /><path d="M8 10h8 M8 13h5" /></>),
  mapPin: (<><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>),
  star: (<><path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z" /></>),
  share: (<><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.8l7.6-3.6 M8.2 13.2l7.6 3.6" /></>),
  zap: (<><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" /></>),
  shield: (<><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></>),
  trend: (<><path d="M4 16l6-6 4 4 6-6" /><path d="M15 8h5v5" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  check: (<><path d="M5 12l4 4 10-10" /></>),
  checkCircle: (<><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-5" /></>),
  alert: (<><path d="M12 3l10 18H2L12 3z" /><path d="M12 9v5 M12 17v0.5" /></>),
  more: (<><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" /></>),
  sparkles: (<><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="M19 14l0.8 2.2L22 17l-2.2 0.8L19 20l-0.8-2.2L16 17l2.2-0.8z" /></>),
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18" /></>),
  download: (<><path d="M12 4v12 M7 11l5 5 5-5" /><path d="M4 20h16" /></>),
  filter: (<><path d="M4 5h16l-6 8v5l-4 2v-7z" /></>),
  edit: (<><path d="M4 20h4l11-11-4-4L4 16v4z" /><path d="M14 5l4 4" /></>),
  eye: (<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>),
  copy: (<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></>),
  lock: (<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></>),
  layers: (<><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5 M3 17l9 5 9-5" /></>),
  grid: (<><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></>),
  link: (<><path d="M9 12a3 3 0 013-3h4a3 3 0 010 6h-2" /><path d="M15 12a3 3 0 01-3 3H8a3 3 0 010-6h2" /></>),
  building: (<><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2 M13 7h2 M9 11h2 M13 11h2 M9 15h2 M13 15h2" /></>),
  scissors: (<><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8 8l12 8 M8 16l12-8" /></>),
  package: (<><path d="M12 3l9 5v8l-9 5-9-5V8l9-5z" /><path d="M3 8l9 5 9-5 M12 13v8" /></>),
  truck: (<><path d="M3 6h11v9H3z" /><path d="M14 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>),
  factory: (<><path d="M3 21V11l6 4V11l6 4V7l4 3v11H3z" /><path d="M7 17h2 M11 17h2" /></>),
};

export function Icon({ name, size = 20, className = '', color = 'currentColor', strokeWidth = 1.75, fill = 'none' }) {
  const content = icons[name];
  if (!content) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {content}
    </svg>
  );
}

export function IconBadge({ name, size = 20, bg = '#f97316', color = '#FFFFFF', className = '' }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl ${className}`}
      style={{ width: size * 1.8, height: size * 1.8, background: bg }}
    >
      <Icon name={name} size={size} color={color} />
    </div>
  );
}

export default Icon;