import React, { useState } from "react";
import { ChevronLeft, Eye, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileWorkspaceHeader({ profile, isDark, onBack, lang }) {
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

  const profileUrl = `${window.location.origin}/p/${profile.username}`;

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const planLabels = {
    free: "Free", pro: "Pro", professional: "Professional",
    salon: "Salon", restaurant: "Restaurant", lawfirm: "Law Firm",
    business: "Business", corporate: "Corporate"
  };

  return (
    <div className="rounded-2xl overflow-hidden mb-5"
      style={{
        background: "linear-gradient(135deg, #0b2149 0%, #13284f 60%, #0f3080 100%)",
        boxShadow: "0 4px 24px rgba(11,33,73,0.3)"
      }}>
      {/* Orange accent bar */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #f97316, #FDBA21, #f97316)" }} />

      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:bg-white/15 text-white/60 hover:text-white flex-shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Profile avatar */}
          {profile.profile_photo
            ? <img src={profile.profile_photo} className="w-10 h-10 rounded-xl object-cover shadow-md flex-shrink-0"
                style={{ border: "2px solid rgba(255,255,255,0.2)" }} alt="" />
            : <div className="w-10 h-10 rounded-xl shadow-md flex items-center justify-center font-black text-white text-base flex-shrink-0"
                style={{ background: profile.cover_color || "#2563eb", border: "2px solid rgba(255,255,255,0.2)" }}>
                {profile.display_name?.charAt(0) || "?"}
              </div>
          }

          {/* Profile info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-sm text-white truncate">{profile.display_name}</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/15 text-white/70 uppercase tracking-wide">
                {planLabels[profile.plan] || profile.plan || "Free"}
              </span>
              {profile.is_active && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-white/50 font-semibold">Live</span>
                </span>
              )}
            </div>
            <p className="text-xs text-blue-300 font-semibold truncate mt-0.5">/p/{profile.username}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={copyLink}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all bg-white/10 hover:bg-white/18 text-white/70 hover:text-white border border-white/15">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
            </button>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer">
              <button className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: "#f97316" }}>
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">Preview</span>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}