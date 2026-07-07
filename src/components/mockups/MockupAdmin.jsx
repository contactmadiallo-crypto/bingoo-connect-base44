import React from 'react';
import { DesktopFrame } from './MockupFrame';

export default function MockupAdmin() {
  const orders = [
    { id: 'MFG-001', company: 'Diallo Law Firm', product: 'Metal Card ×50', status: 'in_production', cost: 520, price: 1750, margin: '70%', date: 'Jul 3' },
    { id: 'MFG-002', company: 'Salon Connect', product: 'Keychain ×100', status: 'shipped', cost: 400, price: 1200, margin: '67%', date: 'Jun 28' },
    { id: 'MFG-003', company: 'Bingoo Personal', product: 'Wood Card ×25', status: 'sent_to_supplier', cost: 350, price: 700, margin: '50%', date: 'Jul 1' },
    { id: 'MFG-004', company: 'Tech Corp', product: 'Bracelet ×200', status: 'paid', cost: 1200, price: 3000, margin: '60%', date: 'Jul 5' },
    { id: 'MFG-005', company: 'Cafe Deluxe', product: 'Sticker ×500', status: 'delivered', cost: 250, price: 750, margin: '67%', date: 'Jun 20' },
  ];
  const statusColors = {
    draft: '#64748B', submitted: '#0A1F52', awaiting_payment: '#FF7A00',
    paid: '#22C55E', in_review: '#8B5CF6', sent_to_supplier: '#0A1F52',
    in_production: '#FF7A00', shipped: '#8B5CF6', delivered: '#22C55E', cancelled: '#EF4444'
  };

  return (
    <DesktopFrame label="12 · Admin Manufacturing Orders">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF2]">
        <div>
          <h3 className="font-bold text-[#0F172A] text-sm">Manufacturing Orders</h3>
          <p className="text-[10px] text-[#64748B]">5 orders · $7,450 total revenue · $2,720 supplier cost · 63% avg margin</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-[#F7F9FC] rounded-lg text-[10px] text-[#64748B] border border-[#E5EAF2]">🔍 Search...</div>
          <button className="px-3 py-1.5 bg-[#F7F9FC] text-[#0F172A] text-[10px] font-medium rounded-lg border border-[#E5EAF2]">📥 Export</button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 px-6 py-3 bg-[#F7F9FC] border-b border-[#E5EAF2]">
        {['All', 'Draft', 'Paid', 'In Production', 'Shipped', 'Delivered'].map((s, i) => (
          <button key={s} className={`px-3 py-1 text-[10px] font-medium rounded-lg ${i === 0 ? 'bg-[#0A1F52] text-white' : 'bg-white text-[#64748B] border border-[#E5EAF2]'}`}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div className="p-4">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-[#64748B] border-b border-[#E5EAF2]">
              <th className="text-left py-2 px-2 font-semibold">Order ID</th>
              <th className="text-left py-2 px-2 font-semibold">Company</th>
              <th className="text-left py-2 px-2 font-semibold">Product</th>
              <th className="text-left py-2 px-2 font-semibold">Status</th>
              <th className="text-right py-2 px-2 font-semibold">Supplier Cost</th>
              <th className="text-right py-2 px-2 font-semibold">Sale Price</th>
              <th className="text-right py-2 px-2 font-semibold">Margin</th>
              <th className="text-left py-2 px-2 font-semibold">Date</th>
              <th className="text-center py-2 px-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-[#E5EAF2] hover:bg-[#F7F9FC]">
                <td className="py-2.5 px-2 font-semibold text-[#0A1F52]">{o.id}</td>
                <td className="py-2.5 px-2 text-[#0F172A]">{o.company}</td>
                <td className="py-2.5 px-2 text-[#64748B]">{o.product}</td>
                <td className="py-2.5 px-2">
                  <span className="px-2 py-0.5 text-[8px] font-bold rounded" style={{backgroundColor: `${statusColors[o.status]}15`, color: statusColors[o.status]}}>
                    {o.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-right text-[#64748B]">${o.cost}</td>
                <td className="py-2.5 px-2 text-right font-semibold text-[#0F172A]">${o.price}</td>
                <td className="py-2.5 px-2 text-right font-bold text-[#22C55E]">{o.margin}</td>
                <td className="py-2.5 px-2 text-[#64748B]">{o.date}</td>
                <td className="py-2.5 px-2 text-center">
                  <button className="px-2 py-0.5 bg-[#0A1F52]/10 text-[#0A1F52] text-[8px] font-medium rounded mr-1">🎨 Art</button>
                  <button className="px-2 py-0.5 bg-[#FF7A00]/10 text-[#FF7A00] text-[8px] font-medium rounded">→ Status</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Total Revenue', value: '$7,450', color: '#22C55E' },
            { label: 'Supplier Cost', value: '$2,720', color: '#EF4444' },
            { label: 'Gross Profit', value: '$4,730', color: '#0A1F52' },
            { label: 'Avg Margin', value: '63%', color: '#FF7A00' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
              <p className="text-[10px] text-[#64748B] mb-1">{s.label}</p>
              <p className="text-lg font-bold" style={{color: s.color}}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}