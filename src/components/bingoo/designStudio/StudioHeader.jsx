import React from 'react';
import { WandSparkles, Eye, ShoppingCart } from 'lucide-react';

export default function StudioHeader() {
  const steps = [
    { icon: WandSparkles, label: 'Design', active: true },
    { icon: Eye, label: 'Preview', active: false },
    { icon: ShoppingCart, label: 'Checkout', active: false },
  ];
  return (
    <div className="px-5 lg:px-7 py-5 bg-white border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl xl:text-3xl font-black text-[#0b2149]">Design Studio</h1>
        <p className="text-sm text-slate-500">Create your own NFC device. Your brand. Your way.</p>
      </div>
      <div className="flex items-center gap-4 text-xs font-bold">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <span className={`flex items-center gap-2 ${s.active ? 'text-[#f97316]' : 'text-slate-400'}`}>
              <s.icon className="w-4 h-4" />
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="text-slate-300">→</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}