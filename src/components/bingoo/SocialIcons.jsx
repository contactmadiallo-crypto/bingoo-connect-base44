// Official social media SVG icons (no emojis)
export function InstagramIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <radialGradient id="ig1" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig1)" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
  );
}

export function FacebookIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#1877F2" />
      <path d="M15.5 8H13.5C13.2 8 13 8.2 13 8.5V10H15.5L15.2 12H13V19H11V12H9.5V10H11V8.5C11 7.1 12.1 6 13.5 6H15.5V8Z" fill="white" />
    </svg>
  );
}

export function TikTokIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#010101" />
      <path d="M16 7.8C15.3 7.2 14.9 6.4 14.8 5.5H13.1V14.5C13.1 15.3 12.5 15.9 11.7 15.9C10.9 15.9 10.3 15.3 10.3 14.5C10.3 13.7 10.9 13.1 11.7 13.1C11.9 13.1 12.1 13.1 12.2 13.2V11.4C12.1 11.4 11.9 11.4 11.7 11.4C9.9 11.4 8.5 12.8 8.5 14.6C8.5 16.4 9.9 17.8 11.7 17.8C13.5 17.8 14.9 16.4 14.9 14.6V9.9C15.7 10.5 16.6 10.8 17.6 10.8V9.1C16.9 9.1 16.4 8.5 16 7.8Z" fill="white" />
      <path d="M16 7.8C15.7 7.5 15.5 7.1 15.4 6.7C15.9 7.1 16.4 7.5 16.8 7.8H16Z" fill="#69C9D0" />
    </svg>
  );
}

export function LinkedInIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#0A66C2" />
      <rect x="6" y="10" width="2.5" height="8" fill="white" />
      <circle cx="7.25" cy="7.5" r="1.5" fill="white" />
      <path d="M11 10H13.5V11.5C14 10.5 15 10 16 10C18 10 19 11.3 19 13.5V18H16.5V14C16.5 13 16 12.5 15.2 12.5C14.4 12.5 13.5 13 13.5 14.5V18H11V10Z" fill="white" />
    </svg>
  );
}

export function YouTubeIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#FF0000" />
      <path d="M19.5 9C19.5 9 19.3 7.8 18.7 7.2C18 6.5 17.2 6.5 16.9 6.5C15.1 6.4 12.5 6.4 12.5 6.4C12.5 6.4 9.9 6.4 8.1 6.5C7.8 6.5 7 6.5 6.3 7.2C5.7 7.8 5.5 9 5.5 9C5.5 9 5.3 10.4 5.3 11.8V13.1C5.3 14.5 5.5 15.9 5.5 15.9C5.5 15.9 5.7 17.1 6.3 17.7C7 18.4 7.9 18.4 8.3 18.4C9.6 18.5 12.5 18.5 12.5 18.5C12.5 18.5 15.1 18.5 16.9 18.4C17.2 18.3 18 18.3 18.7 17.7C19.3 17.1 19.5 15.9 19.5 15.9C19.5 15.9 19.7 14.5 19.7 13.1V11.8C19.7 10.4 19.5 9 19.5 9ZM10.8 14.5V9.4L15.2 11.9L10.8 14.5Z" fill="white" />
    </svg>
  );
}

export function XIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#000000" />
      <path d="M17 5.5H14.7L12 9L9.3 5.5H7L11.1 11L7 18.5H9.3L12 15L14.7 18.5H17L12.9 12.5L17 5.5Z" fill="white" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#25D366" />
      <path d="M12 5.5C8.4 5.5 5.5 8.4 5.5 12C5.5 13.3 5.9 14.5 6.6 15.5L5.5 18.5L8.6 17.4C9.6 18 10.8 18.5 12 18.5C15.6 18.5 18.5 15.6 18.5 12C18.5 8.4 15.6 5.5 12 5.5ZM15.5 14.5C15.3 15 14.5 15.5 14 15.6C13.6 15.6 13 15.5 11.8 15C10.3 14.4 9.3 12.9 9.2 12.8C9.1 12.7 8.5 11.9 8.5 11C8.5 10.1 9 9.7 9.2 9.5C9.4 9.3 9.6 9.3 9.7 9.3H10.1C10.2 9.3 10.4 9.3 10.5 9.6C10.7 10 11 10.8 11 10.9C11.1 11 11.1 11.1 11 11.2C10.9 11.4 10.8 11.5 10.7 11.6C10.6 11.7 10.5 11.9 10.6 12C11 12.7 11.5 13.2 12.1 13.6C12.3 13.7 12.5 13.7 12.6 13.6C12.7 13.4 13 13.1 13.2 12.8C13.3 12.6 13.5 12.6 13.6 12.7C14 12.8 14.5 13.1 14.9 13.3C15 13.4 15.2 13.4 15.3 13.5C15.6 13.7 15.7 14.2 15.5 14.5Z" fill="white" />
    </svg>
  );
}

