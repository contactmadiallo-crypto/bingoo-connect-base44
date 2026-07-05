import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, Clock, User, Phone, Mail, Check, X, CheckCircle,
  Inbox, MessageSquare, Download, AlertTriangle, Search
} from "lucide-react";
import { toast } from "sonner";
import { useBingooTheme } from "@/hooks/useBingooTheme";

const STATUS_COLORS_DARK = {
  pending:     "bg-amber-500/20 text-amber-300 border-amber-500/30",
  confirmed:   "bg-green-500/20 text-green-300 border-green-500/30",
  accepted:    "bg-green-500/20 text-green-300 border-green-500/30",
  completed:   "bg-blue-500/20 text-blue-300 border-blue-500/30",
  cancelled:   "bg-red-500/20 text-red-300 border-red-500/30",
  canceled:    "bg-red-500/20 text-red-300 border-red-500/30",
  declined:    "bg-red-500/20 text-red-300 border-red-500/30",
  rescheduled: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  no_show:     "bg-orange-500/20 text-orange-300 border-orange-500/30",
};
const STATUS_COLORS_LIGHT = {
  pending:     "bg-amber-50 text-amber-700 border-amber-200",
  confirmed:   "bg-green-50 text-green-700 border-green-200",
  accepted:    "bg-green-50 text-green-700 border-green-200",
  completed:   "bg-blue-50 text-blue-700 border-blue-200",
  cancelled:   "bg-red-50 text-red-600 border-red-200",
  canceled:    "bg-red-50 text-red-600 border-red-200",
  declined:    "bg-red-50 text-red-600 border-red-200",
  rescheduled: "bg-purple-50 text-purple-700 border-purple-200",
  no_show:     "bg-orange-50 text-orange-600 border-orange-200",
};

const DONE = ["cancelled", "canceled", "completed", "declined", "no_show"];

