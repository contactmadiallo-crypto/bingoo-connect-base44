import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut, Calendar, Users, Download, ChevronDown } from "lucide-react";
import { MobileSelect } from "@/components/ui/mobile-select";
import { format, parseISO, differenceInMinutes } from "date-fns";

function hoursWorked(clockIn, clockOut) {
  if (!clockIn || !clockOut) return null;
  const mins = differenceInMinutes(parseISO(clockOut), parseISO(clockIn));
  return (mins / 60).toFixed(2);
}

function exportCSV(logs) {
  const rows = [["Member", "Date", "Clock In", "Clock Out", "Hours"]];
  logs.forEach(l => rows.push([
    l.team_member_name || l.team_member_id,
    l.date,
    l.clock_in ? format(parseISO(l.clock_in), "HH:mm") : "",
    l.clock_out ? format(parseISO(l.clock_out), "HH:mm") : "In Progress",
    hoursWorked(l.clock_in, l.clock_out) || "",
  ]));
  const csv = rows.map(r => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "attendance.csv";
  a.click();
}

export default function AttendancePanel({ profileId, isDark: propDark }) {
  const { isDark } = useBingooTheme();
  const dark = propDark ?? isDark;
  const qc = useQueryClient();
  const [selectedMember, setSelectedMember] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: members = [] } = useQuery({
    queryKey: ["team-members", profileId],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profileId, status: "active" }, "name"),
    enabled: !!profileId,
  });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["attendance", profileId, filterDate],
    queryFn: () => base44.entities.AttendanceLog.filter({ profile_id: profileId, date: filterDate }, "-clock_in"),
    enabled: !!profileId,
  });

  const { data: allLogs = [] } = useQuery({
    queryKey: ["attendance-all", profileId],
    queryFn: () => base44.entities.AttendanceLog.filter({ profile_id: profileId }, "-clock_in", 200),
    enabled: !!profileId,
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const member = members.find(m => m.id === selectedMember);
      if (!member) throw new Error("Select a team member first");
      const payload = {
        profile_id: profileId,
        team_member_id: member.id,
        team_member_name: member.name,
        clock_in: new Date().toISOString(),
        date: new Date().toISOString().slice(0, 10),
        status: "clocked_in",
      };
      const res = await base44.functions.invoke('createGatedRecord', { entity_name: 'AttendanceLog', profile_id: profileId, data: payload });
      return res.data.record;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); qc.invalidateQueries({ queryKey: ["attendance-all"] }); },
  });

  const clockOutMutation = useMutation({
    mutationFn: async (logId) => {
      const clockOut = new Date().toISOString();
      const log = allLogs.find(l => l.id === logId);
      const hrs = log ? parseFloat(hoursWorked(log.clock_in, clockOut)) : 0;
      const res = await base44.functions.invoke('createGatedRecord', { entity_name: 'AttendanceLog', profile_id: profileId, op: 'update', record_id: logId, data: { clock_out: clockOut, status: "clocked_out", hours_worked: hrs } });
      return res.data.record;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attendance"] }); qc.invalidateQueries({ queryKey: ["attendance-all"] }); },
  });

  // Check who's currently clocked in (today, no clock_out)
  const today = new Date().toISOString().slice(0, 10);
  const activeSessions = allLogs.filter(l => l.date === today && l.status === "clocked_in");

  // Total hours today
  const todayHours = logs.reduce((sum, l) => sum + (l.hours_worked || 0), 0).toFixed(1);

  const card = dark ? "bg-white/5 border-white/8" : "bg-white border-slate-200";
  const head = dark ? "text-white" : "text-slate-900";
  const sub = dark ? "text-white/50" : "text-slate-500";
  const inp = dark ? "bg-white/8 border-white/15 text-white focus:border-white/30" : "bg-white border-slate-200 text-slate-900 focus:border-blue-400";

  if (!profileId) return <div className={`text-center py-12 ${sub}`}>Select a profile first.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className={`text-lg font-black ${head}`}>Attendance Dashboard</h2>
          <p className={`text-xs mt-0.5 ${sub}`}>{activeSessions.length} currently clocked in</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => exportCSV(allLogs)} className="rounded-xl gap-1.5 font-semibold text-xs">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Clock In/Out Panel */}
      <div className={`rounded-2xl border p-5 ${card}`}>
        <p className={`font-bold text-sm mb-3 ${head}`}>Clock In / Out</p>
        <div className="flex gap-2 flex-wrap">
          <MobileSelect
            value={selectedMember || "none"}
            onValueChange={(v) => setSelectedMember(v === "none" ? "" : v)}
            options={[
              { value: "none", label: "Select team member…" },
              ...members.map(m => ({ value: m.id, label: m.name }))
            ]}
            className={`flex-1 min-w-[160px] rounded-xl px-3 py-2.5 text-sm border outline-none ${inp}`}
          />
          <Button size="sm" onClick={() => clockInMutation.mutate()} disabled={!selectedMember || clockInMutation.isPending}
            className="rounded-xl gap-1.5 font-bold text-white" style={{ background: "#10b981" }}>
            <LogIn className="w-3.5 h-3.5" /> Clock In
          </Button>
        </div>
        {members.length === 0 && (
          <p className={`text-xs mt-2 ${sub}`}>Add team members in the Team tab first.</p>
        )}

        {/* Active sessions */}
        {activeSessions.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className={`text-xs font-semibold mb-2 ${sub}`}>Currently clocked in:</p>
            {activeSessions.map(s => (
              <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl ${dark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-100"}`}>
                <div>
                  <p className={`font-bold text-sm ${head}`}>{s.team_member_name}</p>
                  <p className={`text-xs ${sub}`}>In since {format(parseISO(s.clock_in), "HH:mm")}</p>
                </div>
                <Button size="sm" onClick={() => clockOutMutation.mutate(s.id)} disabled={clockOutMutation.isPending}
                  className="rounded-xl gap-1.5 font-bold text-white text-xs" style={{ background: "#ef4444" }}>
                  <LogOut className="w-3.5 h-3.5" /> Clock Out
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily summary */}
      <div className={`grid grid-cols-3 gap-3`}>
        {[
          { label: "Total Logs Today", value: logs.length, icon: Calendar, color: "#3b82f6" },
          { label: "Hours Today", value: todayHours, icon: Clock, color: "#8b5cf6" },
          { label: "Active Now", value: activeSessions.length, icon: Users, color: "#10b981" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 text-center ${card}`}>
            <div className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: s.color + "22" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className={`text-xl font-black ${head}`}>{s.value}</p>
            <p className={`text-xs mt-0.5 ${sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Date filter + log table */}
      <div className={`rounded-2xl border ${card}`}>
        <div className="flex items-center justify-between p-4 pb-3">
          <p className={`font-bold text-sm ${head}`}>Daily Log</p>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className={`rounded-xl px-3 py-1.5 text-xs border outline-none ${inp}`} />
        </div>
        {isLoading ? (
          <div className={`text-center py-8 text-sm ${sub}`}>Loading…</div>
        ) : logs.length === 0 ? (
          <div className={`text-center py-8 text-sm ${sub}`}>No records for this date.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-t ${dark ? "border-white/8" : "border-slate-100"}`}>
                  {["Member", "Clock In", "Clock Out", "Hours"].map(h => (
                    <th key={h} className={`text-left px-4 py-2 text-xs font-semibold ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} className={`border-t ${dark ? "border-white/5 hover:bg-white/3" : "border-slate-50 hover:bg-slate-50"} transition-colors`}>
                    <td className={`px-4 py-3 font-semibold text-sm ${head}`}>{l.team_member_name}</td>
                    <td className={`px-4 py-3 text-sm ${sub}`}>{l.clock_in ? format(parseISO(l.clock_in), "HH:mm") : "—"}</td>
                    <td className={`px-4 py-3 text-sm ${sub}`}>
                      {l.clock_out
                        ? format(parseISO(l.clock_out), "HH:mm")
                        : <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${dark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>In Progress</span>
                      }
                    </td>
                    <td className={`px-4 py-3 text-sm font-bold ${head}`}>
                      {hoursWorked(l.clock_in, l.clock_out) ? `${hoursWorked(l.clock_in, l.clock_out)}h` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}