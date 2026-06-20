import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, CheckCircle2, MapPin, Phone, Mail, MessageSquare,
  Smartphone, CreditCard, Key, Award, Shield, Wifi, Clock, User, ChevronDown, ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const DEVICE_ICONS = { card: CreditCard, keychain: Key, bracelet: Award, stand: Shield, badge: Wifi, sticker: Smartphone };

const isLost = (device) => device.status === "lost";

export default function LostDeviceManager({ profileId, userId, isDark, tr = {} }) {
  const qc = useQueryClient();
  const [activeSection, setActiveSection] = useState("devices"); // "devices" | "reports"
  const [expandedReportDevice, setExpandedReportDevice] = useState(null);

  const headText = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-white/60" : "text-slate-500";
  const cardCls = isDark
    ? "bg-white/5 border border-white/10"
    : "bg-white border border-slate-100";

  // ── Data ──────────────────────────────────────────────────
  // Fetch user's profiles first, then query NFCDevice by profile_id (same source as MyNFCDevices)
  const { data: userProfiles = [] } = useQuery({
    queryKey: ["user-profiles-lost", userId],
    queryFn: () => base44.entities.Profile.filter({ created_by_id: userId }),
    enabled: !!userId,
  });

  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ["my-devices-lost", userId, userProfiles.map(p => p.id).join(",")],
    queryFn: async () => {
      if (!userProfiles.length) return [];
      const all = await Promise.all(
        userProfiles.map(p => base44.entities.NFCDevice.filter({ profile_id: p.id }))
      );
      return all.flat();
    },
    enabled: !!userId && userProfiles.length > 0,
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["lost-reports", profileId],
    queryFn: () => base44.entities.LostItemReport.filter({ owner_profile_id: profileId }),
    enabled: !!profileId,
  });

  // ── Real-time subscription — instantly reflects lost/active toggle ──
  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.NFCDevice.subscribe((event) => {
      if (event.type === "update") {
        qc.invalidateQueries({ queryKey: ["my-devices-lost", userId] });
      }
    });
    return unsub;
  }, [userId, qc]);

  useEffect(() => {
    if (!profileId) return;
    const unsub = base44.entities.LostItemReport.subscribe((event) => {
      if (event.type === "create" && event.data?.owner_profile_id === profileId) {
        qc.setQueryData(["lost-reports", profileId], (old = []) => [event.data, ...old]);
        toast.info("📍 New finder report received!");
      }
      if (event.type === "update") {
        qc.setQueryData(["lost-reports", profileId], (old = []) =>
          old.map(r => r.id === event.id ? { ...r, ...event.data } : r)
        );
      }
    });
    return unsub;
  }, [profileId, qc]);

  // ── Mutations with optimistic updates ────────────────────
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
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(["my-devices-lost", userId], ctx.prev);
      toast.error("Update failed, please try again.");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-nfc-devices-page"] });
    },
  });

  const updateReport = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LostItemReport.update(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ["lost-reports", profileId] });
      const prev = qc.getQueryData(["lost-reports", profileId]);
      qc.setQueryData(["lost-reports", profileId], (old = []) =>
        old.map(r => r.id === id ? { ...r, ...data } : r)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(["lost-reports", profileId], ctx.prev);
    },
  });

  const markLost = (device) => {
    updateDevice.mutate({ id: device.id, data: { status: "lost" } });
    toast.error(`🔴 ${device.device_code} marked as Lost`);
  };

  const markActive = (device) => {
    updateDevice.mutate({ id: device.id, data: { status: "active" } });
    toast.success(`✅ ${device.device_code} recovered — back to Active`);
  };

  // ── Derived ───────────────────────────────────────────────
  const lostDevices = devices.filter(isLost);
  const newReports = reports.filter(r => r.status === "new");
  const getReportsForDevice = (code) => reports.filter(r => r.device_code === code);

  if (!userId || devicesLoading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-black ${headText}`}>Lost Mode</h2>
        <Link to="/activate-device">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors">
            <Smartphone className="w-4 h-4" /> Activate Device
          </button>
        </Link>
      </div>

      {/* ── Alert banner ── */}
      {lostDevices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-red-700 text-sm">
              {lostDevices.length} device{lostDevices.length > 1 ? "s" : ""} in Lost Mode
            </p>
            <p className="text-red-500 text-xs mt-0.5">
              Anyone who taps these devices will see a recovery form instead of your profile.
            </p>
          </div>
        </div>
      )}

      {/* ── Section Switcher ── */}
      <div className={`flex rounded-2xl p-1 gap-1 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
        {[
          { id: "devices", label: "My Devices", count: devices.length },
          { id: "reports", label: "Finder Reports", count: newReports.length, badge: true },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${
              activeSection === s.id
                ? isDark ? "bg-white/10 text-white shadow" : "bg-white text-slate-900 shadow-sm"
                : isDark ? "text-white/40 hover:text-white/70" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {s.label}
            {s.count > 0 && (
              <span className={`min-w-[20px] h-5 rounded-full text-[11px] font-black flex items-center justify-center px-1 ${
                s.badge && s.count > 0
                  ? "bg-amber-500 text-white"
                  : isDark ? "bg-white/15 text-white/60" : "bg-slate-200 text-slate-500"
              }`}>
                {s.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ DEVICES SECTION ══ */}
      {activeSection === "devices" && (
        <div className="space-y-3">
          {devices.length === 0 ? (
            <div className={`rounded-2xl p-10 text-center ${cardCls}`}>
              <Smartphone className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className={`font-semibold text-sm mb-3 ${subText}`}>No activated devices yet.</p>
              <Link to="/activate-device">
                <button className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors">
                  Activate a Device
                </button>
              </Link>
            </div>
          ) : (
            devices.map(device => {
              const Icon = DEVICE_ICONS[device.device_type] || Smartphone;
              const lost = isLost(device);
              const deviceReports = getReportsForDevice(device.device_code);

              return (
                <div key={device.id} className={`rounded-2xl ${cardCls} overflow-hidden transition-all`}>
                  <div className="p-4 flex items-center gap-3">

                    {/* Icon with lost pulse */}
                    <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      lost ? "bg-red-100" : "bg-blue-50"
                    }`}>
                      <Icon className={`w-5 h-5 ${lost ? "text-red-500" : "text-blue-600"}`} />
                      {lost && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-sm ${headText}`}>
                          {device.device_code}
                        </p>
                        {/* ── STATUS LABEL ── */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border ${
                          lost
                            ? "bg-red-100 text-red-600 border-red-300"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}>
                          {lost
                            ? <><AlertTriangle className="w-3 h-3" /> LOST</>
                            : <><CheckCircle2 className="w-3 h-3" /> ACTIVE</>
                          }
                        </span>
                        {deviceReports.length > 0 && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-bold">
                            📍 {deviceReports.length} report{deviceReports.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-mono mt-0.5 ${subText}`}>
                        {device.device_type}
                        {" · "}
                        {device.assigned_at
                          ? `Since ${new Date(device.assigned_at).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>

                    {/* Toggle */}
                    <div className="shrink-0">
                      {lost ? (
                        <Button size="sm" onClick={() => markActive(device)}
                          className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-8 px-3 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Recovered
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => markLost(device)}
                          className="rounded-xl text-xs border-red-200 text-red-600 hover:bg-red-50 font-bold h-8 px-3 gap-1">
                          <AlertTriangle className="w-3 h-3" /> Mark Lost
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══ REPORTS SECTION ══ */}
      {activeSection === "reports" && (
        <div className="space-y-3">
          {reportsLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className={`rounded-2xl p-10 text-center ${cardCls}`}>
              <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className={`font-semibold text-sm ${subText}`}>No finder reports yet.</p>
              <p className={`text-xs mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                When someone finds your lost device and fills the form, their contact info will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Group by device */}
              {devices
                .filter(d => getReportsForDevice(d.device_code).length > 0)
                .map(device => {
                  const deviceReports = getReportsForDevice(device.device_code);
                  const isExpanded = expandedReportDevice === device.id;
                  const newCount = deviceReports.filter(r => r.status === "new").length;

                  return (
                    <div key={device.id} className={`rounded-2xl ${cardCls} overflow-hidden`}>
                      {/* Group header */}
                      <button
                        onClick={() => setExpandedReportDevice(isExpanded ? null : device.id)}
                        className="w-full p-4 flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isLost(device) ? "bg-red-100" : "bg-blue-50"}`}>
                          {(() => { const I = DEVICE_ICONS[device.device_type] || Smartphone; return <I className={`w-4 h-4 ${isLost(device) ? "text-red-500" : "text-blue-500"}`} />; })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm ${headText}`}>{device.device_code}</p>
                          <p className={`text-xs ${subText}`}>{device.device_code} · {deviceReports.length} report{deviceReports.length > 1 ? "s" : ""}</p>
                        </div>
                        {newCount > 0 && (
                          <span className="bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                            {newCount} new
                          </span>
                        )}
                        {isExpanded ? <ChevronUp className={`w-4 h-4 ${subText}`} /> : <ChevronDown className={`w-4 h-4 ${subText}`} />}
                      </button>

                      {/* Reports list */}
                      {isExpanded && (
                        <div className={`border-t ${isDark ? "border-white/10" : "border-slate-100"} divide-y ${isDark ? "divide-white/10" : "divide-slate-100"}`}>
                          {deviceReports.map(report => (
                            <div key={report.id} className={`p-4 ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"} transition-colors`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black text-sm text-white ${
                                  report.status === "recovered" ? "bg-emerald-500" : "bg-amber-500"
                                }`}>
                                  {report.finder_name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className={`font-bold text-sm ${headText}`}>{report.finder_name || "Anonymous"}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      report.status === "recovered"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : report.status === "contacted"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}>
                                      {report.status === "recovered" ? "✓ Recovered" : report.status === "contacted" ? "Contacted" : "New"}
                                    </span>
                                  </div>

                                  {report.finder_phone && (
                                    <a href={`tel:${report.finder_phone}`}
                                      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-500 font-semibold w-fit">
                                      <Phone className="w-3 h-3" /> {report.finder_phone}
                                    </a>
                                  )}
                                  {report.finder_email && (
                                    <a href={`mailto:${report.finder_email}`}
                                      className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 font-semibold w-fit">
                                      <Mail className="w-3 h-3" /> {report.finder_email}
                                    </a>
                                  )}
                                  {report.finder_location && (
                                    <p className={`flex items-center gap-1.5 text-xs ${subText}`}>
                                      <MapPin className="w-3 h-3 shrink-0" /> {report.finder_location}
                                    </p>
                                  )}
                                  {report.finder_message && (
                                    <p className={`flex items-start gap-1.5 text-xs ${subText} italic`}>
                                      <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" /> "{report.finder_message}"
                                    </p>
                                  )}
                                  {report.latitude && report.longitude && (
                                    <a
                                      href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                                      target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 text-xs text-violet-500 hover:text-violet-400 font-semibold w-fit"
                                    >
                                      <MapPin className="w-3 h-3" /> View GPS on Map
                                    </a>
                                  )}
                                  <p className={`flex items-center gap-1 text-[10px] ${isDark ? "text-white/30" : "text-slate-400"}`}>
                                    <Clock className="w-3 h-3" />
                                    {report.scan_time ? new Date(report.scan_time).toLocaleString() : "Unknown time"}
                                  </p>
                                </div>

                                {/* Status action */}
                                {report.status !== "recovered" && (
                                  <div className="shrink-0 flex flex-col gap-1">
                                    {report.status === "new" && (
                                      <Button size="sm"
                                        onClick={() => {
                                          updateReport.mutate({ id: report.id, data: { status: "contacted" } });
                                          toast.success("Marked as contacted");
                                        }}
                                        className="rounded-lg text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold h-7 px-2">
                                        Mark Contacted
                                      </Button>
                                    )}
                                    <Button size="sm"
                                      onClick={() => {
                                        updateReport.mutate({ id: report.id, data: { status: "recovered" } });
                                        toast.success("Item marked as recovered!");
                                      }}
                                      className="rounded-lg text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-7 px-2">
                                      Recovered ✓
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Reports with no matching device (edge case) */}
              {reports
                .filter(r => !devices.find(d => d.device_code === r.device_code))
                .length > 0 && (
                <p className={`text-xs text-center ${subText} pt-2`}>
                  + {reports.filter(r => !devices.find(d => d.device_code === r.device_code)).length} report(s) from unlinked devices
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}