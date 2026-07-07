import React from 'react';
import { DesktopFrame } from './MockupFrame';

export default function MockupAppointments() {
  const days = ['Mon 7', 'Tue 8', 'Wed 9', 'Thu 10', 'Fri 11', 'Sat 12', 'Sun 13'];
  const appts = [
    { day: 0, time: '09:00', name: 'J. Smith', type: 'Consultation', status: 'confirmed' },
    { day: 0, time: '14:00', name: 'M. Brown', type: 'Follow-up', status: 'pending' },
    { day: 2, time: '11:00', name: 'L. Garcia', type: 'Immigration', status: 'confirmed' },
    { day: 3, time: '15:30', name: 'R. Patel', type: 'Consultation', status: 'cancelled' },
    { day: 4, time: '10:00', name: 'K. Lee', type: 'Follow-up', status: 'completed' },
  ];
  const statusColors = { confirmed: '#22C55E', pending: '#FF7A00', cancelled: '#EF4444', completed: '#0A1F52' };

  return (
    <DesktopFrame label="8 · Appointments">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF2]">
        <div>
          <h3 className="font-bold text-[#0F172A] text-sm">Appointments</h3>
          <p className="text-[10px] text-[#64748B]">Diallo Law Firm · Week of July 7</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-[#F7F9FC] rounded-lg p-0.5">
            <button className="px-3 py-1 bg-white text-[#0F172A] text-[10px] font-semibold rounded shadow-sm">Week</button>
            <button className="px-3 py-1 text-[#64748B] text-[10px]">Day</button>
            <button className="px-3 py-1 text-[#64748B] text-[10px]">List</button>
          </div>
          <button className="px-3 py-1.5 bg-[#FF7A00] text-white text-[10px] font-semibold rounded-lg">＋ New Appointment</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3 px-6 py-3 bg-[#F7F9FC] border-b border-[#E5EAF2]">
        {[
          { label: 'Pending', value: 1, color: '#FF7A00' },
          { label: 'Confirmed', value: 2, color: '#22C55E' },
          { label: 'Completed', value: 1, color: '#0A1F52' },
          { label: 'Cancelled', value: 1, color: '#EF4444' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}} />
            <span className="text-[10px] text-[#64748B]">{s.label}: <span className="font-bold text-[#0F172A]">{s.value}</span></span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, di) => (
            <div key={day} className="min-h-[300px]">
              <div className={`text-center py-1.5 rounded-t-lg text-[10px] font-bold ${di === 0 ? 'bg-[#0A1F52] text-white' : 'bg-[#F7F9FC] text-[#64748B]'}`}>
                {day}
              </div>
              <div className="border border-[#E5EAF2] border-t-0 rounded-b-lg p-1 space-y-1.5 min-h-[280px]">
                {appts.filter(a => a.day === di).map((a, i) => (
                  <div key={i} className="bg-white rounded p-1.5 border-l-2 text-[9px]" style={{borderColor: statusColors[a.status]}}>
                    <p className="font-bold text-[#0F172A]">{a.time}</p>
                    <p className="text-[#0F172A] truncate">{a.name}</p>
                    <p className="text-[#64748B] truncate">{a.type}</p>
                    <span className="inline-block px-1 py-0.5 text-[7px] font-bold rounded mt-0.5" style={{backgroundColor: `${statusColors[a.status]}15`, color: statusColors[a.status]}}>
                      {a.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}