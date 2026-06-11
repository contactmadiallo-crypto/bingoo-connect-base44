import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ExternalLink, Phone, Mail, MessageCircle, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function SavedProfilesPanel({ user, isDark }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorite-profiles", user?.id],
    queryFn: () => base44.entities.FavoriteProfile.filter({ user_id: user.id }, "-created_date"),
    enabled: !!user?.id,
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.FavoriteProfile.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorite-profiles", user?.id] }),
  });

  const filtered = favorites.filter(f => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      f.profile_display_name?.toLowerCase().includes(q) ||
      f.profile_username?.toLowerCase().includes(q) ||
      f.profile_job_title?.toLowerCase().includes(q) ||
      f.profile_company?.toLowerCase().includes(q)
    );
  });

  const headText = isDark ? "text-white" : "text-slate-900";
  const subText = isDark ? "text-white/50" : "text-slate-500";
  const cardBg = isDark
    ? "bg-white/5 border border-white/8"
    : "bg-white border border-slate-100";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
          <Heart className="w-4.5 h-4.5 text-white fill-white" size={18} />
        </div>
        <div>
          <h2 className={`text-xl font-black ${headText}`}>Saved Profiles</h2>
          <p className={`text-xs ${subText}`}>{favorites.length} saved connection{favorites.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Search */}
      {favorites.length > 0 && (
        <div className="relative">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/30" : "text-slate-400"}`} />
          <input
            type="text"
            placeholder="Search saved profiles…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-10 pr-9 py-2.5 rounded-2xl text-sm font-medium outline-none transition-all ${
              isDark
                ? "bg-white/5 border border-white/8 text-white placeholder:text-white/25 focus:border-white/20"
                : "bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-300"
            }`}
          />
          {search && (
            <button onClick={() => setSearch("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30" : "text-slate-400"}`}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin" />
        </div>
      ) : favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-10 text-center border ${cardBg}`}
        >
          <div className="text-4xl mb-3">💔</div>
          <h3 className={`text-base font-black mb-1 ${headText}`}>No saved profiles yet</h3>
          <p className={`text-sm ${subText}`}>Tap ❤️ <strong>Save Profile</strong> on any Bingoo profile to see it here.</p>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className={`rounded-3xl p-8 text-center border ${cardBg}`}>
          <p className={`font-semibold ${subText}`}>No results for "{search}"</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence>
            {filtered.map((fav, i) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ delay: i * 0.04 }}
                className={`relative rounded-2xl overflow-hidden border ${cardBg}`}
                style={{ boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                {/* Cover strip */}
                <div className="h-10" style={{ background: `linear-gradient(135deg, ${fav.profile_cover_color || "#0B2E6B"}, ${fav.profile_cover_color || "#0B2E6B"}99)` }} />

                <div className="px-4 pb-4">
                  {/* Avatar row */}
                  <div className="flex items-end justify-between -mt-5 mb-3">
                    <div>
                      {fav.profile_photo
                        ? <img src={fav.profile_photo} className="w-10 h-10 rounded-full object-cover shadow" style={{ border: `3px solid ${isDark ? "#1e2030" : "#fff"}` }} alt="" />
                        : <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-black text-white shadow" style={{ background: fav.profile_cover_color || "#0B2E6B", border: `3px solid ${isDark ? "#1e2030" : "#fff"}` }}>
                            {fav.profile_display_name?.charAt(0) || "?"}
                          </div>
                      }
                    </div>
                    <button
                      onClick={() => removeMutation.mutate(fav.id)}
                      disabled={removeMutation.isPending}
                      className={`p-1.5 rounded-full transition-colors ${isDark ? "hover:bg-red-500/20 text-white/25 hover:text-red-400" : "hover:bg-red-50 text-slate-200 hover:text-red-500"}`}
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mb-3">
                    <p className={`font-black text-sm leading-tight ${headText}`}>{fav.profile_display_name || fav.profile_username}</p>
                    {fav.profile_job_title && <p className="text-xs font-semibold mt-0.5" style={{ color: fav.profile_cover_color || "#3b82f6" }}>{fav.profile_job_title}</p>}
                    {fav.profile_company && <p className={`text-xs mt-0.5 ${subText}`}>{fav.profile_company}</p>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/p/${fav.profile_username}`}
                      className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${fav.profile_cover_color || "#0B2E6B"}, ${fav.profile_cover_color || "#0B2E6B"}bb)` }}
                    >
                      <ExternalLink className="w-3 h-3" /> View
                    </Link>
                    {fav.profile_phone && (
                      <a href={`tel:${fav.profile_phone}`} className={`p-2 rounded-xl transition-colors ${isDark ? "bg-white/8 hover:bg-white/15 text-white/60" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`} title="Call">
                        <Phone className="w-3 h-3" />
                      </a>
                    )}
                    {fav.profile_whatsapp && (
                      <a href={`https://wa.me/${fav.profile_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 transition-colors" title="WhatsApp">
                        <MessageCircle className="w-3 h-3" />
                      </a>
                    )}
                    {fav.profile_email && (
                      <a href={`mailto:${fav.profile_email}`} className={`p-2 rounded-xl transition-colors ${isDark ? "bg-white/8 hover:bg-white/15 text-white/60" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`} title="Email">
                        <Mail className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}