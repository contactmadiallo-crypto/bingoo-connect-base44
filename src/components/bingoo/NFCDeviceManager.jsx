import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MobileSelect } from "@/components/ui/mobile-select";
import { deviceUrl as buildDeviceUrl, activationUrl as buildActivationUrl } from "@/lib/nfcUrl";
import { PRODUCTS } from "@/lib/shopProducts";
import { toast } from "sonner";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";
import { publicProfileUrl } from "@/lib/publicProfileUrl";
import {
  Plus, Download, Printer, Search, Edit, Trash2, QrCode, X, Loader2,
  BarChart3, Wifi, AlertTriangle, Activity, Package, MapPin,
  ArrowRightLeft, RotateCcw, Clock, Layers,
  RefreshCw, History, Copy, ExternalLink
} from "lucide-react";

const DEVICE_TYPES = ["card", "keychain", "bracelet", "stand", "badge", "sticker", "tag"];
const DEVICE_EMOJIS = { card: "💳", keychain: "🔑", bracelet: "📿", stand: "🪧", badge: "🎫", sticker: "🏷️", tag: "🏷️" };

// Admin generation must use the same physical products customers see in Shop.
// This keeps product identity stable from manufacturing → activation → profile/asset.
const ADMIN_PRODUCTS = PRODUCTS.filter(p => p.availability === "active" && p.stripeReady);
const DEFAULT_PRODUCT_ID = ADMIN_PRODUCTS.find(p => p.id === "nfc-key-fob")?.id || ADMIN_PRODUCTS[0]?.id || "";

function productToDeviceData(product) {
  return {
    device_type: product?.category || "card",
    product_sku: product?.id || "",
    product_name: product?.name || "NFC Device",
    product_image: product?.image || "",
    status: "available",
  };
}
const ALL_STATUSES = ["available", "assigned", "active", "lost", "disabled", "replaced"];

const STATUS_COLORS = {
  available: "bg-white/10 text-white/50 border-white/10",
  assigned:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  active:    "bg-green-500/20 text-green-400 border-green-500/30",
  lost:      "bg-red-500/20 text-red-400 border-red-500/30",
  disabled:  "bg-orange-500/20 text-orange-400 border-orange-500/30",
  replaced:  "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const orange = "#f97316";
const gold = "#FDBA21";
const navyCard = "#0b2149";

function padCode(n) { return `BG-${String(n).padStart(6, "0")}`; }

function QRCell({ code }) {
  const url = buildDeviceUrl(code);
  return (
    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`}
      alt={code} className="w-10 h-10 rounded-md bg-white p-0.5" />
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[status] || "bg-white/10 text-white/40"}`}>
      {status}
    </span>
  );
}

const SUB_TABS = [
  { id: "overview", key: "nfc_admin_dashboard", icon: BarChart3 },
  { id: "devices", key: "nfc_admin_all_devices", icon: Layers },
  { id: "generation", key: "nfc_admin_generate", icon: Plus },
  { id: "assignment", key: "nfc_admin_assignment", icon: ArrowRightLeft },
  { id: "replacement", key: "nfc_admin_replacement", icon: RefreshCw },
  { id: "lost", key: "nfc_admin_lost_mode", icon: AlertTriangle },
  { id: "analytics", key: "nfc_admin_analytics", icon: Activity },
  { id: "audit", key: "nfc_admin_audit", icon: History },
  { id: "mfg", key: "nfc_admin_mfg_export", icon: Package },
];

