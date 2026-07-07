import React from 'react';
import { DesktopFrame, Badge } from './MockupFrame';
import { Icon } from './BingooIcons';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

// Simple bar chart component
function BarChart({ data, color = ORANGE }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end justify-between gap-2 h-32 pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="w-full flex flex-col justify-end h-24">
            <div
              className="w-full rounded-t-md transition-all hover:opacity-80"
              style={{ height: `${(d.value / max) * 100}%`, background: `linear-gradient(180deg, ${color}, ${color}88)` }}
            />
          </div>
          <span className="text-[8px] font-bold text-[#64748B]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Line chart (simplified)
function LineChart({ data, color = '#3b82f6' }) {
  const max = Math.max(...data);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 80}`).join(' ');
  return (
    <div className="relative h-32 pt-4">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle key={i} cx={(i / (data.length - 1)) * 100} cy={100 - (v / max) * 80} r="1.5" fill={color} />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((l) => (
          <span key={l} className="text-[8px] font-bold text-[#64748B]">{l}</span>
        ))}
      </div>
    </div>
  );
}

export default function MockupAnalytics() {
  return (
    <DesktopFrame label="9 · Analytics">
      <div className="p-6 bg-[#F7F9FC] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold text-[#f97316] tracking-wider">INSIGHTS</p>
            <h2 className="text-xl font-black text-[#0F172A]">Analytics Dashboard</h2>
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-[#E5EAF2] overflow-hidden bg-white">
              {['7D', '30D', '90D', 'All'].map((t, i) => (
                <span key={t} className={`px-3 py-1.5 text-xs font-bold ${i === 1 ? 'text-white' : 'text-[#64748B]'}`} style={i === 1 ? { background: NAVY } : {}}>{t}</span>
              ))}
            </div>
            <button className="px-3 py-1.5 text-xs font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] flex items-center gap-1.5 bg-white">
              <Icon name="download" size={14} color="#64748B" /> Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Profile Views', value: '2,847', change: '+12%', color: NAVY, icon: 'eye' },
            { label: 'NFC Taps', value: '384', change: '+8%', color: ORANGE, icon: 'nfc' },
            { label: 'QR Scans', value: '192', change: '+15%', color: '#3b82f6', icon: 'qr' },
            { label: 'Wallet Saves', value: '47', change: '+22%', color: '#8b5cf6', icon: 'wallet' },
            { label: 'Leads', value: '36', change: '+5%', color: '#22C55E', icon: 'message' },
            { label: 'Bookings', value: '18', change: '+3%', color: '#ec4899', icon: 'calendar' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}>
                  <Icon name={k.icon} size={15} color={k.color} />
                </div>
                <span className="text-[9px] font-bold text-[#22C55E]">{k.change}</span>
              </div>
              <p className="text-lg font-black" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[9px] text-[#64748B] font-medium">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-[#0F172A]">Views Over Time</p>
              <Badge color="#3b82f6">TRENDING UP</Badge>
            </div>
            <LineChart data={[120, 180, 150, 220, 280, 340]} color="#3b82f6" />
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-[#0F172A]">Taps by Day</p>
              <Badge color={ORANGE}>THIS WEEK</Badge>
            </div>
            <BarChart data={[
              { label: 'Mon', value: 28 },
              { label: 'Tue', value: 42 },
              { label: 'Wed', value: 35 },
              { label: 'Thu', value: 58 },
              { label: 'Fri', value: 72 },
              { label: 'Sat', value: 48 },
              { label: 'Sun', value: 22 },
            ]} color={ORANGE} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Source Breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
            <p className="text-xs font-black text-[#0F172A] mb-4">Traffic Sources</p>
            <div className="space-y-3">
              {[
                { label: 'NFC Tap', value: 45, color: ORANGE, icon: 'nfc' },
                { label: 'QR Scan', value: 28, color: '#3b82f6', icon: 'qr' },
                { label: 'Direct Link', value: 18, color: NAVY, icon: 'link' },
                { label: 'Wallet Pass', value: 9, color: '#8b5cf6', icon: 'wallet' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon name={s.icon} size={12} color={s.color} />
                      <span className="text-[10px] font-bold text-[#0F172A]">{s.label}</span>
                    </div>
                    <span className="text-[10px] font-black" style={{ color: s.color }}>{s.value}%</span>
                  </div>
                  <div className="h-2 bg-[#F7F9FC] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Links */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
            <p className="text-xs font-black text-[#0F172A] mb-4">Top Links Clicked</p>
            <div className="space-y-2.5">
              {[
                { label: 'WhatsApp', clicks: 84, icon: 'message', color: '#22C55E' },
                { label: 'Phone Call', clicks: 62, icon: 'phone', color: NAVY },
                { label: 'Website', clicks: 48, icon: 'globe', color: '#3b82f6' },
                { label: 'Email', clicks: 35, icon: 'mail', color: ORANGE },
                { label: 'LinkedIn', clicks: 22, icon: 'users', color: '#8b5cf6' },
              ].map((l, i) => (
                <div key={l.label} className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-[#64748B] w-4">{i + 1}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${l.color}15` }}>
                    <Icon name={l.icon} size={13} color={l.color} />
                  </div>
                  <span className="flex-1 text-[10px] font-bold text-[#0F172A]">{l.label}</span>
                  <span className="text-[10px] font-black text-[#0F172A]">{l.clicks}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
            <p className="text-xs font-black text-[#0F172A] mb-4">Top Locations</p>
            <div className="space-y-2.5">
              {[
                { city: 'New York, NY', views: 842, pct: '34%' },
                { city: 'Dakar, SN', views: 528, pct: '21%' },
                { city: 'Washington, DC', views: 314, pct: '13%' },
                { city: 'Atlanta, GA', views: 198, pct: '8%' },
                { city: 'Other', views: 365, pct: '24%' },
              ].map((l, i) => (
                <div key={l.city} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${NAVY}10` }}>
                    <Icon name="mapPin" size={13} color={NAVY} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-[#0F172A]">{l.city}</p>
                    <p className="text-[8px] text-[#64748B]">{l.views} views</p>
                  </div>
                  <span className="text-[10px] font-black" style={{ color: ORANGE }}>{l.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}