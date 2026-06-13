import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Plus, Download, Printer, Search, Edit, Trash2, QrCode, RefreshCw, X, Loader2,
  BarChart3, Wifi, AlertTriangle, CheckCircle2, Activity, Package, MapPin,
  ArrowRightLeft, History, FileText, Settings, Eye, RotateCcw, Clock, Users, Layers
} from "lucide-react";

const DEVICE_TYPES = ["card", "keychain", "bracelet", "stand", "badge", "sticker"];
const DEVICE_EMOJIS = { card: "💳", keychain: "🔑", bracelet: "📿", stand: "🪧", badge: "🎫", sticker: "🏷️" };

const orange = "#FF7A00";
const gold = "#FDBA21";
const navyCard = "#0B2E6B";

function generateCode(prefix, index) {
  return `${prefix}${String(index).padStart(4, "0")}`;
}

function QRCell({ code }) {
  const url = `https://bingooconnect.com/n/${code}`;
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`}
      alt={code}
      className="w-10 h-10 rounded-md bg-white p-0.5"
    />
  );
}

function StatusBadge({ status }) {
  const map = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    inactive: "bg-white/10 text-white/40 border-white/10",
    lost: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${map[status] || "bg-white/10 text-white/40"}`}>
      {status}
    </span>
  );
}

const SUB_TABS = [
  { id: "overview",    label: "Dashboard",       icon: BarChart3 },
  { id: "devices",     label: "All Devices",     icon: Layers },
  { id: "generation",  label: "Generation",      icon: Plus },
  { id: "assignment",  label: "Assignment",      icon: ArrowRightLeft },
  { id: "activation",  label: "Activation",      icon: CheckCircle2 },
  { id: "lost",        label: "Lost Mode",       icon: AlertTriangle },
  { id: "analytics",   label: "Analytics",       icon: Activity },
  { id: "mfg",         label: "Mfg. Tools",      icon: Package },
];

