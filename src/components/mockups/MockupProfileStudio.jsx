import React from 'react';
import { PhoneFrame, MobileBottomNav } from './MockupFrame';

export default function MockupProfileStudio() {
  const tabs = ['Info', 'Design', 'Links', 'Media', 'Tools', 'Share', 'Settings'];
  return (
    <PhoneFrame label="4 · Profile Studio">
      <div className="relative min-h-full pb-20">
        {/* Header */}
        <div className="bg-[#0A1F52] px-5 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white text-sm">‹</span>
            <p className="text-white font-bold text-sm">Diallo Law Firm</p>
            <span className="px-1.5 py-0.5 bg-[#FF7A00] text-white text-[8px] font-bold rounded ml-auto">★ DEFAULT</span>
          </div>
          {/* Tab Scroll */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {tabs.map((t, i) => (
              <span key={t} className={`px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap ${i === 1 ? 'bg-[#FF7A00] text-white' : 'bg-white/10 text-white/60'}`}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Design Tab Content */}
        <div className="px-5 py-4 space-y-4">
          {/* Live Preview */}
          <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Live Preview</p>
            <div className="bg-gradient-to-br from-[#0A1F52] to-[#071A3D] rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-[#FF7A00] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base">MD</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Mamadou Diallo</p>
                  <p className="text-white/50 text-[10px]">Immigration Attorney</p>
                </div>
              </div>
              <p className="text-white/70 text-[10px] mb-3">Diallo Law Firm · New York, NY</p>
              <div className="space-y-2">
                {['📞 Call', '💬 WhatsApp', '📧 Email', '📅 Book Appointment'].map((b) => (
                  <div key={b} className="bg-white/10 rounded-lg py-2 px-3 text-white/80 text-[10px] font-medium">{b}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Layout Picker */}
          <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Layout</p>
            <div className="grid grid-cols-4 gap-2">
              {['Classic', 'Dark', 'Glass', 'Luxury'].map((l, i) => (
                <div key={l} className={`rounded-lg p-2 border-2 ${i === 1 ? 'border-[#FF7A00]' : 'border-[#E5EAF2]'} bg-white text-center`}>
                  <div className={`w-full h-12 rounded mb-1 ${i === 1 ? 'bg-[#0A1F52]' : i === 0 ? 'bg-[#F7F9FC]' : i === 2 ? 'bg-gradient-to-br from-[#0A1F52]/30 to-[#FF7A00]/30' : 'bg-gradient-to-br from-[#0A1F52] to-[#FF7A00]'}`} />
                  <p className="text-[8px] font-medium text-[#0F172A]">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Color Scheme */}
          <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Theme Color</p>
            <div className="flex gap-2">
              {['#0A1F52', '#FF7A00', '#22C55E', '#EF4444', '#8B5CF6'].map((c, i) => (
                <div key={c} className={`w-8 h-8 rounded-full border-2 ${i === 0 ? 'border-[#FF7A00] border-2' : 'border-[#E5EAF2]'}`} style={{backgroundColor: c}} />
              ))}
            </div>
          </div>

          {/* Button Style */}
          <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Button Style</p>
            <div className="flex gap-2">
              {['Pill', 'Rounded', 'Sharp'].map((s, i) => (
                <button key={s} className={`flex-1 py-2 text-[10px] font-medium ${i === 0 ? 'bg-[#FF7A00] text-white rounded-full' : 'bg-white text-[#64748B] border border-[#E5EAF2] rounded-lg'}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <MobileBottomNav active="Profiles" />
      </div>
    </PhoneFrame>
  );
}