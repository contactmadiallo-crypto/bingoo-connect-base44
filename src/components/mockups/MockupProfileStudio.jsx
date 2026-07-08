import React from 'react';
import { DesktopFrame, Badge } from './MockupFrame';
import { Icon } from './BingooIcons';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function MockupProfileStudio() {
  const tabs = ['Info', 'Design', 'Links', 'Media', 'Tools', 'Share', 'Settings'];
  const features = ['Digital Identity', 'NFC + QR + Wallet', 'Leads CRM', 'Appointments', 'Analytics', 'Reviews', 'Lost Mode', 'Shop', 'Design Studio', 'Team Tools'];

  return (
    <DesktopFrame label="4 · Profile Studio">
      <div className="flex h-full">
        {/* Left Sidebar */}
        <div className="w-56 border-r border-[#E5EAF2] bg-[#F7F9FC] flex flex-col">
          <div className="px-4 py-5 border-b border-[#E5EAF2]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
                <span className="font-black text-xs" style={{ color: ORANGE }}>DL</span>
              </div>
              <div>
                <p className="font-black text-xs text-[#0F172A]">Diallo Law Firm</p>
                <p className="text-[9px] text-[#64748B]">Law Firm Plan</p>
              </div>
            </div>
          </div>
          <div className="flex-1 py-3">
            {tabs.map((t, i) => (
              <div key={t} className={`px-4 py-2.5 flex items-center gap-2.5 cursor-pointer ${i === 1 ? 'bg-white border-r-2' : ''}`} style={i === 1 ? { borderColor: ORANGE } : {}}>
                <Icon name={['users', 'palette', 'link', 'grid', 'briefcase', 'share', 'settings'][i]} size={15} color={i === 1 ? ORANGE : '#64748B'} />
                <span className={`text-xs font-bold ${i === 1 ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{t}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-[#E5EAF2]">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1.5 bg-[#E5EAF2] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '75%', background: ORANGE }} />
              </div>
              <span className="text-[9px] font-bold text-[#64748B]">75%</span>
            </div>
            <p className="text-[9px] text-[#64748B]">Profile completion</p>
          </div>
        </div>

        {/* Center Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold text-[#f97316] tracking-wider">DESIGN</p>
              <h2 className="text-xl font-black text-[#0F172A]">Profile Design</h2>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-bold border border-[#E5EAF2] rounded-lg text-[#64748B]">Preview</button>
              <button className="px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-md" style={{ background: ORANGE }}>Save Changes</button>
            </div>
          </div>

          {/* Layout Picker */}
          <div className="mb-6">
            <p className="text-xs font-black text-[#0F172A] mb-3">Choose Layout</p>
            <div className="grid grid-cols-6 gap-2">
              {['Classic', 'Dark', 'Glass', 'Magazine', 'Corporate', 'Luxury'].map((l, i) => (
                <div key={l} className={`rounded-xl p-3 border-2 cursor-pointer text-center ${i === 3 ? 'border-[#f97316] bg-[#FFF0E5]' : 'border-[#E5EAF2] bg-white'}`}>
                  <div className="w-full h-16 rounded-lg mb-2" style={{ background: i === 3 ? `linear-gradient(135deg, ${NAVY}, #13284f)` : '#F7F9FC' }} />
                  <span className={`text-[9px] font-bold ${i === 3 ? 'text-[#f97316]' : 'text-[#64748B]'}`}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Controls */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs font-black text-[#0F172A] mb-2">Avatar Shape</p>
              <div className="flex gap-2">
                {['Circle', 'Rounded', 'Squircle', 'Card'].map((s, i) => (
                  <div key={s} className={`px-3 py-2 rounded-lg border text-[10px] font-bold cursor-pointer ${i === 0 ? 'border-[#f97316] text-white' : 'border-[#E5EAF2] text-[#64748B]'}`} style={i === 0 ? { background: ORANGE } : {}}>{s}</div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-black text-[#0F172A] mb-2">Button Style</p>
              <div className="flex gap-2">
                {['Pill', 'Rounded', 'Sharp', 'Flat'].map((s, i) => (
                  <div key={s} className={`px-3 py-2 rounded-lg border text-[10px] font-bold cursor-pointer ${i === 0 ? 'border-[#f97316] text-white' : 'border-[#E5EAF2] text-[#64748B]'}`} style={i === 0 ? { background: ORANGE } : {}}>{s}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Color Picker */}
          <div className="mb-6">
            <p className="text-xs font-black text-[#0F172A] mb-2">Brand Color</p>
            <div className="flex gap-2">
              {['#0b2149', '#f97316', '#22C55E', '#3b82f6', '#ec4899', '#8b5cf6', '#0F172A', '#64748B'].map((c, i) => (
                <div key={c} className={`w-8 h-8 rounded-lg cursor-pointer border-2 ${i === 0 ? 'border-[#0F172A] scale-110' : 'border-white'}`} style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* QR Customization */}
          <div className="bg-[#F7F9FC] rounded-xl p-4 border border-[#E5EAF2]">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="qr" size={16} color={NAVY} />
              <p className="text-xs font-black text-[#0F172A]">QR Code Settings</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[9px] font-bold text-[#64748B] mb-1">QR Color</p>
                <div className="flex gap-1.5">
                  {['#0F172A', '#0b2149', '#f97316', '#22C55E'].map((c, i) => (
                    <div key={c} className={`w-6 h-6 rounded cursor-pointer border ${i === 1 ? 'border-[#0F172A] scale-110' : 'border-[#E5EAF2]'}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#64748B] mb-1">QR Label</p>
                <div className="px-2 py-1.5 bg-white rounded-lg border border-[#E5EAF2] text-[10px] text-[#0F172A]">Scan Me</div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#64748B] mb-1">Watermark</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-5 rounded-full p-0.5" style={{ background: ORANGE }}>
                    <div className="w-4 h-4 rounded-full bg-white ml-auto" />
                  </div>
                  <span className="text-[9px] font-bold text-[#64748B]">ON</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview */}
        <div className="w-72 border-l border-[#E5EAF2] bg-[#F7F9FC] p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black text-[#0F172A]">Live Preview</p>
            <Badge color={ORANGE}>REAL-TIME</Badge>
          </div>
          {/* Mini phone preview */}
          <div className="mx-auto w-full max-w-[200px] bg-white rounded-3xl border-4 border-[#0F172A] overflow-hidden shadow-xl">
            <div className="h-20" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }} />
            <div className="px-4 pb-4">
              <div className="w-14 h-14 rounded-full border-4 border-white -mt-7 mb-2 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
                <span className="text-white font-black text-sm" style={{ color: ORANGE }}>DL</span>
              </div>
              <p className="font-black text-sm text-[#0F172A]">Diallo Law Firm</p>
              <p className="text-[9px] text-[#64748B] mb-3">Immigration · Civil · Criminal</p>
              <div className="space-y-1.5">
                {[
                  { icon: 'phone', label: 'Call' },
                  { icon: 'message', label: 'WhatsApp' },
                  { icon: 'mail', label: 'Email' },
                  { icon: 'globe', label: 'Website' },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${NAVY}08` }}>
                    <Icon name={b.icon} size={12} color={NAVY} />
                    <span className="text-[9px] font-bold text-[#0F172A]">{b.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-center">
                <div className="w-16 h-16 bg-white rounded-lg p-1 border border-[#E5EAF2]">
                  <div className="w-full h-full rounded grid grid-cols-5 gap-px p-0.5" style={{ background: NAVY }}>
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg p-2 text-center border border-[#E5EAF2]">
              <p className="text-[8px] font-bold text-[#64748B]">Profile URL</p>
              <p className="text-[9px] font-bold" style={{ color: ORANGE }}>bingooconnect.com/diallo</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center border border-[#E5EAF2]">
              <p className="text-[8px] font-bold text-[#64748B]">Layout</p>
              <p className="text-[9px] font-bold text-[#0F172A]">Magazine</p>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}