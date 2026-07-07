import React from 'react';
import { DesktopFrame, Badge } from './MockupFrame';
import { Icon } from './BingooIcons';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function MockupLeadsCRM() {
  const stages = [
    { name: 'New', color: '#3b82f6', leads: [
      { name: 'Sarah Lee', type: 'Civil', source: 'Profile', time: '5m', initial: 'S', color: '#3b82f6' },
      { name: 'K. Johnson', type: 'Criminal', source: 'NFC', time: '1h', initial: 'K', color: '#ec4899' },
    ]},
    { name: 'Contacted', color: '#f97316', leads: [
      { name: 'M. Chen', type: 'Immigration', source: 'QR', time: '2h', initial: 'M', color: '#22C55E' },
    ]},
    { name: 'Qualified', color: '#8b5cf6', leads: [
      { name: 'J. Smith', type: 'Immigration', source: 'Profile', time: '1d', initial: 'J', color: ORANGE },
      { name: 'L. Brown', type: 'Civil', source: 'Referral', time: '2d', initial: 'L', color: '#8b5cf6' },
    ]},
    { name: 'Won', color: '#22C55E', leads: [
      { name: 'R. Davis', type: 'Criminal', source: 'NFC', time: '3d', initial: 'R', color: '#22C55E' },
    ]},
    { name: 'Lost', color: '#EF4444', leads: [
      { name: 'T. Wilson', type: 'Civil', source: 'Profile', time: '5d', initial: 'T', color: '#EF4444' },
    ]},
  ];

  return (
    <DesktopFrame label="7 · Leads CRM">
      <div className="p-6 bg-[#F7F9FC]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold text-[#f97316] tracking-wider">CRM</p>
            <h2 className="text-xl font-black text-[#0F172A]">Leads Pipeline</h2>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] flex items-center gap-1.5 bg-white">
              <Icon name="filter" size={14} color="#64748B" /> Filter
            </button>
            <button className="px-3 py-1.5 text-xs font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] flex items-center gap-1.5 bg-white">
              <Icon name="download" size={14} color="#64748B" /> Export CSV
            </button>
            <button className="px-4 py-1.5 text-xs font-bold text-white rounded-lg flex items-center gap-1.5" style={{ background: ORANGE }}>
              <Icon name="plus" size={14} color="#FFFFFF" /> Add Lead
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Leads', value: '12', change: '+3', color: NAVY, icon: 'users' },
            { label: 'New', value: '2', change: '+2', color: '#3b82f6', icon: 'bell' },
            { label: 'Qualified', value: '2', change: '+1', color: '#8b5cf6', icon: 'checkCircle' },
            { label: 'Won', value: '1', change: '+1', color: '#22C55E', icon: 'star' },
            { label: 'Conversion', value: '25%', change: '+5%', color: ORANGE, icon: 'trend' },
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

        {/* Pipeline Columns */}
        <div className="grid grid-cols-5 gap-3">
          {stages.map((stage) => (
            <div key={stage.name}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: stage.color }} />
                  <span className="text-xs font-black text-[#0F172A]">{stage.name}</span>
                </div>
                <span className="text-[10px] font-bold text-[#64748B] bg-white px-1.5 py-0.5 rounded-md border border-[#E5EAF2]">{stage.leads.length}</span>
              </div>
              <div className="space-y-2">
                {stage.leads.map((lead) => (
                  <div key={lead.name} className="bg-white rounded-xl p-3 border border-[#E5EAF2] hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px]" style={{ background: `${lead.color}15`, color: lead.color }}>
                        {lead.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[11px] text-[#0F172A] truncate">{lead.name}</p>
                        <p className="text-[9px] text-[#64748B]">{lead.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-[#64748B] font-medium">{lead.source}</span>
                      <span className="text-[#64748B]">{lead.time} ago</span>
                    </div>
                    <div className="flex gap-1.5 mt-2 pt-2 border-t border-[#E5EAF2]">
                      <div className="flex-1 flex justify-center py-1 rounded-md hover:bg-[#F7F9FC]">
                        <Icon name="phone" size={12} color={NAVY} />
                      </div>
                      <div className="flex-1 flex justify-center py-1 rounded-md hover:bg-[#F7F9FC]">
                        <Icon name="message" size={12} color="#22C55E" />
                      </div>
                      <div className="flex-1 flex justify-center py-1 rounded-md hover:bg-[#F7F9FC]">
                        <Icon name="mail" size={12} color="#3b82f6" />
                      </div>
                      <div className="flex-1 flex justify-center py-1 rounded-md hover:bg-[#F7F9FC]">
                        <Icon name="more" size={12} color="#64748B" />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="rounded-xl p-2.5 border border-dashed border-[#E5EAF2] flex items-center justify-center gap-1 cursor-pointer hover:border-[#f97316]">
                  <Icon name="plus" size={12} color="#64748B" />
                  <span className="text-[9px] font-bold text-[#64748B]">Add</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}