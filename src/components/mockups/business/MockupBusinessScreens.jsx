import React from 'react';
import { DesktopFrame, Badge, StatCard } from '@/components/mockups/MockupFrame';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

// ── Screen 27: Lead Detail ──
export function MockupLeadDetail() {
  return (
    <DesktopFrame label="27 · Lead Detail">
      <div className="p-6 bg-[#F7F9FC]">
        <div className="flex items-center gap-2 mb-5">
          <Icon name="chevronRight" size={16} color={MUTED} className="rotate-180" />
          <span className="text-xs font-bold text-[#64748B]">Leads</span>
          <Icon name="chevronRight" size={14} color="#cbd5e1" />
          <span className="text-xs font-bold text-[#0F172A]">Sarah Lee</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {/* Left: Lead Info */}
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#3b82f6' }}>
                  <span className="text-white font-black text-lg">S</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-[#0F172A]">Sarah Lee</h2>
                    <Badge color="#3b82f6">NEW</Badge>
                  </div>
                  <p className="text-[10px] text-[#64748B]">Civil Matter · From Profile · 5 minutes ago</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-[10px] font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] bg-white">Change Status</button>
                  <button className="px-3 py-1.5 text-[10px] font-bold text-white rounded-lg" style={{ background: ORANGE }}>Convert to Client</button>
                </div>
              </div>
              {/* Contact Grid */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E5EAF2]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#22C55E15' }}><Icon name="phone" size={14} color="#22C55E" /></div>
                  <div><p className="text-[8px] font-bold text-[#64748B]">PHONE</p><p className="text-[10px] font-bold text-[#0F172A]">(646) 555-0123</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#25D36615' }}><Icon name="message" size={14} color="#25D366" /></div>
                  <div><p className="text-[8px] font-bold text-[#64748B]">WHATSAPP</p><p className="text-[10px] font-bold text-[#0F172A]">Same as phone</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#3b82f615' }}><Icon name="mail" size={14} color="#3b82f6" /></div>
                  <div><p className="text-[8px] font-bold text-[#64748B]">EMAIL</p><p className="text-[10px] font-bold text-[#0F172A]">sarah@email.com</p></div>
                </div>
              </div>
            </div>
            {/* Status Timeline */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-4">Status Timeline</p>
              <div className="flex items-center gap-2">
                {[
                  { label: 'New', active: true, color: '#3b82f6' },
                  { label: 'Contacted', active: false, color: '#f97316' },
                  { label: 'Qualified', active: false, color: '#8b5cf6' },
                  { label: 'Consultation', active: false, color: '#3b82f6' },
                  { label: 'Retained', active: false, color: '#22C55E' },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: s.active ? s.color : '#E5EAF2' }}>
                        {s.active ? <Icon name="check" size={14} color="#FFFFFF" /> : <span className="text-[#64748B] text-[10px] font-bold">{i + 1}</span>}
                      </div>
                      <span className={`text-[9px] font-bold ${s.active ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{s.label}</span>
                    </div>
                    {i < 4 && <div className="flex-1 h-px" style={{ background: '#E5EAF2' }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* Notes */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-3">Case Notes</p>
              <div className="space-y-2">
                <div className="bg-[#F7F9FC] rounded-xl p-3">
                  <p className="text-[10px] text-[#0F172A]">Civil matter regarding property dispute. Client is seeking consultation on landlord-tenant issue. Prefers WhatsApp contact.</p>
                  <p className="text-[8px] text-[#64748B] mt-1">Added 5 min ago</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <input className="flex-1 px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] text-[#64748B]" placeholder="Add a note..." readOnly />
                <button className="px-3 py-2 text-[10px] font-bold text-white rounded-lg" style={{ background: NAVY }}>Add</button>
              </div>
            </div>
          </div>
          {/* Right: Actions + Case Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: 'phone', label: 'Call', color: '#22C55E' },
                  { icon: 'message', label: 'WhatsApp', color: '#25D366' },
                  { icon: 'mail', label: 'Email', color: '#3b82f6' },
                  { icon: 'calendar', label: 'Schedule', color: ORANGE },
                ].map((a) => (
                  <button key={a.label} className="flex flex-col items-center gap-1.5 py-3 rounded-xl border border-[#E5EAF2] hover:bg-[#F7F9FC]">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${a.color}15` }}><Icon name={a.icon} size={16} color={a.color} /></div>
                    <span className="text-[9px] font-bold text-[#0F172A]">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-3">Case Details</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Category', value: 'Civil' },
                  { label: 'Matter Type', value: 'Property Dispute' },
                  { label: 'Incident Date', value: 'Jun 28, 2026' },
                  { label: 'Urgency', value: 'Medium' },
                  { label: 'Preferred Contact', value: 'WhatsApp' },
                ].map((d) => (
                  <div key={d.label} className="flex justify-between text-[10px]">
                    <span className="font-bold text-[#64748B]">{d.label}</span>
                    <span className="font-bold text-[#0F172A]">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-3">Documents</p>
              <div className="space-y-2">
                {['Lease_Agreement.pdf', 'Photos_Evidence.zip'].map((doc) => (
                  <div key={doc} className="flex items-center gap-2 px-3 py-2 bg-[#F7F9FC] rounded-lg">
                    <Icon name="package" size={14} color={NAVY} />
                    <span className="text-[10px] font-bold text-[#0F172A] flex-1 truncate">{doc}</span>
                    <Icon name="download" size={12} color={MUTED} />
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

// ── Screen 29: Appointment Detail ──
export function MockupAppointmentDetail() {
  return (
    <DesktopFrame label="29 · Appointment Detail">
      <div className="p-6 bg-[#F7F9FC]">
        <div className="flex items-center gap-2 mb-5">
          <Icon name="chevronRight" size={16} color={MUTED} className="rotate-180" />
          <span className="text-xs font-bold text-[#64748B]">Appointments</span>
          <Icon name="chevronRight" size={14} color="#cbd5e1" />
          <span className="text-xs font-bold text-[#0F172A]">J. Smith — Consultation</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${ORANGE}15` }}>
                  <Icon name="calendar" size={24} color={ORANGE} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-[#0F172A]">Consultation — J. Smith</h2>
                    <Badge color="#22C55E">CONFIRMED</Badge>
                  </div>
                  <p className="text-[10px] text-[#64748B]">Immigration · Today, 2:00 PM · 30 minutes</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E5EAF2]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#3b82f615' }}><Icon name="users" size={16} color="#3b82f6" /></div>
                  <div><p className="text-[8px] font-bold text-[#64748B]">VISITOR</p><p className="text-[11px] font-bold text-[#0F172A]">James Smith</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#22C55E15' }}><Icon name="phone" size={16} color="#22C55E" /></div>
                  <div><p className="text-[8px] font-bold text-[#64748B]">PHONE</p><p className="text-[11px] font-bold text-[#0F172A]">(917) 555-0145</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#3b82f615' }}><Icon name="mail" size={16} color="#3b82f6" /></div>
                  <div><p className="text-[8px] font-bold text-[#64748B]">EMAIL</p><p className="text-[11px] font-bold text-[#0F172A]">jsmith@email.com</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}15` }}><Icon name="clock" size={16} color={ORANGE} /></div>
                  <div><p className="text-[8px] font-bold text-[#64748B]">SOURCE</p><p className="text-[11px] font-bold text-[#0F172A]">NFC Tap</p></div>
                </div>
              </div>
            </div>
            {/* Notes */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-3">Appointment Notes</p>
              <div className="bg-[#F7F9FC] rounded-xl p-3">
                <p className="text-[10px] text-[#0F172A]">Client seeking immigration consultation for family-based petition. Has green card expiration concerns. Bring I-90 form and supporting documents.</p>
              </div>
            </div>
            {/* Status Management */}
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-3">Status Management</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Confirm', color: '#22C55E', icon: 'check', active: true },
                  { label: 'Reschedule', color: '#f97316', icon: 'clock' },
                  { label: 'Complete', color: '#3b82f6', icon: 'checkCircle' },
                  { label: 'Cancel', color: '#EF4444', icon: 'alert' },
                ].map((b) => (
                  <button key={b.label} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border ${b.active ? 'text-white border-transparent' : 'border-[#E5EAF2] text-[#64748B]'}`} style={b.active ? { background: b.color } : {}}>
                    <Icon name={b.icon} size={16} color={b.active ? '#FFFFFF' : b.color} />
                    <span className="text-[9px] font-bold">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-3">Reminder Status</p>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="checkCircle" size={14} color="#22C55E" />
                <span className="text-[10px] font-bold text-[#0F172A]">Push notification sent</span>
              </div>
              <p className="text-[9px] text-[#64748B]">Today at 9:00 AM</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
              <p className="text-xs font-black text-[#0F172A] mb-3">Service Details</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Service', value: 'Consultation' },
                  { label: 'Duration', value: '30 min' },
                  { label: 'Date', value: 'Jul 7, 2026' },
                  { label: 'Time', value: '2:00 PM EST' },
                  { label: 'Type', value: 'Immigration' },
                ].map((d) => (
                  <div key={d.label} className="flex justify-between text-[10px]">
                    <span className="font-bold text-[#64748B]">{d.label}</span>
                    <span className="font-bold text-[#0F172A]">{d.value}</span>
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

// ── Screen 31: Reviews Dashboard ──
export function MockupReviewsDashboard() {
  const reviews = [
    { name: 'James Smith', rating: 5, text: 'Excellent consultation! Mr. Diallo was thorough and professional. Highly recommend.', time: '2d ago', initial: 'J', color: '#3b82f6', responded: true },
    { name: 'Maria Garcia', rating: 5, text: 'Best immigration attorney in NYC. Helped me with my green card process smoothly.', time: '5d ago', initial: 'M', color: '#ec4899', responded: false },
    { name: 'Robert Chen', rating: 4, text: 'Very knowledgeable and helpful. The office staff is friendly and responsive.', time: '1w ago', initial: 'R', color: '#22C55E', responded: true },
    { name: 'Lisa Brown', rating: 5, text: 'Outstanding service! They handled my case with care and expertise.', time: '2w ago', initial: 'L', color: '#8b5cf6', responded: false },
  ];
  return (
    <DesktopFrame label="31 · Reviews Dashboard">
      <div className="p-6 bg-[#F7F9FC]">
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-[10px] font-bold text-[#f97316] tracking-wider">REPUTATION</p><h2 className="text-xl font-black text-[#0F172A]">Reviews Dashboard</h2></div>
          <Badge color="#4285F4"><Icon name="globe" size={10} color="#4285F4" /> GOOGLE REVIEWS SYNCED</Badge>
        </div>
        {/* KPIs */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Avg Rating', value: '4.8', color: '#FFD700', icon: 'star' },
            { label: 'Total Reviews', value: '47', color: NAVY, icon: 'message' },
            { label: 'Responded', value: '32', color: '#22C55E', icon: 'checkCircle' },
            { label: 'Pending', value: '4', color: ORANGE, icon: 'clock' },
            { label: 'This Month', value: '+8', color: '#3b82f6', icon: 'trend' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}><Icon name={k.icon} size={15} color={k.color} /></div>
              </div>
              <p className="text-lg font-black" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[9px] text-[#64748B] font-medium">{k.label}</p>
            </div>
          ))}
        </div>
        {/* Rating Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] mb-6">
          <p className="text-xs font-black text-[#0F172A] mb-4">Rating Distribution</p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const counts = { 5: 38, 4: 6, 3: 2, 2: 1, 1: 0 };
              const pct = (counts[stars] / 47) * 100;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-[10px] font-bold text-[#0F172A]">{stars}</span>
                    <Icon name="star" size={12} color="#FFD700" />
                  </div>
                  <div className="flex-1 h-2 bg-[#F7F9FC] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#FFD700' }} />
                  </div>
                  <span className="text-[10px] font-bold text-[#64748B] w-8 text-right">{counts[stars]}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Review Cards */}
        <div className="grid grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.name} className="bg-white rounded-2xl p-4 border border-[#E5EAF2]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs" style={{ background: `${r.color}15`, color: r.color }}>{r.initial}</div>
                <div className="flex-1">
                  <p className="font-bold text-xs text-[#0F172A]">{r.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} name="star" size={10} color={i < r.rating ? '#FFD700' : '#E5EAF2'} />
                    ))}
                    <span className="text-[8px] text-[#64748B] ml-1">{r.time}</span>
                  </div>
                </div>
                {r.responded ? <Badge color="#22C55E">RESPONDED</Badge> : <Badge color={ORANGE}>PENDING</Badge>}
              </div>
              <p className="text-[10px] text-[#64748B] mb-3">{r.text}</p>
              {!r.responded && (
                <button className="w-full py-2 text-[10px] font-bold text-white rounded-lg" style={{ background: ORANGE }}>Respond Now</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}

// ── Screen 32: Connections Dashboard ──
export function MockupConnectionsDashboard() {
  const connections = [
    { name: 'Sarah Lee', phone: '(646) 555-0123', source: 'NFC', date: 'Jul 7', initial: 'S', color: '#3b82f6' },
    { name: 'James Smith', phone: '(917) 555-0145', source: 'QR', date: 'Jul 6', initial: 'J', color: ORANGE },
    { name: 'Maria Garcia', phone: '(212) 555-0178', source: 'Profile', date: 'Jul 5', initial: 'M', color: '#ec4899' },
    { name: 'Robert Chen', phone: '(718) 555-0192', source: 'NFC', date: 'Jul 4', initial: 'R', color: '#22C55E' },
    { name: 'Lisa Brown', phone: '(646) 555-0167', source: 'Direct', date: 'Jul 3', initial: 'L', color: '#8b5cf6' },
    { name: 'David Wilson', phone: '(917) 555-0183', source: 'QR', date: 'Jul 2', initial: 'D', color: NAVY },
  ];
  return (
    <DesktopFrame label="32 · Connections Dashboard">
      <div className="p-6 bg-[#F7F9FC]">
        <div className="flex items-center justify-between mb-5">
          <div><p className="text-[10px] font-bold text-[#f97316] tracking-wider">NETWORK</p><h2 className="text-xl font-black text-[#0F172A]">Connections Dashboard</h2></div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] bg-white flex items-center gap-1.5"><Icon name="filter" size={14} color={MUTED} /> Filter</button>
            <button className="px-3 py-1.5 text-xs font-bold border border-[#E5EAF2] rounded-lg text-[#64748B] bg-white flex items-center gap-1.5"><Icon name="download" size={14} color={MUTED} /> Export CSV</button>
          </div>
        </div>
        {/* KPIs */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total Saved', value: '128', color: NAVY, icon: 'users' },
            { label: 'From NFC', value: '52', color: ORANGE, icon: 'nfc' },
            { label: 'From QR', value: '38', color: '#3b82f6', icon: 'qr' },
            { label: 'From Profile', value: '28', color: '#22C55E', icon: 'globe' },
            { label: 'This Month', value: '+24', color: '#8b5cf6', icon: 'trend' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2]">
              <div className="flex items-center justify-between mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}><Icon name={k.icon} size={15} color={k.color} /></div></div>
              <p className="text-lg font-black" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[9px] text-[#64748B] font-medium">{k.label}</p>
            </div>
          ))}
        </div>
        {/* Connections Table */}
        <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
          <div className="grid grid-cols-12 gap-0 px-4 py-3 border-b border-[#E5EAF2] bg-[#F7F9FC]">
            <div className="col-span-3 text-[10px] font-black text-[#64748B] tracking-wider">NAME</div>
            <div className="col-span-3 text-[10px] font-black text-[#64748B] tracking-wider">PHONE</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">SOURCE</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider">DATE SAVED</div>
            <div className="col-span-2 text-[10px] font-black text-[#64748B] tracking-wider text-right">ACTIONS</div>
          </div>
          {connections.map((c) => (
            <div key={c.name} className="grid grid-cols-12 gap-0 px-4 py-3 border-b border-[#E5EAF2] items-center hover:bg-[#F7F9FC]">
              <div className="col-span-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px]" style={{ background: `${c.color}15`, color: c.color }}>{c.initial}</div>
                <span className="text-[10px] font-bold text-[#0F172A]">{c.name}</span>
              </div>
              <div className="col-span-3"><span className="text-[10px] font-medium text-[#64748B]">{c.phone}</span></div>
              <div className="col-span-2"><Badge color={c.source === 'NFC' ? ORANGE : c.source === 'QR' ? '#3b82f6' : c.source === 'Profile' ? '#22C55E' : NAVY}>{c.source.toUpperCase()}</Badge></div>
              <div className="col-span-2"><span className="text-[10px] text-[#64748B]">{c.date}</span></div>
              <div className="col-span-2 flex justify-end gap-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#22C55E15' }}><Icon name="phone" size={12} color="#22C55E" /></div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#25D36615' }}><Icon name="message" size={12} color="#25D366" /></div>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#3b82f615' }}><Icon name="mail" size={12} color="#3b82f6" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}