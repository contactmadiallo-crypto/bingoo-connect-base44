import React from 'react';
import { DesktopFrame, Badge } from '@/components/mockups/MockupFrame';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', ORANGE = '#f97316', BG = '#F7F9FC', MUTED = '#64748B', INK = '#0F172A';

export default function MockupConnectionsImproved() {
  const connections = [
    { name: 'Sarah Lee', company: 'Lee Consulting', rel: 'Client', source: 'NFC', event: 'TechConf 2026', met: 'Jul 7, 2026', followUp: 'Jul 14', tags: ['VIP', 'Legal'], notes: 'Interested in immigration services', initial: 'S', color: '#3b82f6', followStatus: 'pending' },
    { name: 'James Smith', company: 'Smith Corp', rel: 'Prospect', source: 'QR', event: 'Networking Mixer', met: 'Jul 5, 2026', followUp: 'Jul 12', tags: ['Corporate'], notes: 'Civil matter consultation', initial: 'J', color: ORANGE, followStatus: 'pending' },
    { name: 'Maria Garcia', company: 'Garcia Law', rel: 'Colleague', source: 'Profile', event: 'Bar Association', met: 'Jun 28, 2026', followUp: '—', tags: ['Referral'], notes: 'Refers immigration cases', initial: 'M', color: '#ec4899', followStatus: 'none' },
    { name: 'Robert Chen', company: 'TechStart', rel: 'Vendor', source: 'NFC', event: 'Business Expo', met: 'Jun 20, 2026', followUp: 'Jul 10', tags: ['IT Services'], notes: 'IT infrastructure provider', initial: 'R', color: '#22C55E', followStatus: 'overdue' },
    { name: 'Lisa Brown', company: 'Brown Realty', rel: 'Partner', source: 'Manual', event: '—', met: 'Jun 15, 2026', followUp: '—', tags: ['Real Estate'], notes: 'Cross-referral partnership', initial: 'L', color: '#8b5cf6', followStatus: 'none' },
    { name: 'David Wilson', company: 'Wilson CPA', rel: 'Friend', source: 'Imported', event: '—', met: 'May 30, 2026', followUp: '—', tags: ['Personal'], notes: 'College friend, CPA services', initial: 'D', color: NAVY, followStatus: 'none' },
  ];
  const relColors = { Client: '#22C55E', Prospect: ORANGE, Colleague: '#3b82f6', Vendor: '#8b5cf6', Partner: '#ec4899', Friend: '#64748B' };
  const sourceColors = { NFC: ORANGE, QR: '#3b82f6', Profile: '#22C55E', Manual: '#8b5cf6', Imported: MUTED };

  return (
    <DesktopFrame label="Connections Dashboard — Rich CRM Data" height="h-[700px]">
      <div className="p-6 bg-[#F7F9FC] h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-[10px] font-bold text-[#f97316] tracking-wider">NETWORK CRM</p><h2 className="text-xl font-black text-[#0F172A]">Connections</h2></div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] bg-white flex items-center gap-1.5"><Icon name="download" size={14} color={MUTED} /> Export</button>
            <button className="px-3 py-1.5 text-xs font-bold text-white rounded-lg flex items-center gap-1.5" style={{ background: ORANGE }}><Icon name="plus" size={14} color="#FFFFFF" /> Add Contact</button>
          </div>
        </div>
        {/* KPIs */}
        <div className="grid grid-cols-6 gap-3 mb-4">
          {[
            { label: 'Total', value: '128', color: NAVY, icon: 'users' },
            { label: 'Clients', value: '34', color: '#22C55E', icon: 'briefcase' },
            { label: 'Prospects', value: '28', color: ORANGE, icon: 'trend' },
            { label: 'Follow-ups Due', value: '12', color: '#EF4444', icon: 'clock' },
            { label: 'From Events', value: '47', color: '#3b82f6', icon: 'calendar' },
            { label: 'This Month', value: '+24', color: '#8b5cf6', icon: 'plus' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
              <div className="flex items-center justify-between mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}><Icon name={k.icon} size={15} color={k.color} /></div></div>
              <p className="text-lg font-black" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[9px] text-[#64748B] font-medium">{k.label}</p>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[9px] font-black text-[#64748B] tracking-wider">FILTERS:</span>
            {['Category: All', 'Source: All', 'Event: All', 'Date: All', 'Follow-up: All'].map((f) => (
              <button key={f} className="px-3 py-1.5 text-[9px] font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] bg-white flex items-center gap-1"><Icon name="filter" size={10} color={MUTED} /> {f} <Icon name="chevronDown" size={10} color={MUTED} /></button>
            ))}
          </div>
        </div>
        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
          <div className="grid grid-cols-12 px-3 py-2.5 border-b border-[#E5EAF2] bg-[#F7F9FC] text-[9px] font-black text-[#64748B] tracking-wider">
            <div className="col-span-2">NAME</div>
            <div className="col-span-1">RELATIONSHIP</div>
            <div className="col-span-1">SOURCE</div>
            <div className="col-span-2">EVENT / WHERE MET</div>
            <div className="col-span-1">DATE MET</div>
            <div className="col-span-1">FOLLOW-UP</div>
            <div className="col-span-1">TAGS</div>
            <div className="col-span-2">NOTES</div>
            <div className="col-span-1 text-right">·</div>
          </div>
          {connections.map((c) => (
            <div key={c.name} className="grid grid-cols-12 px-3 py-3 border-b border-[#E5EAF2] items-center hover:bg-[#F7F9FC]">
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px]" style={{ background: `${c.color}15`, color: c.color }}>{c.initial}</div>
                <div><p className="text-[10px] font-bold text-[#0F172A]">{c.name}</p><p className="text-[8px] text-[#64748B]">{c.company}</p></div>
              </div>
              <div className="col-span-1"><Badge color={relColors[c.rel]}>{c.rel.toUpperCase()}</Badge></div>
              <div className="col-span-1"><Badge color={sourceColors[c.source]}>{c.source.toUpperCase()}</Badge></div>
              <div className="col-span-2"><span className="text-[9px] font-medium text-[#0F172A]">{c.event}</span></div>
              <div className="col-span-1"><span className="text-[9px] text-[#64748B]">{c.met}</span></div>
              <div className="col-span-1">
                {c.followUp === '—' ? <span className="text-[9px] text-[#cbd5e1]">—</span> :
                  <div className="flex items-center gap-1">
                    <Icon name="clock" size={10} color={c.followStatus === 'overdue' ? '#EF4444' : ORANGE} />
                    <span className={`text-[9px] font-bold ${c.followStatus === 'overdue' ? 'text-[#EF4444]' : 'text-[#0F172A]'}`}>{c.followUp}</span>
                  </div>
                }
              </div>
              <div className="col-span-1 flex flex-wrap gap-1">
                {c.tags.map((t) => <span key={t} className="px-1.5 py-0.5 text-[7px] font-bold rounded bg-[#F7F9FC] text-[#64748B]">{t}</span>)}
              </div>
              <div className="col-span-2"><span className="text-[9px] text-[#64748B] truncate block">{c.notes}</span></div>
              <div className="col-span-1 flex justify-end gap-1">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#22C55E15' }}><Icon name="phone" size={10} color="#22C55E" /></div>
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: '#25D36615' }}><Icon name="message" size={10} color="#25D366" /></div>
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="eye" size={10} color={NAVY} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}