import React, { useState } from 'react';

const NAVY = '#0b2149', ORANGE = '#f97316';

export default function BingooTabs({ tabs, defaultIndex = 0, onChange, variant = 'underline' }) {
  const [active, setActive] = useState(defaultIndex);

  const handleClick = (index) => {
    setActive(index);
    onChange?.(index);
  };

  if (variant === 'pills') {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${active === i ? 'text-white' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'}`}
            style={active === i ? { background: ORANGE } : {}}
          >
            {tab.icon && <tab.icon style={{ width: 14, height: 14 }} />}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${active === i ? 'bg-white/25' : 'bg-slate-200'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1 border-b border-slate-200 overflow-x-auto scrollbar-hide">
      {tabs.map((tab, i) => (
        <button
          key={i}
          onClick={() => handleClick(i)}
          className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors relative ${active === i ? '' : 'text-slate-400 hover:text-slate-600'}`}
          style={{ color: active === i ? NAVY : undefined }}
        >
          {tab.icon && <tab.icon style={{ width: 14, height: 14 }} />}
          {tab.label}
          {tab.count !== undefined && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">{tab.count}</span>
          )}
          {active === i && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ background: ORANGE }} />
          )}
        </button>
      ))}
    </div>
  );
}