export default function NFCDeviceManager({ profiles = [], allNfcDevices = [], onLegacyReset }) {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingDevice, setEditingDevice] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [assignDevice, setAssignDevice] = useState(null);
  const [assignProfileId, setAssignProfileId] = useState("");

  // Generation state
  const [showSingleForm, setShowSingleForm] = useState(false);
  const [singleCode, setSingleCode] = useState("");
  const [singleType, setSingleType] = useState("card");
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkPrefix, setBulkPrefix] = useState("BNG-");
  const [bulkStart, setBulkStart] = useState(1);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkType, setBulkType] = useState("card");
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const { data: devices = [], refetch } = useQuery({
    queryKey: ["nfc-manager-devices"],
    queryFn: () => base44.entities.NFCDevice.list("-created_date", 1000),
  });

  const { data: lostReports = [] } = useQuery({
    queryKey: ["admin-lost-reports"],
    queryFn: () => base44.entities.LostItemReport.list("-scan_time", 200),
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["nfc-analytics"],
    queryFn: () => base44.entities.Analytics.filter({ event_type: "nfc_tap" }, "-created_at", 500),
  });

  const { data: qrAnalytics = [] } = useQuery({
    queryKey: ["qr-analytics"],
    queryFn: () => base44.entities.Analytics.filter({ event_type: "qr_scan" }, "-created_at", 500),
  });

  const createDevice = useMutation({
    mutationFn: (data) => base44.entities.NFCDevice.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["nfc-manager-devices"] }); setShowSingleForm(false); setSingleCode(""); toast.success("Device created!"); },
    onError: (e) => toast.error(e.message),
  });

  const updateDevice = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NFCDevice.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["nfc-manager-devices"] }); setEditingDevice(null); setAssignDevice(null); setAssignProfileId(""); toast.success("Device updated!"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteDevice = useMutation({
    mutationFn: (id) => base44.entities.NFCDevice.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["nfc-manager-devices"] }); setDeleteConfirm(null); toast.success("Device deleted!"); },
    onError: (e) => toast.error(e.message),
  });

  const handleBulkGenerate = async () => {
    setBulkGenerating(true);
    const existingCodes = new Set(devices.map(d => d.device_code?.toUpperCase()));
    const toCreate = [];
    let index = parseInt(bulkStart) || 1;
    let created = 0;
    while (created < Math.min(bulkCount, 100)) {
      const code = generateCode(bulkPrefix, index).toUpperCase();
      if (!existingCodes.has(code)) { toCreate.push({ device_code: code, device_type: bulkType, status: "inactive" }); created++; }
      index++;
    }
    try {
      await base44.entities.NFCDevice.bulkCreate(toCreate);
      queryClient.invalidateQueries({ queryKey: ["nfc-manager-devices"] });
      toast.success(`${bulkCount} devices generated!`);
      setShowBulkForm(false);
    } catch (e) { toast.error("Bulk generation failed: " + e.message); }
    setBulkGenerating(false);
  };

  const handleExportCSV = (devList = null) => {
    const list = devList || filteredDevices;
    const rows = [["Device ID", "Device Code", "Type", "Status", "Owner", "Profile Username", "Activation Date", "NFC URL"]];
    list.forEach(d => {
      const profile = profiles.find(p => p.id === d.profile_id);
      rows.push([d.id, d.device_code, d.device_type, d.status, profile?.display_name || "Unclaimed", profile?.username || "", d.assigned_at?.slice(0, 10) || "", `https://bingooconnect.com/n/${d.device_code}`]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bingoo-nfc-devices.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  const handleExportMfgPackage = () => {
    const rows = [["Device Code", "NFC URL", "QR Image URL", "Type", "Status"]];
    devices.forEach(d => {
      const url = `https://bingooconnect.com/n/${d.device_code}`;
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      rows.push([d.device_code, url, qr, d.device_type, d.status]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bingoo-manufacturer-package.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Manufacturer package exported!");
  };

  const handlePrintQR = (devList = null) => {
    const list = (devList || filteredDevices).slice(0, 100);
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Bingoo NFC QR Codes</title>
      <style>
        body{font-family:monospace;background:#fff;margin:0}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px}
        .card{border:1px solid #ddd;border-radius:8px;padding:10px;text-align:center;break-inside:avoid}
        .card img{width:90px;height:90px}
        .code{font-size:10px;font-weight:bold;margin-top:5px}
        .type{font-size:9px;color:#888}
        .url{font-size:8px;color:#555;word-break:break-all;margin-top:2px}
        @media print{@page{size:A4 portrait;margin:8mm}}
      </style></head><body><div class="grid">`);
    list.forEach(d => {
      const url = `https://bingooconnect.com/n/${d.device_code}`;
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      w.document.write(`<div class="card"><img src="${qr}" alt="${d.device_code}" /><div class="code">${d.device_code}</div><div class="type">${d.device_type}</div><div class="url">${url}</div></div>`);
    });
    w.document.write("</div></body></html>");
    w.document.close();
    w.onload = () => w.print();
  };

  const handlePrintSheet = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Bingoo Device IDs</title>
      <style>body{font-family:monospace;font-size:12px;padding:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:6px 10px;text-align:left}th{background:#f0f0f0}</style>
      </head><body><h2>Bingoo NFC Device List</h2><p>Generated: ${new Date().toLocaleDateString()}</p>
      <table><tr><th>Device Code</th><th>Type</th><th>Status</th><th>URL</th></tr>`);
    devices.forEach(d => {
      w.document.write(`<tr><td>${d.device_code}</td><td>${d.device_type}</td><td>${d.status}</td><td>https://bingooconnect.com/n/${d.device_code}</td></tr>`);
    });
    w.document.write("</table></body></html>");
    w.document.close();
    w.onload = () => w.print();
  };

  const filteredDevices = devices
    .filter(d => statusFilter === "all" || d.status === statusFilter)
    .filter(d => typeFilter === "all" || d.device_type === typeFilter)
    .filter(d => !search || d.device_code?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: devices.length,
    active: devices.filter(d => d.status === "active").length,
    unclaimed: devices.filter(d => !d.profile_id).length,
    lost: devices.filter(d => d.status === "lost").length,
    recovered: lostReports.filter(r => r.status === "recovered").length,
    disabled: devices.filter(d => d.status === "inactive").length,
  };

  const activatedDevices = devices.filter(d => d.profile_id && d.assigned_at);
  const pendingActivations = devices.filter(d => !d.profile_id && d.status === "inactive");
  const recentActivity = devices.filter(d => d.assigned_at).sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at)).slice(0, 10);

  // Most active by analytics taps
  const tapsByDevice = analytics.reduce((acc, a) => { if (a.device_id) acc[a.device_id] = (acc[a.device_id] || 0) + 1; return acc; }, {});
  const mostActiveDevices = devices.filter(d => tapsByDevice[d.id]).sort((a, b) => (tapsByDevice[b.id] || 0) - (tapsByDevice[a.id] || 0)).slice(0, 5);

  const st = { background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" };
  const inputSt = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" };

  return (
    <div className="space-y-5">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 flex-wrap rounded-2xl p-1 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
        {SUB_TABS.map(st => (
          <button key={st.id} onClick={() => setSubTab(st.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
            style={{ background: subTab === st.id ? orange : "transparent", color: subTab === st.id ? "#fff" : "rgba(255,255,255,0.4)" }}>
            <st.icon className="w-3.5 h-3.5" />{st.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD OVERVIEW ── */}
      {subTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Devices", value: stats.total, color: orange, icon: Layers },
              { label: "Active", value: stats.active, color: "#22c55e", icon: Wifi },
              { label: "Unclaimed", value: stats.unclaimed, color: gold, icon: Package },
              { label: "Lost", value: stats.lost, color: "#ef4444", icon: AlertTriangle },
              { label: "Recovered", value: stats.recovered, color: "#06b6d4", icon: CheckCircle2 },
              { label: "Disabled", value: stats.disabled, color: "rgba(255,255,255,0.3)", icon: Settings },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 border" style={st}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: s.color + "20" }}>
                  <s.icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5 text-white/40">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border p-5" style={st}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-orange-400" />
              <h3 className="font-black text-white">Recent Activations</h3>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-8">No activations yet</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map(d => {
                  const profile = profiles.find(p => p.id === d.profile_id);
                  return (
                    <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <span className="text-lg">{DEVICE_EMOJIS[d.device_type] || "📱"}</span>
                      <div className="flex-1">
                        <span className="font-mono font-black text-sm text-white">{d.device_code}</span>
                        <span className="text-white/30 text-xs ml-2 capitalize">{d.device_type}</span>
                      </div>
                      <div className="text-right">
                        {profile ? (
                          <a href={`/p/${profile.username}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:underline" style={{ color: orange }}>{profile.display_name}</a>
                        ) : <span className="text-white/25 text-xs italic">Unclaimed</span>}
                        <p className="text-white/25 text-xs mt-0.5">{d.assigned_at?.slice(0, 10)}</p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Stats Row */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border p-5" style={st}>
              <h4 className="text-white/50 text-xs font-bold uppercase mb-3">Device Type Breakdown</h4>
              {DEVICE_TYPES.map(type => {
                const count = devices.filter(d => d.device_type === type).length;
                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={type} className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-4">{DEVICE_EMOJIS[type]}</span>
                    <span className="text-xs text-white/50 capitalize w-16">{type}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/10">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: orange }} />
                    </div>
                    <span className="text-xs text-white/40 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="rounded-2xl border p-5" style={st}>
              <h4 className="text-white/50 text-xs font-bold uppercase mb-3">Status Overview</h4>
              {[
                { label: "Active (Claimed)", count: stats.active, color: "#22c55e" },
                { label: "Unclaimed", count: stats.unclaimed, color: gold },
                { label: "Lost", count: stats.lost, color: "#ef4444" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/50">{s.label}</span>
                  <span className="text-sm font-black" style={{ color: s.color }}>{s.count}</span>
                </div>
              ))}
              <div className="mt-2 pt-3 border-t border-white/10">
                <p className="text-xs text-white/30">Activation rate: <span className="text-white/60 font-bold">{stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%</span></p>
              </div>
            </div>
            <div className="rounded-2xl border p-5" style={st}>
              <h4 className="text-white/50 text-xs font-bold uppercase mb-3">NFC Taps (All Time)</h4>
              <p className="text-3xl font-black" style={{ color: orange }}>{analytics.length}</p>
              <p className="text-xs text-white/30 mt-1">NFC taps recorded</p>
              <p className="text-3xl font-black mt-3" style={{ color: gold }}>{qrAnalytics.length}</p>
              <p className="text-xs text-white/30 mt-1">QR scans recorded</p>
            </div>
          </div>
        </div>
      )}

      {/* ── ALL DEVICES ── */}
      {subTab === "devices" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                placeholder="Search by device code..."
                value={search} onChange={e => setSearch(e.target.value)} style={inputSt} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "active", "inactive", "lost"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                  style={{ background: statusFilter === s ? orange : "rgba(255,255,255,0.07)", color: statusFilter === s ? "#fff" : "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {s === "all" ? "All Status" : s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", ...DEVICE_TYPES].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className="px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                  style={{ background: typeFilter === t ? gold : "rgba(255,255,255,0.07)", color: typeFilter === t ? "#071d47" : "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {t === "all" ? "All Types" : `${DEVICE_EMOJIS[t]} ${t}`}
                </button>
              ))}
            </div>
          </div>

          <p className="text-white/30 text-xs">{filteredDevices.length} of {devices.length} devices</p>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["QR", "Device ID", "Type", "Status", "Owner", "Tap URL", "Activated", "Last Activity", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map(d => {
                    const profile = profiles.find(p => p.id === d.profile_id);
                    const taps = tapsByDevice[d.id] || 0;
                    return (
                      <tr key={d.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td className="px-4 py-3"><QRCell code={d.device_code} /></td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-black text-sm text-white">{d.device_code}</span>
                          <p className="text-xs text-white/25 mt-0.5 font-mono">{d.id?.slice(0, 8)}…</p>
                        </td>
                        <td className="px-4 py-3 text-sm capitalize text-white/60">{DEVICE_EMOJIS[d.device_type]} {d.device_type}</td>
                        <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                        <td className="px-4 py-3">
                          {profile ? (
                            <a href={`/p/${profile.username}`} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-bold hover:underline" style={{ color: orange }}>{profile.display_name}</a>
                          ) : <span className="text-white/25 text-xs italic">Unclaimed</span>}
                        </td>
                        <td className="px-4 py-3">
                          <a href={`/n/${d.device_code}`} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-mono hover:underline" style={{ color: orange }}>/n/{d.device_code}</a>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/35">{d.assigned_at?.slice(0, 10) || "—"}</td>
                        <td className="px-4 py-3">
                          {taps > 0 ? <span className="text-xs" style={{ color: gold }}>{taps} tap{taps !== 1 ? "s" : ""}</span> : <span className="text-white/25 text-xs">No taps</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button title="Edit" onClick={() => setEditingDevice({ ...d })}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                              <Edit className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                            <button title="Assign/Unassign" onClick={() => { setAssignDevice(d); setAssignProfileId(d.profile_id || ""); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                              <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
                            </button>
                            {d.profile_id && (
                              <button title="Unassign / Reset" onClick={() => updateDevice.mutate({ id: d.id, data: { status: "inactive", profile_id: null, assigned_at: null } })}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                                <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
                              </button>
                            )}
                            <button title="Delete" onClick={() => setDeleteConfirm(d)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredDevices.length === 0 && (
                <div className="text-center py-16 text-white/20">
                  <QrCode className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>No devices found</p>
                </div>
              )}
            </div>
          </div>

          {/* Edit inline */}
          {editingDevice && (
            <div className="rounded-2xl border p-5" style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.2)" }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">Edit: <span className="font-mono text-orange-400">{editingDevice.device_code}</span></h3>
                <button onClick={() => setEditingDevice(null)}><X className="w-5 h-5 text-white/40 hover:text-white" /></button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">Type</label>
                  <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputSt}
                    value={editingDevice.device_type} onChange={e => setEditingDevice(d => ({ ...d, device_type: e.target.value }))}>
                    {DEVICE_TYPES.map(t => <option key={t} value={t} style={{ background: navyCard }}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">Status</label>
                  <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputSt}
                    value={editingDevice.status} onChange={e => setEditingDevice(d => ({ ...d, status: e.target.value }))}>
                    {["active", "inactive", "lost"].map(s => <option key={s} value={s} style={{ background: navyCard }}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">Notes</label>
                  <input className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputSt}
                    placeholder="Optional description..."
                    value={editingDevice.description || ""} onChange={e => setEditingDevice(d => ({ ...d, description: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => updateDevice.mutate({ id: editingDevice.id, data: { device_type: editingDevice.device_type, status: editingDevice.status, description: editingDevice.description } })}
                  disabled={updateDevice.isPending} style={{ background: orange, color: "#fff" }} className="font-bold">
                  {updateDevice.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditingDevice(null)} className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── GENERATION ── */}
      {subTab === "generation" && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Single Device */}
            <div className="rounded-2xl border p-6" style={st}>
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-white">Generate Single Device</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">Device Code</label>
                  <input className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none" style={inputSt}
                    placeholder="BNG-0001" value={singleCode}
                    onChange={e => setSingleCode(e.target.value.toUpperCase())} />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">Device Type</label>
                  <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputSt}
                    value={singleType} onChange={e => setSingleType(e.target.value)}>
                    {DEVICE_TYPES.map(t => <option key={t} value={t} style={{ background: navyCard }}>{DEVICE_EMOJIS[t]} {t}</option>)}
                  </select>
                </div>
                <Button onClick={() => createDevice.mutate({ device_code: singleCode, device_type: singleType, status: "inactive" })}
                  disabled={createDevice.isPending || !singleCode}
                  style={{ background: orange, color: "#fff" }} className="w-full font-bold">
                  {createDevice.isPending ? "Creating..." : "Create Device"}
                </Button>
              </div>
            </div>

            {/* Bulk Generation */}
            <div className="rounded-2xl border p-6" style={st}>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white">Bulk Generate Devices</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">Prefix</label>
                  <input className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none" style={inputSt}
                    value={bulkPrefix} onChange={e => setBulkPrefix(e.target.value.toUpperCase())} />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">Start #</label>
                  <input type="number" className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none" style={inputSt}
                    value={bulkStart} onChange={e => setBulkStart(e.target.value)} min={1} />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">Count (max 100)</label>
                  <input type="number" className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none" style={inputSt}
                    value={bulkCount} onChange={e => setBulkCount(Math.min(100, parseInt(e.target.value) || 1))} min={1} max={100} />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">Type</label>
                  <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputSt}
                    value={bulkType} onChange={e => setBulkType(e.target.value)}>
                    {DEVICE_TYPES.map(t => <option key={t} value={t} style={{ background: navyCard }}>{DEVICE_EMOJIS[t]} {t}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-white/30 text-xs mb-3">
                Range: <span className="font-mono text-orange-400">{generateCode(bulkPrefix, bulkStart)} → {generateCode(bulkPrefix, parseInt(bulkStart) + bulkCount - 1)}</span>
              </p>
              <Button onClick={handleBulkGenerate} disabled={bulkGenerating}
                style={{ background: gold, color: "#071d47" }} className="w-full font-black">
                {bulkGenerating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating…</> : `Generate ${bulkCount} Devices`}
              </Button>
            </div>
          </div>

          {/* QR Code generation */}
          <div className="rounded-2xl border p-6" style={st}>
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white">Generate QR Codes</h3>
            </div>
            <p className="text-white/40 text-sm mb-4">Generate and preview QR codes for all devices. Prints a grid-ready A4 sheet.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {devices.slice(0, 8).map(d => (
                <div key={d.id} className="rounded-xl p-3 text-center border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <QRCell code={d.device_code} />
                  <p className="font-mono text-xs text-white mt-2 font-bold">{d.device_code}</p>
                  <p className="text-white/30 text-xs capitalize">{d.device_type}</p>
                </div>
              ))}
            </div>
            {devices.length > 8 && <p className="text-white/25 text-xs mb-4">…and {devices.length - 8} more devices</p>}
            <Button onClick={() => handlePrintQR()} style={{ background: "#7c3aed", color: "#fff" }} className="font-bold gap-2">
              <Printer className="w-4 h-4" /> Print All QR Codes
            </Button>
          </div>
        </div>
      )}

      {/* ── ASSIGNMENT ── */}
      {subTab === "assignment" && (
        <div className="space-y-4">
          <div className="rounded-2xl border p-5" style={st}>
            <div className="flex items-center gap-2 mb-4">
              <ArrowRightLeft className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white">Assign / Unassign Device</h3>
            </div>
            <p className="text-white/40 text-sm mb-5">Link or unlink a device to a user profile. Use the Unassign button to reset ownership.</p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Claimed devices */}
              <div>
                <h4 className="text-white/50 text-xs font-bold uppercase mb-3">Claimed Devices ({devices.filter(d => d.profile_id).length})</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {devices.filter(d => d.profile_id).map(d => {
                    const profile = profiles.find(p => p.id === d.profile_id);
                    return (
                      <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <span>{DEVICE_EMOJIS[d.device_type]}</span>
                        <div className="flex-1">
                          <span className="font-mono font-bold text-sm text-white">{d.device_code}</span>
                          <p className="text-xs text-white/40">{profile?.display_name || "Unknown profile"}</p>
                        </div>
                        <button onClick={() => updateDevice.mutate({ id: d.id, data: { status: "inactive", profile_id: null, assigned_at: null } })}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                          Unassign
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unclaimed devices */}
              <div>
                <h4 className="text-white/50 text-xs font-bold uppercase mb-3">Unclaimed Devices ({devices.filter(d => !d.profile_id).length})</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {devices.filter(d => !d.profile_id).map(d => (
                    <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <span>{DEVICE_EMOJIS[d.device_type]}</span>
                      <div className="flex-1">
                        <span className="font-mono font-bold text-sm text-white">{d.device_code}</span>
                        <p className="text-xs text-white/40 capitalize">{d.device_type}</p>
                      </div>
                      <button onClick={() => { setAssignDevice(d); setAssignProfileId(""); }}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg"
                        style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVATION CENTER ── */}
      {subTab === "activation" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Pending Activations", value: pendingActivations.length, color: gold },
              { label: "Activated Devices", value: activatedDevices.length, color: "#22c55e" },
              { label: "Activation Rate", value: `${stats.total ? Math.round((activatedDevices.length / stats.total) * 100) : 0}%`, color: orange },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5 border" style={st}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1 text-white/40">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border p-5" style={st}>
            <h3 className="font-bold text-white mb-4">Activation Log (Latest)</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Device Code", "Type", "Owner", "Profile", "Activation Date"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activatedDevices.sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at)).map(d => {
                    const profile = profiles.find(p => p.id === d.profile_id);
                    return (
                      <tr key={d.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="px-4 py-3 font-mono font-black text-sm text-white">{d.device_code}</td>
                        <td className="px-4 py-3 text-sm text-white/60 capitalize">{DEVICE_EMOJIS[d.device_type]} {d.device_type}</td>
                        <td className="px-4 py-3">
                          {profile?.profile_photo
                            ? <img src={profile.profile_photo} className="w-7 h-7 rounded-full object-cover inline-block mr-2" alt="" />
                            : <span className="inline-block w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 text-xs font-black text-center leading-7 mr-2">{profile?.display_name?.charAt(0)}</span>
                          }
                          <span className="text-sm text-white/70">{profile?.display_name || "—"}</span>
                        </td>
                        <td className="px-4 py-3">
                          {profile && <a href={`/p/${profile.username}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: orange }}>{profile.username}</a>}
                        </td>
                        <td className="px-4 py-3 text-xs text-white/35">{d.assigned_at?.slice(0, 10)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {activatedDevices.length === 0 && <p className="text-center py-8 text-white/20 text-sm">No activations yet</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── LOST MODE CENTER ── */}
      {subTab === "lost" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Marked Lost", value: devices.filter(d => d.status === "lost").length, color: "#ef4444" },
              { label: "Finder Reports", value: lostReports.length, color: gold },
              { label: "Recovered", value: lostReports.filter(r => r.status === "recovered").length, color: "#22c55e" },
              { label: "Recovery Rate", value: `${lostReports.length ? Math.round((lostReports.filter(r => r.status === "recovered").length / lostReports.length) * 100) : 0}%`, color: orange },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5 border" style={st}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1 text-white/40">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Lost Devices */}
          <div className="rounded-2xl border p-5" style={st}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-white">Lost Devices</h3>
            </div>
            <div className="space-y-2">
              {devices.filter(d => d.status === "lost").map(d => {
                const profile = profiles.find(p => p.id === d.profile_id);
                return (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}>
                    <span className="text-lg">{DEVICE_EMOJIS[d.device_type]}</span>
                    <div className="flex-1">
                      <span className="font-mono font-black text-sm text-white">{d.device_code}</span>
                      <p className="text-xs text-white/40">{profile?.display_name || "No owner"}</p>
                    </div>
                    <button onClick={() => updateDevice.mutate({ id: d.id, data: { status: "active" } })}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                      Mark Recovered
                    </button>
                    <button onClick={() => updateDevice.mutate({ id: d.id, data: { status: "inactive", profile_id: null, assigned_at: null } })}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      Reset
                    </button>
                  </div>
                );
              })}
              {devices.filter(d => d.status === "lost").length === 0 && (
                <p className="text-center py-8 text-white/20 text-sm">No devices marked as lost</p>
              )}
            </div>
          </div>

          {/* Finder Reports */}
          <div className="rounded-2xl border p-5" style={st}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-white">Finder Reports</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Device Code", "Finder", "Contact", "Location", "Found At", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lostReports.map(r => (
                    <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="px-4 py-3 font-mono font-black text-sm text-white">{r.device_code}</td>
                      <td className="px-4 py-3 text-sm text-white/70">{r.finder_name || "—"}</td>
                      <td className="px-4 py-3">
                        {r.finder_phone && <p className="text-xs text-white/50">{r.finder_phone}</p>}
                        {r.finder_email && <p className="text-xs text-white/50">{r.finder_email}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/50">{r.finder_location || "—"}</td>
                      <td className="px-4 py-3 text-xs text-white/35">{r.scan_time?.slice(0, 10) || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${r.status === "recovered" ? "bg-green-500/20 text-green-400" : r.status === "contacted" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                          {r.status || "new"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lostReports.length === 0 && <p className="text-center py-8 text-white/20 text-sm">No finder reports yet</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {subTab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Total NFC Taps", value: analytics.length, color: orange },
              { label: "Total QR Scans", value: qrAnalytics.length, color: gold },
              { label: "Active Devices (with taps)", value: Object.keys(tapsByDevice).length, color: "#22c55e" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5 border" style={st}>
                <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1 text-white/40">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Most Active Devices */}
            <div className="rounded-2xl border p-5" style={st}>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-white">Most Active Devices</h3>
              </div>
              {mostActiveDevices.length === 0 ? (
                <p className="text-white/25 text-sm text-center py-8">No tap data yet</p>
              ) : (
                <div className="space-y-3">
                  {mostActiveDevices.map((d, i) => {
                    const profile = profiles.find(p => p.id === d.profile_id);
                    const taps = tapsByDevice[d.id] || 0;
                    const maxTaps = tapsByDevice[mostActiveDevices[0].id] || 1;
                    return (
                      <div key={d.id} className="flex items-center gap-3">
                        <span className="text-white/30 text-xs w-4 text-center">#{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs text-white font-bold">{d.device_code}</span>
                            <span className="text-xs font-black" style={{ color: orange }}>{taps} taps</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10">
                            <div className="h-1.5 rounded-full" style={{ width: `${(taps / maxTaps) * 100}%`, background: orange }} />
                          </div>
                          {profile && <p className="text-white/30 text-xs mt-1">{profile.display_name}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Device Activity */}
            <div className="rounded-2xl border p-5" style={st}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white">Recent NFC Activity</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analytics.slice(0, 15).map((a, i) => {
                  const device = devices.find(d => d.id === a.device_id);
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <Wifi className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-mono text-xs text-white">{device?.device_code || a.device_id?.slice(0, 8) || "Unknown"}</span>
                      </div>
                      <span className="text-white/25 text-xs">{a.created_at?.slice(0, 10)}</span>
                    </div>
                  );
                })}
                {analytics.length === 0 && <p className="text-white/25 text-sm text-center py-8">No analytics data yet</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MANUFACTURING TOOLS ── */}
      {subTab === "mfg" && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: QrCode, label: "Export QR Codes", desc: "Print a full-page grid of QR codes for all devices (A4 format).", color: "#7c3aed",
                action: () => handlePrintQR(), btn: "Print QR Sheet"
              },
              {
                icon: Download, label: "Export Device IDs", desc: "CSV file with all device codes, types, and current status.", color: gold,
                action: () => handleExportCSV(devices), btn: "Download CSV"
              },
              {
                icon: FileText, label: "Export NFC URLs", desc: "Full list of NFC redirect URLs for all devices.", color: "#22c55e",
                action: () => {
                  const rows = [["Device Code", "NFC URL", "Type", "Status"]];
                  devices.forEach(d => rows.push([d.device_code, `https://bingooconnect.com/n/${d.device_code}`, d.device_type, d.status]));
                  const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url; a.download = "bingoo-nfc-urls.csv"; a.click();
                  URL.revokeObjectURL(url);
                  toast.success("NFC URLs exported!");
                }, btn: "Download URLs"
              },
              {
                icon: Printer, label: "Export Print Sheet", desc: "Printable list of all device codes and URLs for factory use.", color: "#06b6d4",
                action: handlePrintSheet, btn: "Print Sheet"
              },
              {
                icon: Package, label: "Manufacturer Package", desc: "Complete manufacturer package: device codes, URLs, QR image links, and status.", color: orange,
                action: handleExportMfgPackage, btn: "Download Package"
              },
              {
                icon: Layers, label: "Inactive Devices Only", desc: "Export only unclaimed/inactive devices ready to be shipped.", color: "#ec4899",
                action: () => handleExportCSV(devices.filter(d => d.status === "inactive")), btn: "Export Inactive"
              },
            ].map(tool => (
              <div key={tool.label} className="rounded-2xl border p-5" style={st}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tool.color + "20" }}>
                    <tool.icon className="w-5 h-5" style={{ color: tool.color }} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{tool.label}</h4>
                    <p className="text-xs text-white/40 mt-0.5">{tool.desc}</p>
                  </div>
                </div>
                <Button onClick={tool.action} className="font-bold gap-2 text-sm"
                  style={{ background: tool.color, color: tool.color === gold ? "#071d47" : "#fff" }}>
                  <Download className="w-4 h-4" /> {tool.btn}
                </Button>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border p-5" style={st}>
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-white/40" />
              <h4 className="font-bold text-white text-sm">Device Summary</h4>
            </div>
            <p className="text-white/40 text-xs">Total: <span className="text-white font-bold">{devices.length}</span> &nbsp;|&nbsp; Active: <span className="text-green-400 font-bold">{stats.active}</span> &nbsp;|&nbsp; Unclaimed: <span className="font-bold" style={{ color: gold }}>{stats.unclaimed}</span> &nbsp;|&nbsp; Lost: <span className="text-red-400 font-bold">{stats.lost}</span></p>
          </div>
        </div>
      )}

      {/* ── ASSIGN MODAL ── */}
      {assignDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl p-6 max-w-sm w-full border" style={{ background: "#0B2E6B", borderColor: "rgba(255,255,255,0.15)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-white">Assign Device</h3>
                <p className="text-xs text-white/40 font-mono mt-0.5">{assignDevice.device_code}</p>
              </div>
              <button onClick={() => setAssignDevice(null)}><X className="w-5 h-5 text-white/40 hover:text-white" /></button>
            </div>
            <label className="text-white/50 text-xs font-bold block mb-1">Select Profile</label>
            <select className="w-full px-3 py-2.5 rounded-xl text-sm outline-none mb-4" style={inputSt}
              value={assignProfileId} onChange={e => setAssignProfileId(e.target.value)}>
              <option value="" style={{ background: navyCard }}>— Select a profile —</option>
              {profiles.map(p => <option key={p.id} value={p.id} style={{ background: navyCard }}>{p.display_name} (@{p.username})</option>)}
            </select>
            <div className="flex gap-2">
              <Button onClick={() => updateDevice.mutate({ id: assignDevice.id, data: { profile_id: assignProfileId, status: "active", assigned_at: new Date().toISOString() } })}
                disabled={!assignProfileId || updateDevice.isPending}
                style={{ background: orange, color: "#fff" }} className="flex-1 font-bold">
                {updateDevice.isPending ? "Assigning…" : "Assign"}
              </Button>
              <Button variant="outline" onClick={() => setAssignDevice(null)} className="flex-1 border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">Delete Device</h3>
                <p className="text-xs text-slate-400 font-mono">{deleteConfirm.device_code}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">This will permanently delete this NFC device. Anyone who scans it will see a "not found" page.</p>
            <div className="flex gap-2">
              <Button onClick={() => deleteDevice.mutate(deleteConfirm.id)} disabled={deleteDevice.isPending}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold">
                {deleteDevice.isPending ? "Deleting..." : "Yes, Delete"}
              </Button>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}