const FILTER_TABS = [
  { id: "all",      label: "All" },
  { id: "today",    label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "pending",  label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function AppointmentsPanel({ profileId, userId, highlightId }) {
  const qc = useQueryClient();
  const { isDark } = useBingooTheme();
  const [filterTab, setFilterTab] = useState("all");
  const [search, setSearch] = useState("");
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [noteFor, setNoteFor] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [flashId, setFlashId] = useState(null);
  const listRef = useRef(null);

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

  const seen = new Set();
  const all = [...byProfile, ...byOwner].filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onMutate: async ({ id, data }) => {
      const keys = [];
      if (profileId) keys.push(["appointments", profileId]);
      if (userId) keys.push(["appointments-owner", userId]);
      await Promise.all(keys.map(k => qc.cancelQueries({ queryKey: k })));
      const prevs = {};
      keys.forEach(k => {
        const key = k.join("|");
        prevs[key] = qc.getQueryData(k);
        qc.setQueryData(k, (old = []) => old.map(a => a.id === id ? { ...a, ...data } : a));
      });
      return { prevs, keys };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.keys) ctx.keys.forEach(k => qc.setQueryData(k, ctx.prevs[k.join("|")]));
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["appointments", profileId] });
      qc.invalidateQueries({ queryKey: ["appointments-owner", userId] });
      const msgs = {
        confirmed: "Appointment confirmed!", accepted: "Appointment accepted!",
        cancelled: "Appointment cancelled.", declined: "Appointment declined.",
        completed: "Marked as completed.", rescheduled: "Appointment rescheduled.",
        no_show: "Marked as no-show.",
      };
      if (vars.data.status) toast.success(msgs[vars.data.status] || "Updated");
      if (vars.data.description !== undefined) toast.success("Note saved");
      setNoteFor(null); setNoteText(""); setRescheduleId(null);
    },
  });

  const today = new Date().toISOString().slice(0, 10);

  const filtered = all.filter(a => {
    const s = a.status || "pending";
    if (filterTab === "today") return a.date === today;
    if (filterTab === "upcoming") return !DONE.includes(s) && (a.date || "") >= today;
    if (filterTab === "pending") return s === "pending";
    if (filterTab === "confirmed") return s === "confirmed" || s === "accepted";
    if (filterTab === "completed") return s === "completed";
    if (filterTab === "cancelled") return s === "cancelled" || s === "canceled" || s === "declined";
    return true;
  }).filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [a.visitor_name, a.visitor_email, a.visitor_phone, a.service_name, a.notes]
      .some(v => v?.toLowerCase().includes(q));
  });

  const exportCSV = () => {
    const rows = [["Name", "Email", "Phone", "Service", "Date", "Time", "Status", "Notes", "Source"]];
    filtered.forEach(a => rows.push([
      a.visitor_name, a.visitor_email, a.visitor_phone || "", a.service_name || "",
      a.date, a.time_slot, a.status, a.notes || "", a.source || ""
    ]));
    const csv = rows.map(r => r.map(v => `"${(v||"").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: "appointments.csv" }).click();
    URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  // Theme tokens
  const SC = isDark ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const inputClass = isDark
    ? "bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 placeholder:text-white/25"
    : "border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 bg-white text-slate-900 placeholder:text-slate-400";
  const noteAreaClass = isDark
    ? "w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400 placeholder:text-white/25"
    : "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400 placeholder:text-slate-400";

  // Summary counts
  const pendingCount = all.filter(a => (a.status || "pending") === "pending").length;
  const todayCount = all.filter(a => a.date === today && !DONE.includes(a.status || "pending")).length;
  const confirmedCount = all.filter(a => ["confirmed", "accepted"].includes(a.status)).length;

  if (!profileId && !userId) return (
    <div className={`text-center py-12 ${mutedText}`}>Create a profile first.</div>
  );

  const Card = ({ a }) => {
    const s = a.status || "pending";
    const isDone = DONE.includes(s);
    return (
      <div className="rounded-2xl p-5 space-y-3" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CalendarDays className={`w-4 h-4 flex-shrink-0 ${mutedText}`} />
            <span className={`font-bold text-sm ${headText}`}>
              {a.date ? new Date(a.date + "T00:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }) : "Date TBD"}
            </span>
            {a.time_slot && <span className={`flex items-center gap-1 text-sm ${mutedText}`}><Clock className="w-3.5 h-3.5" />{a.time_slot}</span>}
            {a.service_name && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-700"}`}>{a.service_name}</span>}
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${SC[s] || SC.pending}`}>{s.replace("_", " ")}</span>
        </div>

        {/* Visitor info */}
        <div className="flex flex-col gap-1">
          <div className={`flex items-center gap-2 text-sm ${headText}`}><User className={`w-3.5 h-3.5 ${mutedText}`} /><span className="font-semibold">{a.visitor_name}</span></div>
          {a.visitor_email && <div className={`flex items-center gap-2 text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}><Mail className={`w-3.5 h-3.5 ${mutedText}`} /><a href={`mailto:${a.visitor_email}`} className="hover:text-blue-500">{a.visitor_email}</a></div>}
          {a.visitor_phone && <div className={`flex items-center gap-2 text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}><Phone className={`w-3.5 h-3.5 ${mutedText}`} /><a href={`tel:${a.visitor_phone}`} className="hover:text-blue-500">{a.visitor_phone}</a></div>}
          {a.guest_count && <div className={`flex items-center gap-2 text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}><span className={`text-xs ${mutedText}`}>👥 {a.guest_count} guests</span></div>}
          {a.case_type && <div className={`text-xs px-2 py-0.5 rounded-full inline-flex ${isDark ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-700"}`}>{a.case_type}{a.a_number ? ` · A# ${a.a_number}` : ""}</div>}
        </div>

        {a.notes && <p className={`text-xs rounded-xl p-3 italic ${isDark ? "bg-white/5 text-white/40" : "bg-slate-50 text-slate-500"}`}>"{a.notes}"</p>}

        {/* Internal note */}
        {noteFor === a.id ? (
          <div className="space-y-2">
            <textarea className={noteAreaClass} rows={2} placeholder="Add a private note..."
              value={noteText} onChange={e => setNoteText(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => update.mutate({ id: a.id, data: { description: noteText } })} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs">Save Note</Button>
              <Button size="sm" variant="outline" onClick={() => { setNoteFor(null); setNoteText(""); }} className={`text-xs ${isDark ? "border-white/10 text-white/50" : ""}`}>Cancel</Button>
            </div>
          </div>
        ) : (
          <button onClick={() => { setNoteFor(a.id); setNoteText(a.description || ""); }} className={`flex items-center gap-1.5 text-xs transition-colors ${isDark ? "text-white/30 hover:text-white/60" : "text-slate-400 hover:text-slate-600"}`}>
            <MessageSquare className="w-3.5 h-3.5" />{a.description ? "Edit note" : "Add note"}
          </button>
        )}
        {a.description && <p className={`text-xs rounded-xl p-3 ${isDark ? "text-blue-300 bg-blue-500/10" : "text-blue-600 bg-blue-50"}`}>📝 {a.description}</p>}

        {/* Reschedule picker */}
        {rescheduleId === a.id && (
          <div className="space-y-2 mt-1">
            <div className="flex gap-2">
              <input type="date" value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} className={`flex-1 ${inputClass}`} style={isDark ? { colorScheme: "dark" } : {}} />
              <input type="time" value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} className={`flex-1 ${inputClass}`} style={isDark ? { colorScheme: "dark" } : {}} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { if (!rescheduleDate || !rescheduleTime) return; update.mutate({ id: a.id, data: { status: "rescheduled", date: rescheduleDate, time_slot: rescheduleTime } }); setRescheduleDate(""); setRescheduleTime(""); }}
                disabled={!rescheduleDate || !rescheduleTime} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs">Confirm Reschedule</Button>
              <Button size="sm" variant="outline" onClick={() => setRescheduleId(null)} className={`text-xs ${isDark ? "border-white/10 text-white/50" : ""}`}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isDone && rescheduleId !== a.id && (
          <div className="flex gap-2 pt-1 flex-wrap">
            {["pending", "rescheduled"].includes(s) && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs" onClick={() => update.mutate({ id: a.id, data: { status: "confirmed" } })}>
                <Check className="w-3.5 h-3.5" /> Confirm
              </Button>
            )}
            {["pending", "rescheduled"].includes(s) && (
              <Button size="sm" variant="outline" className={`gap-1.5 text-xs ${isDark ? "text-red-400 border-red-500/30 hover:bg-red-500/10" : "text-red-500 border-red-200 hover:bg-red-50"}`} onClick={() => update.mutate({ id: a.id, data: { status: "declined" } })}>
                <X className="w-3.5 h-3.5" /> Decline
              </Button>
            )}
            {["confirmed", "accepted"].includes(s) && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs" onClick={() => update.mutate({ id: a.id, data: { status: "completed" } })}>
                <CheckCircle className="w-3.5 h-3.5" /> Complete
              </Button>
            )}
            {["confirmed", "accepted"].includes(s) && (
              <Button size="sm" variant="outline" className={`gap-1.5 text-xs ${isDark ? "text-orange-400 border-orange-500/30 hover:bg-orange-500/10" : "text-orange-600 border-orange-200 hover:bg-orange-50"}`} onClick={() => update.mutate({ id: a.id, data: { status: "no_show" } })}>
                <AlertTriangle className="w-3.5 h-3.5" /> No Show
              </Button>
            )}
            <Button size="sm" variant="outline" className={`gap-1.5 text-xs ${isDark ? "text-purple-400 border-purple-500/30 hover:bg-purple-500/10" : "text-purple-600 border-purple-200 hover:bg-purple-50"}`} onClick={() => setRescheduleId(a.id)}>
              📅 Reschedule
            </Button>
            {!["cancelled", "canceled"].includes(s) && (
              <Button size="sm" variant="outline" className={`gap-1.5 text-xs ${isDark ? "text-red-400 border-red-500/30 hover:bg-red-500/10" : "text-red-500 border-red-200 hover:bg-red-50"}`} onClick={() => update.mutate({ id: a.id, data: { status: "cancelled" } })}>
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", value: pendingCount, color: "#f59e0b" },
          { label: "Today", value: todayCount, color: "#3b82f6" },
          { label: "Confirmed", value: confirmedCount, color: "#10b981" },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4 border text-center" style={{ background: cardBg, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}>
            <p className="text-2xl font-black" style={{ color: k.color }}>{k.value}</p>
            <p className={`text-xs mt-0.5 ${mutedText}`}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className={`text-xl font-black ${headText}`}>Appointments</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedText}`} />
            <input className={`pl-9 w-full sm:w-52 text-sm rounded-xl px-3 py-2 outline-none border ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/25" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"}`}
              placeholder="Search appointments…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={exportCSV} className={`flex items-center gap-1.5 border rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${isDark ? "border-white/10 text-white/50 hover:bg-white/8 hover:text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTER_TABS.map(f => {
          const count = f.id === "pending" ? pendingCount : f.id === "today" ? todayCount : null;
          return (
            <button key={f.id} onClick={() => setFilterTab(f.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: filterTab === f.id ? (isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.1)") : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                border: `1px solid ${filterTab === f.id ? "rgba(16,185,129,0.4)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`,
                color: filterTab === f.id ? "#10b981" : isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
              }}>
              {f.label}
              {count !== null && count > 0 && <span className="ml-1 bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[11px] font-black">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: cardBg, border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
          <Inbox className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-white/10" : "text-slate-200"}`} />
          <p className={`font-bold ${headText}`}>{search ? "No results" : "No appointments"}</p>
          <p className={`text-sm mt-1 ${mutedText}`}>{search ? "Try a different search." : "Enable booking on your profile so visitors can schedule time."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => <Card key={a.id} a={a} />)}
        </div>
      )}
    </div>
  );
}