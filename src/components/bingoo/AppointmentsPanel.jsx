import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, User, Phone, Mail, Check, X, CheckCircle, Inbox, MessageSquare, Download, Filter } from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLE = {
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  confirmed:   "bg-green-50 text-green-700 border-green-200",
  accepted:    "bg-green-50 text-green-700 border-green-200",
  completed:   "bg-blue-50 text-blue-700 border-blue-200",
  cancelled:   "bg-red-50 text-red-600 border-red-200",
  canceled:    "bg-red-50 text-red-600 border-red-200",
  declined:    "bg-red-50 text-red-600 border-red-200",
  rescheduled: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function AppointmentsPanel({ profileId }) {
  const qc = useQueryClient();
  const [addNote, setAddNote] = useState({});
  const [showNoteFor, setShowNoteFor] = useState(null);

  // Real-time: push update when a new appointment is booked
  useEffect(() => {
    if (!profileId) return;
    const unsub = base44.entities.Appointment.subscribe((event) => {
      if (event.data?.profile_id === profileId) {
        qc.invalidateQueries({ queryKey: ["appointments", profileId] });
      }
    });
    return () => unsub();
  }, [profileId]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", profileId],
    queryFn: () => base44.entities.Appointment.filter({ profile_id: profileId }, "-created_date"),
    enabled: !!profileId,
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["appointments", profileId] });
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

  if (!profileId) return <div className="text-center py-12 text-slate-400">Create a profile first.</div>;
  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  const today = new Date().toISOString().slice(0,10);
  const DONE_STATUSES = ["cancelled", "canceled", "completed", "declined"];
  const filtered = appointments.filter(a => {
    if (filterStatus !== "all" && (a.status || "pending") !== filterStatus) return false;
    if (filterDate && a.date !== filterDate) return false;
    return true;
  });
  const upcoming = filtered.filter(a => !DONE_STATUSES.includes(a.status) && (a.date || "") >= today);
  const past = filtered.filter(a => DONE_STATUSES.includes(a.status) || (a.date || "") < today);

  if (appointments.length === 0) return (
    <div className="text-center py-16">
      <Inbox className="w-14 h-14 mx-auto text-slate-200 mb-4" />
      <p className="font-semibold text-slate-600 text-lg">No appointments yet</p>
      <p className="text-slate-400 text-sm mt-1">Enable booking on your profile so visitors can schedule time with you.</p>
    </div>
  );

  const Card = ({ a }) => (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CalendarDays className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="font-bold text-slate-900 text-sm">
            {a.date ? new Date(a.date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }) : "Date TBD"}
          </span>
          {a.time_slot && <span className="flex items-center gap-1 text-slate-500 text-sm"><Clock className="w-3.5 h-3.5" />{a.time_slot}</span>}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${STATUS_STYLE[a.status] || STATUS_STYLE.pending}`}>{a.status || "pending"}</span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-slate-700"><User className="w-3.5 h-3.5 text-slate-400" /><span className="font-semibold">{a.visitor_name}</span></div>
        {a.visitor_email && <div className="flex items-center gap-2 text-sm text-slate-500"><Mail className="w-3.5 h-3.5 text-slate-400" /><a href={`mailto:${a.visitor_email}`} className="hover:text-blue-600">{a.visitor_email}</a></div>}
        {a.visitor_phone && <div className="flex items-center gap-2 text-sm text-slate-500"><Phone className="w-3.5 h-3.5 text-slate-400" /><a href={`tel:${a.visitor_phone}`} className="hover:text-blue-600">{a.visitor_phone}</a></div>}
      </div>

      {a.notes && <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 italic">"{a.notes}"</p>}

      {/* Owner note */}
      {showNoteFor === a.id ? (
        <div className="space-y-2">
          <textarea
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400"
            rows={2}
            placeholder="Add a private note..."
            value={addNote[a.id] || ""}
            onChange={e => setAddNote(n => ({ ...n, [a.id]: e.target.value }))}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => update.mutate({ id: a.id, data: { description: addNote[a.id] || "" } })} className="flex-1 bg-blue-600 hover:bg-blue-500 text-xs">Save Note</Button>
            <Button size="sm" variant="outline" onClick={() => setShowNoteFor(null)} className="text-xs">Cancel</Button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNoteFor(a.id)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          <MessageSquare className="w-3.5 h-3.5" />
          {a.description ? "Edit note" : "Add note"}
        </button>
      )}
      {a.description && <p className="text-xs text-blue-600 bg-blue-50 rounded-xl p-3">📝 {a.description}</p>}

      {/* Reschedule form */}
      {rescheduleId === a.id && (
        <div className="space-y-2 mt-1">
          <div className="flex gap-2">
            <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
            <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleReschedule(a.id)} disabled={!rescheduleDate || !rescheduleTime} className="flex-1 bg-purple-600 hover:bg-purple-500 text-xs">Confirm Reschedule</Button>
            <Button size="sm" variant="outline" onClick={() => setRescheduleId(null)} className="text-xs">Cancel</Button>
          </div>
        </div>
      )}

      {!["completed", "cancelled", "canceled", "declined"].includes(a.status || "pending") && rescheduleId !== a.id && (
        <div className="flex gap-2 pt-1 flex-wrap">
          {["pending", "rescheduled"].includes(a.status || "pending") && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1.5 text-xs" onClick={() => update.mutate({ id: a.id, data: { status: "accepted" } })}>
              <Check className="w-3.5 h-3.5" /> Accept
            </Button>
          )}
          {["pending", "rescheduled"].includes(a.status || "pending") && (
            <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 gap-1.5 text-xs" onClick={() => update.mutate({ id: a.id, data: { status: "declined" } })}>
              <X className="w-3.5 h-3.5" /> Decline
            </Button>
          )}
          {["confirmed", "accepted"].includes(a.status) && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1.5 text-xs" onClick={() => update.mutate({ id: a.id, data: { status: "completed" } })}>
              <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
            </Button>
          )}
          <Button size="sm" variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50 gap-1.5 text-xs" onClick={() => setRescheduleId(a.id)}>
            📅 Reschedule
          </Button>
          {["confirmed", "accepted"].includes(a.status) && (
            <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 gap-1.5 text-xs" onClick={() => update.mutate({ id: a.id, data: { status: "cancelled" } })}>
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
        <h2 className="text-xl font-black text-slate-900">Appointments</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none bg-white">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="completed">Completed</option>
            <option value="declined">Declined</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none bg-white" />
          {filterDate && <button onClick={() => setFilterDate("")} className="text-xs text-slate-400 hover:text-slate-600">✕ Clear date</button>}
          <button onClick={exportCSV} className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <span className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-1 text-xs font-semibold">{appointments.filter(a => (a.status || "pending") === "pending").length} pending</span>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Upcoming</p>
          <div className="space-y-3">{upcoming.map(a => <Card key={a.id} a={a} />)}</div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Past / Completed / Cancelled</p>
          <div className="space-y-3 opacity-60">{past.map(a => <Card key={a.id} a={a} />)}</div>
        </div>
      )}
    </div>
  );
}