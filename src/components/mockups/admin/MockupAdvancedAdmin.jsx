import React, { useState } from 'react';
import { DesktopFrame, Badge } from '@/components/mockups/MockupFrame';
import { BingooLogo } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', ORANGE = '#f97316', BG = '#F7F9FC', MUTED = '#64748B', INK = '#0F172A';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'users', label: 'Users & Subs', icon: 'users' },
  { id: 'devices', label: 'NFC Inventory', icon: 'nfc' },
  { id: 'orders', label: 'Manufacturing', icon: 'factory' },
  { id: 'products', label: 'Products', icon: 'package' },
  { id: 'approvals', label: 'Design Approvals', icon: 'palette' },
  { id: 'support', label: 'Support', icon: 'message' },
  { id: 'lost', label: 'Lost Reports', icon: 'alert' },
  { id: 'audit', label: 'Audit Log', icon: 'shield' },
];

export default function MockupAdvancedAdmin() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <DesktopFrame label="Advanced Admin Dashboard — Full Operations" height="h-[680px]">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-48 border-r border-[#E5EAF2] bg-[#F7F9FC] py-3 shrink-0">
          <div className="px-3 mb-4"><BingooLogo size={28} showText /></div>
          {TABS.map((t) => (
            <div key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-2 flex items-center gap-2 cursor-pointer ${activeTab === t.id ? 'bg-white border-r-2' : ''}`} style={activeTab === t.id ? { borderColor: ORANGE } : {}}>
              <Icon name={t.icon} size={14} color={activeTab === t.id ? ORANGE : MUTED} />
              <span className={`text-[10px] font-bold ${activeTab === t.id ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{t.label}</span>
            </div>
          ))}
        </div>
        {/* Main Content */}
        <div className="flex-1 p-5 overflow-y-auto bg-[#F7F9FC]">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'devices' && <DevicesTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'approvals' && <ApprovalsTab />}
          {activeTab === 'support' && <SupportTab />}
          {activeTab === 'lost' && <LostTab />}
          {activeTab === 'audit' && <AuditTab />}
        </div>
      </div>
    </DesktopFrame>
  );
}

