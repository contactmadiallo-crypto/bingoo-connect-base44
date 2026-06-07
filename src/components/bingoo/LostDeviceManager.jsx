import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CheckCircle2, Clock, MapPin, Phone, Mail, MessageSquare, Smartphone, CreditCard, Key, Award, Shield, Wifi, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const deviceIcons = { card: CreditCard, keychain: Key, bracelet: Award, stand: Shield, badge: Wifi, sticker: Smartphone };

const statusConfig = {
  active:    { label: "Active",    color: "bg-green-100 text-green-700 border-green-200",  icon: CheckCircle2 },
  lost:      { label: "Lost",      color: "bg-red-100 text-red-600 border-red-200",        icon: AlertTriangle },
  inactive:  { label: "Inactive",  color: "bg-slate-100 text-slate-500 border-slate-200",  icon: Clock },
};

export default function LostDeviceManager({ profileId, isDark }) {
  const qc = useQueryClient();
  const [expandedDevice, setExpandedDevice] = useState(null);

  const bg = isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-100";
  const headText = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-white/60" : "text-slate-500";

  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ["nfc-devices-lost", profileId],
    queryFn: () => base44.entities.NFCDevice.filter({ profile_id: profileId }),
    enabled: !!profileId,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["lost-reports", profileId],
    queryFn: () => base44.entities.LostItemReport.filter({ owner_profile_id: profileId }),
    enabled: !!profileId,
  });

  const updateDevice = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NFCDevice.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nfc-devices-lost", profileId] });
      qc.invalidateQueries({ queryKey: ["devices", profileId] });
    },
  });

  const updateReport = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LostItemReport.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lost-reports", profileId] }),
  });

  const markLost = (device) => {
    updateDevice.mutate({ id: device.id, data: { status: "lost" } });
    toast.error(`Device ${device.device_code} marked as Lost`);
  };

  const markActive = (device) => {
    updateDevice.mutate({ id: device.id, data: { status: "active" } });
    toast.success(`Device ${device.device_code} marked as Active`);
  };

  const togglePrivacy = (device, field) => {
    updateDevice.mutate({ id: device.id, data: { [field]: !device[field] } });
  };

  const markReportRecovered = (report) => {
    updateReport.mutate({ id: report.id, data: { status: "recovered" } });
    toast.success("Report marked as recovered");
  };

  if (devicesLoading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  const lostDevices = devices.filter(d => d.status === "lost");
  const activeDevices = devices.filter(d => d.status !== "lost");

  const getReportsForDevice = (code) => reports.filter(r => r.device_code === code);

  return (
    <div className="space-y-6">
      {/* Lost Devices Alert */}
      {lostDevices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-red-700 text-sm">{lostDevices.length} device{lostDevices.length > 1 ? "s" : ""} marked as lost</p>
            <p className="text-red-500 text-xs mt-0.5">When tapped, these devices will show a Lost Item recovery page instead of your profile.</p>
          </div>
        </div>
      )}

      {/* All Devices */}
      <div>
        <h3 className={`font-black text-base mb-3 ${headText}`}>All Devices</h3>
        {devices.length === 0 ? (
          <div className={`rounded-2xl border p-8 text-center ${bg}`}>
            <Smartphone className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className={`font-semibold text-sm ${subText}`}>No devices linked to this profile.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map(device => {
              const Icon = deviceIcons[device.device_type] || Smartphone;
              const sc = statusConfig[device.status] || statusConfig.inactive;
              const StatusIcon = sc.icon;
              const deviceReports = getReportsForDevice(device.device_code);
              const isExpanded = expandedDevice === device.id;

              return (
                <div key={device.id} className={`rounded-2xl border ${bg} overflow-hidden`}>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-bold text-sm capitalize ${headText}`}>{device.device_type}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" /> {sc.label}
                          </span>
                          {deviceReports.length > 0 && (
                            <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                              {deviceReports.length} finder report{deviceReports.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-mono mt-0.5 ${subText}`}>{device.device_code}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {device.status === "lost" ? (
                          <Button size="sm" onClick={() => markActive(device)}
                            className="rounded-xl text-xs bg-green-600 hover:bg-green-500 text-white font-bold h-8 px-3">
                            Recovered
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => markLost(device)}
                            className="rounded-xl text-xs border-red-200 text-red-600 hover:bg-red-50 font-bold h-8 px-3">
                            Mark Lost
                          </Button>
                        )}
                        {(device.status === "lost" || deviceReports.length > 0) && (
                          <Button size="sm" variant="ghost" onClick={() => setExpandedDevice(isExpanded ? null : device.id)}
                            className="rounded-xl text-xs h-8 px-2">
                            {isExpanded ? "Hide" : "Details"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Privacy + Reports */}
                  {isExpanded && (
                    <div className={`border-t ${isDark ? "border-white/10" : "border-slate-100"} p-4 space-y-4`}>
                      {/* Privacy Controls (only shown when lost) */}
                      {device.status === "lost" && (
                        <div>
                          <p className={`text-xs font-bold mb-2 ${headText}`}>Lost Mode Privacy Controls</p>
                          <p className={`text-xs mb-3 ${subText}`}>Choose what finders can see on your lost item page.</p>
                          <div className="space-y-2">
                            {[
                              { field: "lost_show_phone", label: "Show phone number (allow finders to call)" },
                            ].map(({ field, label }) => (
                              <div key={field} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {device[field] ? <Eye className="w-3.5 h-3.5 text-blue-500" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                                  <span className={`text-xs ${subText}`}>{label}</span>
                                </div>
                                <Switch
                                  checked={!!device[field]}
                                  onCheckedChange={() => togglePrivacy(device, field)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Finder Reports */}
                      {deviceReports.length > 0 && (
                        <div>
                          <p className={`text-xs font-bold mb-2 ${headText}`}>Finder Reports</p>
                          <div className="space-y-2">
                            {deviceReports.map(report => (
                              <div key={report.id} className={`rounded-xl p-3 border ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1 flex-1 min-w-0">
                                    <p className={`font-semibold text-xs ${headText}`}>{report.finder_name || "Anonymous"}</p>
                                    {report.finder_phone && (
                                      <a href={`tel:${report.finder_phone}`} className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                                        <Phone className="w-3 h-3" /> {report.finder_phone}
                                      </a>
                                    )}
                                    {report.finder_email && (
                                      <a href={`mailto:${report.finder_email}`} className="flex items-center gap-1 text-xs text-blue-500 hover:underline">
                                        <Mail className="w-3 h-3" /> {report.finder_email}
                                      </a>
                                    )}
                                    {report.finder_location && (
                                      <p className="flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin className="w-3 h-3" /> {report.finder_location}
                                      </p>
                                    )}
                                    {report.finder_message && (
                                      <p className="flex items-start gap-1 text-xs text-slate-500">
                                        <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" /> {report.finder_message}
                                      </p>
                                    )}
                                    <p className="text-xs text-slate-400">{report.scan_time ? new Date(report.scan_time).toLocaleString() : ""}</p>
                                  </div>
                                  {report.status !== "recovered" && (
                                    <Button size="sm" onClick={() => markReportRecovered(report)}
                                      className="rounded-lg text-[10px] bg-green-600 hover:bg-green-500 text-white font-bold h-7 px-2 shrink-0">
                                      Recovered
                                    </Button>
                                  )}
                                  {report.status === "recovered" && (
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">✓ Recovered</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}