import { useState } from "react";
import { Flag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { MobileSelect } from "@/components/ui/mobile-select";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "fake_profile", label: "Fake Profile" },
  { value: "harassment", label: "Harassment" },
  { value: "impersonation", label: "Impersonation" },
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "scam", label: "Scam / Fraud" },
  { value: "other", label: "Other" },
];

export default function ReportAbuseButton({ profileId, username }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.AbuseReport.create({
      reported_profile_id: profileId,
      reported_username: username,
      reason,
      details,
      reporter_email: email,
    });
    setSubmitted(true);
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors py-1"
      >
        <Flag className="w-3.5 h-3.5" />
        Report Profile
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-bold text-slate-900 mb-1">Report Submitted</h3>
            <p className="text-slate-500 text-sm">Our team will review this report. Thank you for helping keep Bingoo Connect safe.</p>
            <button onClick={() => setOpen(false)} className="mt-4 px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Flag className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Report Profile</h3>
                <p className="text-xs text-slate-400">@{username}</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">Reason *</label>
                <MobileSelect
                  value={reason}
                  onValueChange={setReason}
                  options={REASONS}
                  placeholder="Select a reason…"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">Details (optional)</label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Describe the issue…"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none resize-none bg-slate-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1.5">Your Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="for follow-up if needed"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-slate-50"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading || !reason}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#dc2626" }}>
                  {loading ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}