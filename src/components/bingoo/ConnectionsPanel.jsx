import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trash2, ExternalLink, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConnectionsPanel({ isDark, profileId }) {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["saved-connections", profileId],
    queryFn: () => profileId
      ? base44.entities.SavedConnection.filter({ profile_id: profileId }, "-created_date")
      : base44.entities.SavedConnection.list("-created_date"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.SavedConnection.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-connections", profileId] }),
  });

  const filtered = connections.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return c.profile_display_name?.toLowerCase().includes(q)
      || c.profile_job_title?.toLowerCase().includes(q)
      || c.profile_company?.toLowerCase().includes(q);
  });

  const t = {
    card: isDark ? "bg-white/5 border-white/8" : "bg-white border-slate-100",
    text: isDark ? "text-white" : "text-slate-900",
    sub: isDark ? "text-white/50" : "text-slate-500",
    input: isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20" : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-300",
    badge: isDark ? "bg-white/8 text-white/40" : "bg-slate-100 text-slate-500",
  };

  const sourceLabel = { nfc_scan: "📡 NFC", qr_scan: "📷 QR", manual: "👆 Manual" };

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${t.text}`}>My Connections</h2>
          <p className={`text-sm mt-0.5 ${t.sub}`}>{connections.length} saved profile{connections.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search */}
      {connections.length > 0 && (
        <div className="relative">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${t.sub}`} />
          <input
            type="text"
            placeholder="Search connections…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-medium outline-none border transition-all ${t.input}`}
          />
        </div>
      )}

      {/* Empty state */}
      {connections.length === 0 && (
        <div className="text-center py-16">
          <Users className={`w-14 h-14 mx-auto mb-3 ${isDark ? "text-white/10" : "text-slate-200"}`} />
          <p className={`font-bold text-lg ${t.text}`}>No connections yet</p>
          <p className={`text-sm mt-1 ${t.sub}`}>Tap "Save Profile" on any Bingoo profile to connect</p>
        </div>
      )}

      {/* Connections grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((conn, i) => (
          <motion.div
            key={conn.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <a
              href={`/p/${conn.profile_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-2xl border p-4 flex items-center gap-3 group cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md block ${t.card}`}
              style={{ boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.04)" : "0 1px 4px rgba(0,0,0,0.05)", textDecoration: "none" }}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {conn.profile_photo
                  ? <img src={conn.profile_photo} alt="" className="w-12 h-12 rounded-full object-cover" style={{ border: `2px solid ${conn.profile_cover_color || "#2563eb"}` }} />
                  : <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-lg"
                      style={{ background: `linear-gradient(135deg, ${conn.profile_cover_color || "#2563eb"}, ${conn.profile_cover_color || "#7c3aed"})` }}>
                      {conn.profile_display_name?.charAt(0)}
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${t.text}`}>{conn.profile_display_name}</p>
                {conn.profile_job_title && <p className={`text-xs truncate ${t.sub}`}>{conn.profile_job_title}</p>}
                {conn.profile_company && <p className={`text-xs truncate ${t.sub}`}>{conn.profile_company}</p>}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${t.badge}`}>
                  {sourceLabel[conn.source] || "👆 Manual"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors ${isDark ? "bg-blue-500/15 text-blue-400 hover:bg-blue-500/25" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
                  <ExternalLink className="w-3 h-3" /> View
                </span>
                <Button size="icon" variant="ghost" aria-label="Delete connection"
                  onClick={(e) => { e.preventDefault(); deleteMut.mutate(conn.id); }}
                  className={`w-11 h-11 rounded-xl ${isDark ? "hover:bg-red-500/15 text-white/30 hover:text-red-400" : "hover:bg-red-50 text-slate-300 hover:text-red-500"}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}