const inputSt = { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" };
const cardSt  = { background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" };

function DarkSelect({ value, onValueChange, items, placeholder, ariaLabel }) {
  return (
    <MobileSelect
      value={value}
      onValueChange={onValueChange}
      options={items}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      className="w-full rounded-xl text-sm"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
    />
  );
}

async function writeAuditLog(fields) {
  try {
    await base44.entities.DeviceAuditLog.create(fields);
  } catch {}
}

export default function NFCDeviceManager({ profiles = [], currentUser }) {
  const { language } = useI18n();
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingDevice, setEditingDevice] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [assignDevice, setAssignDevice] = useState(null);
  const [assignProfileId, setAssignProfileId] = useState("");
  const [replaceDevice, setReplaceDevice] = useState(null);
  const [replaceNewCode, setReplaceNewCode] = useState("");
  const [replaceType, setReplaceType] = useState("card");

  // Generation state
  const [singleCode, setSingleCode] = useState("");
  const [singleProductId, setSingleProductId] = useState(DEFAULT_PRODUCT_ID);
  const [singleGenerating, setSingleGenerating] = useState(false);
  const [singleGeneratingCode, setSingleGeneratingCode] = useState("");
  const [lastGeneratedDevice, setLastGeneratedDevice] = useState(null);
  const [bulkStart, setBulkStart] = useState("");
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkProductId, setBulkProductId] = useState(DEFAULT_PRODUCT_ID);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const { data: devices = [] } = useQuery({
    queryKey: ["nfc-manager-devices"],
    queryFn: () => base44.entities.NFCDevice.list("-created_date", 2000),
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

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["device-audit-logs"],
    queryFn: () => base44.entities.DeviceAuditLog.list("-created_date", 500),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["nfc-manager-devices"] });

  const createDevice = useMutation({
    mutationFn: async (data) => {
      // Re-check the database immediately before creation. This protects against
      // stale Admin tabs and accidental rapid clicks using the same BG code.
      const existing = await base44.entities.NFCDevice.filter({ device_code: data.device_code }, "-created_date", 20);
      if ((existing || []).some(d => d.status !== "retired")) throw new Error(`${data.device_code} already exists. Refreshing inventory instead.`);
      return base44.entities.NFCDevice.create(data);
    },
    onSuccess: async (d) => {
      await writeAuditLog({ device_id: d.id, device_code: d.device_code, action: "generated", performed_by: currentUser?.id, performed_by_name: currentUser?.full_name, new_status: "available" });
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["device-audit-logs"] });
      setSingleCode("");
      setLastGeneratedDevice(d);
      toast.success(`${d.device_code} created successfully`);
    },
    onError: (e) => { invalidate(); setLastGeneratedDevice(null); toast.error(e.message); },
    onSettled: () => { setSingleGenerating(false); setSingleGeneratingCode(""); },
  });

  const updateDevice = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NFCDevice.update(id, data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["device-audit-logs"] });
      setEditingDevice(null);
      setAssignDevice(null);
      setAssignProfileId("");
      toast.success(t("nfc_admin_device_updated",language));
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteDevice = useMutation({
    mutationFn: (id) => base44.entities.NFCDevice.delete(id),
    onSuccess: () => { invalidate(); setDeleteConfirm(null); toast.success(t("nfc_admin_device_deleted",language)); },
    onError: (e) => toast.error(e.message),
  });

  // Next available BG code number
  const nextBgNumber = () => {
    const nums = devices
      .map(d => d.device_code?.match(/^BG-(\d+)$/)?.[1])
      .filter(Boolean)
      .map(Number);
    return nums.length ? Math.max(...nums) + 1 : 1;
  };

  const handleBulkGenerate = async () => {
    if (bulkGenerating) return;
    setBulkGenerating(true);
    const product = ADMIN_PRODUCTS.find(p => p.id === bulkProductId);
    if (!product) { toast.error(t("nfc_admin_choose_product",language)); setBulkGenerating(false); return; }
    const freshDevices = await base44.entities.NFCDevice.list("-created_date", 500);
    const existingCodes = new Set((freshDevices || []).filter(d => d.status !== "retired").map(d => d.device_code?.toUpperCase()));
    const toCreate = [];
    const requestedStart = parseInt(bulkStart);
    let index = Number.isFinite(requestedStart) && requestedStart > 0 ? requestedStart : nextBgNumber();
    const firstIndex = index;
    let created = 0;
    while (created < Math.min(bulkCount, 200)) {
      const code = padCode(index).toUpperCase();
      if (!existingCodes.has(code)) {
        toCreate.push({ device_code: code, ...productToDeviceData(product) });
        existingCodes.add(code);
        created++;
      }
      index++;
    }
    try {
      const createdDevices = await base44.entities.NFCDevice.bulkCreate(toCreate);
      for (const d of (createdDevices || [])) {
        await writeAuditLog({ device_id: d.id, device_code: d.device_code, action: "generated", performed_by: currentUser?.id, performed_by_name: currentUser?.full_name, new_status: "available", notes: `${product.name} · ${product.id}` });
      }
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["device-audit-logs"] });
      setBulkStart("");
      toast.success(`${toCreate.length} ${product.name} devices generated! (${padCode(firstIndex)} → ${padCode(index - 1)})`);
    } catch (e) { toast.error(t("nfc_admin_bulk_failed",language) + " " + e.message); }
    setBulkGenerating(false);
  };

  const handleAssign = async () => {
    if (!assignDevice || !assignProfileId) return;
    const profile = profiles.find(p => p.id === assignProfileId);
    const old = assignDevice.status;
    await updateDevice.mutateAsync({ id: assignDevice.id, data: { profile_id: assignProfileId, status: "assigned", assigned_at: new Date().toISOString() } });
    await writeAuditLog({ device_id: assignDevice.id, device_code: assignDevice.device_code, action: "assigned", performed_by: currentUser?.id, performed_by_name: currentUser?.full_name, profile_id: assignProfileId, profile_name: profile?.display_name, old_status: old, new_status: "assigned" });
    queryClient.invalidateQueries({ queryKey: ["device-audit-logs"] });
  };

  const handleUnassign = async (device) => {
    const old = device.status;
    await updateDevice.mutateAsync({ id: device.id, data: { status: "available", profile_id: null, assigned_at: null } });
    await writeAuditLog({ device_id: device.id, device_code: device.device_code, action: "unassigned", performed_by: currentUser?.id, performed_by_name: currentUser?.full_name, old_status: old, new_status: "available" });
    queryClient.invalidateQueries({ queryKey: ["device-audit-logs"] });
  };

  const handleReplace = async () => {
    if (!replaceDevice || !replaceNewCode.trim()) return;
    const newCode = replaceNewCode.trim().toUpperCase();
    if (devices.some(d => d.device_code === newCode)) { toast.error(t("nfc_admin_code_exists",language)); return; }
    // Mark old as replaced
    await base44.entities.NFCDevice.update(replaceDevice.id, { status: "replaced", replaced_by_code: newCode });
    // Create new device with same profile
    const newDevice = await base44.entities.NFCDevice.create({
      device_code: newCode,
      device_type: replaceType,
      status: replaceDevice.profile_id ? "active" : "available",
      profile_id: replaceDevice.profile_id || null,
      assigned_at: replaceDevice.profile_id ? new Date().toISOString() : null,
    });
    await writeAuditLog({ device_id: replaceDevice.id, device_code: replaceDevice.device_code, action: "replaced", performed_by: currentUser?.id, performed_by_name: currentUser?.full_name, notes: `Replaced by ${newCode}`, old_status: replaceDevice.status, new_status: "replaced" });
    await writeAuditLog({ device_id: newDevice.id, device_code: newCode, action: "generated", performed_by: currentUser?.id, performed_by_name: currentUser?.full_name, notes: `Replacement for ${replaceDevice.device_code}`, new_status: newDevice.status });
    invalidate();
    queryClient.invalidateQueries({ queryKey: ["device-audit-logs"] });
    setReplaceDevice(null);
    setReplaceNewCode("");
    toast.success(`Device ${replaceDevice.device_code} replaced with ${newCode}!`);
  };

  const handleExportCSV = (devList = null) => {
    const list = devList || filteredDevices;
    const rows = [["Device ID", "Device Code", "Type", "Status", "Owner", "Profile Username", "Activation Date", "NFC URL"]];
    list.forEach(d => {
      const profile = profiles.find(p => p.id === d.profile_id);
      rows.push([d.id, d.device_code, d.device_type, d.status, profile?.display_name || "Unclaimed", profile?.username || "", d.assigned_at?.slice(0, 10) || "", buildDeviceUrl(d.device_code)]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bingoo-nfc-devices.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success(t("nfc_admin_csv_exported",language));
  };

  const handleExportMfg = () => {
    const rows = [["Device Code", "NFC URL", "QR Image URL", "Device Type", "Status"]];
    devices.forEach(d => {
      const url = buildDeviceUrl(d.device_code);
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      rows.push([d.device_code, url, qr, d.device_type, d.status]);
    });
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bingoo-manufacturer-export.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success(t("nfc_admin_mfg_downloaded",language));
  };

  const handlePrintQR = (devList = null) => {
    const list = (devList || filteredDevices).slice(0, 200);
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Bingoo NFC QR Codes</title>
      <style>body{font-family:monospace;background:#fff;margin:0}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px}
      .card{border:1px solid #ddd;border-radius:8px;padding:10px;text-align:center;break-inside:avoid}.card img{width:90px;height:90px}
      .code{font-size:10px;font-weight:bold;margin-top:5px}.type{font-size:9px;color:#888}.url{font-size:8px;color:#555;word-break:break-all;margin-top:2px}
      @media print{@page{size:A4 portrait;margin:8mm}}</style></head><body><div class="grid">`);
    list.forEach(d => {
      const url = buildDeviceUrl(d.device_code);
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      w.document.write(`<div class="card"><img src="${qr}" alt="${d.device_code}" /><div class="code">${d.device_code}</div><div class="type">${d.device_type}</div><div class="url">${url}</div></div>`);
    });
    w.document.write("</div></body></html>");
    w.document.close();
    w.onload = () => w.print();
  };

  const filteredDevices = devices
    .filter(d => statusFilter === "all" || d.status === statusFilter)
    .filter(d => typeFilter === "all" || d.device_type === typeFilter)
    .filter(d => !search || d.device_code?.toLowerCase().includes(search.toLowerCase()) || profiles.find(p => p.id === d.profile_id)?.display_name?.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: devices.length,
    available: devices.filter(d => d.status === "available").length,
    assigned: devices.filter(d => d.status === "assigned").length,
    active: devices.filter(d => d.status === "active").length,
    lost: devices.filter(d => d.status === "lost").length,
    disabled: devices.filter(d => d.status === "disabled").length,
    replaced: devices.filter(d => d.status === "replaced").length,
  };

  const tapsByDevice = analytics.reduce((acc, a) => { if (a.device_id) acc[a.device_id] = (acc[a.device_id] || 0) + 1; return acc; }, {});
  const mostActiveDevices = devices.filter(d => tapsByDevice[d.id]).sort((a, b) => (tapsByDevice[b.id] || 0) - (tapsByDevice[a.id] || 0)).slice(0, 5);
  const recentActivity = devices.filter(d => d.assigned_at).sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at)).slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Sub-tab Navigation */}
      <div className="rounded-2xl p-1 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="w-full min-w-0 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="flex w-max min-w-full gap-1 px-1 whitespace-nowrap">
            {SUB_TABS.map(st => (
              <button key={st.id} onClick={() => setSubTab(st.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all"
                style={{ background: subTab === st.id ? orange : "transparent", color: subTab === st.id ? "#fff" : "rgba(255,255,255,0.4)" }}>
                <st.icon className="w-3.5 h-3.5" />{t(st.key,language)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── DASHBOARD OVERVIEW ── */}
      {subTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: t("nfc_admin_total",language), value: stats.total, color: orange },
              { label: t("nfc_admin_available",language), value: stats.available, color: "rgba(255,255,255,0.4)" },
              { label: t("nfc_admin_assigned",language), value: stats.assigned, color: "#60a5fa" },
              { label: t("nfc_admin_active",language), value: stats.active, color: "#22c55e" },
              { label: t("nfc_admin_lost",language), value: stats.lost, color: "#ef4444" },
              { label: t("nfc_admin_disabled",language), value: stats.disabled, color: "#f97316" },
              { label: t("nfc_admin_replaced",language), value: stats.replaced, color: "#a78bfa" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4 border" style={cardSt}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5 text-white/40">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-5" style={cardSt}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-orange-400" />
                <h3 className="font-black text-white">{t("nfc_admin_recent_activations",language)}</h3>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-8">{t("nfc_admin_no_activations",language)}</p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map(d => {
                    const profile = profiles.find(p => p.id === d.profile_id);
                    return (
                      <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <span className="text-lg">{DEVICE_EMOJIS[d.device_type] || "📱"}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-mono font-black text-sm text-white">{d.device_code}</span>
                          <p className="text-xs text-white/30 truncate">{profile?.display_name || t("nfc_admin_unclaimed",language)}</p>
                        </div>
                        <StatusBadge status={d.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl border p-5" style={cardSt}>
              <h4 className="text-white/50 text-xs font-bold uppercase mb-3">{t("nfc_admin_type_breakdown",language)}</h4>
              {DEVICE_TYPES.map(type => {
                const count = devices.filter(d => d.device_type === type).length;
                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={type} className="flex items-center gap-2 mb-2">
                    <span className="w-5">{DEVICE_EMOJIS[type]}</span>
                    <span className="text-xs text-white/50 capitalize w-16">{type}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/10">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: orange }} />
                    </div>
                    <span className="text-xs text-white/40 w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ALL DEVICES ── */}
      {subTab === "devices" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                placeholder={t("nfc_admin_search",language)} value={search} onChange={e => setSearch(e.target.value)} style={inputSt} />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {["all", ...ALL_STATUSES].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
                  style={{ background: statusFilter === s ? orange : "rgba(255,255,255,0.07)", color: statusFilter === s ? "#fff" : "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {["all", ...DEVICE_TYPES].map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
                  style={{ background: typeFilter === t ? gold : "rgba(255,255,255,0.07)", color: typeFilter === t ? "#071A3D" : "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {t === "all" ? "All" : DEVICE_EMOJIS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-white/30 text-xs">{filteredDevices.length} of {devices.length} devices</p>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button onClick={() => handleExportCSV()} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-white/15 text-white/50 hover:text-white hover:bg-white/8 transition-all flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={() => handlePrintQR()} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-white/15 text-white/50 hover:text-white hover:bg-white/8 transition-all flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5" /> {t("nfc_admin_print_qr",language)}
              </button>
            </div>
          </div>

          <div className="hidden md:block rounded-2xl overflow-hidden border" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["QR", "Device Code", "Type", "Status", "Owner", "Assigned", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/30">{h}</th>
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
                        <td className="px-4 py-3"><QRCell code={d.device_code} /></td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-black text-sm text-white">{d.device_code}</span>
                          <p className="font-mono text-[10px] text-orange-400/80 mt-1 break-all">{buildDeviceUrl(d.device_code)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button type="button" onClick={() => { navigator.clipboard?.writeText(buildDeviceUrl(d.device_code)); toast.success(t("nfc_admin_url_copied",language)); }} className="text-[10px] font-bold text-white/40 hover:text-white inline-flex items-center gap-1"><Copy className="w-3 h-3" /> {t("nfc_admin_copy",language)}</button>
                            <a href={buildDeviceUrl(d.device_code)} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-white/40 hover:text-white inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {t("nfc_admin_test",language)}</a>
                          </div>
                          {d.replaced_by_code && <p className="text-xs text-purple-400 mt-0.5">→ {d.replaced_by_code}</p>}
                        </td>
                        <td className="px-4 py-3 text-sm capitalize text-white/60">{DEVICE_EMOJIS[d.device_type]} {d.device_type}</td>
                        <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                        <td className="px-4 py-3">
                          {profile ? (
                            <a href={publicProfileUrl(profile.username)} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-bold hover:underline" style={{ color: orange }}>{profile.display_name}</a>
                          ) : <span className="text-white/25 text-xs italic">{t("nfc_admin_unassigned",language)}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-white/35">{d.assigned_at?.slice(0, 10) || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button title={t("nfc_admin_edit",language)} aria-label={t("nfc_admin_edit_device",language)} onClick={() => setEditingDevice({ ...d })}
                              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10">
                              <Edit className="w-4 h-4 text-blue-400" />
                            </button>
                            <button title={t("nfc_admin_assign",language)} aria-label={t("nfc_admin_assign_device_aria",language)} onClick={() => { setAssignDevice(d); setAssignProfileId(d.profile_id || ""); }}
                              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10">
                              <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                            </button>
                            {d.profile_id && (
                              <button title={t("nfc_admin_unassign",language)} aria-label={t("nfc_admin_unassign_device",language)} onClick={() => handleUnassign(d)}
                                className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10">
                                <RotateCcw className="w-4 h-4 text-yellow-400" />
                              </button>
                            )}
                            <button title={t("nfc_admin_replace",language)} aria-label={t("nfc_admin_replace_device_aria",language)} onClick={() => { setReplaceDevice(d); setReplaceNewCode(padCode(nextBgNumber())); setReplaceType(d.device_type); }}
                              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10">
                              <RefreshCw className="w-4 h-4 text-cyan-400" />
                            </button>
                            <button title={t("nfc_admin_delete",language)} aria-label={t("nfc_admin_delete_device",language)} onClick={() => setDeleteConfirm(d)}
                              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10">
                              <Trash2 className="w-4 h-4 text-red-400" />
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
                  <p>{t("nfc_admin_no_devices",language)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredDevices.length === 0 ? (
              <div className="text-center py-16 text-white/20">
                <QrCode className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>{t("nfc_admin_no_devices",language)}</p>
              </div>
            ) : filteredDevices.map(d => {
              const profile = profiles.find(p => p.id === d.profile_id);
              return (
                <div key={d.id} className="rounded-2xl border p-4 space-y-3" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="font-mono font-black text-sm text-white">{d.device_code}</span>
                      <p className="font-mono text-[10px] text-orange-400/80 mt-1 break-all">{buildDeviceUrl(d.device_code)}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60 capitalize">
                    <span className="text-lg">{DEVICE_EMOJIS[d.device_type] || "📱"}</span>
                    {d.device_type}
                  </div>
                  {d.replaced_by_code && <p className="text-xs text-purple-400">→ {d.replaced_by_code}</p>}
                  <div>
                    {profile ? (
                      <a href={publicProfileUrl(profile.username)} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-bold hover:underline" style={{ color: orange }}>{profile.display_name}</a>
                    ) : <span className="text-white/25 text-xs italic">{t("nfc_admin_unassigned",language)}</span>}
                  </div>
                  {d.assigned_at && <p className="text-xs text-white/35">Assigned: {d.assigned_at.slice(0, 10)}</p>}
                  <div className="flex flex-col-reverse sm:flex-row gap-2">
                    <button type="button" onClick={() => { navigator.clipboard?.writeText(buildDeviceUrl(d.device_code)); toast.success(t("nfc_admin_url_copied",language)); }} className="min-h-[40px] px-3 rounded-lg border border-white/10 text-xs font-bold text-white/50 flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> {t("nfc_admin_copy_url",language)}</button>
                    <a href={buildDeviceUrl(d.device_code)} target="_blank" rel="noopener noreferrer" className="min-h-[40px] px-3 rounded-lg border border-white/10 text-xs font-bold text-white/50 flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> {t("nfc_admin_test",language)}</a>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    <button aria-label={language === "fr" ? "Modifier l’appareil" : "Edit device"} onClick={() => setEditingDevice({ ...d })}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10">
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button aria-label={language === "fr" ? "Attribuer l’appareil" : "Assign device"} onClick={() => { setAssignDevice(d); setAssignProfileId(d.profile_id || ""); }}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10">
                      <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                    </button>
                    {d.profile_id && (
                      <button aria-label={language === "fr" ? "Désattribuer l’appareil" : "Unassign device"} onClick={() => handleUnassign(d)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10">
                        <RotateCcw className="w-4 h-4 text-yellow-400" />
                      </button>
                    )}
                    <button aria-label={language === "fr" ? "Remplacer l’appareil" : "Replace device"} onClick={() => { setReplaceDevice(d); setReplaceNewCode(padCode(nextBgNumber())); setReplaceType(d.device_type); }}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10">
                      <RefreshCw className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button aria-label={language === "fr" ? "Supprimer l’appareil" : "Delete device"} onClick={() => setDeleteConfirm(d)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inline Edit */}
          {editingDevice && (
            <div className="rounded-2xl border p-5" style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.2)" }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white">{t("nfc_admin_edit_prefix",language)} <span className="font-mono text-orange-400">{editingDevice.device_code}</span></h3>
                <button onClick={() => setEditingDevice(null)} aria-label={t("nfc_admin_close_edit",language)} className="min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5 text-white/40 hover:text-white" /></button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_type",language)}</label>
                  <DarkSelect
                    value={editingDevice.device_type}
                    onValueChange={(v) => setEditingDevice(d => ({ ...d, device_type: v }))}
                    items={DEVICE_TYPES.map(t => ({ value: t, label: `${DEVICE_EMOJIS[t]} ${t}` }))}
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_status",language)}</label>
                  <DarkSelect
                    value={editingDevice.status}
                    onValueChange={(v) => setEditingDevice(d => ({ ...d, status: v }))}
                    items={ALL_STATUSES.map(s => ({ value: s, label: s }))}
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_notes",language)}</label>
                  <input className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={inputSt}
                    placeholder={t("nfc_admin_optional",language)} value={editingDevice.description || ""}
                    onChange={e => setEditingDevice(d => ({ ...d, description: e.target.value }))} />
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button onClick={() => updateDevice.mutate({ id: editingDevice.id, data: { device_type: editingDevice.device_type, status: editingDevice.status, description: editingDevice.description } })}
                  disabled={updateDevice.isPending} style={{ background: orange, color: "#fff" }} className="font-bold">
                  {updateDevice.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditingDevice(null)} className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">{t("nfc_admin_cancel",language)}</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── GENERATION ── */}
      {subTab === "generation" && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Single */}
            <div className="rounded-2xl border p-6" style={cardSt}>
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-white">{t("nfc_admin_generate_single",language)}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_device_code",language)}</label>
                  <input className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none" style={inputSt}
                    placeholder={padCode(nextBgNumber())} value={singleCode}
                    onChange={e => setSingleCode(e.target.value.toUpperCase())} />
                  <p className="text-white/25 text-xs mt-1">{t("nfc_admin_next_suggested",language)} <span className="font-mono text-orange-400">{padCode(nextBgNumber())}</span></p>
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_shop_product",language)}</label>
                  <DarkSelect
                    value={singleProductId}
                    onValueChange={setSingleProductId}
                    items={ADMIN_PRODUCTS.map(p => ({ value: p.id, label: `${p.name} · ${p.collection}` }))}
                  />
                </div>
                {(() => {
                  const product = ADMIN_PRODUCTS.find(p => p.id === singleProductId);
                  const code = (singleCode || padCode(nextBgNumber())).trim().toUpperCase();
                  const url = buildDeviceUrl(code);
                  return product ? (
                    <div className="rounded-xl p-3 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="flex items-center gap-3">
                        {product.image && <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-white/5" />}
                        <div className="min-w-0 flex-1"><p className="font-bold text-white text-sm">{product.name}</p><p className="text-xs text-white/35">SKU: {product.id} · {product.category}</p></div>
                      </div>
                      <div><p className="text-[10px] uppercase tracking-wider font-bold text-white/35">{t("nfc_admin_permanent_url_write",language)}</p><p className="font-mono text-xs text-orange-400 break-all mt-1">{url}</p></div>
                      <div><p className="text-[10px] uppercase tracking-wider font-bold text-white/25">{t("nfc_admin_activation_secondary",language)}</p><p className="font-mono text-[10px] text-white/40 break-all mt-1">{buildActivationUrl(code)}</p></div>
                      <div className="flex flex-col-reverse sm:flex-row gap-2">
                        <button type="button" onClick={() => { navigator.clipboard?.writeText(url); toast.success(t("nfc_admin_url_copied",language)); }} className="flex-1 min-h-10 rounded-lg border border-white/10 text-xs font-bold text-white/60 hover:text-white flex items-center justify-center gap-1.5"><Copy className="w-3.5 h-3.5" /> {t("nfc_admin_copy_url",language)}</button>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 min-h-10 rounded-lg border border-white/10 text-xs font-bold text-white/60 hover:text-white flex items-center justify-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> {t("nfc_admin_test_url",language)}</a>
                      </div>
                    </div>
                  ) : null;
                })()}
                <Button onClick={() => {
                  const product = ADMIN_PRODUCTS.find(p => p.id === singleProductId);
                  const code = (singleCode || padCode(nextBgNumber())).trim().toUpperCase();
                  if (!/^BG-\d{6}$/.test(code)) { toast.error(t("nfc_admin_code_format",language)); return; }
                  if (devices.some(d => d.device_code?.toUpperCase() === code)) { toast.error(t("nfc_admin_code_exists_plain",language)); return; }
                  if (!product) { toast.error(t("nfc_admin_choose_product",language)); return; }
                  if (singleGenerating || createDevice.isPending) return;
                  setLastGeneratedDevice(null);
                  setSingleGenerating(true);
                  setSingleGeneratingCode(code);
                  createDevice.mutate({ device_code: code, ...productToDeviceData(product) });
                }}
                  disabled={singleGenerating || createDevice.isPending}
                  style={{ background: orange, color: "#fff" }} className="w-full font-bold">
                  {(singleGenerating || createDevice.isPending) ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{language === "fr" ? "Génération" : "Generating"} {singleGeneratingCode || (singleCode || padCode(nextBgNumber())).trim().toUpperCase()}…</> : (language === "fr" ? "Créer l’appareil correspondant au Shop" : "Create Shop-Matched Device")}
                </Button>
                {lastGeneratedDevice && (
                  <div className="rounded-xl p-3" style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.28)" }}>
                    <p className="text-green-400 text-sm font-black">{lastGeneratedDevice.device_code} {t("nfc_admin_created",language)} ✓</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/35">{t("nfc_admin_permanent_url",language)}</p>
                    <p className="mt-1 font-mono text-xs text-orange-400 break-all">{buildDeviceUrl(lastGeneratedDevice.device_code)}</p>
                    <div className="flex gap-2 mt-3">
                      <button type="button" onClick={() => { navigator.clipboard?.writeText(buildDeviceUrl(lastGeneratedDevice.device_code)); toast.success(t("nfc_admin_url_copied",language)); }} className="flex-1 min-h-10 rounded-lg border border-white/10 text-xs font-bold text-white/60 hover:text-white flex items-center justify-center gap-1.5"><Copy className="w-3.5 h-3.5" /> {t("nfc_admin_copy_url",language)}</button>
                      <a href={buildDeviceUrl(lastGeneratedDevice.device_code)} target="_blank" rel="noopener noreferrer" className="flex-1 min-h-10 rounded-lg border border-white/10 text-xs font-bold text-white/60 hover:text-white flex items-center justify-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> {t("nfc_admin_open_test",language)}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bulk */}
            <div className="rounded-2xl border p-6" style={cardSt}>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white">{t("nfc_admin_bulk_generate",language)}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_start_number",language)}</label>
                  <input type="number" className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none" style={inputSt}
                    value={bulkStart} onChange={e => setBulkStart(e.target.value)} min={1} placeholder={String(nextBgNumber())} />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_count_max",language)}</label>
                  <input type="number" className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none" style={inputSt}
                    value={bulkCount} onChange={e => setBulkCount(Math.min(200, parseInt(e.target.value) || 1))} min={1} max={200} />
                </div>
                <div className="col-span-2">
                  <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_shop_product",language)}</label>
                  <DarkSelect
                    value={bulkProductId}
                    onValueChange={setBulkProductId}
                    items={ADMIN_PRODUCTS.map(p => ({ value: p.id, label: `${p.name} · ${p.collection}` }))}
                  />
                </div>
              </div>
              <p className="text-white/30 text-xs mb-1">
                {language === "fr" ? "Plage" : "Range"}: <span className="font-mono text-orange-400">{padCode(parseInt(bulkStart) || nextBgNumber())} → {padCode((parseInt(bulkStart) || nextBgNumber()) + bulkCount - 1)}</span>
              </p>
              <p className="text-white/25 text-xs mb-3">{t("nfc_admin_auto_start",language)}</p>
              <Button onClick={handleBulkGenerate} disabled={bulkGenerating}
                style={{ background: gold, color: "#071A3D" }} className="w-full font-black">
                {bulkGenerating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("nfc_admin_generating",language)}</> : `${t("nfc_admin_generate_devices",language)} (${bulkCount})`}
              </Button>
            </div>
          </div>

          {/* QR Preview */}
          <div className="rounded-2xl border p-6" style={cardSt}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">{t("nfc_admin_qr_preview",language)}</h3>
              </div>
              <Button onClick={() => handlePrintQR(devices)} style={{ background: "#7c3aed", color: "#fff" }} className="font-bold gap-2 text-xs">
                <Printer className="w-3.5 h-3.5" /> {t("nfc_admin_print_all_qr",language)}
              </Button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {devices.slice(0, 16).map(d => (
                <div key={d.id} className="rounded-xl p-2 text-center border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                  <QRCell code={d.device_code} />
                  <p className="font-mono text-xs text-white mt-1 font-bold truncate">{d.device_code}</p>
                </div>
              ))}
            </div>
            {devices.length > 16 && <p className="text-white/25 text-xs mt-3">{language === "fr" ? `…et ${devices.length - 16} autres appareils` : `…and ${devices.length - 16} more devices`}</p>}
          </div>
        </div>
      )}

      {/* ── ASSIGNMENT ── */}
      {subTab === "assignment" && (
        <div className="space-y-4">
          <div className="rounded-2xl border p-5" style={cardSt}>
            <h3 className="font-bold text-white mb-4">{t("nfc_admin_assign_unassign",language)}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white/50 text-xs font-bold uppercase mb-3">{language === "fr" ? "Attribués" : "Assigned"} ({devices.filter(d => d.profile_id).length})</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {devices.filter(d => d.profile_id).map(d => {
                    const profile = profiles.find(p => p.id === d.profile_id);
                    return (
                      <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <span>{DEVICE_EMOJIS[d.device_type]}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-mono font-bold text-sm text-white">{d.device_code}</span>
                          <p className="text-xs text-white/40 truncate">{profile?.display_name || (language === "fr" ? "Inconnu" : "Unknown")}</p>
                        </div>
                        <StatusBadge status={d.status} />
                        <button onClick={() => handleUnassign(d)}
                          aria-label={`Unassign device ${d.device_code}`}
                          className="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                          {language === "fr" ? "Désattribuer" : "Unassign"}
                        </button>
                      </div>
                    );
                  })}
                  {devices.filter(d => d.profile_id).length === 0 && <p className="text-white/25 text-sm py-4 text-center">{t("nfc_admin_no_assigned",language)}</p>}
                </div>
              </div>
              <div>
                <h4 className="text-white/50 text-xs font-bold uppercase mb-3">{language === "fr" ? "Disponibles" : "Available"} ({devices.filter(d => !d.profile_id && d.status === "available").length})</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {devices.filter(d => !d.profile_id && d.status === "available").map(d => (
                    <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <span>{DEVICE_EMOJIS[d.device_type]}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-mono font-bold text-sm text-white">{d.device_code}</span>
                        <p className="text-xs text-white/40 capitalize">{d.device_type}</p>
                      </div>
                      <button onClick={() => { setAssignDevice(d); setAssignProfileId(""); }}
                        aria-label={`Assign device ${d.device_code}`}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0"
                        style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                        {language === "fr" ? "Attribuer" : "Assign"}
                      </button>
                    </div>
                  ))}
                  {devices.filter(d => !d.profile_id && d.status === "available").length === 0 && <p className="text-white/25 text-sm py-4 text-center">{t("nfc_admin_no_available",language)}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REPLACEMENT ── */}
      {subTab === "replacement" && (
        <div className="space-y-4">
          <div className="rounded-2xl border p-5" style={cardSt}>
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white">{t("nfc_admin_device_replacement",language)}</h3>
            </div>
            <p className="text-white/40 text-sm mb-5">{t("nfc_admin_replace_help",language)}</p>

            <div className="space-y-3">
              <div>
                <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_select_replace",language)}</label>
                <DarkSelect
                  value={replaceDevice?.id || ""}
                  onValueChange={(v) => {
                    const d = devices.find(x => x.id === v);
                    setReplaceDevice(d || null);
                    if (d) { setReplaceNewCode(padCode(nextBgNumber())); setReplaceType(d.device_type); }
                  }}
                  placeholder={language === "fr" ? "— Sélectionner un appareil —" : "— Select a device —"}
                  items={devices.filter(d => d.status !== "replaced" && d.status !== "disabled").map(d => {
                    const profile = profiles.find(p => p.id === d.profile_id);
                    return { value: d.id, label: `${d.device_code} — ${profile?.display_name || t("nfc_admin_unassigned",language)} (${d.device_type})` };
                  })}
                />
              </div>

              {replaceDevice && (
                <>
                  <div className="p-4 rounded-xl border" style={{ background: "rgba(249,115,22,0.05)", borderColor: "rgba(249,115,22,0.2)" }}>
                    <p className="text-white/50 text-xs font-bold mb-2">{t("nfc_admin_old_device",language)}</p>
                    <div className="flex items-center gap-3">
                      <QRCell code={replaceDevice.device_code} />
                      <div>
                        <p className="font-mono font-black text-white">{replaceDevice.device_code}</p>
                        <p className="text-xs text-white/40">{replaceDevice.device_type} · {profiles.find(p => p.id === replaceDevice.profile_id)?.display_name || t("nfc_admin_unassigned",language)}</p>
                        <StatusBadge status={replaceDevice.status} />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_new_code",language)}</label>
                      <input className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none" style={inputSt}
                        placeholder={padCode(nextBgNumber())} value={replaceNewCode}
                        onChange={e => setReplaceNewCode(e.target.value.toUpperCase())} />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_new_type",language)}</label>
                      <DarkSelect
                        value={replaceType}
                        onValueChange={setReplaceType}
                        items={DEVICE_TYPES.map(t => ({ value: t, label: `${DEVICE_EMOJIS[t]} ${t}` }))}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
                    <p className="font-bold mb-1">{t("nfc_admin_what_happens",language)}</p>
                    <ul className="space-y-0.5 text-cyan-300/70">
                      <li>• Old device <strong>{replaceDevice.device_code}</strong> → marked as <strong>Replaced</strong></li>
                      <li>• New device <strong>{replaceNewCode || padCode(nextBgNumber())}</strong> → created as <strong>{replaceDevice.profile_id ? "Active" : "Available"}</strong></li>
                      {replaceDevice.profile_id && <li>• Profile assignment transfers automatically</li>}
                    </ul>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <Button onClick={handleReplace} disabled={updateDevice.isPending}
                      style={{ background: "#06b6d4", color: "#fff" }} className="font-bold gap-2">
                      <RefreshCw className="w-4 h-4" /> {t("nfc_admin_replace_device",language)}
                    </Button>
                    <Button variant="outline" onClick={() => { setReplaceDevice(null); setReplaceNewCode(""); }}
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent">{t("nfc_admin_cancel",language)}</Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Replaced devices list */}
          <div className="rounded-2xl border p-5" style={cardSt}>
            <h4 className="font-bold text-white mb-3">{t("nfc_admin_replaced_devices",language)} ({devices.filter(d => d.status === "replaced").length})</h4>
            {devices.filter(d => d.status === "replaced").length === 0 ? (
              <p className="text-white/25 text-sm text-center py-6">{t("nfc_admin_no_devices",language)}</p>
            ) : (
              <div className="space-y-2">
                {devices.filter(d => d.status === "replaced").map(d => (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                    style={{ background: "rgba(167,139,250,0.06)", borderColor: "rgba(167,139,250,0.15)" }}>
                    <span className="text-lg">{DEVICE_EMOJIS[d.device_type]}</span>
                    <div className="flex-1">
                      <span className="font-mono font-black text-sm text-white/70 line-through">{d.device_code}</span>
                      {d.replaced_by_code && <span className="text-xs text-purple-400 ml-2">→ {d.replaced_by_code}</span>}
                    </div>
                    <StatusBadge status="replaced" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── LOST MODE ── */}
      {subTab === "lost" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t("nfc_admin_marked_lost",language), value: devices.filter(d => d.status === "lost").length, color: "#ef4444" },
              { label: t("nfc_admin_finder_reports",language), value: lostReports.length, color: gold },
              { label: t("nfc_admin_recovered",language), value: lostReports.filter(r => r.status === "recovered").length, color: "#22c55e" },
              { label: t("nfc_admin_recovery_rate",language), value: `${lostReports.length ? Math.round((lostReports.filter(r => r.status === "recovered").length / lostReports.length) * 100) : 0}%`, color: orange },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5 border" style={cardSt}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1 text-white/40">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border p-5" style={cardSt}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-white">{t("nfc_admin_lost_devices",language)}</h3>
            </div>
            <div className="space-y-2">
              {devices.filter(d => d.status === "lost").map(d => {
                const profile = profiles.find(p => p.id === d.profile_id);
                return (
                  <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                    style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}>
                    <span className="text-lg">{DEVICE_EMOJIS[d.device_type]}</span>
                    <div className="flex-1">
                      <span className="font-mono font-black text-sm text-white">{d.device_code}</span>
                      <p className="text-xs text-white/40">{profile?.display_name || "No owner"}</p>
                    </div>
                    <button onClick={async () => {
                      await updateDevice.mutateAsync({ id: d.id, data: { status: "active" } });
                      await writeAuditLog({ device_id: d.id, device_code: d.device_code, action: "recovered", performed_by: currentUser?.id, performed_by_name: currentUser?.full_name, old_status: "lost", new_status: "active" });
                      queryClient.invalidateQueries({ queryKey: ["device-audit-logs"] });
                    }}
                      aria-label={`Mark device ${d.device_code} as recovered`}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                      Mark Recovered
                    </button>
                    <button onClick={() => { setReplaceDevice(d); setReplaceNewCode(padCode(nextBgNumber())); setReplaceType(d.device_type); setSubTab("replacement"); }}
                      aria-label={`Replace device ${d.device_code}`}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.25)" }}>
                      Replace
                    </button>
                  </div>
                );
              })}
              {devices.filter(d => d.status === "lost").length === 0 && (
                <p className="text-center py-8 text-white/20 text-sm">{t("nfc_admin_no_lost",language)}</p>
              )}
            </div>
          </div>

          {/* Finder Reports */}
          <div className="rounded-2xl border p-5" style={cardSt}>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-white">{t("nfc_admin_finder_reports",language)}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
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
                      <td className="px-4 py-3 text-xs text-white/50">{r.finder_phone || r.finder_email || "—"}</td>
                      <td className="px-4 py-3 text-xs text-white/50">{r.finder_location || "—"}</td>
                      <td className="px-4 py-3 text-xs text-white/35">{r.scan_time?.slice(0, 10) || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${r.status === "recovered" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                          {r.status || "new"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lostReports.length === 0 && <p className="text-center py-8 text-white/20 text-sm">{t("nfc_admin_no_finder",language)}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS ── */}
      {subTab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: t("nfc_admin_total_taps",language), value: analytics.length, color: orange },
              { label: t("nfc_admin_total_qr_scans",language), value: qrAnalytics.length, color: gold },
              { label: t("nfc_admin_devices_taps",language), value: Object.keys(tapsByDevice).length, color: "#22c55e" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5 border" style={cardSt}>
                <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-1 text-white/40">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-5" style={cardSt}>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-white">{t("nfc_admin_most_active",language)}</h3>
              </div>
              {mostActiveDevices.length === 0 ? (
                <p className="text-white/25 text-sm text-center py-8">{t("nfc_admin_no_tap_data",language)}</p>
              ) : mostActiveDevices.map((d, i) => {
                const profile = profiles.find(p => p.id === d.profile_id);
                const taps = tapsByDevice[d.id] || 0;
                const maxTaps = tapsByDevice[mostActiveDevices[0].id] || 1;
                return (
                  <div key={d.id} className="flex items-center gap-3 mb-3">
                    <span className="text-white/30 text-xs w-4">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-white font-bold">{d.device_code}</span>
                        <span className="text-xs font-black" style={{ color: orange }}>{taps} taps</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10">
                        <div className="h-1.5 rounded-full" style={{ width: `${(taps / maxTaps) * 100}%`, background: orange }} />
                      </div>
                      {profile && <p className="text-white/30 text-xs mt-0.5">{profile.display_name}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border p-5" style={cardSt}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white">{t("nfc_admin_recent_activity",language)}</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analytics.slice(0, 20).map((a, i) => {
                  const device = devices.find(d => d.id === a.device_id);
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <Wifi className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span className="font-mono text-xs text-white flex-1">{device?.device_code || "Unknown"}</span>
                      <span className="text-white/25 text-xs">{a.created_at?.slice(0, 10)}</span>
                    </div>
                  );
                })}
                {analytics.length === 0 && <p className="text-white/25 text-sm text-center py-8">{t("nfc_admin_no_analytics",language)}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIT LOG ── */}
      {subTab === "audit" && (
        <div className="space-y-4">
          <div className="rounded-2xl border p-5" style={cardSt}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">{t("nfc_admin_device_audit",language)}</h3>
              </div>
              <span className="text-white/30 text-xs">{auditLogs.length} entries</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    {["Device Code", "Action", "Performed By", "Profile", "Status Change", "Date"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="px-4 py-3 font-mono font-black text-sm text-white">{log.device_code}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          log.action === "activated" || log.action === "recovered" ? "bg-green-500/20 text-green-400"
                          : log.action === "lost_reported" || log.action === "deleted" || log.action === "disabled" ? "bg-red-500/20 text-red-400"
                          : log.action === "replaced" ? "bg-purple-500/20 text-purple-400"
                          : log.action === "assigned" ? "bg-blue-500/20 text-blue-400"
                          : "bg-white/10 text-white/50"
                        }`}>{log.action?.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-white/60">{log.performed_by_name || "System"}</td>
                      <td className="px-4 py-3 text-xs text-white/50">{log.profile_name || "—"}</td>
                      <td className="px-4 py-3 text-xs text-white/40">
                        {log.old_status && <><span className="line-through">{log.old_status}</span> → </>}{log.new_status}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/35">{log.created_date?.slice(0, 16)?.replace("T", " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {auditLogs.length === 0 && <p className="text-center py-8 text-white/20 text-sm">{t("nfc_admin_no_audit",language)}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── MANUFACTURING EXPORT ── */}
      {subTab === "mfg" && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Download, label: t("nfc_admin_mfg_package",language), desc: t("nfc_admin_mfg_package_desc",language), color: orange, action: handleExportMfg, btn: t("nfc_admin_download_package",language) },
              { icon: Download, label: t("nfc_admin_all_csv",language), desc: t("nfc_admin_all_csv_desc",language), color: gold, action: () => handleExportCSV(devices), btn: t("nfc_admin_export_all",language) },
              { icon: Download, label: t("nfc_admin_available_csv",language), desc: t("nfc_admin_available_csv_desc",language), color: "#22c55e", action: () => handleExportCSV(devices.filter(d => d.status === "available")), btn: t("nfc_admin_export_available",language) },
              { icon: Printer, label: t("nfc_admin_print_all_qr",language), desc: t("nfc_admin_print_all_desc",language), color: "#7c3aed", action: () => handlePrintQR(devices), btn: t("nfc_admin_print_qr_sheet",language) },
              { icon: Printer, label: t("nfc_admin_print_ids",language), desc: t("nfc_admin_print_ids_desc",language), color: "#06b6d4", action: () => {
                const w = window.open("", "_blank");
                w.document.write(`<html><head><title>Bingoo Device IDs</title><style>body{font-family:monospace;font-size:12px;padding:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:6px 10px;text-align:left}th{background:#f0f0f0}</style></head><body><h2>Bingoo NFC Devices — ${new Date().toLocaleDateString()}</h2><table><tr><th>Device Code</th><th>Type</th><th>Status</th><th>URL</th></tr>`);
                devices.forEach(d => { w.document.write(`<tr><td>${d.device_code}</td><td>${d.device_type}</td><td>${d.status}</td><td>${buildDeviceUrl(d.device_code)}</td></tr>`); });
                w.document.write("</table></body></html>");
                w.document.close();
                w.onload = () => w.print();
              }, btn: t("nfc_admin_print_sheet",language) },
            ].map(tool => (
              <div key={tool.label} className="rounded-2xl border p-5 flex items-start gap-4" style={cardSt}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tool.color + "20" }}>
                  <tool.icon className="w-5 h-5" style={{ color: tool.color }} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-sm">{tool.label}</h4>
                  <p className="text-xs text-white/40 mt-0.5 mb-3">{tool.desc}</p>
                  <Button onClick={tool.action} className="font-bold gap-2 text-xs"
                    style={{ background: tool.color, color: tool.color === gold ? "#071A3D" : "#fff" }}>
                    <Download className="w-3.5 h-3.5" /> {tool.btn}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border p-4" style={cardSt}>
            <p className="text-white/40 text-xs">
              Total: <span className="text-white font-bold">{devices.length}</span> &nbsp;|&nbsp;
              Available: <span className="font-bold" style={{ color: gold }}>{stats.available}</span> &nbsp;|&nbsp;
              Active: <span className="text-green-400 font-bold">{stats.active}</span> &nbsp;|&nbsp;
              Lost: <span className="text-red-400 font-bold">{stats.lost}</span> &nbsp;|&nbsp;
              Replaced: <span className="text-purple-400 font-bold">{stats.replaced}</span>
            </p>
          </div>
        </div>
      )}

      {/* ── ASSIGN MODAL ── */}
      {assignDevice && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 sm:max-w-sm w-full max-h-[92dvh] overflow-y-auto overscroll-contain border" style={{ background: navyCard, borderColor: "rgba(255,255,255,0.15)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-white">{t("nfc_admin_assign_device",language)}</h3>
                <p className="text-xs text-white/40 font-mono mt-0.5">{assignDevice.device_code}</p>
              </div>
              <button onClick={() => setAssignDevice(null)} aria-label={t("nfc_admin_close_assign",language)} className="min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5 text-white/40 hover:text-white" /></button>
            </div>
            <label className="text-white/50 text-xs font-bold block mb-1">{t("nfc_admin_select_profile",language)}</label>
            <div className="mb-4">
              <DarkSelect
                value={assignProfileId}
                onValueChange={setAssignProfileId}
                placeholder={language === "fr" ? "— Sélectionner un profil —" : "— Select a profile —"}
                items={profiles.map(p => ({ value: p.id, label: `${p.display_name} (@${p.username})` }))}
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Button onClick={handleAssign} disabled={!assignProfileId || updateDevice.isPending}
                style={{ background: orange, color: "#fff" }} className="flex-1 min-h-[44px] font-bold">
                {updateDevice.isPending ? t("nfc_admin_assigning",language) : t("nfc_admin_assign",language)}
              </Button>
              <Button variant="outline" onClick={() => setAssignDevice(null)} className="flex-1 min-h-[44px] border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">{t("nfc_admin_cancel",language)}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 sm:max-w-sm w-full max-h-[92dvh] overflow-y-auto overscroll-contain shadow-2xl border border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900">{t("nfc_admin_delete_confirm",language)}</h3>
                <p className="text-xs text-slate-400 font-mono">{deleteConfirm.device_code}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">{t("nfc_admin_delete_warning",language)}</p>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Button onClick={() => deleteDevice.mutate(deleteConfirm.id)} disabled={deleteDevice.isPending}
                className="flex-1 min-h-[44px] bg-red-600 hover:bg-red-500 text-white font-bold">
                {deleteDevice.isPending ? (language === "fr" ? "Suppression..." : "Deleting...") : (language === "fr" ? "Oui, supprimer" : "Yes, Delete")}
              </Button>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1 min-h-[44px]">{t("nfc_admin_cancel",language)}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}