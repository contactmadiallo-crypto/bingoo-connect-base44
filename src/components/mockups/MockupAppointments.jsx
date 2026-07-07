import React from 'react';
import { DesktopFrame, Badge } from './MockupFrame';
import { Icon } from './BingooIcons';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function MockupAppointments() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dates = [3, 4, 5, 6, 7, 8, 9];
  const appointments = [
    { time: '09:00', name: 'J. Smith', type: 'Consultation', status: 'confirmed', duration: '30m', color: '#22C55E' },
    { time: '11:00', name: 'M. Chen', type: 'Immigration', status: 'pending', duration: '45m', color: '#f97316' },
    { time: '14:00', name: 'L. Brown', type: 'Civil Matter', status: 'confirmed', duration: '60m', color: '#22C55E' },
    { time: '16:30', name: 'R. Davis', type: 'Follow-up', status: 'cancelled', duration: '30m', color: '#EF4444' },
  ];

  return (
    <DesktopFrame label="8 · Appointments">
      <div className="flex h-full">
        {/* Calendar */}
        <div className="flex-1 p-6 bg-[#F7F9FC] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold text-[#f97316] tracking-wider">SCHEDULE</p>
              <h2 className="text-xl font-black text-[#0F172A]">Appointments</h2>
            </div>
            <div className="flex gap-2">
              <div className="flex rounded-lg border border-[#E5EAF2] overflow-hidden bg-white">
                <span className="px-3 py-1.5 text-xs font-bold text-white" style={{ background: NAVY }}>Week</span>
                <span className="px-3 py-1.5 text-xs font-bold text-[#64748B]">Day</span>
                <span className="px-3 py-1.5 text-xs font-bold text-[#64748B]">List</span>
              </div>
              <button className="px-4 py-1.5 text-xs font-bold text-white rounded-lg flex items-center gap-1.5" style={{ background: ORANGE }}>
                <Icon name="plus" size={14} color="#FFFFFF" /> New
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Today', value: '4', color: NAVY, icon: 'calendar' },
              { label: 'Confirmed', value: '2', color: '#22C55E', icon: 'checkCircle' },
              { label: 'Pending', value: '1', color: ORANGE, icon: 'clock' },
              { label: 'This Week', value: '18', color: '#3b82f6', icon: 'trend' },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15` }}>
                  <Icon name={k.icon} size={18} color={k.color} />
                </div>
                <div>
                  <p className="text-lg font-black" style={{ color: k.color }}>{k.value}</p>
                  <p className="text-[9px] text-[#64748B] font-medium">{k.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
            <div className="grid grid-cols-7 border-b border-[#E5EAF2]">
              {days.map((d, i) => (
                <div key={d} className={`p-3 text-center border-r border-[#E5EAF2] ${i === 3 ? 'bg-[#FFF0E5]' : ''}`}>
                  <p className="text-[9px] font-bold text-[#64748B]">{d.toUpperCase()}</p>
                  <p className={`text-lg font-black ${i === 3 ? 'text-white rounded-full w-7 h-7 flex items-center justify-center mx-auto' : 'text-[#0F172A]'}`} style={i === 3 ? { background: ORANGE } : {}}>{dates[i]}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 min-h-[300px]">
              {days.map((d, i) => (
                <div key={d} className={`border-r border-[#E5EAF2] p-1.5 ${i === 3 ? 'bg-[#FFF8F2]' : ''}`}>
                  {i === 3 && appointments.map((a, j) => (
                    <div key={j} className="mb-1.5 rounded-lg p-1.5 border-l-2" style={{ borderColor: a.color, background: `${a.color}10` }}>
                      <p className="text-[9px] font-black" style={{ color: a.color }}>{a.time}</p>
                      <p className="text-[9px] font-bold text-[#0F172A] truncate">{a.name}</p>
                      <p className="text-[8px] text-[#64748B]">{a.type}</p>
                    </div>
                  ))}
                  {i !== 3 && Math.random() > 0.6 && (
                    <div className="mb-1.5 rounded-lg p-1.5 border-l-2 border-[#E5EAF2] bg-[#F7F9FC]">
                      <p className="text-[8px] font-bold text-[#64748B]">10:00</p>
                      <p className="text-[8px] text-[#64748B] truncate">—</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Appointment List */}
        <div className="w-72 border-l border-[#E5EAF2] bg-white p-4 overflow-y-auto">
          <p className="text-xs font-black text-[#0F172A] mb-4">Today's Schedule</p>
          <div className="space-y-2">
            {appointments.map((a, i) => (
              <div key={i} className="rounded-xl p-3 border border-[#E5EAF2]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black" style={{ color: a.color }}>{a.time}</span>
                  <Badge color={a.color}>{a.status.toUpperCase()}</Badge>
                </div>
                <p className="font-bold text-sm text-[#0F172A]">{a.name}</p>
                <p className="text-[10px] text-[#64748B] mb-2">{a.type} · {a.duration}</p>
                <div className="flex gap-1.5 pt-2 border-t border-[#E5EAF2]">
                  <div className="flex-1 flex justify-center py-1 rounded-md hover:bg-[#F7F9FC]">
                    <Icon name="phone" size={12} color={NAVY} />
                  </div>
                  <div className="flex-1 flex justify-center py-1 rounded-md hover:bg-[#F7F9FC]">
                    <Icon name="message" size={12} color="#22C55E" />
                  </div>
                  <div className="flex-1 flex justify-center py-1 rounded-md hover:bg-[#F7F9FC]">
                    <Icon name="edit" size={12} color={ORANGE} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Settings */}
          <div className="mt-5 pt-4 border-t border-[#E5EAF2]">
            <p className="text-xs font-black text-[#0F172A] mb-3">Booking Settings</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#64748B]">Online Booking</span>
                <div className="w-8 h-5 rounded-full p-0.5" style={{ background: ORANGE }}>
                  <div className="w-4 h-4 rounded-full bg-white ml-auto" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#64748B]">Slot Duration</span>
                <span className="text-[10px] font-bold text-[#0F172A]">30 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#64748B]">Auto-Confirm</span>
                <div className="w-8 h-5 rounded-full p-0.5 bg-[#E5EAF2]">
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}