// Capture-only mirror of the real ConnectionsPanel with fictional demo connections.
import { Search, Users, ExternalLink, Trash2 } from "lucide-react";
import { demoConnections } from "@/lib/playstoreCaptureData";

const isDark = true;
const headText = "text-white";
const mutedText = "text-white/50";
const t = {
  card: "bg-white/5 border-white/8",
  text: "text-white",
  sub: "text-white/50",
  input: "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20",
  badge: "bg-white/8 text-white/40",
};
const sourceLabel = { nfc_scan: "📡 NFC", qr_scan: "📷 QR", manual: "👆 Manual" };

export default function CaptureConnections() {
  const connections = demoConnections;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${t.text}`}>My Connections</h2>
          <p className={`text-sm mt-0.5 ${t.sub}`}>{connections.length} saved profiles</p>
        </div>
      </div>

      <div className="relative">
        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${t.sub}`} />
        <input
          type="text"
          placeholder="Search connections…"
          readOnly
          className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium outline-none border transition-all ${t.input}`}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {connections.map(conn => (
          <div key={conn.id} className={`rounded-2xl border p-4 flex items-center gap-3 ${t.card}`}
            style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04)" }}>
            <div className="flex-shrink-0">
              {conn.profile_photo ? (
                <img src={conn.profile_photo} alt="" className="w-12 h-12 rounded-full object-cover" style={{ border: `2px solid ${conn.profile_cover_color || "#2563eb"}` }} />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-lg"
                  style={{ background: `linear-gradient(135deg, ${conn.profile_cover_color || "#2563eb"}, ${conn.profile_cover_color || "#7c3aed"})` }}>
                  {conn.profile_display_name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm truncate ${t.text}`}>{conn.profile_display_name}</p>
              {conn.profile_job_title && <p className={`text-xs truncate ${t.sub}`}>{conn.profile_job_title}</p>}
              {conn.profile_company && <p className={`text-xs truncate ${t.sub}`}>{conn.profile_company}</p>}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${t.badge}`}>
                {sourceLabel[conn.source] || "👆 Manual"}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-blue-500/15 text-blue-400">
                <ExternalLink className="w-3 h-3" /> View
              </span>
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-white/30 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}