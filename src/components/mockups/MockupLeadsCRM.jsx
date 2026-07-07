import React from 'react';
import { DesktopFrame } from './MockupFrame';

export default function MockupLeadsCRM() {
  const stages = [
    { name: 'New', count: 4, color: '#FF7A00', leads: [
      { name: 'Sarah Lee', type: 'Civil', source: 'Profile', time: '5m' },
      { name: 'K. Johnson', type: 'Criminal', source: 'NFC', time: '1h' },
    ]},
    { name: 'Contacted', count: 3, color: '#0A1F52', leads: [
      { name: 'M. Chen', type: 'Immigration', source: 'QR', time: '2h' },
    ]},
    { name: 'Consult', count: 2, color: '#8B5CF6', leads: [
      { name: 'L. Adams', type: 'Immigration', source: 'Profile', time: '1d' },
    ]},
    { name: 'Retained', count: 1, color: '#22C55E', leads: [
      { name: 'R. Patel', type: 'Civil', source: 'Referral', time: '3d' },
    ]},
  ];

  return (
    <DesktopFrame label="7 · Leads CRM">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF2]">
        <div>
          <h3 className="font-bold text-[#0F172A] text-sm">Leads CRM</h3>
          <p className="text-[10px] text-[#64748B]">Diallo Law Firm · 10 total leads · 10% conversion</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#F7F9FC] rounded-lg text-[10px] text-[#64748B] border border-[#E5EAF2]">🔍 Search leads...</div>
          <button className="px-3 py-1.5 bg-[#F7F9FC] text-[#0F172A] text-[10px] font-medium rounded-lg border border-[#E5EAF2]">📥 Export CSV</button>
          <button className="px-3 py-1.5 bg-[#FF7A00] text-white text-[10px] font-semibold rounded-lg">＋ New Lead</button>
        </div>
      </div>

      {/* Pipeline */}
      <div className="flex gap-3 p-4 overflow-x-auto bg-[#F7F9FC] min-h-[500px]">
        {stages.map((stage) => (
          <div key={stage.name} className="w-56 flex-shrink-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: stage.color}} />
                <span className="text-xs font-bold text-[#0F172A]">{stage.name}</span>
              </div>
              <span className="px-1.5 py-0.5 bg-white text-[#64748B] text-[9px] font-bold rounded">{stage.count}</span>
            </div>
            <div className="space-y-2">
              {stage.leads.map((lead) => (
                <div key={lead.name} className="bg-white rounded-lg p-3 border border-[#E5EAF2]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-[#0A1F52]/10 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-[#0A1F52]">{lead.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#0F172A] truncate">{lead.name}</p>
                      <p className="text-[8px] text-[#64748B]">{lead.type} · {lead.source}</p>
                    </div>
                  </div>
                  <p className="text-[8px] text-[#64748B] mb-2">{lead.time} ago</p>
                  <div className="flex gap-1">
                    <button className="flex-1 py-1 bg-[#22C55E]/10 rounded text-[8px]">💬</button>
                    <button className="flex-1 py-1 bg-[#0A1F52]/10 rounded text-[8px]">📞</button>
                    <button className="flex-1 py-1 bg-[#FF7A00]/10 rounded text-[8px]">📧</button>
                    <button className="flex-1 py-1 bg-[#F7F9FC] rounded text-[8px]">›</button>
                  </div>
                </div>
              ))}
              <button className="w-full py-1.5 border border-dashed border-[#E5EAF2] rounded-lg text-[9px] text-[#64748B]">＋ Add</button>
            </div>
          </div>
        ))}
      </div>
    </DesktopFrame>
  );
}