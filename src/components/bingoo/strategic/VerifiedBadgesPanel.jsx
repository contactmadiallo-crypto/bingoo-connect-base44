import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, CheckCircle2, Clock, Lock, Upload, Loader2 } from "lucide-react";

const NAVY = "#0b2149", ORANGE = "#f97316";

const PRIVACY_OPTIONS = [
  { key: "hide_email", label: "Hide email from public", desc: "Visitors can't see your email address" },
  { key: "show_phone_verified_only", label: "Show phone only to verified users", desc: "Phone visible only to other verified profiles" },
  { key: "block_search_engines", label: "Block search engines", desc: "Prevent Google from indexing your profile" },
  { key: "require_nfc_tap", label: "Require NFC tap to view", desc: "Profile only accessible via NFC device tap" },
];

export default function VerifiedBadgesPanel({ profile, isDark, user }) {
  const queryClient = useQueryClient();
  const [requesting, setRequesting] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(null);
  const [message, setMessage] = useState("");

  const cardBg = isDark ? "bg-white/5" : "bg-white";
  const cardBorder = isDark ? "border-white/10" : "border-slate-200";
  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/60" : "text-slate-500";
  const innerBg = isDark ? "bg-white/5" : "bg-slate-50";

  const vStatus = profile?.verification_status || "none";
  const vType = profile?.verification_type || "none";
  const isVerified = profile?.is_verified || vStatus === "verified";
  const privacy = profile?.privacy_settings || {};

  const requestVerification = async () => {
    setRequesting(true);
    setMessage("");
    try {
      // Create a support ticket for verification
      await base44.entities.SupportTicket.create({
        user_id: user?.id || "",
        user_email: user?.email || "",
        user_name: user?.full_name || profile?.display_name || "",
        subject: "Profile Verification Request",
        message: `Requesting verification for profile: ${profile.display_name} (@${profile.username}). Plan: ${profile.plan}. Job: ${profile.job_title || "N/A"}. Company: ${profile.company_name || "N/A"}.`,
        category: "verification",
        priority: "medium",
        status: "open",
      });
      // Update profile to pending
      await base44.entities.Profile.update(profile.id, {
        verification_status: "pending",
      });
      setMessage("Verification request submitted! Our team will review within 2-3 business days.");
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    } catch (e) {
      setMessage("Couldn't submit request. Please try again.");
    }
    setRequesting(false);
  };

  const togglePrivacy = async (key) => {
    setSavingPrivacy(key);
    const newSettings = { ...privacy, [key]: !privacy[key] };
    try {
      await base44.entities.Profile.update(profile.id, { privacy_settings: newSettings });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    } catch (e) {
      // revert on failure — UI will refetch
    }
    setSavingPrivacy(null);
  };

  const verificationCards = [
    {
      type: "identity",
      label: "Identity Verification",
      desc: "Verified via government ID check",
      icon: Shield,
      color: NAVY,
      verified: isVerified && (vType === "identity" || vType === "both"),
    },
    {
      type: "business",
      label: "Business Verification",
      desc: "Verified via state registration & documents",
      icon: CheckCircle2,
      color: ORANGE,
      verified: isVerified && (vType === "business" || vType === "both"),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Verification Status */}
      <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-orange-500" />
          <h3 className={`text-sm font-black ${headText}`}>Verification Badges</h3>
        </div>

        {/* Status banner */}
        <div className={`rounded-xl p-3 mb-4 ${isDark ? "bg-white/5" : "bg-slate-50"} flex items-center gap-3`}>
          {vStatus === "verified" ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <p className={`text-xs font-bold ${headText}`}>Your profile is verified ✓</p>
            </>
          ) : vStatus === "pending" ? (
            <>
              <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <p className={`text-xs font-bold ${headText}`}>Verification under review...</p>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <p className={`text-xs font-bold ${mutedText}`}>Not verified yet — build trust with verified status</p>
            </>
          )}
        </div>

        {/* Verification type cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {verificationCards.map((v) => (
            <div key={v.type} className={`rounded-xl p-4 border ${v.verified ? "border-emerald-500/30" : cardBorder} ${innerBg}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
                  <v.icon className="w-5 h-5" style={{ color: v.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-xs font-black ${headText}`}>{v.label}</p>
                    {v.verified && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
                        ✓ VERIFIED
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] ${mutedText}`}>{v.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Request button */}
        {vStatus === "none" && (
          <button
            onClick={requestVerification}
            disabled={requesting}
            className="w-full py-3 rounded-xl text-sm font-black text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #0b2149, #13284f)" }}
          >
            {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {requesting ? "Submitting..." : "Request Verification"}
          </button>
        )}

        {message && <p className={`text-xs mt-3 ${message.includes("Couldn't") ? "text-red-500" : "text-emerald-500"}`}>{message}</p>}
      </div>

      {/* Privacy Controls */}
      <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-orange-500" />
          <h3 className={`text-sm font-black ${headText}`}>Privacy Controls</h3>
        </div>
        <div className="space-y-1">
          {PRIVACY_OPTIONS.map((opt) => {
            const isOn = privacy[opt.key] || false;
            const isSaving = savingPrivacy === opt.key;
            return (
              <div key={opt.key} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0 dark:border-white/5">
                <div className="flex-1 min-w-0 pr-3">
                  <p className={`text-xs font-bold ${headText}`}>{opt.label}</p>
                  <p className={`text-[10px] ${mutedText}`}>{opt.desc}</p>
                </div>
                <button
                  onClick={() => togglePrivacy(opt.key)}
                  disabled={isSaving}
                  className="w-10 h-6 rounded-full p-0.5 transition-all flex-shrink-0"
                  style={{ background: isOn ? "#f97316" : isDark ? "#ffffff20" : "#e2e8f0" }}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-all flex items-center justify-center ${
                      isOn ? "ml-auto" : ""
                    }`}
                  >
                    {isSaving && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}