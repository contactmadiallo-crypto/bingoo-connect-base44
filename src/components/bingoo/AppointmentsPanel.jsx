import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, User, Phone, Mail, Check, X, CheckCircle, Inbox, MessageSquare, Download } from "lucide-react";
import { toast } from "sonner";
import { useBingooTheme } from "@/hooks/useBingooTheme";

const STATUS_STYLE_LIGHT = {
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  confirmed:   "bg-green-50 text-green-700 border-green-200",
  accepted:    "bg-green-50 text-green-700 border-green-200",
  completed:   "bg-blue-50 text-blue-700 border-blue-200",
  cancelled:   "bg-red-50 text-red-600 border-red-200",
  canceled:    "bg-red-50 text-red-600 border-red-200",
  declined:    "bg-red-50 text-red-600 border-red-200",
  rescheduled: "bg-purple-50 text-purple-700 border-purple-200",
};
const STATUS_STYLE_DARK = {
  pending:     "bg-amber-500/20 text-amber-300 border-amber-500/30",
  confirmed:   "bg-green-500/20 text-green-300 border-green-500/30",
  accepted:    "bg-green-500/20 text-green-300 border-green-500/30",
  completed:   "bg-blue-500/20 text-blue-300 border-blue-500/30",
  cancelled:   "bg-red-500/20 text-red-300 border-red-500/30",
  canceled:    "bg-red-500/20 text-red-300 border-red-500/30",
  declined:    "bg-red-500/20 text-red-300 border-red-500/30",
  rescheduled: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function AppointmentsPanel({ profileId, userId }) {
  const qc = useQueryClient();
  const { isDark } = useBingooTheme();
  const [addNote, setAddNote] = useState({});
  const [showNoteFor, setShowNoteFor] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  useEffect(() => {
    if (!profileId) return;
    const unsub = base44.entities.Appointment.subscribe((event) => {
      if (event.data?.profile_id === profileId) {
        qc.invalidateQueries({ queryKey: ["appointments", profileId] });
      }
    });
    return () => unsub();
  }, [profileId]);

  const { data: byProfile = [] } = useQuery({
    queryKey: ["appointments", profileId],
    queryFn: () => base44.entities.Appointment.filter({ profile_id: profileId }, "-created_date"),
    enabled: !!profileId,
    refetchOnMount: "always",
  });

  const { data: byOwner = [] } = useQuery({
    queryKey: ["appointments-owner", userId],
    queryFn: () => base44.entities.Appointment.filter({ owner_user_id: userId }, "-created_date"),
    enabled: !!userId && !profileId,
    refetchOnMount: "always",
  });

  // Merge and deduplicate
  const seen = new Set();
  const appointments = [...byProfile, ...byOwner].filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["appointments", profileId] });
      qc.invalidateQueries({ queryKey: ["appointments-owner", userId] });
      const msgs = {
        confirmed: "Appointment accepted!",
        accepted: "Appointment accepted!",
        cancelled: "Appointment cancelled.",
        declined: "Appointment declined.",
        completed: "Marked as completed.",
        rescheduled: "Appointment rescheduled.",
      };
      if (vars.data.status) toast.success(msgs[vars.data.status] || "Updated");
      if (vars.data.notes !== undefined) toast.success("Note saved");
      setShowNoteFor(null);
      setRescheduleId(null);
    },
  });

  const handleReschedule = (id) => {
    if (!rescheduleDate || !rescheduleTime) return;
    update.mutate({ id, data: { status: "rescheduled", date: rescheduleDate, time_slot: rescheduleTime } });
    setRescheduleDate(""); setRescheduleTime("");
  };

  const exportCSV = () => {
    const rows = [["Name", "Email", "Phone", "Date", "Time", "Status", "Notes"]];
    appointments.forEach(a => rows.push([a.visitor_name, a.visitor_email, a.visitor_phone, a.date, a.time_slot, a.status, a.notes || ""]));
    const csv = rows.map(r => r.map(v => `"${(v||"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: "appointments.csv" }).click();
    URL.revokeObjectURL(url);
  };

  // Theme tokens
  const STATUS_STYLE = isDark ? STATUS_STYLE_DARK : STATUS_STYLE_LIGHT;
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const noteBg = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const noteText = isDark ? "text-white/40" : "text-slate-500";
  const selectClass = isDark
    ? "border-white/10 bg-transparent text-white/60 outline-none"
    : "border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none bg-white";
  const inputClass = isDark
    ? "bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
    : "border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white text-slate-900";
  const noteAreaClass = isDark
    ? "w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400 placeholder:text-white/25"
    : "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-400";
  const addNoteBtn = isDark
    ? "flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
    : "flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors";
  const sectionLabel = isDark ? "text-xs font-bold text-white/25 uppercase tracking-wider mb-3" : "text-xs font-bold text-slate-400 uppercase tracking-wider mb-3";

  if (!profileId && !userId) return <div className={`text-center py-12 ${mutedText}`}>Create a profile first.</div>;

  if (appointments.length === 0) return (
    <div className="text-center py-16">
      <Inbox className={`w-14 h-14 mx-auto mb-4 ${isDark ? "text-white/10" : "text-slate-200"}`} />
      <p className={`font-semibold text-lg ${headText}`}>No appointments yet</p>
      <p className={`text-sm mt-1 ${mutedText}`}>Enable booking on your profile so visitors can schedule time with you.</p>
    </div>
  );

  const today = new Date().toISOString().slice(0,10);
  const DONE_STATUSES = ["cancelled", "canceled", "completed", "declined"];
  const filtered = appointments.filter(a => {
    if (filterStatus !== "all" && (a.status || "pending") !== filterStatus) return false;
    if (filterDate && a.date !== filterDate) return false;
    return true;
  });
  const upcoming = filtered.filter(a => !DONE_STATUSES.includes(a.status) && (a.date || "") >= today);
  const past = filtered.filter(a => DONE_STATUSES.includes(a.status) || (a.date || "") < today);

  const Card = ({ a }) => (
    <div className="rounded-2xl p-5 space-y-3" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays className={`w-4 h-4 flex-shrink-0 ${mutedText}`} />
          <span className={`font-bold text-sm ${headText}`}>
            {a.date ? new Date(a.date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }) : "Date TBD"}
          </span>
          {a.time_slot && <span className={`flex items-center gap-1 text-sm ${mutedText}`}><Clock className="w-3.5 h-3.5" />{a.time_slot}</span>}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${STATUS_STYLE[a.status] || STATUS_STYLE.pending}`}>{a.status || "pending"}</span>
      </div>

      <div className="flex flex-col gap-1">
        <div className={`flex items-center gap-2 text-sm ${headText}`}><User className={`w-3.5 h-3.5 ${mutedText}`} /><span className="font-semibold">{a.visitor_name}</span></div>
        {a.visitor_email && <div className={`flex items-center gap-2 text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}><Mail className={`w-3.5 h-3.5 ${mutedText}`} /><a href={`mailto:${a.visitor_email}`} className="hover:text-blue-500">{a.visitor_email}</a></div>}
        {a.visitor_phone && <div className={`flex items-center gap-2 text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}><Phone className={`w-3.5 h-3.5 ${mutedText}`} /><a href={`tel:${a.visitor_phone}`} className="hover:text-blue-500">{a.visitor_phone}</a></div>}
      </div>

      {a.notes && <p className={`text-xs rounded-xl p-3 italic ${isDark ? "bg-white/5 text-white/40" : "bg-slate-50 text-slate-500"}`}>"{a.notes}"</p>}

      {showNoteFor === a.id ? (
        <div className="space-y-2">
          <textarea className={noteAreaClass} rows={2} placeholder="Add a private note..."
            value={addNote[a.id] || ""}
            onChange={e => setAddNote(n => ({ ...n, [a.id]: e.target.value }))}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => update.mutate({ id: a.id, data: { description: addNote[a.id] || "" } })} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs">Save Note</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNoteFor(null)} className={`text-xs ${isDark ? "border-white/10 text-white/50 hover:bg-white/8" : ""}`}>Cancel</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNoteFor(a.id)} className={addNoteBtn}>
          <MessageSquare className="w-3.5 h-3.5" />
          {a.description ? "Edit note" : "Add note"}
        </button>
      )}
      {a.description && <p className={`text-xs rounded-xl p-3 ${isDark ? "text-blue-300 bg-blue-500/10" : "text-blue-600 bg-blue-50"}`}>📝 {a.description}</p>}

      {rescheduleId === a.id && (
        <div className="space-y-2 mt-1">
          <div className="flex gap-2">
            <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} className={`flex-1 ${inputClass}`} />
            <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} className={`flex-1 ${inputClass}`} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleReschedule(a.id)} disabled={!rescheduleDate || !rescheduleTime} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs">Confirm Reschedule</Button>
            <Button size="sm" variant="outline" onClick={() => setRescheduleId(null)} className={`text-xs ${isDark ? "border-white/10 text-white/50 hover:bg-white/8" : ""}`}>Cancel</Button>
          </div>
        </div>
      )}

      {!["completed", "cancelled", "canceled", "declined"].includes(a.status || "pending") && rescheduleId !== a.id && (
        <div className="flex gap-2 pt-1 flex-wrap">
          {["pending", "rescheduled"].includes(a.status || "pending") && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs" onClick={() => update.mutate({ id: a.id, data: { status: "accepted" } })}>
              <Check className="w-3.5 h-3.5" /> Accept
            </Button>
          )}
          {["pending", "rescheduled"].includes(a.status || "pending") && (
            <Button size="sm" variant="outline" className={`gap-1.5 text-xs ${isDark ? "text-red-400 border-red-500/30 hover:bg-red-500/10" : "text-red-500 border-red-200 hover:bg-red-50"}`} onClick={() => update.mutate({ id: a.id, data: { status: "declined" } })}>
              <X className="w-3.5 h-3.5" /> Decline
            </Button>
          )}
          {["confirmed", "accepted"].includes(a.status) && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs" onClick={() => update.mutate({ id: a.id, data: { status: "completed" } })}>
              <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
            </Button>
          )}
          <Button size="sm" variant="outline" className={`gap-1.5 text-xs ${isDark ? "text-purple-400 border-purple-500/30 hover:bg-purple-500/10" : "text-purple-600 border-purple-200 hover:bg-purple-50"}`} onClick={() => setRescheduleId(a.id)}>
            📅 Reschedule
          </Button>
          {["confirmed", "accepted"].includes(a.status) && (
            <Button size="sm" variant="outline" className={`gap-1.5 text-xs ${isDark ? "text-red-400 border-red-500/30 hover:bg-red-500/10" : "text-red-500 border-red-200 hover:bg-red-50"}`} onClick={() => update.mutate({ id: a.id, data: { status: "cancelled" } })}>
              <X className="w-3.5 h-3.5" /> Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className={`text-xl font-black ${headText}`}>Appointments</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold border ${selectClass}`}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold border ${isDark ? "bg-white/5 border-white/10 text-white/60" : "border-slate-200 bg-white text-slate-700"} outline-none`} />
          {filterDate && <button onClick={() => setFilterDate("")} className={`text-xs ${mutedText} hover:text-slate-600`}>✕ Clear date</button>}
          <button onClick={exportCSV} className={`flex items-center gap-1.5 border rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${isDark ? "border-white/10 text-white/50 hover:bg-white/8 hover:text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${isDark ? "bg-amber-500/15 text-amber-300 border-amber-500/25" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
            {appointments.filter(a => (a.status || "pending") === "pending").length} pending
          </span>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div>
          <p className={sectionLabel}>Upcoming</p>
          <div className="space-y-3">{upcoming.map(a => <Card key={a.id} a={a} />)}</div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className={sectionLabel}>Past / Completed / Cancelled</p>
          <div className="space-y-3 opacity-60">{past.map(a => <Card key={a.id} a={a} />)}</div>
        </div>
      )}
    </div>
  );
}