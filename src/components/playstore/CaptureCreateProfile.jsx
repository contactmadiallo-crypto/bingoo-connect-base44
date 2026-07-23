// Capture-only mirror of the real NewProfileForm (BingooDashboard.jsx).
// Visual only — no profile is created. Fictional demo prefill.
import { useState } from "react";
import { ChevronLeft } from "lucide-react";

const isDark = true;
const headText = "text-white";
const mutedText = "text-white/40";
const panelBg = "bg-[#13162a]";
const panelBorder = "border-white/8";
const inputCls =
  "w-full px-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-orange-400/40 bg-white/5 border-white/10 text-white placeholder:text-white/30";

export default function CaptureCreateProfile() {
  const [form] = useState({
    display_name: "Amina Diallo",
    username: "amina-diallo",
    job_title: "Brand Strategist",
    bio: "Helping founders show up with clarity and confidence.",
  });

  return (
    <div className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all flex-shrink-0 border-white/10 text-white/50 hover:bg-white/8 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" /> Profiles
        </button>
        <p className={`font-bold text-sm ${headText}`}>New Profile</p>
      </div>

      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}>
        <p className={`text-xs font-bold uppercase tracking-widest ${mutedText}`}>Profile Info</p>

        <div>
          <label className={`text-xs font-semibold ${mutedText} block mb-1`}>Display Name *</label>
          <input className={inputCls} value={form.display_name} readOnly placeholder="Your Name or Business" />
        </div>

        <div>
          <label className={`text-xs font-semibold ${mutedText} block mb-1`}>Username (Profile URL) *</label>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-2 rounded-xl flex-shrink-0 bg-white/8 text-white/40">/p/</span>
            <input className={inputCls} value={form.username} readOnly placeholder="yourusername" />
          </div>
          <p className={`text-[11px] mt-1 ${mutedText}`}>Lowercase letters, numbers, hyphens and underscores only.</p>
        </div>

        <div>
          <label className={`text-xs font-semibold ${mutedText} block mb-1`}>Job Title / Role</label>
          <input className={inputCls} value={form.job_title} readOnly placeholder="CEO · Consultant · Attorney" />
        </div>

        <div>
          <label className={`text-xs font-semibold ${mutedText} block mb-1`}>Bio</label>
          <textarea className={inputCls} rows={3} value={form.bio} readOnly placeholder="Short description about you or your business..." />
        </div>

        <button
          type="button"
          className="w-full py-3 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)" }}
        >
          Create Profile &amp; Open Editor →
        </button>
        <p className={`text-[11px] text-center ${mutedText}`}>You can add photos, links, and more after creation.</p>
      </div>
    </div>
  );
}