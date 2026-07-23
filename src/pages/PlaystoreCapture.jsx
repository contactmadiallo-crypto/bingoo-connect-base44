// Admin-only Google Play Store asset capture workspace.
// Reuses real production UI components + capture-only mirrors with fictional demo data.
// No DB writes, no real orders/leads/emails/payments/notifications, no subscription changes.
import { useSearchParams } from "react-router-dom";
import CaptureFrame from "@/components/playstore/CaptureFrame";
import PremiumHomeDashboard from "@/components/bingoo/PremiumHomeDashboard";
import CaptureCreateProfile from "@/components/playstore/CaptureCreateProfile";
import CaptureShare from "@/components/playstore/CaptureShare";
import CaptureNfc from "@/components/playstore/CaptureNfc";
import CaptureConnections from "@/components/playstore/CaptureConnections";
import CaptureAnalytics from "@/components/playstore/CaptureAnalytics";
import {
  demoUser, demoProfile, demoLeads, demoAppointments,
  demoAnalytics, demoNfcDevices, CAPTURE_STATES,
} from "@/lib/playstoreCaptureData";
import { ShieldAlert, ExternalLink, ArrowLeft } from "lucide-react";

const shell = (inner) => (
  <div className="min-h-screen bg-[#0a0c14]">
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-24 pt-3">{inner}</div>
  </div>
);

function Screen({ state }) {
  switch (state) {
    case "01":
      return shell(
        <PremiumHomeDashboard
          profile={demoProfile}
          user={demoUser}
          isDark
          leads={demoLeads}
          appointments={demoAppointments}
          analytics={demoAnalytics}
          nfcDevices={demoNfcDevices.filter(d => d.status === "active")}
          plan="professional"
          canAccessFeature={() => true}
          onNavigate={() => {}}
          profileUrl={`${window.location.origin}/p/${demoProfile.username}`}
          isLoading={false}
        />
      );
    case "02": return shell(<CaptureCreateProfile />);
    case "03": return shell(<CaptureShare />);
    case "04": return shell(<CaptureNfc />);
    case "05": return shell(<CaptureConnections />);
    case "06": return shell(<CaptureAnalytics />);
    default: return null;
  }
}

export default function PlaystoreCapture() {
  const [params, setParams] = useSearchParams();
  const state = params.get("state");
  const capture = params.get("capture") === "1";

  // Full 1080×1920 capture view — no chrome.
  if (capture && state) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <CaptureFrame frameScale={1}>
          <Screen state={state} />
        </CaptureFrame>
      </div>
    );
  }

  // Single-state interactive (scrollable) view.
  if (state) {
    const meta = CAPTURE_STATES.find(s => s.id === state);
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <button onClick={() => setParams({})} className="inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white">
              <ArrowLeft className="w-4 h-4" /> All states
            </button>
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-widest text-orange-400">{meta?.id} · 1080×1920</p>
              <p className="text-sm font-semibold">{meta?.caption}</p>
            </div>
          </div>
          <div className="flex justify-center">
            <CaptureFrame frameScale={0.62}>
              <Screen state={state} />
            </CaptureFrame>
          </div>
          <div className="mt-6 text-center">
            <a href={`/playstore-capture?state=${state}&capture=1`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white" style={{ background: "#f97316" }}>
              <ExternalLink className="w-4 h-4" /> Open full 1080×1920 capture view
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Workspace — list of all six states with scaled previews.
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-6 h-6 text-orange-400" />
          <h1 className="text-2xl font-black">Play Store Capture Workspace</h1>
        </div>
        <p className="text-sm text-white/60 mb-1">Admin-only. Fictional demo data only — no real users, records, payments, or subscriptions are used or changed.</p>
        <p className="text-xs text-white/40 mb-8">Apple Wallet is intentionally omitted from all captures. State 06 (Insights) is shown under a fictional Professional-plan context.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAPTURE_STATES.map(s => (
            <div key={s.id} className="rounded-2xl bg-slate-800/60 border border-white/10 p-4">
              <div className="flex justify-center mb-4 overflow-hidden rounded-xl">
                <div style={{ width: 1080 * 0.26, height: 1920 * 0.26, overflow: "hidden" }}>
                  <CaptureFrame frameScale={0.26}><Screen state={s.id} /></CaptureFrame>
                </div>
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-orange-400">{s.id} · {s.file}</p>
              <p className="text-sm font-semibold mt-1 mb-3">{s.caption}</p>
              <div className="flex gap-2">
                <button onClick={() => setParams({ state: s.id })}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 transition-colors">
                  Preview
                </button>
                <a href={`/playstore-capture?state=${s.id}&capture=1`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-bold text-white text-center inline-flex items-center justify-center gap-1.5"
                  style={{ background: "#f97316" }}>
                  <ExternalLink className="w-3.5 h-3.5" /> Capture
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-slate-800/40 border border-white/10 p-5 text-sm text-white/70 space-y-2">
          <p className="font-bold text-white">How to capture each 1080×1920 PNG</p>
          <ol className="list-decimal list-inside space-y-1 text-white/60 text-sm">
            <li>Click <span className="font-semibold text-white">Capture</span> on a state — it opens the full 1080×1920 canvas in a new tab.</li>
            <li>Scroll inside the phone canvas so the content you want fills the visible area.</li>
            <li>Screenshot the 1080×1920 canvas (browser devtools "Capture node", or a screen-capture tool at 1:1).</li>
            <li>Save as the filename shown (e.g. <span className="font-mono">01-profile-dashboard.png</span>), max 8 MB, PNG/JPEG.</li>
            <li>Repeat for all six states, then bundle into one ZIP.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}