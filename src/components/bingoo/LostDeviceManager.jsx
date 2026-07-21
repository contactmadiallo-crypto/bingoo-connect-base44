import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, CheckCircle2, MapPin, Phone, Mail, MessageSquare,
  CreditCard, Key, Award, Shield, Wifi, Clock, User, ChevronDown, ChevronUp,
  Trash2, ExternalLink, Link2, Unlink, RefreshCw, Edit2, Package, Smartphone, Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getDeviceTypeLabel } from '@/lib/deviceTypes';

const DEVICE_ICONS = {
  card: CreditCard, metal_card: CreditCard, keychain: Key, bracelet: Award,
  stand: Shield, badge: Wifi, sticker: Smartphone, tag: Tag,
};

const isLost = (d) => d.status === "lost";

export default function LostDeviceManager({ profileId, userId, isDark, tr = {} }) {
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState("devices");
  const [expandedDeviceId, setExpandedDeviceId] = useState(null);

  const headText = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-white/60" : "text-slate-500";
  const cardCls = isDark ? "bg-white/5 border border-white/10" : "bg-white border border-slate-100";

  // ── Data: profiles (for assigned target lookup) ──
  const { data: userProfiles = [] } = useQuery({
    queryKey: ["user-profiles-lost", userId],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: userId }),
    enabled: !!userId,
  });

  const profileMap = useMemo(() => {
    const m = {};
    userProfiles.forEach(p => { m[p.id] = p; });
    return m;
  }, [userProfiles]);

  // ── Data: NFC devices ──
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ["my-devices-lost", userId, [...userProfiles.map(p => p.id)].sort().join(",")],
    queryFn: async () => {
      if (!userProfiles.length) return [];
      const all = await Promise.all(
        userProfiles.map(p => base44.entities.NFCDevice.filter({ profile_id: p.id }))
      );
      return all.flat();
    },
    enabled: !!userId && userProfiles.length > 0,
  });

  // ── Data: Assets ──
  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["my-assets-lost", userId],
    queryFn: () => base44.entities.AssetItem.filter({ owner_user_id: userId }, "-created_date", 100),
    enabled: !!userId,
  });

  // ── Data: Lost reports (profile-owned via owner_profile_id + asset-owned via owner_user_id) ──
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["lost-reports", profileId, userId],
    queryFn: async () => {
      const byProfile = profileId ? await base44.entities.LostItemReport.filter({ owner_profile_id: profileId }) : [];
      const byUser = userId ? await base44.entities.LostItemReport.filter({ owner_user_id: userId }) : [];
      const map = {};
      [...byProfile, ...byUser].forEach(r => { map[r.id] = r; });
      return Object.values(map);
    },
    enabled: !!profileId || !!userId,
  });

  // ── Realtime ──
  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.NFCDevice.subscribe((event) => {
      if (event.type === "update") qc.invalidateQueries({ queryKey: ["my-devices-lost", userId] });
    });
    return unsub;
  }, [userId, qc]);

  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.AssetItem.subscribe((event) => {
      if (event.type === "update" || event.type === "delete")
        qc.invalidateQueries({ queryKey: ["my-assets-lost", userId] });
    });
    return unsub;
  }, [userId, qc]);

  useEffect(() => {
    if (!profileId) return;
    const unsub = base44.entities.LostItemReport.subscribe((event) => {
      const owns = event.data?.owner_profile_id === profileId || event.data?.owner_user_id === userId;
      if (event.type === "create" && owns) {
        qc.setQueryData(["lost-reports", profileId, userId], (old = []) => [event.data, ...old]);
        toast.info("📍 New finder report received!");
      }
      if (event.type === "update") {
        qc.setQueryData(["lost-reports", profileId, userId], (old = []) =>
          old.map(r => r.id === event.id ? { ...r, ...event.data } : r)
        );
      }
    });
    return unsub;
  }, [profileId, qc]);

  // ── Mutations ──
  const updateDevice = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NFCDevice.update(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["my-devices-lost", userId] });
      const prev = qc.getQueryData(["my-devices-lost", userId]);
      qc.setQueryData(["my-devices-lost", userId], (old = []) =>
        old.map(d => d.id === id ? { ...d, ...data } : d)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(["my-devices-lost", userId], ctx.prev);
      toast.error("Update failed, please try again.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] }),
  });

  const deleteDevice = useMutation({
    mutationFn: (id) => base44.entities.NFCDevice.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-devices-lost", userId] });
      toast.success("Device deleted");
    },
    onError: (e) => toast.error(e.message || "Delete failed — admin only"),
  });

  const updateReport = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LostItemReport.update(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["lost-reports", profileId, userId] });
      const prev = qc.getQueryData(["lost-reports", profileId, userId]);
      qc.setQueryData(["lost-reports", profileId, userId], (old = []) =>
        old.map(r => r.id === id ? { ...r, ...data } : r)
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(["lost-reports", profileId, userId], ctx.prev),
  });

  const deleteReport = useMutation({
    mutationFn: (id) => base44.entities.LostItemReport.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lost-reports", profileId, userId] });
      toast.success("Report deleted");
    },
    onError: (e) => toast.error(e.message || "Failed to delete report"),
  });

  const updateAsset = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AssetItem.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-assets-lost", userId] }),
  });

  const deleteAsset = useMutation({
    mutationFn: (id) => base44.entities.AssetItem.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-assets-lost", userId] });
      toast.success("Asset deleted");
    },
    onError: (e) => toast.error(e.message || "Failed to delete asset"),
  });

  const markLost = (d) => { updateDevice.mutate({ id: d.id, data: { status: "lost" } }); toast.error(`🔴 ${d.device_code} marked as Lost`); };
  const markActive = (d) => { updateDevice.mutate({ id: d.id, data: { status: "active" } }); toast.success(`✅ ${d.device_code} recovered`); };

  // ── Derived ──
  const lostDevices = devices.filter(isLost);
  const lostAssets = assets.filter(a => a.lost_mode_enabled);
  const totalLost = lostDevices.length + lostAssets.length;
  const newReports = reports.filter(r => r.status === "new");
  const getReportsForDevice = (code) => reports.filter(r => r.device_code === code);
  // Lost & Found view: devices in Lost Mode OR with found reports
  const lostOrReportedDevices = devices.filter(d => isLost(d) || getReportsForDevice(d.device_code).length > 0);

  const loading = devicesLoading && devices.length === 0;
  if (!userId || loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  // ── Device card renderer ──
  const renderDeviceCard = (device) => {
    const Icon = DEVICE_ICONS[device.device_type] || Smartphone;
    const lost = isLost(device);
    const deviceReports = getReportsForDevice(device.device_code);
    const isExpanded = expandedDeviceId === device.id;
    const assignedProfile = device.profile_id ? profileMap[device.profile_id] : null;
    const assignedName = assignedProfile?.display_name || "Unassigned";
    const productLabel = device.product_name || getDeviceTypeLabel(device.device_type);
    const destination = assignedProfile?.username ? `/p/${assignedProfile.username}` : null;
    const contactLabel = device.lost_show_phone ? "Phone shown" : "Phone hidden";

    return (
      <div key={device.id} className={`rounded-2xl ${cardCls} overflow-hidden transition-all`}>
        {/* Card header */}
        <div className="p-4 flex items-center gap-3 cursor-pointer select-none" onClick={() => setExpandedDeviceId(isExpanded ? null : device.id)}>
          {/* Product image or icon */}
          <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${lost ? "bg-red-100" : isDark ? "bg-white/10" : "bg-blue-50"}`}>
            {device.product_image ? (
              <img src={device.product_image} alt={productLabel} className="w-full h-full object-cover" />
            ) : (
              <Icon className={`w-5 h-5 ${lost ? "text-red-500" : "text-blue-600"}`} />
            )}
            {lost && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-bold text-sm ${headText}`}>{device.device_code}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${lost ? "bg-red-100 text-red-600 border-red-300" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
                {lost ? <><AlertTriangle className="w-2.5 h-2.5" /> LOST</> : <><CheckCircle2 className="w-2.5 h-2.5" /> ACTIVE</>}
              </span>
              {deviceReports.length > 0 && (
                <span className="bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                  📍 {deviceReports.length}
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${subText}`}>{productLabel} · → {assignedName}</p>
          </div>

          <div className="shrink-0" onClick={e => e.stopPropagation()}>
            {lost && (
              <Button size="sm" onClick={() => markActive(device)} className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-8 px-3 gap-1">
                <CheckCircle2 className="w-3 h-3" /> Turn Off
              </Button>
            )}
          </div>
          {isExpanded ? <ChevronUp className={`w-4 h-4 ${subText} shrink-0`} /> : <ChevronDown className={`w-4 h-4 ${subText} shrink-0`} />}
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className={`px-4 pb-4 border-t ${isDark ? "border-white/10" : "border-slate-100"} space-y-3`}>
            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
              <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>Type</p>
                <p className={`text-xs font-bold mt-0.5 ${headText}`}>{productLabel}</p>
              </div>
              <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>Assigned To</p>
                <p className={`text-xs font-bold mt-0.5 ${headText} truncate`}>{assignedName}</p>
              </div>
              <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>Destination</p>
                {destination ? (
                  <a href={destination} target="_blank" rel="noopener" className={`text-xs font-bold mt-0.5 text-blue-500 hover:underline flex items-center gap-1`}>
                    /p/{assignedProfile.username} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <p className={`text-xs font-bold mt-0.5 ${subText}`}>—</p>
                )}
              </div>
              <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>Contact</p>
                <p className={`text-xs font-bold mt-0.5 ${device.lost_show_phone ? "text-emerald-600" : "text-slate-400"}`}>{contactLabel}</p>
              </div>
            </div>

            {/* Actions row */}
            <div className="flex gap-1.5 flex-wrap">
              <Link to="/my-nfc-devices" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white">
                <Link2 className="w-3 h-3" /> Change Destination
              </Link>
              <button
                onClick={() => { if (confirm(`Delete device ${device.device_code}? This cannot be undone.`)) deleteDevice.mutate(device.id); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" /> Delete Device
              </button>
              <button
                onClick={() => updateDevice.mutate({ id: device.id, data: { lost_show_phone: !device.lost_show_phone } })}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${isDark ? "bg-white/5 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                <Phone className="w-3 h-3" /> {device.lost_show_phone ? "Hide Phone" : "Show Phone"}
              </button>
            </div>

            {/* Finder reports */}
            {deviceReports.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>Finder Reports</p>
                </div>
                {deviceReports.map(report => (
                  <div key={report.id} className={`p-2.5 rounded-lg ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className={`font-bold text-xs ${headText}`}>{report.finder_name || "Anonymous"}</p>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${report.status === "recovered" ? "bg-emerald-100 text-emerald-700" : report.status === "contacted" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {report.status === "recovered" ? "✓ Recovered" : report.status === "contacted" ? "Contacted" : "New"}
                        </span>
                        <button
                          onClick={() => { if (confirm("Delete this report?")) deleteReport.mutate(report.id); }}
                          className="text-red-400 hover:text-red-600 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {report.finder_phone && <a href={`tel:${report.finder_phone}`} className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1"><Phone className="w-3 h-3" /> {report.finder_phone}</a>}
                    {report.finder_email && <a href={`mailto:${report.finder_email}`} className="flex items-center gap-1 text-[11px] text-blue-500 font-semibold"><Mail className="w-3 h-3" /> {report.finder_email}</a>}
                    {report.finder_location && <p className={`flex items-center gap-1 text-[11px] ${subText} mt-0.5`}><MapPin className="w-3 h-3" /> {report.finder_location}</p>}
                    {report.finder_message && <p className={`text-[11px] ${subText} italic mt-0.5`}>"{report.finder_message}"</p>}
                    {report.status !== "recovered" && (
                      <div className="flex gap-1 mt-1.5">
                        {report.status === "new" && <button onClick={() => { updateReport.mutate({ id: report.id, data: { status: "contacted" } }); toast.success("Marked as contacted"); }} className="text-[10px] font-bold px-2 py-1 rounded bg-blue-600 text-white">Contacted</button>}
                        <button onClick={() => { updateReport.mutate({ id: report.id, data: { status: "recovered" } }); toast.success("Item recovered!"); }} className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-600 text-white">Recovered ✓</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Asset card renderer ──
  const renderAssetCard = (asset) => {
    const linkedDevice = devices.find(d => d.id === asset.nfc_device_id);
    const lost = asset.lost_mode_enabled;
    const destination = linkedDevice ? `/asset/${linkedDevice.device_code}` : null;

    return (
      <div key={asset.id} className={`rounded-2xl ${cardCls} overflow-hidden ${lost ? "ring-2 ring-orange-500" : ""}`}>
        <div className="p-4 flex items-center gap-3">
          <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${lost ? "bg-orange-100" : isDark ? "bg-white/10" : "bg-slate-100"}`}>
            {asset.photo_url ? (
              <img src={asset.photo_url} alt={asset.name} className="w-full h-full object-cover" />
            ) : (
              <Package className={`w-5 h-5 ${lost ? "text-orange-500" : subText}`} />
            )}
            {lost && <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white animate-pulse" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-bold text-sm ${headText}`}>{asset.name}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${lost ? "bg-orange-100 text-orange-600 border-orange-300" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
                {lost ? <><AlertTriangle className="w-2.5 h-2.5" /> LOST</> : <><CheckCircle2 className="w-2.5 h-2.5" /> SAFE</>}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${subText}`}>
              {asset.asset_type} · {linkedDevice ? linkedDevice.device_code : "No device linked"}
            </p>
          </div>

          <div className="shrink-0">
            {lost && (
              <Button size="sm" onClick={() => updateAsset.mutate({ id: asset.id, data: { lost_mode_enabled: false } })}
                className="rounded-xl text-xs font-bold h-8 px-3 gap-1 bg-emerald-600 hover:bg-emerald-500 text-white">
                <CheckCircle2 className="w-3 h-3" /> Found
              </Button>
            )}
          </div>
        </div>

        {/* Expanded details */}
        <div className={`px-4 pb-4 border-t ${isDark ? "border-white/10" : "border-slate-100"} space-y-2`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>Type</p>
              <p className={`text-xs font-bold mt-0.5 ${headText} capitalize`}>{asset.asset_type}</p>
            </div>
            <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>Destination</p>
              {destination ? (
                <a href={destination} target="_blank" rel="noopener" className="text-xs font-bold mt-0.5 text-blue-500 hover:underline flex items-center gap-1">
                  /asset/{linkedDevice.device_code} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              ) : <p className={`text-xs font-bold mt-0.5 ${subText}`}>—</p>}
            </div>
            <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>Contact</p>
              <p className={`text-xs font-bold mt-0.5 capitalize ${headText}`}>{asset.safe_contact_preference || "phone"}</p>
            </div>
          </div>

          {asset.finder_message && (
            <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${subText}`}>Finder Message</p>
              <p className={`text-xs mt-0.5 ${headText} italic`}>"{asset.finder_message}"</p>
            </div>
          )}

          <div className="flex gap-1.5 flex-wrap">
            <Link to="/my-assets" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white">
              <Edit2 className="w-3 h-3" /> Edit Asset
            </Link>
            {linkedDevice ? (
              <button onClick={() => updateAsset.mutate({ id: asset.id, data: { nfc_device_id: "" } })}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${isDark ? "bg-white/5 text-white" : "bg-slate-100 text-slate-600"}`}>
                <Unlink className="w-3 h-3" /> Unlink
              </button>
            ) : (
              <Link to="/my-assets" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: "#f97316" }}>
                <Link2 className="w-3 h-3" /> Link Device
              </Link>
            )}
            <button
              onClick={() => { if (confirm(`Delete asset "${asset.name}"?`)) deleteAsset.mutate(asset.id); }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* ── Header (no activation button) ── */}
      <div>
        <h2 className={`text-xl font-black ${headText}`}>Lost & Found</h2>
        <p className={`text-xs ${subText} mt-0.5`}>Devices and assets currently in Lost Mode, plus all found reports. Activate Lost Mode from My NFC Devices.</p>
      </div>

      {/* ── Alert banner ── */}
      {totalLost > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-red-700 text-sm">{totalLost} item{totalLost > 1 ? "s" : ""} in Lost Mode</p>
            <p className="text-red-500 text-xs mt-0.5">Anyone who taps these devices will see a recovery form instead of your profile.</p>
          </div>
        </div>
      )}

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`rounded-xl p-3 text-center ${cardCls}`}>
          <p className="text-2xl font-black text-red-500">{lostDevices.length}</p>
          <p className={`text-[10px] font-bold uppercase ${subText}`}>Lost Devices</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${cardCls}`}>
          <p className="text-2xl font-black text-orange-500">{lostAssets.length}</p>
          <p className={`text-[10px] font-bold uppercase ${subText}`}>Lost Assets</p>
        </div>
        <div className={`rounded-xl p-3 text-center ${cardCls}`}>
          <p className="text-2xl font-black text-amber-500">{reports.length}</p>
          <p className={`text-[10px] font-bold uppercase ${subText}`}>Found Reports</p>
        </div>
      </div>

      {/* ── Section switcher ── */}
      <div className={`flex rounded-2xl p-1 gap-1 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
        {[
          { id: "devices", label: "Lost Devices", count: lostOrReportedDevices.length },
          { id: "assets", label: "Lost Assets", count: lostAssets.length },
          { id: "reports", label: "Found Reports", count: newReports.length, badge: true },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${
              activeSection === s.id
                ? isDark ? "bg-white/10 text-white shadow" : "bg-white text-slate-900 shadow-sm"
                : isDark ? "text-white/40 hover:text-white/70" : "text-slate-400 hover:text-slate-600"
            }`}>
            {s.label}
            {s.count > 0 && (
              <span className={`min-w-[20px] h-5 rounded-full text-[11px] font-black flex items-center justify-center px-1 ${
                s.badge && s.count > 0 ? "bg-amber-500 text-white"
                : isDark ? "bg-white/15 text-white/60" : "bg-slate-200 text-slate-500"
              }`}>{s.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ DEVICES SECTION ══ */}
      {activeSection === "devices" && (
        <div className="space-y-3">
          {lostOrReportedDevices.length === 0 ? (
            <div className={`rounded-2xl p-10 text-center ${cardCls}`}>
              <Smartphone className={`w-10 h-10 mx-auto mb-3 ${subText}`} />
              <p className={`font-semibold text-sm mb-1 ${subText}`}>No devices in Lost Mode.</p>
              <p className={`text-xs ${subText}`}>Activate Lost Mode from My NFC Devices to protect your cards and accessories.</p>
            </div>
          ) : lostOrReportedDevices.map(renderDeviceCard)}
        </div>
      )}

      {/* ══ ASSETS SECTION ══ */}
      {activeSection === "assets" && (
        <div className="space-y-3">
          {assetsLoading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>
          ) : lostAssets.length === 0 ? (
            <div className={`rounded-2xl p-10 text-center ${cardCls}`}>
              <Package className={`w-10 h-10 mx-auto mb-3 ${subText}`} />
              <p className={`font-semibold text-sm mb-1 ${subText}`}>No assets in Lost Mode.</p>
              <p className={`text-xs ${subText}`}>Enable Lost Mode on an asset from My Assets to track it here.</p>
            </div>
          ) : lostAssets.map(renderAssetCard)}
        </div>
      )}

      {/* ══ REPORTS SECTION ══ */}
      {activeSection === "reports" && (
        <div className="space-y-3">
          {reportsLoading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" /></div>
          ) : reports.length === 0 ? (
            <div className={`rounded-2xl p-10 text-center ${cardCls}`}>
              <MapPin className={`w-10 h-10 mx-auto mb-3 ${subText}`} />
              <p className={`font-semibold text-sm ${subText}`}>No finder reports yet.</p>
              <p className={`text-xs mt-1 ${subText}`}>When someone finds your lost device and fills the form, their contact info will appear here.</p>
            </div>
          ) : (
            reports.map(report => {
              const deviceReports = getReportsForDevice(report.device_code);
              const reportDevice = devices.find(d => d.device_code === report.device_code);
              return (
                <div key={report.id} className={`rounded-2xl ${cardCls} p-4`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black text-sm text-white ${
                      report.status === "recovered" ? "bg-emerald-500" : "bg-amber-500"
                    }`}>
                      {report.finder_name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-sm ${headText}`}>{report.finder_name || "Anonymous"}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${report.status === "recovered" ? "bg-emerald-100 text-emerald-700" : report.status === "contacted" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {report.status === "recovered" ? "✓ Recovered" : report.status === "contacted" ? "Contacted" : "New"}
                        </span>
                        {reportDevice && <span className={`text-xs ${subText}`}>· {reportDevice.device_code}</span>}
                      </div>
                      {report.finder_phone && <a href={`tel:${report.finder_phone}`} className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold"><Phone className="w-3 h-3" /> {report.finder_phone}</a>}
                      {report.finder_email && <a href={`mailto:${report.finder_email}`} className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold"><Mail className="w-3 h-3" /> {report.finder_email}</a>}
                      {report.finder_location && <p className={`flex items-center gap-1.5 text-xs ${subText}`}><MapPin className="w-3 h-3" /> {report.finder_location}</p>}
                      {report.finder_message && <p className={`text-xs ${subText} italic`}>"{report.finder_message}"</p>}
                      {report.latitude && report.longitude && (
                        <a href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-xs text-violet-500 font-semibold">
                          <MapPin className="w-3 h-3" /> View GPS
                        </a>
                      )}
                      <p className={`flex items-center gap-1 text-xs ${subText}`}><Clock className="w-3 h-3" /> {report.scan_time ? new Date(report.scan_time).toLocaleString() : "Unknown time"}</p>
                    </div>
                    <div className="shrink-0 flex flex-col gap-1">
                      {report.status !== "recovered" && (
                        <>
                          {report.status === "new" && <Button size="sm" onClick={() => { updateReport.mutate({ id: report.id, data: { status: "contacted" } }); toast.success("Marked as contacted"); }} className="rounded-lg text-xs bg-blue-600 text-white h-7 px-2">Contacted</Button>}
                          <Button size="sm" onClick={() => { updateReport.mutate({ id: report.id, data: { status: "recovered" } }); toast.success("Recovered!"); }} className="rounded-lg text-xs bg-emerald-600 text-white h-7 px-2">Recovered ✓</Button>
                        </>
                      )}
                      <button onClick={() => { if (confirm("Delete this report?")) deleteReport.mutate(report.id); }} className="text-red-400 hover:text-red-600 p-1 self-end">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}