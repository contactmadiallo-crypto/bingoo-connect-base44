// Capture-only mirror of the real MyNFCDevices page (header + device list).
// Reuses the real DeviceBadges + DEVICE_TYPES. Fictional demo devices, no DB calls.
import DeviceBadges from "@/components/bingoo/nfc/DeviceBadges";
import { DEVICE_TYPES } from "@/lib/deviceTypes";
import { CheckCircle, ExternalLink, ChevronDown, Zap } from "lucide-react";
import { demoNfcDevices, demoProfile } from "@/lib/playstoreCaptureData";

const isDark = true;
const headText = "text-white";
const mutedText = "text-white/40";
const bg = "rgba(255,255,255,0.04)";
const border = "rgba(255,255,255,0.07)";

const PROD_BASE_URL = "https://bingooconnect.com";

function StatusBadge({ status }) {
  const map = {
    active: { cls: "bg-emerald-500/20 text-emerald-400", label: "Active" },
    lost: { cls: "bg-red-500/20 text-red-400", label: "Lost" },
    assigned: { cls: "bg-blue-500/20 text-blue-400", label: "Assigned" },
    available: { cls: "bg-white/10 text-white/40", label: "Available" },
  };
  const s = map[status] || map.available;
  return <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${s.cls}`}>{s.label}</span>;
}

function QRImage({ url }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  return <img src={qrUrl} alt="QR Code" className="w-40 h-40 rounded-xl shadow border border-white/10" />;
}

export default function CaptureNfc() {
  const activeCount = demoNfcDevices.filter(d => d.status === "active").length;
  const lostCount = demoNfcDevices.filter(d => d.status === "lost").length;
  const tapsByDevice = { d1: 128, d2: 64, d3: 22 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden p-6"
        style={{ background: "linear-gradient(135deg,#0b2149,#13284f)", border: "1px solid rgba(249,115,22,0.2)" }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(249,115,22,0.1)" }} />
        <div className="h-1 absolute top-0 left-0 right-0" style={{ background: "linear-gradient(90deg,#f97316,#FDBA21,#f97316)" }} />
        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.3)" }}>📲</div>
            <div>
              <h1 className="text-2xl font-black text-white">My NFC Devices</h1>
              <p className="text-xs mt-0.5 text-white/50">Manage your Bingoo NFC cards, keychains &amp; accessories</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm font-bold text-emerald-400">{activeCount} Active</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-sm font-bold text-red-400">{lostCount} Lost</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-sm font-bold text-white/50">{demoNfcDevices.length} Total</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-sm font-bold" style={{ color: "#FDBA21" }}>214 Taps</span>
              </div>
            </div>
          </div>
          <button type="button" className="font-bold gap-2 flex-shrink-0 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-white"
            style={{ background: "#f97316" }}>🔑 Activate Device</button>
        </div>
      </div>

      {/* Device list */}
      <div className="space-y-4">
        {demoNfcDevices.map((device, idx) => {
          const deviceUrl = `${PROD_BASE_URL}/n/${device.device_code}`;
          const typeInfo = DEVICE_TYPES.find(t => t.value === device.device_type) || DEVICE_TYPES[0];
          const isLost = device.status === "lost";
          const isExpanded = idx === 0; // first device expanded to show QR
          return (
            <div key={device.id} className="rounded-2xl overflow-hidden"
              style={{ background: bg, border: `1px solid ${isLost ? "rgba(239,68,68,0.3)" : border}` }}>
              <div className="p-4 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden ${isLost ? "bg-red-500/15" : "bg-gradient-to-br from-orange-500/20 to-amber-500/20"}`}>
                  {device.product_image ? <img src={device.product_image} alt="" className="w-full h-full object-cover" /> : typeInfo.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-black text-sm font-mono ${headText}`}>{device.device_code}</p>
                    <StatusBadge status={device.status} />
                  </div>
                  <p className={`text-xs mt-0.5 ${mutedText} flex items-center gap-1.5 flex-wrap`}>
                    <span className="font-semibold">{device.product_name || typeInfo.label}</span>
                    <span>· <span className="font-semibold">{demoProfile.display_name}</span></span>
                    {device.assigned_at && <span>· Activated {device.assigned_at.slice(0, 10)}</span>}
                    <span className="flex items-center gap-0.5">· <Zap className="w-3 h-3" style={{ color: "#FDBA21" }} /> {tapsByDevice[device.id] || 0} taps</span>
                  </p>
                  <DeviceBadges device={device} hasProfile={!!device.profile_id} hasAsset={false} reportCount={0} isDark={isDark} />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!isLost && (
                    <span className="p-2 rounded-lg text-white/40 hover:text-blue-400">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  )}
                  <span className="p-2 rounded-lg text-white/40"><ChevronDown className="w-4 h-4" /></span>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-6 pt-2 border-t border-white/10 space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: "Device Code", value: device.device_code },
                      { label: "Type", value: typeInfo.label },
                      { label: "Profile", value: demoProfile.display_name },
                      { label: "Status", value: device.status },
                      { label: "Taps", value: tapsByDevice[device.id] || 0 },
                    ].map(item => (
                      <div key={item.label} className="rounded-xl p-3 bg-white/5">
                        <p className={`text-xs font-bold uppercase tracking-wider ${mutedText}`}>{item.label}</p>
                        <p className={`text-sm font-black mt-1 ${headText} capitalize`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-2`}>Device URL</p>
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-white/5 border border-white/10">
                      <span className={`font-mono text-sm flex-1 break-all ${headText}`}>{deviceUrl}</span>
                      <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white">
                        <CheckCircle className="w-3.5 h-3.5" /> Copy
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${mutedText} mb-3`}>QR Code</p>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <QRImage url={deviceUrl} />
                      <div className="space-y-2 text-sm">
                        <p className={`font-semibold ${headText}`}>Share via QR Code</p>
                        <p className={`${mutedText} text-xs`}>Right-click the QR image to save it, or share the URL directly.</p>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                          <ExternalLink className="w-3.5 h-3.5" /> Open Device URL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl p-5 text-center"
        style={{ background: "linear-gradient(135deg,#0b2149,#13284f)", border: "1px solid rgba(249,115,22,0.2)" }}>
        <p className="font-black text-white mb-1">Need more NFC devices?</p>
        <p className="text-white/50 text-xs mb-4">Cards, keychains, bracelets, counter stands — all Bingoo branded.</p>
        <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold" style={{ background: "#f97316" }}>🛍️ Shop NFC Devices</span>
      </div>
    </div>
  );
}