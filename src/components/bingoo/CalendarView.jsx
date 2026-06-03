import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths, parseISO } from "date-fns";

const STATUS_STYLES = {
  pending:   { icon: AlertCircle, color: "#f59e0b", bg: "rgba(245,158,11,0.12)",   label: "Pending" },
  confirmed: { icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.12)",   label: "Confirmed" },
  cancelled: { icon: XCircle,     color: "#ef4444", bg: "rgba(239,68,68,0.12)",    label: "Cancelled" },
};

export default function CalendarView({ profileId }) {
  const { isDark } = useBingooTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments-cal", profileId],
    queryFn: () => base44.entities.Appointment.filter({ profile_id: profileId }),
    enabled: !!profileId,
  });

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const subText = isDark ? "text-white/60" : "text-slate-600";
  const cardBg = isDark ? "bg-white/5" : "bg-white";
  const cardShadow = isDark ? "0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.25)" : "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)";
  const cellHover = isDark ? "hover:bg-white/8" : "hover:bg-slate-50";

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDow = startOfMonth(currentMonth).getDay(); // 0=Sun

  // Events per day
  const eventsOnDay = (day) =>
    appointments.filter(a => {
      try { return isSameDay(parseISO(a.date), day); } catch { return false; }
    });

  const selectedEvents = eventsOnDay(selectedDay);

  // Upcoming appointments sorted
  const upcoming = [...appointments]
    .filter(a => {
      try { return parseISO(a.date) >= new Date(new Date().setHours(0,0,0,0)); } catch { return false; }
    })
    .sort((a, b) => (a.date + a.time_slot).localeCompare(b.date + b.time_slot))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-2xl font-black ${headText}`}>Calendar</h2>
        <p className={`text-sm mt-1 ${mutedText}`}>All upcoming appointments at a glance.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Calendar Grid */}
        <div className={`rounded-2xl overflow-hidden ${cardBg}`} style={{ boxShadow: cardShadow }}>
          {/* Month nav */}
          <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-white/8" : "border-slate-100"}`}>
            <h3 className={`text-base font-black ${headText}`}>
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className={`px-3 h-8 rounded-lg text-xs font-bold transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-100 text-slate-500"}`}
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 px-2 pt-3 pb-1">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className={`text-center text-xs font-bold pb-2 ${mutedText}`}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 px-2 pb-4 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: startDow }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const events = eventsOnDay(day);
              const isSelected = isSameDay(day, selectedDay);
              const isTodayDay = isToday(day);
              const inMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`relative flex flex-col items-center rounded-xl py-1.5 px-1 transition-all ${cellHover} ${
                    isSelected ? (isDark ? "bg-blue-500/25 ring-1 ring-blue-500/50" : "bg-blue-50 ring-1 ring-blue-400") : ""
                  }`}
                >
                  <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                    isTodayDay
                      ? "bg-blue-600 text-white font-black"
                      : isSelected
                      ? (isDark ? "text-blue-300" : "text-blue-700")
                      : inMonth
                      ? (isDark ? "text-white/80" : "text-slate-700")
                      : mutedText
                  }`}>
                    {format(day, "d")}
                  </span>
                  {/* Dots for events */}
                  {events.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {events.slice(0, 3).map((e, i) => {
                        const st = STATUS_STYLES[e.status] || STATUS_STYLES.pending;
                        return (
                          <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel — selected day + upcoming */}
        <div className="space-y-4">
          {/* Selected day events */}
          <div className={`rounded-2xl overflow-hidden ${cardBg}`} style={{ boxShadow: cardShadow }}>
            <div className={`px-4 py-3 border-b ${isDark ? "border-white/8" : "border-slate-100"}`}>
              <h3 className={`font-black text-sm ${headText}`}>
                {isToday(selectedDay) ? "Today" : format(selectedDay, "EEEE, MMM d")}
              </h3>
              <p className={`text-xs mt-0.5 ${mutedText}`}>{selectedEvents.length} appointment{selectedEvents.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {selectedEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
                  <p className={`text-xs ${mutedText}`}>No appointments</p>
                </div>
              ) : (
                selectedEvents
                  .sort((a, b) => (a.time_slot || "").localeCompare(b.time_slot || ""))
                  .map(appt => <AppointmentCard key={appt.id} appt={appt} isDark={isDark} headText={headText} mutedText={mutedText} />)
              )}
            </div>
          </div>

          {/* Upcoming */}
          <div className={`rounded-2xl overflow-hidden ${cardBg}`} style={{ boxShadow: cardShadow }}>
            <div className={`px-4 py-3 border-b ${isDark ? "border-white/8" : "border-slate-100"}`}>
              <h3 className={`font-black text-sm ${headText}`}>Upcoming</h3>
              <p className={`text-xs mt-0.5 ${mutedText}`}>Next 5 appointments</p>
            </div>
            <div className="p-3 space-y-2">
              {isLoading ? (
                <div className="py-6 flex justify-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : upcoming.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-white/10" : "text-slate-200"}`} />
                  <p className={`text-xs ${mutedText}`}>No upcoming appointments</p>
                </div>
              ) : (
                upcoming.map(appt => <AppointmentCard key={appt.id} appt={appt} showDate isDark={isDark} headText={headText} mutedText={mutedText} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appt, showDate = false, isDark, headText, mutedText }) {
  const st = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
  const Icon = st.icon;
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
      style={{ background: st.bg }}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4" style={{ color: st.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${headText}`}>{appt.visitor_name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {appt.time_slot && (
            <span className={`flex items-center gap-1 text-xs ${mutedText}`}>
              <Clock className="w-3 h-3" /> {appt.time_slot}
            </span>
          )}
          {showDate && appt.date && (
            <span className={`text-xs ${mutedText}`}>
              {format(parseISO(appt.date), "MMM d")}
            </span>
          )}
        </div>
        {appt.visitor_email && <p className={`text-xs truncate mt-0.5 ${mutedText}`}>{appt.visitor_email}</p>}
      </div>
      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: st.color, background: `${st.color}22` }}>
        {st.label}
      </span>
    </div>
  );
}