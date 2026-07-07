import React from 'react';
import { DesktopFrame, Badge } from './MockupFrame';
import { Icon } from './BingooIcons';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function MockupAdmin() {
  const orders = [
    { id: 'MFG-2401', customer: 'Diallo Law Firm', product: 'NFC Card ×50', total: '$224.50', status: 'production', color: ORANGE, date: 'Jul 5', margin: '42%' },
    { id: 'MFG-2400', customer: 'Bingoo Salon', product: 'NFC Keychain ×25', total: '$99.75', status: 'shipped', color: '#3b82f6', date: 'Jul 3', margin: '38%' },
    { id: 'MFG-2399', customer: 'Elite Realty', product: 'NFC Card ×100', total: '$449.00', status: 'delivered', color: '#22C55E', date: 'Jul 1', margin: '45%' },
    { id: 'MFG-2398', customer: 'Coffee Corner', product: 'NFC Sticker ×50', total: '$174.50', status: 'artwork', color: '#8b5cf6', date: 'Jul 7', margin: '40%' },
    { id: 'MFG-2397', customer: 'TechStart Inc', product: 'NFC Stand ×30', total: '$194.70', status: 'pending', color: '#64748B', date: 'Jul 7', margin: '35%' },
    { id: 'MFG-2396', customer: 'MedCare Clinic', product: 'NFC Badge ×40', total: '$224.00', status: 'delivered', color: '#22C55E', date: 'Jun 28', margin: '43%' },
  ];

  return (
    <DesktopFrame label="12 · Admin Manufacturing Orders">
      <div className="p-6 bg-[#F7F9FC] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold text-[#f97316] tracking-wider">ADMIN</p>
            <h2 className="text-xl font-black text-[#0F172A]">Manufacturing Orders</h2>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] flex items-center gap-1.5 bg-white">
              <Icon name="download" size={14} color="#64748B" /> Export
            </button>
            <button className="px-4 py-1.5 text-xs font-bold text-white rounded-lg flex items-center gap-1.5" style={{ background: ORANGE }}>
              <Icon name="plus" size={14} color="#FFFFFF" /> New Order
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Total Orders', value: '2,401', color: NAVY, icon: 'package' },
            { label: 'In Production', value: '8', color: ORANGE, icon: 'factory' },
            { label: 'Shipped', value: '3', color: '#3b82f6', icon: 'truck' },
            { label: 'Delivered', value: '2,380', color: '#22C55E', icon: 'checkCircle' },
            { label: 'Revenue', value: '$48K', color: '#8b5cf6', icon: 'trend' },
            { label: 'Avg Margin', value: '41%', color: '#ec4899', icon: 'chart' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}>
                  <Icon name={k.icon} size={15} color={k.color} />
                </div>
              </div>
              <p className="text-lg font-black" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[9px] text-[#64748B] font-medium">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Status Pipeline */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-[#0F172A]">Production Pipeline</p>
            <span className="text-[10px] font-bold text-[#64748B]">8 active orders</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[
              { stage: 'Pending', count: 2, color: '#64748B' },
              { stage: 'Artwork', count: 1, color: '#8b5cf6' },
              { stage: 'Production', count: 3, color: ORANGE },
              { stage: 'Quality Check', count: 1, color: '#3b82f6' },
              { stage: 'Ready to Ship', count: 1, color: '#22C55E' },
            ].map((s, i) => (
              <div key={s.stage} className="flex items-center gap-2">
                <div className="flex-1 rounded-xl p-3 border-2 text-center" style={{ borderColor: `${s.color}40`, background: `${s.color}08` }}>
                  <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: s.color }}>
                    <span className="text-white font-black text-sm">{s.count}</span>
                  </div>
                  <p className="text-[9px] font-bold" style={{ color: s.color }}>{s.stage}</p>
                </div>
                {i < 4 && <Icon name="chevronRight" size={14} color="#cbd5e1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
          <div className="grid grid-cols-12 gap-0 px-4 py-3 border-b border-[#E5EAF2] bg-[#F7F9FC]">
            <div className="col-span-1 text-[10px] font-black text-[#64748B] tracking-wider">ORDER ID</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">CUSTOMER</div>
            <div className="col-span-3 text-[10px] font-black text-[#64748B] tracking-wider">PRODUCT</div>
            <div className="col-span-1 text-[10px] font-black text-[#64748B] tracking-wider">DATE</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider text-right">TOTAL</div>
            <div className="col-span-1 text-[10px] font-black text-[#64748B] tracking-wider text-right">MARGIN</div>
            <div className="col-span-1 text-[10px] font-black text-[#64748B] tracking-wider text-center">STATUS</div>
            <div className="col-span-1 text-[10px] font-black text-[#64748B] tracking-wider text-right">ART</div>
          </div>
          {orders.map((o) => (
            <div key={o.id} className="grid grid-cols-12 gap-0 px-4 py-3 border-b border-[#E5EAF2] items-center hover:bg-[#F7F9FC] cursor-pointer">
              <div className="col-span-1">
                <p className="text-[10px] font-black text-[#0F172A]">{o.id}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-[#0F172A] truncate">{o.customer}</p>
              </div>
              <div className="col-span-3">
                <p className="text-[10px] font-medium text-[#64748B]">{o.product}</p>
              </div>
              <div className="col-span-1">
                <p className="text-[10px] text-[#64748B]">{o.date}</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-[10px] font-black" style={{ color: ORANGE }}>{o.total}</p>
              </div>
              <div className="col-span-1 text-right">
                <span className="text-[10px] font-black text-[#22C55E]">{o.margin}</span>
              </div>
              <div className="col-span-1 text-center">
                <Badge color={o.color}>{o.status.toUpperCase()}</Badge>
              </div>
              <div className="col-span-1 flex justify-end">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#F7F9FC]" style={{ background: `${NAVY}10` }}>
                  <Icon name="eye" size={12} color={NAVY} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Supplier Info */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { name: 'Primary Supplier', location: 'Shenzhen, CN', lead: '5-7 days', orders: 12, color: NAVY },
            { name: 'Backup Supplier', location: 'Istanbul, TR', lead: '8-10 days', orders: 4, color: ORANGE },
            { name: 'Premium Supplier', location: 'Miami, US', lead: '3-5 days', orders: 2, color: '#22C55E' },
          ].map((s) => (
            <div key={s.name} className="bg-white rounded-2xl p-4 border border-[#E5EAF2]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <Icon name="factory" size={18} color={s.color} />
                </div>
                <div>
                  <p className="font-black text-xs text-[#0F172A]">{s.name}</p>
                  <p className="text-[9px] text-[#64748B]">{s.location}</p>
                </div>
              </div>
              <div className="flex justify-between text-[9px]">
                <div>
                  <p className="font-bold text-[#64748B]">Lead Time</p>
                  <p className="font-black text-[#0F172A]">{s.lead}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#64748B]">Active Orders</p>
                  <p className="font-black" style={{ color: s.color }}>{s.orders}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}