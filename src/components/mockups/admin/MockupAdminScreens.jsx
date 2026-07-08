import React from 'react';
import { DesktopFrame, Badge, StatCard } from '@/components/mockups/MockupFrame';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

// ── Screen 39: Admin Dashboard ──
export function MockupAdminDashboard() {
  return (
    <DesktopFrame label="39 · Admin Dashboard">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-48 border-r border-[#E5EAF2] bg-[#F7F9FC] py-4">
          <div className="px-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`, boxShadow: `0 2px 6px ${ORANGE}44, inset 0 1px 0 rgba(255,255,255,0.3)` }}><svg width="14" height="7" viewBox="0 0 48 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M 14 12 C 14 6 20 6 24 12 C 28 18 34 18 34 12 C 34 6 28 6 24 12 C 20 18 14 18 14 12 Z" /></svg></div>
              <div><p className="font-black text-xs text-[#0F172A]">Bing<span style={{ color: ORANGE }}>∞</span> Connect</p><p className="text-[8px] text-[#f97316] font-bold">ADMIN</p></div>
            </div>
          </div>
          {[
            { icon: 'grid', label: 'Dashboard', active: true },
            { icon: 'users', label: 'Users' },
            { icon: 'nfc', label: 'Devices' },
            { icon: 'package', label: 'Orders' },
            { icon: 'wallet', label: 'Subscriptions' },
            { icon: 'chart', label: 'Analytics' },
            { icon: 'shield', label: 'Security' },
          ].map((item) => (
            <div key={item.label} className={`px-4 py-2.5 flex items-center gap-2.5 cursor-pointer ${item.active ? 'bg-white border-r-2' : ''}`} style={item.active ? { borderColor: ORANGE } : {}}>
              <Icon name={item.icon} size={15} color={item.active ? ORANGE : MUTED} />
              <span className={`text-xs font-bold ${item.active ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{item.label}</span>
            </div>
          ))}
        </div>
        {/* Main */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#F7F9FC]">
          <div className="flex items-center justify-between mb-5">
            <div><p className="text-[10px] font-bold text-[#f97316] tracking-wider">SYSTEM OVERVIEW</p><h2 className="text-xl font-black text-[#0F172A]">Admin Dashboard</h2></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F7F9FC] flex items-center justify-center"><Icon name="bell" size={16} color={MUTED} /></div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-[#E5EAF2]"><div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: NAVY }}><span className="text-white text-[9px] font-black">AD</span></div><span className="text-[10px] font-bold text-[#0F172A]">Admin</span></div>
            </div>
          </div>
          {/* KPIs */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            {[
              { label: 'Total Users', value: '10,247', change: '+5%', color: NAVY, icon: 'users' },
              { label: 'Revenue (MTD)', value: '$48.2K', change: '+12%', color: '#22C55E', icon: 'trend' },
              { label: 'Active Devices', value: '8,492', change: '+8%', color: ORANGE, icon: 'nfc' },
              { label: 'Orders', value: '2,401', change: '+3%', color: '#3b82f6', icon: 'package' },
              { label: 'Subscriptions', value: '3,847', change: '+7%', color: '#8b5cf6', icon: 'wallet' },
              { label: 'Profile Views', value: '1.2M', change: '+22%', color: '#ec4899', icon: 'eye' },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
                <div className="flex items-center justify-between mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}><Icon name={k.icon} size={15} color={k.color} /></div><span className="text-[9px] font-bold text-[#22C55E]">{k.change}</span></div>
                <p className="text-lg font-black" style={{ color: k.color }}>{k.value}</p>
                <p className="text-[9px] text-[#64748B] font-medium">{k.label}</p>
              </div>
            ))}
          </div>
          {/* Revenue Chart + Activity */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <div className="flex items-center justify-between mb-4"><p className="text-xs font-black text-[#0F172A]">Revenue Overview</p><Badge color={ORANGE}>LAST 6 MONTHS</Badge></div>
              <div className="flex items-end justify-between gap-3 h-40 pt-4">
                {[28, 35, 32, 42, 48, 52].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex flex-col justify-end h-32">
                      <div className="w-full rounded-t-md" style={{ height: `${(v / 52) * 100}%`, background: `linear-gradient(180deg, ${ORANGE}, ${ORANGE}88)` }} />
                    </div>
                    <span className="text-[8px] font-bold text-[#64748B]">{['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'][i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-4">Recent Activity</p>
              <div className="space-y-3">
                {[
                  { icon: 'users', text: 'New user registered', time: '2m', color: '#3b82f6' },
                  { icon: 'package', text: 'Order MFG-2401 placed', time: '15m', color: ORANGE },
                  { icon: 'wallet', text: 'New subscription: Salon', time: '1h', color: '#22C55E' },
                  { icon: 'nfc', text: 'Device BG-000007 lost', time: '2h', color: '#EF4444' },
                  { icon: 'star', text: 'New 5-star review', time: '3h', color: '#FFD700' },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${a.color}15` }}><Icon name={a.icon} size={13} color={a.color} /></div>
                    <p className="text-[10px] font-bold text-[#0F172A] flex-1">{a.text}</p>
                    <span className="text-[8px] text-[#64748B]">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

// ── Screen 40: Admin Users / Accounts ──
export function MockupAdminUsers() {
  const users = [
    { name: 'Mamadou Diallo', email: 'mamadou@bingooconnect.com', plan: 'Law Firm', status: 'active', profiles: 3, joined: 'Jan 2026', initial: 'M', color: NAVY },
    { name: 'Sarah Johnson', email: 'sarah@salon.com', plan: 'Salon', status: 'active', profiles: 2, joined: 'Feb 2026', initial: 'S', color: '#ec4899' },
    { name: 'David Chen', email: 'david@techstart.io', plan: 'Business', status: 'trial', profiles: 5, joined: 'Mar 2026', initial: 'D', color: '#22C55E' },
    { name: 'Lisa Brown', email: 'lisa@personal.me', plan: 'Free', status: 'active', profiles: 1, joined: 'Apr 2026', initial: 'L', color: '#8b5cf6' },
    { name: 'Robert Wilson', email: 'rob@realtor.co', plan: 'Professional', status: 'past_due', profiles: 2, joined: 'May 2026', initial: 'R', color: '#3b82f6' },
    { name: 'Maria Garcia', email: 'maria@law.com', plan: 'Law Firm', status: 'active', profiles: 4, joined: 'Jun 2026', initial: 'M', color: ORANGE },
  ];
  return (
    <DesktopFrame label="40 · Admin Users / Accounts">
      <div className="p-6 bg-[#F7F9FC]">
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-[10px] font-bold text-[#f97316] tracking-wider">USER MANAGEMENT</p><h2 className="text-xl font-black text-[#0F172A]">All Users</h2></div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] bg-white flex items-center gap-1.5"><Icon name="filter" size={14} color={MUTED} /> Plan: All</button>
            <button className="px-3 py-1.5 text-xs font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] bg-white flex items-center gap-1.5"><Icon name="search" size={14} color={MUTED} /> Search</button>
          </div>
        </div>
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Users', value: '10,247', color: NAVY, icon: 'users' },
            { label: 'Paying Subscribers', value: '3,847', color: '#22C55E', icon: 'wallet' },
            { label: 'Trial Users', value: '247', color: ORANGE, icon: 'clock' },
            { label: 'Past Due', value: '18', color: '#EF4444', icon: 'alert' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15` }}><Icon name={k.icon} size={18} color={k.color} /></div>
              <div><p className="text-lg font-black" style={{ color: k.color }}>{k.value}</p><p className="text-[9px] text-[#64748B] font-medium">{k.label}</p></div>
            </div>
          ))}
        </div>
        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
          <div className="grid grid-cols-12 gap-0 px-4 py-3 border-b border-[#E5EAF2] bg-[#F7F9FC]">
            <div className="col-span-3 text-[10px] font-black text-[#64748B] tracking-wider">USER</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">PLAN</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">STATUS</div>
            <div className="col-span-1 text-[10px] font-black text-[#64748B] tracking-wider text-center">PROFILES</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">JOINED</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider text-right">ACTIONS</div>
          </div>
          {users.map((u) => (
            <div key={u.email} className="grid grid-cols-12 gap-0 px-4 py-3 border-b border-[#E5EAF2] items-center hover:bg-[#F7F9FC]">
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px]" style={{ background: `${u.color}15`, color: u.color }}>{u.initial}</div>
                <div><p className="text-[10px] font-bold text-[#0F172A]">{u.name}</p><p className="text-[8px] text-[#64748B]">{u.email}</p></div>
              </div>
              <div className="col-span-2"><Badge color={u.plan === 'Free' ? MUTED : u.plan === 'Law Firm' ? NAVY : u.plan === 'Salon' ? '#ec4899' : u.plan === 'Business' ? '#22C55E' : ORANGE}>{u.plan.toUpperCase()}</Badge></div>
              <div className="col-span-2"><Badge color={u.status === 'active' ? '#22C55E' : u.status === 'trial' ? ORANGE : '#EF4444'}>{u.status.toUpperCase()}</Badge></div>
              <div className="col-span-1 text-center"><span className="text-[10px] font-black text-[#0F172A]">{u.profiles}</span></div>
              <div className="col-span-2"><span className="text-[10px] text-[#64748B]">{u.joined}</span></div>
              <div className="col-span-2 flex justify-end gap-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="eye" size={12} color={NAVY} /></div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ORANGE}10` }}><Icon name="edit" size={12} color={ORANGE} /></div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${MUTED}10` }}><Icon name="more" size={12} color={MUTED} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}

// ── Screen 41: Admin NFC Devices Inventory ──
export function MockupAdminNFCInventory() {
  const devices = [
    { code: 'BG-000001', type: 'Card', status: 'active', owner: 'Diallo Law', assigned: 'Jul 1', color: '#22C55E' },
    { code: 'BG-000002', type: 'Keychain', status: 'available', owner: '—', assigned: '—', color: MUTED },
    { code: 'BG-000003', type: 'Keychain', status: 'active', owner: 'Mamadou D.', assigned: 'Jul 3', color: '#22C55E' },
    { code: 'BG-000004', type: 'Sticker', status: 'assigned', owner: 'Sarah J.', assigned: 'Jul 5', color: '#3b82f6' },
    { code: 'BG-000007', type: 'Bracelet', status: 'lost', owner: 'Diallo Law', assigned: 'Jun 20', color: '#EF4444' },
    { code: 'BG-000010', type: 'Stand', status: 'disabled', owner: 'David C.', assigned: 'Jun 15', color: '#64748B' },
  ];
  return (
    <DesktopFrame label="41 · Admin NFC Devices Inventory">
      <div className="p-6 bg-[#F7F9FC]">
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-[10px] font-bold text-[#f97316] tracking-wider">HARDWARE</p><h2 className="text-xl font-black text-[#0F172A]">NFC Device Inventory</h2></div>
          <button className="px-4 py-1.5 text-xs font-bold text-white rounded-lg flex items-center gap-1.5" style={{ background: ORANGE }}><Icon name="plus" size={14} color="#FFFFFF" /> Generate Batch</button>
        </div>
        {/* Status Pipeline */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Available', count: '4,892', color: MUTED, icon: 'package' },
            { label: 'Assigned', count: '1,247', color: '#3b82f6', icon: 'users' },
            { label: 'Active', count: '2,156', color: '#22C55E', icon: 'nfc' },
            { label: 'Lost', count: '89', color: '#EF4444', icon: 'alert' },
            { label: 'Disabled', count: '108', color: '#64748B', icon: 'lock' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
              <div className="flex items-center justify-between mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}><Icon name={s.icon} size={15} color={s.color} /></div></div>
              <p className="text-lg font-black" style={{ color: s.color }}>{s.count}</p>
              <p className="text-[9px] text-[#64748B] font-medium">{s.label}</p>
            </div>
          ))}
        </div>
        {/* Batch Generation */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-[#64748B] mb-1.5">GENERATE NEW BATCH</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#64748B]">Type:</span>
                  <select className="px-3 py-1.5 bg-[#F7F9FC] rounded-lg text-[10px] font-bold text-[#0F172A] border border-[#E5EAF2]"><option>NFC Card</option></select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#64748B]">Quantity:</span>
                  <input className="px-3 py-1.5 bg-[#F7F9FC] rounded-lg text-[10px] font-bold text-[#0F172A] border border-[#E5EAF2] w-16" defaultValue="100" readOnly />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#64748B]">Prefix:</span>
                  <input className="px-3 py-1.5 bg-[#F7F9FC] rounded-lg text-[10px] font-bold text-[#0F172A] border border-[#E5EAF2] w-20" defaultValue="BG-" readOnly />
                </div>
                <button className="px-4 py-1.5 text-[10px] font-bold text-white rounded-lg" style={{ background: NAVY }}>Generate</button>
              </div>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
          <div className="grid grid-cols-12 gap-0 px-4 py-3 border-b border-[#E5EAF2] bg-[#F7F9FC]">
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">DEVICE CODE</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">TYPE</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">STATUS</div>
            <div className="col-span-3 text-[10px] font-black text-[#64748B] tracking-wider">OWNER</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">ASSIGNED</div>
            <div className="col-span-1 text-[10px] font-black text-[#64748B] tracking-wider text-right">·</div>
          </div>
          {devices.map((d) => (
            <div key={d.code} className="grid grid-cols-12 gap-0 px-4 py-3 border-b border-[#E5EAF2] items-center hover:bg-[#F7F9FC]">
              <div className="col-span-2"><p className="text-[10px] font-black text-[#0F172A]">{d.code}</p></div>
              <div className="col-span-2"><span className="text-[10px] font-bold text-[#0F172A]">{d.type}</span></div>
              <div className="col-span-2"><Badge color={d.color}>{d.status.toUpperCase()}</Badge></div>
              <div className="col-span-3"><span className="text-[10px] font-medium text-[#64748B]">{d.owner}</span></div>
              <div className="col-span-2"><span className="text-[10px] text-[#64748B]">{d.assigned}</span></div>
              <div className="col-span-1 flex justify-end"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="eye" size={12} color={NAVY} /></div></div>
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}

// ── Screen 43: Admin Order Detail ──
export function MockupAdminOrderDetail() {
  const stages = [
    { label: 'Received', date: 'Jul 5', active: true, color: '#22C55E' },
    { label: 'Artwork', date: 'Jul 5', active: true, color: '#22C55E' },
    { label: 'Production', date: 'Jul 6', active: true, color: ORANGE },
    { label: 'Quality Check', date: '—', active: false, color: '#3b82f6' },
    { label: 'Shipped', date: '—', active: false, color: '#8b5cf6' },
    { label: 'Delivered', date: '—', active: false, color: '#22C55E' },
  ];
  return (
    <DesktopFrame label="43 · Admin Order Detail">
      <div className="p-6 bg-[#F7F9FC]">
        <div className="flex items-center gap-2 mb-5">
          <Icon name="chevronRight" size={16} color={MUTED} className="rotate-180" />
          <span className="text-xs font-bold text-[#64748B]">Orders</span>
          <Icon name="chevronRight" size={14} color="#cbd5e1" />
          <span className="text-xs font-bold text-[#0F172A]">MFG-2401</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            {/* Order Info */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${ORANGE}15` }}><Icon name="package" size={24} color={ORANGE} /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-[#0F172A]">MFG-2401</h2>
                    <Badge color={ORANGE}>IN PRODUCTION</Badge>
                  </div>
                  <p className="text-[10px] text-[#64748B]">Diallo Law Firm · 50 NFC Cards · $224.50</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E5EAF2]">
                <div><p className="text-[8px] font-bold text-[#64748B]">CUSTOMER</p><p className="text-[10px] font-bold text-[#0F172A]">Diallo Law Firm</p></div>
                <div><p className="text-[8px] font-bold text-[#64748B]">ORDER DATE</p><p className="text-[10px] font-bold text-[#0F172A]">Jul 5, 2026</p></div>
                <div><p className="text-[8px] font-bold text-[#64748B]">MARGIN</p><p className="text-[10px] font-bold text-[#22C55E]">42% ($94.29)</p></div>
              </div>
            </div>
            {/* Production Timeline */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-4">Production Timeline</p>
              <div className="flex items-center gap-2">
                {stages.map((s, i) => (
                  <React.Fragment key={s.label}>
                    <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: s.active ? s.color : '#E5EAF2' }}>
                        {s.active ? <Icon name="check" size={16} color="#FFFFFF" /> : <span className="text-[#64748B] text-[10px] font-bold">{i + 1}</span>}
                      </div>
                      <span className={`text-[9px] font-bold ${s.active ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{s.label}</span>
                      <span className="text-[8px] text-[#64748B]">{s.date}</span>
                    </div>
                    {i < 5 && <div className="flex-1 h-px" style={{ background: s.active && stages[i + 1].active ? s.color : '#E5EAF2' }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* Artwork Preview */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-4">Artwork Preview</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="rounded-2xl shadow-xl p-4 mb-2" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})`, height: 120 }}>
                    <div className="flex justify-between items-start">
                      <div><div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`, boxShadow: `0 2px 6px ${ORANGE}44, inset 0 1px 0 rgba(255,255,255,0.3)` }}><svg width="14" height="7" viewBox="0 0 48 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M 14 12 C 14 6 20 6 24 12 C 28 18 34 18 34 12 C 34 6 28 6 24 12 C 20 18 14 18 14 12 Z" /></svg></div><p className="text-white font-black text-[10px]">Diallo Law Firm</p></div>
                    </div>
                    <div className="flex justify-between items-end mt-8"><span className="text-[8px] font-bold" style={{ color: ORANGE, textShadow: `0 0 6px ${ORANGE}44` }}>BING∞ CONNECT</span><Icon name="nfc" size={12} color="rgba(255,255,255,0.3)" /></div>
                  </div>
                  <p className="text-[9px] font-bold text-[#64748B]">FRONT</p>
                </div>
                <div className="text-center">
                  <div className="rounded-2xl shadow-xl p-4 mb-2 flex items-center justify-center" style={{ background: '#F7F9FC', height: 120, border: '1px solid #E5EAF2' }}>
                    <div className="text-center"><div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="nfc" size={20} color={NAVY} /></div><p className="text-[8px] font-bold text-[#64748B]">Tap here to share</p></div>
                  </div>
                  <p className="text-[9px] font-bold text-[#64748B]">BACK</p>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Supplier + Shipping */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-3">Supplier</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="factory" size={18} color={NAVY} /></div>
                <div><p className="font-bold text-xs text-[#0F172A]">Primary Supplier</p><p className="text-[9px] text-[#64748B]">Shenzhen, CN</p></div>
              </div>
              <div className="space-y-2 pt-3 border-t border-[#E5EAF2]">
                <div className="flex justify-between text-[10px]"><span className="font-bold text-[#64748B]">Lead Time</span><span className="font-bold text-[#0F172A]">5-7 days</span></div>
                <div className="flex justify-between text-[10px]"><span className="font-bold text-[#64748B]">Cost/Unit</span><span className="font-bold text-[#0F172A]">$2.30</span></div>
                <div className="flex justify-between text-[10px]"><span className="font-bold text-[#64748B]">Batch Status</span><span className="font-bold" style={{ color: ORANGE }}>In Production</span></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-3">Shipping</p>
              <div className="flex items-center gap-2 mb-3">
                <Icon name="truck" size={16} color="#3b82f6" />
                <span className="text-[10px] font-bold text-[#0F172A]">Pending Shipment</span>
              </div>
              <div className="space-y-2 pt-3 border-t border-[#E5EAF2]">
                <div><p className="text-[8px] font-bold text-[#64748B]">ADDRESS</p><p className="text-[10px] font-bold text-[#0F172A]">123 Broadway, NYC 10001</p></div>
                <div><p className="text-[8px] font-bold text-[#64748B]">CARRIER</p><p className="text-[10px] font-bold text-[#0F172A]">USPS Priority</p></div>
                <div><p className="text-[8px] font-bold text-[#64748B]">TRACKING</p><p className="text-[10px] font-bold text-[#64748B]">—</p></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-3">Actions</p>
              <div className="space-y-2">
                <button className="w-full py-2 text-[10px] font-bold text-white rounded-lg" style={{ background: ORANGE }}>Advance to QC</button>
                <button className="w-full py-2 text-[10px] font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] bg-white">Contact Customer</button>
                <button className="w-full py-2 text-[10px] font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] bg-white">Download Invoice</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

// ── Screen 44: Admin Subscription / Test Account Controls ──
export function MockupAdminSubscriptions() {
  const subs = [
    { email: 'mamadou@bingooconnect.com', plan: 'Law Firm', status: 'active', source: 'stripe', amount: '$49.00', cycle: 'Monthly', initial: 'M', color: NAVY },
    { email: 'sarah@salon.com', plan: 'Salon', status: 'active', source: 'stripe', amount: '$19.99', cycle: 'Monthly', initial: 'S', color: '#ec4899' },
    { email: 'david@techstart.io', plan: 'Business', status: 'trial', source: 'admin_override', amount: '$0.00', cycle: '—', initial: 'D', color: '#22C55E' },
    { email: 'test1@bingooconnect.com', plan: 'Professional', status: 'active', source: 'admin_override', amount: '$0.00', cycle: '—', initial: 'T', color: ORANGE },
    { email: 'rob@realtor.co', plan: 'Professional', status: 'past_due', source: 'stripe', amount: '$9.99', cycle: 'Monthly', initial: 'R', color: '#3b82f6' },
  ];
  return (
    <DesktopFrame label="44 · Admin Subscription / Test Account Controls">
      <div className="p-6 bg-[#F7F9FC]">
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-[10px] font-bold text-[#f97316] tracking-wider">BILLING</p><h2 className="text-xl font-black text-[#0F172A]">Subscriptions & Test Accounts</h2></div>
          <button className="px-4 py-1.5 text-xs font-bold text-white rounded-lg flex items-center gap-1.5" style={{ background: ORANGE }}><Icon name="plus" size={14} color="#FFFFFF" /> Grant Override</button>
        </div>
        {/* KPIs */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Active Subs', value: '3,847', color: '#22C55E', icon: 'wallet' },
            { label: 'MRR', value: '$48.2K', color: NAVY, icon: 'trend' },
            { label: 'Test Accounts', value: '12', color: ORANGE, icon: 'shield' },
            { label: 'Admin Overrides', value: '8', color: '#8b5cf6', icon: 'lock' },
            { label: 'Past Due', value: '18', color: '#EF4444', icon: 'alert' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
              <div className="flex items-center justify-between mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}><Icon name={k.icon} size={15} color={k.color} /></div></div>
              <p className="text-lg font-black" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[9px] text-[#64748B] font-medium">{k.label}</p>
            </div>
          ))}
        </div>
        {/* Test Account Panel */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ORANGE}15` }}><Icon name="shield" size={16} color={ORANGE} /></div>
            <p className="text-xs font-black text-[#0F172A]">Test Account Management</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <p className="text-[9px] font-bold text-[#64748B] mb-1.5">EMAIL</p>
              <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] font-bold text-[#0F172A]">newtest@bingooconnect.com</div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#64748B] mb-1.5">PLAN</p>
              <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] font-bold text-[#0F172A]">Law Firm</div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#64748B] mb-1.5">DURATION</p>
              <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] font-bold text-[#0F172A]">90 days</div>
            </div>
            <div className="flex items-end">
              <button className="w-full py-2 text-[10px] font-bold text-white rounded-lg" style={{ background: NAVY }}>Create Test Account</button>
            </div>
          </div>
        </div>
        {/* Subscriptions Table */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
          <div className="grid grid-cols-12 gap-0 px-4 py-3 border-b border-[#E5EAF2] bg-[#F7F9FC]">
            <div className="col-span-3 text-[10px] font-black text-[#64748B] tracking-wider">ACCOUNT</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">PLAN</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">STATUS</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">SOURCE</div>
            <div className="col-span-1 text-[10px] font-black text-[#64748B] tracking-wider text-right">AMOUNT</div>
            <div className="col-span-1 text-[10px] font-black text-[#64748B] tracking-wider text-center">CYCLE</div>
            <div className="col-span-1 text-[10px] font-black text-[#64748B] tracking-wider text-right">·</div>
          </div>
          {subs.map((s) => (
            <div key={s.email} className="grid grid-cols-12 gap-0 px-4 py-3 border-b border-[#E5EAF2] items-center hover:bg-[#F7F9FC]">
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px]" style={{ background: `${s.color}15`, color: s.color }}>{s.initial}</div>
                <span className="text-[10px] font-bold text-[#0F172A]">{s.email}</span>
              </div>
              <div className="col-span-2"><Badge color={s.plan === 'Law Firm' ? NAVY : s.plan === 'Salon' ? '#ec4899' : s.plan === 'Business' ? '#22C55E' : ORANGE}>{s.plan.toUpperCase()}</Badge></div>
              <div className="col-span-2"><Badge color={s.status === 'active' ? '#22C55E' : s.status === 'trial' ? ORANGE : '#EF4444'}>{s.status.toUpperCase()}</Badge></div>
              <div className="col-span-2"><Badge color={s.source === 'stripe' ? '#635BFF' : '#8b5cf6'}>{s.source === 'stripe' ? 'STRIPE' : 'ADMIN OVERRIDE'}</Badge></div>
              <div className="col-span-1 text-right"><span className="text-[10px] font-black" style={{ color: s.amount === '$0.00' ? MUTED : ORANGE }}>{s.amount}</span></div>
              <div className="col-span-1 text-center"><span className="text-[9px] font-bold text-[#64748B]">{s.cycle}</span></div>
              <div className="col-span-1 flex justify-end gap-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ORANGE}10` }}><Icon name="edit" size={12} color={ORANGE} /></div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${MUTED}10` }}><Icon name="more" size={12} color={MUTED} /></div>
              </div>
            </div>
          ))}
        </div>
        {/* Activity Log */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mt-6">
          <p className="text-xs font-black text-[#0F172A] mb-3">Recent Activity Log</p>
          <div className="space-y-2">
            {[
              { text: 'Admin granted Law Firm override to test1@bingooconnect.com', time: '10m ago', icon: 'shield', color: ORANGE },
              { text: 'Subscription canceled for rob@realtor.co (past_due)', time: '1h ago', icon: 'alert', color: '#EF4444' },
              { text: 'New subscription: Salon plan — sarah@salon.com', time: '3h ago', icon: 'wallet', color: '#22C55E' },
              { text: 'Test account created: david@techstart.io (Business)', time: '5h ago', icon: 'lock', color: '#8b5cf6' },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2 border-b border-[#E5EAF2] last:border-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${a.color}15` }}><Icon name={a.icon} size={13} color={a.color} /></div>
                <p className="text-[10px] font-bold text-[#0F172A] flex-1">{a.text}</p>
                <span className="text-[9px] text-[#64748B]">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}