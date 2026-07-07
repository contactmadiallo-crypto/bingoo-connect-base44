import React from 'react';

// Shared frame wrappers for Bingoo 2.0 mockups.
// Uses brand tokens directly — these are static visual previews, not the production design system.

export function PhoneFrame({ children, label }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[340px] h-[680px] bg-[#0F172A] rounded-[2.5rem] p-2 shadow-2xl shadow-[#0A1F52]/20">
        <div className="w-full h-full bg-[#F7F9FC] rounded-[2rem] overflow-hidden relative">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0F172A] rounded-b-2xl z-20" />
          <div className="w-full h-full overflow-y-auto scrollbar-hide pt-5">
            {children}
          </div>
        </div>
      </div>
      {label && <p className="text-sm font-medium text-[#64748B]">{label}</p>}
    </div>
  );
}

export function DesktopFrame({ children, label, height = 'h-[680px]' }) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="w-full max-w-[900px] bg-[#FFFFFF] rounded-xl border border-[#E5EAF2] shadow-lg shadow-[#0A1F52]/5 overflow-hidden">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F7F9FC] border-b border-[#E5EAF2]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
          <div className="flex-1 mx-3 h-5 bg-white rounded border border-[#E5EAF2] flex items-center px-2">
            <span className="text-[10px] text-[#64748B]">bingooconnect.com</span>
          </div>
        </div>
        <div className={`${height} overflow-y-auto scrollbar-hide`}>
          {children}
        </div>
      </div>
      {label && <p className="text-sm font-medium text-[#64748B]">{label}</p>}
    </div>
  );
}

export function MockupSection({ title, subtitle, children, frame }) {
  return (
    <div className="py-12 px-4 md:px-8 border-b border-[#E5EAF2]">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-[#0A1F52] text-white text-xs font-semibold rounded-full mb-3">
            Screen {title}
          </span>
          <h3 className="text-xl font-bold text-[#0F172A]">{subtitle}</h3>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
}

// Shared bottom nav for mobile mockups
export function MobileBottomNav({ active = 'Home' }) {
  const items = [
    { icon: 'Home', label: 'Home' },
    { icon: 'Users', label: 'Profiles' },
    { icon: 'Nfc', label: 'NFC' },
    { icon: 'Briefcase', label: 'Business' },
    { icon: 'MoreHorizontal', label: 'More' },
  ];
  const iconMap = {
    Home: '🏠', Profiles: '👥', Nfc: '📱', Business: '💼', More: '⋯'
  };
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E5EAF2] flex items-center justify-around px-2 z-10">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-0.5">
          <span className={`text-lg ${active === item.label ? 'opacity-100' : 'opacity-40'}`}>{iconMap[item.icon]}</span>
          <span className={`text-[9px] font-medium ${active === item.label ? 'text-[#FF7A00]' : 'text-[#64748B]'}`}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}