import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, Download, Printer, Search, Edit, Trash2, Wifi, QrCode, RefreshCw, X, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { MobileSelect } from "@/components/ui/mobile-select";

const DEVICE_TYPES = ["card", "keychain", "bracelet", "stand", "badge", "sticker"];
const DEVICE_EMOJIS = { card: "💳", keychain: "🔑", bracelet: "📿", stand: "🪧", badge: "🎫", sticker: "🏷️" };
const STATUS_OPTIONS = ["active", "inactive", "lost"];
const STATUS_COLORS = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  inactive: "bg-white/10 text-white/40 border-white/10",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

const navyCard = "#0B2E6B";
const orange = "#FF7A00";
const gold = "#FDBA21";

function generateCode(prefix, index) {
  return `${prefix}${String(index).padStart(4, "0")}`;
}

function QRCodeCell({ deviceCode }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://bingooconnect.com/n/${deviceCode}`)}`;
  return <img src={qrUrl} alt={`QR-${deviceCode}`} className="w-12 h-12 rounded-lg bg-white p-0.5" />;
}

export default function AdminNFCManager({ profiles = [] }) {
  const queryClient = useQueryClient();
  const printRef = useRef(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Bulk generation state
  const [bulkPrefix, setBulkPrefix] = useState("BNG-");
  const [bulkStart, setBulkStart] = useState(1);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkType, setBulkType] = useState("card");
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const { data: devices = [], refetch } = useQuery({
    queryKey: ["nfc-manager-devices"],
    queryFn: () => base44.entities.NFCDevice.list("-created_date", 500),
  });

  const updateDevice = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NFCDevice.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["nfc-manager-devices"] }); setEditingDevice(null); toast.success("Device updated!"); },
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
    while (created < bulkCount) {
      const code = generateCode(bulkPrefix, index).toUpperCase();
      if (!existingCodes.has(code)) {
        toCreate.push({ device_code: code, device_type: bulkType, status: "inactive" });
        created++;
      }
      index++;
    }
    try {
      await base44.entities.NFCDevice.bulkCreate(toCreate);
      queryClient.invalidateQueries({ queryKey: ["nfc-manager-devices"] });
      toast.success(`${bulkCount} devices generated!`);
      setShowBulkForm(false);
    } catch (e) {
      toast.error("Bulk generation failed: " + e.message);
    }
    setBulkGenerating(false);
  };

  const handleExportCSV = () => {
    const filtered = filteredDevices;
    const rows = [["Device Code", "Type", "Status", "Profile", "URL", "Assigned At"]];
    filtered.forEach(d => {
      const profile = profiles.find(p => p.id === d.profile_id);
      rows.push([
        d.device_code,
        d.device_type,
        d.status,
        profile?.display_name || "",
        `https://bingooconnect.com/n/${d.device_code}`,
        d.assigned_at?.slice(0, 10) || "",
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bingoo-devices.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  const handlePrintQR = () => {
    const toprint = filteredDevices.slice(0, 50);
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Bingoo QR Codes</title>
      <style>body{font-family:monospace;background:#fff}
      .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding:16px}
      .card{border:1px solid #ddd;border-radius:8px;padding:12px;text-align:center;break-inside:avoid}
      .card img{width:100px;height:100px}
      .code{font-size:11px;font-weight:bold;margin-top:6px}
      .type{font-size:10px;color:#888}
      .url{font-size:9px;color:#555;word-break:break-all}
      @media print{@page{size:A4 portrait}}
      </style></head><body><div class="grid">`);
    toprint.forEach(d => {
      const url = `https://bingooconnect.com/n/${d.device_code}`;
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      w.document.write(`<div class="card">
        <img src="${qr}" alt="${d.device_code}" />
        <div class="code">${d.device_code}</div>
        <div class="type">${d.device_type}</div>
        <div class="url">${url}</div>
      </div>`);
    });
    w.document.write("</div></body></html>");
    w.document.close();
    w.onload = () => w.print();
    toast.success("Print dialog opened!");
  };

  const filteredDevices = devices
    .filter(d => statusFilter === "all" || d.status === statusFilter)
    .filter(d => !search || d.device_code?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: devices.length,
    active: devices.filter(d => d.status === "active").length,
    inactive: devices.filter(d => d.status === "inactive").length,
    lost: devices.filter(d => d.status === "lost").length,
  };

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Devices", value: stats.total, color: orange },
          { label: "Active", value: stats.active, color: "#22c55e" },
          { label: "Inactive (Unassigned)", value: stats.inactive, color: gold },
          { label: "Lost", value: stats.lost, color: "#ef4444" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border"
            style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5 text-white/40">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none"
            placeholder="Search device code..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all capitalize"
              style={{
                background: statusFilter === s ? orange : "rgba(255,255,255,0.07)",
                color: statusFilter === s ? "#fff" : "rgba(255,255,255,0.4)",
                border: "1px solid rgba(255,255,255,0.08)"
              }}>{s === "all" ? "All" : s}</button>
          ))}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button onClick={() => setShowBulkForm(true)}
            className="gap-2 font-bold text-sm" style={{ background: orange, color: "#fff" }}>
            <Plus className="w-4 h-4" /> Bulk Generate
          </Button>
          <Button onClick={handleExportCSV} variant="outline"
            className="gap-2 font-bold text-sm border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
            <Download className="w-4 h-4" /> CSV
          </Button>
          <Button onClick={handlePrintQR} variant="outline"
            className="gap-2 font-bold text-sm border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
            <Printer className="w-4 h-4" /> Print QR
          </Button>
        </div>
      </div>

      {/* Bulk Generate Form */}
      {showBulkForm && (
        <div className="rounded-2xl border p-6" style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.15)" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Bulk Generate Device Codes</h3>
            <button onClick={() => setShowBulkForm(false)} aria-label="Close"><X className="w-5 h-5 text-white/40 hover:text-white" /></button>
          </div>
          <div className="grid sm:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-white/50 text-xs font-bold block mb-1">Prefix</label>
              <input className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                value={bulkPrefix} onChange={e => setBulkPrefix(e.target.value.toUpperCase())} placeholder="BNG-" />
            </div>
            <div>
              <label className="text-white/50 text-xs font-bold block mb-1">Start Number</label>
              <input type="number" className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                value={bulkStart} onChange={e => setBulkStart(e.target.value)} min={1} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-bold block mb-1">Count (max 100)</label>
              <input type="number" className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                value={bulkCount} onChange={e => setBulkCount(Math.min(100, parseInt(e.target.value) || 1))} min={1} max={100} />
            </div>
            <div>
              <label className="text-white/50 text-xs font-bold block mb-1">Device Type</label>
              <MobileSelect
                value={bulkType}
                onValueChange={setBulkType}
                options={DEVICE_TYPES.map(t => ({ value: t, label: `${DEVICE_EMOJIS[t]} ${t}` }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleBulkGenerate} disabled={bulkGenerating}
              style={{ background: orange, color: "#fff" }} className="font-bold gap-2">
              {bulkGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Plus className="w-4 h-4" />Generate {bulkCount} Devices</>}
            </Button>
            <p className="text-white/30 text-xs">
              Will create: <span className="font-mono text-orange-400">
                {generateCode(bulkPrefix, bulkStart)} → {generateCode(bulkPrefix, parseInt(bulkStart) + bulkCount - 1)}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingDevice && (
        <div className="rounded-2xl border p-6" style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.2)" }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Edit: <span className="font-mono text-orange-400">{editingDevice.device_code}</span></h3>
            <button onClick={() => setEditingDevice(null)} aria-label="Close"><X className="w-5 h-5 text-white/40 hover:text-white" /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-white/50 text-xs font-bold block mb-1">Type</label>
              <MobileSelect
                value={editingDevice.device_type}
                onValueChange={(v) => setEditingDevice(d => ({ ...d, device_type: v }))}
                options={DEVICE_TYPES.map(t => ({ value: t, label: t }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-bold block mb-1">Status</label>
              <MobileSelect
                value={editingDevice.status}
                onValueChange={(v) => setEditingDevice(d => ({ ...d, status: v }))}
                options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-bold block mb-1">Assign to Profile ID</label>
              <input className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                placeholder="profile_id"
                value={editingDevice.profile_id || ""}
                onChange={e => setEditingDevice(d => ({ ...d, profile_id: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => updateDevice.mutate({ id: editingDevice.id, data: { device_type: editingDevice.device_type, status: editingDevice.status, profile_id: editingDevice.profile_id || null } })}
              disabled={updateDevice.isPending} style={{ background: orange, color: "#fff" }} className="font-bold gap-2">
              {updateDevice.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => setEditingDevice(null)} className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">Cancel</Button>
          </div>
        </div>
      )}

      {/* Devices Table */}
      <div className="rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["QR", "Code", "Type", "Status", "Profile", "Tap URL", "Assigned", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-4 text-xs font-bold uppercase tracking-wider text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map(d => {
                const profile = profiles.find(p => p.id === d.profile_id);
                return (
                  <tr key={d.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="px-4 py-3">
                      <QRCodeCell deviceCode={d.device_code} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-black text-sm text-white">{d.device_code}</span>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-white/60">
                      {DEVICE_EMOJIS[d.device_type] || "📱"} {d.device_type}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[d.status] || "bg-white/10 text-white/40"}`}>{d.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">
                      {profile ? (
                        <a href={`/p/${profile.username}`} target="_blank" rel="noopener noreferrer"
                          className="hover:underline text-orange-400 font-bold">{profile.display_name}</a>
                      ) : <span className="text-white/25 italic">Unclaimed</span>}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/n/${d.device_code}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-mono hover:underline" style={{ color: orange }}>
                        /n/{d.device_code}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/35">{d.assigned_at?.slice(0, 10) || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="ghost" className="min-h-[44px] min-w-[44px] p-0 hover:bg-white/10" aria-label="Edit device"
                          onClick={() => setEditingDevice({ ...d })}>
                          <Edit className="w-3.5 h-3.5 text-blue-400" />
                        </Button>
                        <Button size="sm" variant="ghost" className="min-h-[44px] min-w-[44px] p-0 hover:bg-white/10" aria-label="Delete device"
                          onClick={() => setDeleteConfirm(d)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                        {d.status === "active" && d.profile_id && (
                          <Button size="sm" variant="ghost" className="min-h-[44px] min-w-[44px] p-0 hover:bg-white/10"
                            title="Reset to unclaimed" aria-label="Reset to unclaimed"
                            onClick={() => updateDevice.mutate({ id: d.id, data: { status: "inactive", profile_id: null, assigned_at: null } })}>
                            <RefreshCw className="w-3.5 h-3.5 text-yellow-400" />
                          </Button>
                        )}
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
              <p className="text-xs mt-1">Generate devices using "Bulk Generate"</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
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
            <p className="text-sm text-slate-600 mb-5">This will permanently delete this NFC device. Anyone who scans it will get a "not found" page.</p>
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