export function SnapchatIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#FFFC00" />
      <path d="M12 5.5C10.3 5.5 9 6.4 8.5 7.8C8.3 8.3 8.3 9 8.3 9.5L8 10.3C7.8 10.2 7.5 10.2 7.3 10.3C7.1 10.4 7 10.7 7.1 11C7.2 11.4 7.7 11.7 8.1 11.8C7.9 12.3 7.5 12.8 6.8 13C6.5 13.1 6.4 13.4 6.5 13.6C6.7 13.9 7.5 14.1 8.8 14.3C8.9 14.5 9 14.7 9 14.9C9.1 15.1 9.3 15.2 9.5 15.2C9.7 15.2 9.9 15.1 10.2 15.1C10.6 15 11.1 14.9 11.7 14.9C12.2 14.9 12.7 15 13.1 15.1C13.4 15.1 13.7 15.2 13.9 15.2C14.1 15.2 14.2 15 14.3 14.9C14.4 14.7 14.4 14.5 14.5 14.3C15.9 14.2 16.6 14 16.8 13.6C17 13.4 16.8 13.1 16.5 13C15.8 12.8 15.4 12.3 15.2 11.8C15.6 11.7 16.1 11.4 16.2 11C16.3 10.7 16.2 10.4 16 10.3C15.8 10.2 15.5 10.2 15.3 10.3L15 9.5C15 9 15 8.3 14.8 7.8C14.3 6.4 13 5.5 12 5.5Z" fill="#000" />
    </svg>
  );
}

export function PhoneIcon({ size = 20, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6.6 10.8C7.8 13.2 9.8 15.2 12.2 16.4L14 14.6C14.2 14.4 14.6 14.4 14.8 14.6C15.6 14.9 16.5 15.1 17.5 15.1C17.8 15.1 18 15.3 18 15.6V17.5C18 17.8 17.8 18 17.5 18C9.5 18 3 11.5 3 3.5C3 3.2 3.2 3 3.5 3H5.5C5.8 3 6 3.2 6 3.5C6 4.5 6.2 5.4 6.5 6.2C6.6 6.5 6.5 6.8 6.4 7L4.6 8.8C5.7 9.8 6.1 10.4 6.6 10.8Z" fill={color} />
    </svg>
  );
}

export function EmailSvgIcon({ size = 20, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M3 8L12 13L21 8" stroke={color} strokeWidth="1.8" fill="none" />
    </svg>
  );
}

export function CalendarSvgIcon({ size = 20, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="17" rx="2" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M3 10H21" stroke={color} strokeWidth="1.8" />
      <path d="M8 3V7M16 3V7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8.5" cy="15" r="1" fill={color} />
      <circle cx="12" cy="15" r="1" fill={color} />
      <circle cx="15.5" cy="15" r="1" fill={color} />
    </svg>
  );
}

export function ShareIcon({ size = 20, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="18" cy="5" r="3" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="6" cy="12" r="3" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="18" cy="19" r="3" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M8.7 13.5L15.3 17.5M15.3 6.5L8.7 10.5" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

export function SaveContactIcon({ size = 20, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M7 3V7H17V3" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="13.5" r="2.5" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M7 21C7 19.3 9.2 18 12 18C14.8 18 17 19.3 17 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function WebsiteIcon({ size = 20, color = "#64748b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" fill="none" />
      <path d="M12 3C12 3 9 8 9 12C9 16 12 21 12 21" stroke={color} strokeWidth="1.8" />
      <path d="M12 3C12 3 15 8 15 12C15 16 12 21 12 21" stroke={color} strokeWidth="1.8" />
      <path d="M3 12H21" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

export function WaveIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#1BA0E1" />
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#0077B6" />
      {/* Wave "W" logo style */}
      <path d="M5 8L7.5 16L10 10L12 15L14 10L16.5 16L19 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function OrangeMoneyIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#FF6600" />
      {/* Orange Money arrows style */}
      <path d="M7 12H17M13 8L17 12L13 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 8L7 12L11 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

export function MapPinIcon({ size = 20, color = "#64748b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.7 2 6 4.7 6 8C6 12.4 12 22 12 22C12 22 18 12.4 18 8C18 4.7 15.3 2 12 2Z" stroke={color} strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="8" r="2.5" stroke={color} strokeWidth="1.8" fill="none" />
    </svg>
  );
}

export function ZelleIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#0073DE" />
      <path d="M8 12L11 15L17 8" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function CashAppIcon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#00D54B" />
      <path d="M12 7V17M7 12H17" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function WaveIconNew({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#00B4E5" />
      {/* Penguin head */}
      <ellipse cx="12" cy="10" rx="4.5" ry="5" fill="white" />
      {/* Penguin body */}
      <ellipse cx="12" cy="16" rx="5.5" ry="4" fill="white" />
      {/* Eyes */}
      <circle cx="10" cy="9" r="1.2" fill="#000" />
      <circle cx="14" cy="9" r="1.2" fill="#000" />
      {/* Smile */}
      <path d="M10.5 11C11 11.5 13 11.5 13.5 11" stroke="#000" strokeWidth="0.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function OrangeMoneyIconNew({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#FF6600" />
      {/* Arrow up and right */}
      <path d="M7 15L14 8M14 8L14 14M14 8L8 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}