function OverviewTab() {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#f97316] tracking-wider mb-1">SYSTEM OVERVIEW</p>
      <h2 className="text-lg font-black text-[#0F172A] mb-4">Dashboard</h2>
      {/* Revenue KPIs */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {[
          { label: 'MRR', value: '$48.2K', change: '+12%', color: '#22C55E', icon: 'trend' },
          { label: 'ARR', value: '$578K', change: '+18%', color: NAVY, icon: 'chart' },
          { label: 'Churn Rate', value: '2.1%', change: '-0.3%', color: '#EF4444', icon: 'alert' },
          { label: 'Failed Pmts', value: '18', change: '+3', color: '#EF4444', icon: 'alert' },
          { label: 'Monthly', value: '3,200', color: ORANGE, icon: 'calendar' },
          { label: 'Annual', value: '647', color: '#8b5cf6', icon: 'clock' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-2.5 border border-[#E5EAF2]">
            <div className="flex items-center justify-between mb-1.5"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}><Icon name={k.icon} size={13} color={k.color} /></div>{k.change && <span className="text-[8px] font-bold" style={{ color: k.change.startsWith('-') && k.label !== 'Churn Rate' ? '#EF4444' : '#22C55E' }}>{k.change}</span>}</div>
            <p className="text-base font-black" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[8px] text-[#64748B] font-medium">{k.label}</p>
          </div>
        ))}
      </div>
      {/* Revenue + Plan Distribution */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="col-span-2 bg-white rounded-xl p-4 border border-[#E5EAF2]">
          <div className="flex items-center justify-between mb-3"><p className="text-[10px] font-black text-[#0F172A]">Revenue — Monthly vs Annual</p><Badge color={ORANGE}>6 MONTHS</Badge></div>
          <div className="flex items-end justify-between gap-2 h-32">
            {[28, 32, 38, 42, 45, 48].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex justify-center items-end h-28 gap-0.5">
                  <div className="w-2/5 rounded-t" style={{ height: `${(v / 48) * 100}%`, background: ORANGE }} />
                  <div className="w-2/5 rounded-t" style={{ height: `${(v * 0.2 / 48) * 100}%`, background: '#8b5cf6' }} />
                </div>
                <span className="text-[7px] font-bold text-[#64748B]">{['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2"><div className="flex items-center gap-1"><div className="w-2 h-2 rounded" style={{ background: ORANGE }} /><span className="text-[8px] font-bold text-[#64748B]">Monthly</span></div><div className="flex items-center gap-1"><div className="w-2 h-2 rounded" style={{ background: '#8b5cf6' }} /><span className="text-[8px] font-bold text-[#64748B]">Annual</span></div></div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
          <p className="text-[10px] font-black text-[#0F172A] mb-3">Revenue by Plan</p>
          {[
            { plan: 'Law Firm', amount: '$15.8K', pct: 33, color: NAVY },
            { plan: 'Salon', amount: '$8.4K', pct: 17, color: '#ec4899' },
            { plan: 'Business', amount: '$7.2K', pct: 15, color: '#22C55E' },
            { plan: 'Pro', amount: '$5.8K', pct: 12, color: ORANGE },
            { plan: 'Free', amount: '$0', pct: 0, color: MUTED },
          ].map((p) => (
            <div key={p.plan} className="mb-2">
              <div className="flex justify-between text-[9px] mb-0.5"><span className="font-bold text-[#0F172A]">{p.plan}</span><span className="font-bold" style={{ color: p.color }}>{p.amount}</span></div>
              <div className="h-1.5 bg-[#F7F9FC] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} /></div>
            </div>
          ))}
        </div>
      </div>
      {/* Analytics by Dimension */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
          <p className="text-[9px] font-black text-[#0F172A] mb-2">Top Profiles by Views</p>
          {[['Diallo Law', '12.4K'], ['Bella Studio', '8.2K'], ['Carter Ent', '5.1K']].map(([n, v]) => (
            <div key={n} className="flex justify-between text-[8px] py-1"><span className="font-bold text-[#0F172A]">{n}</span><span className="font-bold" style={{ color: ORANGE }}>{v}</span></div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
          <p className="text-[9px] font-black text-[#0F172A] mb-2">Top Products by Sales</p>
          {[['NFC Card', '2,401'], ['Keychain', '1,847'], ['Metal Card', '892']].map(([n, v]) => (
            <div key={n} className="flex justify-between text-[8px] py-1"><span className="font-bold text-[#0F172A]">{n}</span><span className="font-bold" style={{ color: NAVY }}>{v}</span></div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
          <p className="text-[9px] font-black text-[#0F172A] mb-2">Manual Entitlements</p>
          <div className="flex justify-between text-[8px] py-1"><span className="font-bold text-[#64748B]">Overrides Active</span><span className="font-bold text-[#8b5cf6]">8</span></div>
          <div className="flex justify-between text-[8px] py-1"><span className="font-bold text-[#64748B]">Test Accounts</span><span className="font-bold text-[#f97316]">12</span></div>
          <button className="w-full py-1.5 mt-1 text-[8px] font-bold text-white rounded" style={{ background: NAVY }}>Manage Overrides</button>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#f97316] tracking-wider mb-1">USER MANAGEMENT</p>
      <h2 className="text-lg font-black text-[#0F172A] mb-4">Users & Subscriptions</h2>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Active Subs', value: '3,847', color: '#22C55E' },
          { label: 'Past Due', value: '18', color: '#EF4444' },
          { label: 'Canceled', value: '127', color: MUTED },
          { label: 'Plan Overrides', value: '8', color: '#8b5cf6' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2]"><p className="text-base font-black" style={{ color: k.color }}>{k.value}</p><p className="text-[8px] text-[#64748B]">{k.label}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-[#E5EAF2] overflow-hidden">
        <div className="grid grid-cols-12 px-3 py-2 border-b border-[#E5EAF2] bg-[#F7F9FC] text-[9px] font-black text-[#64748B]">
          <div className="col-span-3">USER</div><div className="col-span-2">PLAN</div><div className="col-span-2">STATUS</div><div className="col-span-2">BILLING</div><div className="col-span-1">OVERRIDE</div><div className="col-span-2 text-right">ACTIONS</div>
        </div>
        {[
          { name: 'Mamadou Diallo', email: 'mamadou@bingooconnect.com', plan: 'Law Firm', status: 'active', billing: 'Monthly $49', override: '—', color: NAVY },
          { name: 'Sarah Johnson', email: 'sarah@salon.com', plan: 'Salon', status: 'active', billing: 'Annual $215', override: '—', color: '#ec4899' },
          { name: 'Test User 1', email: 'test1@bingooconnect.com', plan: 'Law Firm', status: 'active', billing: '—', override: 'Admin', color: ORANGE },
          { name: 'Robert Wilson', email: 'rob@realtor.co', plan: 'Pro', status: 'past_due', billing: 'Monthly $9.99', override: '—', color: '#3b82f6' },
        ].map((u) => (
          <div key={u.email} className="grid grid-cols-12 px-3 py-2.5 border-b border-[#E5EAF2] items-center">
            <div className="col-span-3"><p className="text-[9px] font-bold text-[#0F172A]">{u.name}</p><p className="text-[8px] text-[#64748B]">{u.email}</p></div>
            <div className="col-span-2"><Badge color={u.color}>{u.plan.toUpperCase()}</Badge></div>
            <div className="col-span-2"><Badge color={u.status === 'active' ? '#22C55E' : '#EF4444'}>{u.status.toUpperCase()}</Badge></div>
            <div className="col-span-2"><span className="text-[9px] font-medium text-[#0F172A]">{u.billing}</span></div>
            <div className="col-span-1">{u.override === 'Admin' ? <Badge color="#8b5cf6">OVERRIDE</Badge> : <span className="text-[9px] text-[#cbd5e1]">—</span>}</div>
            <div className="col-span-2 flex justify-end gap-1">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${ORANGE}10` }}><Icon name="edit" size={10} color={ORANGE} /></div>
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="lock" size={10} color={NAVY} /></div>
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${MUTED}10` }}><Icon name="more" size={10} color={MUTED} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DevicesTab() {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#f97316] tracking-wider mb-1">NFC HARDWARE</p>
      <h2 className="text-lg font-black text-[#0F172A] mb-4">Device Inventory</h2>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {[['Available', '4,892', MUTED], ['Assigned', '1,247', '#3b82f6'], ['Active', '2,156', '#22C55E'], ['Lost', '89', '#EF4444'], ['Disabled', '108', '#64748B']].map(([l, v, c]) => (
          <div key={l} className="bg-white rounded-xl p-3 border border-[#E5EAF2]"><p className="text-base font-black" style={{ color: c }}>{v}</p><p className="text-[8px] text-[#64748B]">{l}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 border border-[#E5EAF2] mb-4">
        <p className="text-[9px] font-black text-[#0F172A] mb-2">BATCH GENERATION</p>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="px-2 py-1.5 bg-[#F7F9FC] rounded text-[9px] font-bold border border-[#E5EAF2]"><option>NFC Card</option></select>
          <input className="px-2 py-1.5 bg-[#F7F9FC] rounded text-[9px] font-bold border border-[#E5EAF2] w-14" defaultValue="100" readOnly />
          <input className="px-2 py-1.5 bg-[#F7F9FC] rounded text-[9px] font-bold border border-[#E5EAF2] w-16" defaultValue="BG-" readOnly />
          <button className="px-3 py-1.5 text-[9px] font-bold text-white rounded" style={{ background: NAVY }}>Generate</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[#E5EAF2] overflow-hidden">
        <div className="grid grid-cols-12 px-3 py-2 border-b border-[#E5EAF2] bg-[#F7F9FC] text-[9px] font-black text-[#64748B]">
          <div className="col-span-2">CODE</div><div className="col-span-2">TYPE</div><div className="col-span-2">STATUS</div><div className="col-span-3">OWNER</div><div className="col-span-2">ACTIVATED</div><div className="col-span-1 text-right">·</div>
        </div>
        {[['BG-000001', 'Card', 'active', 'Diallo Law', 'Jul 1'], ['BG-000007', 'Bracelet', 'lost', 'Diallo Law', 'Jun 20'], ['BG-000012', 'Keychain', 'available', '—', '—']].map((d) => (
          <div key={d[0]} className="grid grid-cols-12 px-3 py-2.5 border-b border-[#E5EAF2] items-center">
            <div className="col-span-2"><span className="text-[9px] font-black text-[#0F172A]">{d[0]}</span></div>
            <div className="col-span-2"><span className="text-[9px] font-bold text-[#0F172A]">{d[1]}</span></div>
            <div className="col-span-2"><Badge color={d[2] === 'active' ? '#22C55E' : d[2] === 'lost' ? '#EF4444' : MUTED}>{d[2].toUpperCase()}</Badge></div>
            <div className="col-span-3"><span className="text-[9px] text-[#64748B]">{d[3]}</span></div>
            <div className="col-span-2"><span className="text-[9px] text-[#64748B]">{d[4]}</span></div>
            <div className="col-span-1 flex justify-end"><div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="eye" size={10} color={NAVY} /></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#f97316] tracking-wider mb-1">MANUFACTURING</p>
      <h2 className="text-lg font-black text-[#0F172A] mb-4">Orders & Suppliers</h2>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[['In Production', '47', ORANGE], ['Shipped', '128', '#3b82f6'], ['Delivered', '2,226', '#22C55E'], ['Delayed', '3', '#EF4444']].map(([l, v, c]) => (
          <div key={l} className="bg-white rounded-xl p-3 border border-[#E5EAF2]"><p className="text-base font-black" style={{ color: c }}>{v}</p><p className="text-[8px] text-[#64748B]">{l}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 border border-[#E5EAF2] mb-4">
        <p className="text-[9px] font-black text-[#0F172A] mb-2">SUPPLIER STATUS</p>
        {[
          { name: 'Primary — Shenzhen, CN', status: 'Active', lead: '5-7 days', load: '78%', color: '#22C55E' },
          { name: 'Backup — Dongguan, CN', status: 'Standby', lead: '7-10 days', load: '0%', color: MUTED },
          { name: 'Premium — Taiwan', status: 'Active', lead: '3-5 days', load: '45%', color: '#3b82f6' },
        ].map((s) => (
          <div key={s.name} className="flex items-center gap-3 py-2 border-b border-[#E5EAF2] last:border-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}><Icon name="factory" size={14} color={s.color} /></div>
            <div className="flex-1"><p className="text-[9px] font-bold text-[#0F172A]">{s.name}</p><p className="text-[8px] text-[#64748B]">Lead: {s.lead} · Load: {s.load}</p></div>
            <Badge color={s.color}>{s.status.toUpperCase()}</Badge>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-[#E5EAF2] overflow-hidden">
        <div className="grid grid-cols-12 px-3 py-2 border-b border-[#E5EAF2] bg-[#F7F9FC] text-[9px] font-black text-[#64748B]">
          <div className="col-span-2">ORDER</div><div className="col-span-3">CUSTOMER</div><div className="col-span-2">PRODUCT</div><div className="col-span-2">STAGE</div><div className="col-span-2">SUPPLIER</div><div className="col-span-1 text-right">·</div>
        </div>
        {[['MFG-2401', 'Diallo Law', '50 Cards', 'Production', 'Primary'], ['MFG-2402', 'Bella Studio', '20 Keychains', 'QC', 'Premium'], ['MFG-2403', 'Carter Ent', '100 Badges', 'Shipped', 'Primary']].map((o) => (
          <div key={o[0]} className="grid grid-cols-12 px-3 py-2.5 border-b border-[#E5EAF2] items-center">
            <div className="col-span-2"><span className="text-[9px] font-black text-[#0F172A]">{o[0]}</span></div>
            <div className="col-span-3"><span className="text-[9px] font-bold text-[#0F172A]">{o[1]}</span></div>
            <div className="col-span-2"><span className="text-[9px] text-[#64748B]">{o[2]}</span></div>
            <div className="col-span-2"><Badge color={o[3] === 'Shipped' ? '#3b82f6' : o[3] === 'QC' ? '#8b5cf6' : ORANGE}>{o[3].toUpperCase()}</Badge></div>
            <div className="col-span-2"><span className="text-[9px] text-[#64748B]">{o[4]}</span></div>
            <div className="col-span-1 flex justify-end"><div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="eye" size={10} color={NAVY} /></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsTab() {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#f97316] tracking-wider mb-1">CATALOG</p>
      <h2 className="text-lg font-black text-[#0F172A] mb-4">Product Management</h2>
      <div className="grid grid-cols-3 gap-3">
        {[
          { name: 'NFC Business Card', price: '$19.99', stock: '2,847', sales: '2,401', color: NAVY },
          { name: 'NFC Metal Card', price: '$29.99', stock: '1,200', sales: '892', color: '#8b5cf6' },
          { name: 'NFC Keychain', price: '$11.99', stock: '3,400', sales: '1,847', color: ORANGE },
          { name: 'NFC Bracelet', price: '$24.99', stock: '890', sales: '672', color: '#ec4899' },
          { name: 'NFC Sticker', price: '$12.99', stock: '5,200', sales: '1,203', color: '#22C55E' },
          { name: 'NFC Phone Stand', price: '$22.99', stock: '670', sales: '445', color: '#3b82f6' },
        ].map((p) => (
          <div key={p.name} className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${p.color}15` }}><Icon name="nfc" size={16} color={p.color} /></div>
              <div className="flex-1"><p className="text-[9px] font-bold text-[#0F172A]">{p.name}</p><p className="text-[10px] font-black" style={{ color: p.color }}>{p.price}</p></div>
            </div>
            <div className="flex justify-between text-[8px]"><span className="text-[#64748B]">Stock: <b className="text-[#0F172A]">{p.stock}</b></span><span className="text-[#64748B]">Sold: <b className="text-[#0F172A]">{p.sales}</b></span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalsTab() {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#f97316] tracking-wider mb-1">CUSTOM DESIGNS</p>
      <h2 className="text-lg font-black text-[#0F172A] mb-4">Design Approvals</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { customer: 'Diallo Law Firm', product: '50 NFC Cards', status: 'pending', date: 'Jul 5' },
          { customer: 'Bella Studio', product: '20 Keychains', status: 'approved', date: 'Jul 4' },
          { customer: 'Carter Ent', product: '100 Badges', status: 'revision', date: 'Jul 3' },
        ].map((a) => (
          <div key={a.customer} className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
            <div className="flex items-center justify-between mb-3">
              <div><p className="text-[10px] font-bold text-[#0F172A]">{a.customer}</p><p className="text-[8px] text-[#64748B]">{a.product} · {a.date}</p></div>
              <Badge color={a.status === 'approved' ? '#22C55E' : a.status === 'pending' ? ORANGE : '#3b82f6'}>{a.status.toUpperCase()}</Badge>
            </div>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 h-20 rounded-lg" style={{ background: `linear-gradient(135deg, ${NAVY}, #071A3D)` }}>
                <div className="flex items-center justify-center h-full"><Icon name="nfc" size={20} color={ORANGE} /></div>
              </div>
              <div className="flex-1 h-20 rounded-lg bg-[#F7F9FC] border border-[#E5EAF2] flex items-center justify-center"><Icon name="nfc" size={20} color={MUTED} /></div>
            </div>
            {a.status === 'pending' && (
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 text-[8px] font-bold text-white rounded" style={{ background: '#22C55E' }}>Approve</button>
                <button className="flex-1 py-1.5 text-[8px] font-bold text-white rounded" style={{ background: '#EF4444' }}>Request Revision</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportTab() {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#f97316] tracking-wider mb-1">CUSTOMER SUPPORT</p>
      <h2 className="text-lg font-black text-[#0F172A] mb-4">Support Tickets</h2>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[['Open', '47', ORANGE], ['In Progress', '12', '#3b82f6'], ['Resolved', '2,847', '#22C55E'], ['Escalated', '3', '#EF4444']].map(([l, v, c]) => (
          <div key={l} className="bg-white rounded-xl p-3 border border-[#E5EAF2]"><p className="text-base font-black" style={{ color: c }}>{v}</p><p className="text-[8px] text-[#64748B]">{l}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-[#E5EAF2] overflow-hidden">
        <div className="grid grid-cols-12 px-3 py-2 border-b border-[#E5EAF2] bg-[#F7F9FC] text-[9px] font-black text-[#64748B]">
          <div className="col-span-2">TICKET</div><div className="col-span-3">USER</div><div className="col-span-3">ISSUE</div><div className="col-span-2">PRIORITY</div><div className="col-span-2">STATUS</div>
        </div>
        {[
          ['#2047', 'mamadou@bingooconnect.com', 'NFC device not tapping', 'High', 'Open'],
          ['#2046', 'sarah@salon.com', 'Subscription billing error', 'Medium', 'In Progress'],
          ['#2045', 'rob@realtor.co', 'Profile layout broken', 'Low', 'Resolved'],
        ].map((t) => (
          <div key={t[0]} className="grid grid-cols-12 px-3 py-2.5 border-b border-[#E5EAF2] items-center">
            <div className="col-span-2"><span className="text-[9px] font-black text-[#0F172A]">{t[0]}</span></div>
            <div className="col-span-3"><span className="text-[9px] font-bold text-[#0F172A]">{t[1]}</span></div>
            <div className="col-span-3"><span className="text-[9px] text-[#64748B]">{t[2]}</span></div>
            <div className="col-span-2"><Badge color={t[3] === 'High' ? '#EF4444' : t[3] === 'Medium' ? ORANGE : '#22C55E'}>{t[3].toUpperCase()}</Badge></div>
            <div className="col-span-2"><Badge color={t[4] === 'Open' ? ORANGE : t[4] === 'In Progress' ? '#3b82f6' : '#22C55E'}>{t[4].toUpperCase()}</Badge></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LostTab() {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#f97316] tracking-wider mb-1">DEVICE RECOVERY</p>
      <h2 className="text-lg font-black text-[#0F172A] mb-4">Lost Device Reports</h2>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[['New Reports', '8', '#EF4444'], ['Contacted', '4', ORANGE], ['Recovered', '77', '#22C55E']].map(([l, v, c]) => (
          <div key={l} className="bg-white rounded-xl p-3 border border-[#E5EAF2]"><p className="text-base font-black" style={{ color: c }}>{v}</p><p className="text-[8px] text-[#64748B]">{l}</p></div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-[#E5EAF2] overflow-hidden">
        <div className="grid grid-cols-12 px-3 py-2 border-b border-[#E5EAF2] bg-[#F7F9FC] text-[9px] font-black text-[#64748B]">
          <div className="col-span-2">DEVICE</div><div className="col-span-2">OWNER</div><div className="col-span-3">FINDER</div><div className="col-span-3">LOCATION</div><div className="col-span-2">STATUS</div>
        </div>
        {[
          ['BG-000007', 'Diallo Law', 'Sarah J.', 'Central Park, NYC', 'new'],
          ['BG-000015', 'Bella Studio', 'James K.', 'Brooklyn, NYC', 'contacted'],
          ['BG-000022', 'Carter Ent', '—', '—', 'recovered'],
        ].map((r) => (
          <div key={r[0]} className="grid grid-cols-12 px-3 py-2.5 border-b border-[#E5EAF2] items-center">
            <div className="col-span-2"><span className="text-[9px] font-black text-[#0F172A]">{r[0]}</span></div>
            <div className="col-span-2"><span className="text-[9px] font-bold text-[#0F172A]">{r[1]}</span></div>
            <div className="col-span-3"><span className="text-[9px] text-[#64748B]">{r[2]}</span></div>
            <div className="col-span-3"><span className="text-[9px] text-[#64748B]">{r[3]}</span></div>
            <div className="col-span-2"><Badge color={r[4] === 'new' ? '#EF4444' : r[4] === 'contacted' ? ORANGE : '#22C55E'}>{r[4].toUpperCase()}</Badge></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditTab() {
  return (
    <div>
      <p className="text-[10px] font-bold text-[#f97316] tracking-wider mb-1">SECURITY</p>
      <h2 className="text-lg font-black text-[#0F172A] mb-4">Admin Audit Log</h2>
      <div className="bg-white rounded-xl border border-[#E5EAF2] overflow-hidden">
        <div className="grid grid-cols-12 px-3 py-2 border-b border-[#E5EAF2] bg-[#F7F9FC] text-[9px] font-black text-[#64748B]">
          <div className="col-span-2">TIME</div><div className="col-span-2">ADMIN</div><div className="col-span-3">ACTION</div><div className="col-span-3">TARGET</div><div className="col-span-2">DETAILS</div>
        </div>
        {[
          ['10:42 AM', 'admin@bingoo', 'Plan Override', 'test1@bingooconnect.com', 'Granted Law Firm'],
          ['09:15 AM', 'admin@bingoo', 'User Suspend', 'spam@user.com', 'Abuse report'],
          ['Yesterday', 'admin@bingoo', 'Batch Generate', 'BG-05000–05100', '100 NFC Cards'],
          ['Yesterday', 'admin@bingoo', 'Order Advance', 'MFG-2402', 'Production → QC'],
          ['2 days ago', 'admin@bingoo', 'Product Update', 'NFC Metal Card', 'Price: $29.99'],
        ].map((r, i) => (
          <div key={i} className="grid grid-cols-12 px-3 py-2.5 border-b border-[#E5EAF2] items-center">
            <div className="col-span-2"><span className="text-[9px] text-[#64748B]">{r[0]}</span></div>
            <div className="col-span-2"><span className="text-[9px] font-bold text-[#0F172A]">{r[1]}</span></div>
            <div className="col-span-3"><Badge color={NAVY}>{r[2].toUpperCase()}</Badge></div>
            <div className="col-span-3"><span className="text-[9px] font-medium text-[#0F172A]">{r[3]}</span></div>
            <div className="col-span-2"><span className="text-[9px] text-[#64748B]">{r[4]}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}