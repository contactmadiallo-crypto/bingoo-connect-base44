import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ExternalLink, Phone, Mail, MessageCircle, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useBingooTheme } from "@/hooks/useBingooTheme";
import BingooLayout from "@/components/bingoo/BingooLayout";

export default function MySavedProfiles() {
  const { isDark } = useBingooTheme();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

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
  const cardBg = isDark ? "bg-white/5 border-white/8" : "bg-white border-slate-100";

  return (
    <BingooLayout>
      <div className={`min-h-screen ${isDark ? "bg-[#0a0c14]" : "bg-[#f5f7fb]"}`}>
        <div className="max-w-3xl mx-auto px-4 py-6 pb-24">

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-black ${headText}`}>Saved Profiles</h1>
                <p className={`text-sm ${subText}`}>{favorites.length} saved connection{favorites.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          {favorites.length > 0 && (
            <div className="relative mb-5">
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
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl p-10 text-center border ${cardBg}`}
            >
              <div className="text-5xl mb-4">💔</div>
              <h2 className={`text-lg font-black mb-2 ${headText}`}>No saved profiles yet</h2>
              <p className={`text-sm ${subText} mb-6`}>Tap ❤️ Save Profile on any Bingoo profile to save it here.</p>
              <Link to="/" className="inline-block px-6 py-3 rounded-2xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg,#0B2E6B,#1a4a9e)" }}>
                Explore Profiles
              </Link>
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
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.04 }}
                    className={`relative rounded-2xl border overflow-hidden ${cardBg}`}
                    style={{ boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.06)" }}
                  >
                    {/* Cover strip */}
                    <div className="h-12" style={{ background: `linear-gradient(135deg, ${fav.profile_cover_color || "#0B2E6B"}, ${fav.profile_cover_color || "#0B2E6B"}99)` }} />

                    <div className="px-4 pb-4">
                      {/* Avatar */}
                      <div className="flex items-end justify-between -mt-6 mb-3">
                        <div>
                          {fav.profile_photo
                            ? <img src={fav.profile_photo} className="w-12 h-12 rounded-full border-3 border-white object-cover shadow-md" style={{ borderWidth: 3, borderColor: isDark ? "#1e2030" : "#fff" }} alt="" />
                            : <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-white shadow-md" style={{ background: fav.profile_cover_color || "#0B2E6B", border: `3px solid ${isDark ? "#1e2030" : "#fff"}` }}>
                                {fav.profile_display_name?.charAt(0) || "?"}
                              </div>
                          }
                        </div>
                        {/* Remove button */}
                        <button
                          onClick={() => removeMutation.mutate(fav.id)}
                          disabled={removeMutation.isPending}
                          className={`p-1.5 rounded-full transition-colors ${isDark ? "hover:bg-red-500/20 text-white/30 hover:text-red-400" : "hover:bg-red-50 text-slate-300 hover:text-red-500"}`}
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="mb-3">
                        <p className={`font-black text-base leading-tight ${headText}`}>{fav.profile_display_name || fav.profile_username}</p>
                        {fav.profile_job_title && <p className="text-xs font-semibold mt-0.5" style={{ color: fav.profile_cover_color || "#3b82f6" }}>{fav.profile_job_title}</p>}
                        {fav.profile_company && <p className={`text-xs mt-0.5 ${subText}`}>{fav.profile_company}</p>}
                      </div>

                      {/* Quick actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/p/${fav.profile_username}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${fav.profile_cover_color || "#0B2E6B"}, ${fav.profile_cover_color || "#0B2E6B"}cc)` }}
                        >
                          <ExternalLink className="w-3 h-3" /> View Profile
                        </Link>
                        {fav.profile_phone && (
                          <a href={`tel:${fav.profile_phone}`} className={`p-2 rounded-xl transition-colors ${isDark ? "bg-white/8 hover:bg-white/15 text-white/60" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`} title="Call">
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {fav.profile_whatsapp && (
                          <a href={`https://wa.me/${fav.profile_whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 transition-colors" title="WhatsApp">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {fav.profile_email && (
                          <a href={`mailto:${fav.profile_email}`} className={`p-2 rounded-xl transition-colors ${isDark ? "bg-white/8 hover:bg-white/15 text-white/60" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}`} title="Email">
                            <Mail className="w-3.5 h-3.5" />
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
      </div>
    </BingooLayout>
  );
}