import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Copy, Check, Lock, FileText, ExternalLink, Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OwnerWalletPanel from "@/components/bingoo/OwnerWalletPanel";

const QR_LABELS = ["Scan Me", "Find Owner", "Return Me", "Contact Owner", "Help Me Get Home"];
const QR_COLORS = ["#1e293b", "#0b2149", "#f97316", "#7c3aed", "#059669", "#dc2626", "#0891b2", "#000000"];

const Toggle = ({ value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${value ? "bg-orange-500" : "bg-slate-300"}`}>
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
  </button>
);

/**
 * QR & Wallet Center — owner-only dashboard view.
 * Reuses the existing canvas-based QR preview + download approach (same as the
 * workspace Share tab) and the existing OwnerWalletPanel for Apple/Google Wallet
 * pass generation. Adds a Document Wallet placeholder (no backend yet).
 *
 * No wallet backend functions, public profile routes, or entity/RLS logic are touched.
 */
export default function QrWalletCenter({ profile, isDark, effectivePlan }) {
  const qc = useQueryClient();
  const headText    = isDark ? "text-white" : "text-slate-900";
  const mutedText   = isDark ? "text-white/40" : "text-slate-400";
  const panelBg     = isDark ? "bg-[#13162a]" : "bg-white";
  const panelBorder = isDark ? "border-white/8" : "border-slate-200";

  const profileUrl   = profile ? `${window.location.origin}/p/${profile.username}` : null;
  const profileQrUrl = profileUrl ? `${profileUrl}?source=qr` : null;

  const [qrColor, setQrColor]           = useState(profile?.qr_color || "#1e293b");
  const [qrLabel, setQrLabel]           = useState(profile?.qr_label || "Scan Me");
  const [customLabel, setCustomLabel]   = useState("");
  const [logoWatermark, setLogoWatermark] = useState(!!(profile?.qr_watermark));
  const [previewDataUrl, setPreviewDataUrl] = useState(null);
  const [downloading, setDownloading]   = useState(false);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [copiedUrl, setCopiedUrl]       = useState(false);

  // Re-sync local state when the active profile changes
  useEffect(() => {
    if (profile) {
      setQrColor(profile.qr_color || "#1e293b");
      setQrLabel(profile.qr_label || "Scan Me");
      setLogoWatermark(!!profile.qr_watermark);
      setCustomLabel("");
    }
  }, [profile?.id]);

  const isPro = effectivePlan && effectivePlan !== "free";
  const hasLogo = !!profile?.company_logo;
  const displayLabel = customLabel.trim() || qrLabel;

  // Canvas-based live preview — matches the downloaded file exactly (QR + optional
  // logo watermark + label + "Powered by Bingoo Connect" footer).
  useEffect(() => {
    if (!profileQrUrl) { setPreviewDataUrl(null); return; }
    let cancelled = false;
    const fg = qrColor.replace("#", "");
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileQrUrl)}&color=${fg}&bgcolor=ffffff`;
    const canvas = document.createElement("canvas");
    canvas.width = 400; canvas.height = 500;
    const ctx = canvas.getContext("2d");
    const useLogo = logoWatermark && isPro && hasLogo;

    const drawLabelAndFooter = () => {
      ctx.fillStyle = qrColor; ctx.font = "bold 22px system-ui,sans-serif";
      ctx.textAlign = "center"; ctx.fillText(displayLabel, 200, 455);
      ctx.fillStyle = "#0b2149"; ctx.fillRect(0, 468, 400, 32);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 11px system-ui,sans-serif";
      ctx.fillText("Powered by Bingoo Connect", 200, 489);
    };

    const qrImg = new Image(); qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, 400, 500);
      ctx.drawImage(qrImg, 0, 30, 400, 400);
      if (!useLogo) { drawLabelAndFooter(); if (!cancelled) setPreviewDataUrl(canvas.toDataURL("image/png")); return; }
      const logoImg = new Image(); logoImg.crossOrigin = "anonymous";
      logoImg.onload = () => {
        const ls = 72, lx = (400 - ls) / 2, ly = 30 + (400 - ls) / 2;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.roundRect(lx - 6, ly - 6, ls + 12, ls + 12, 12); ctx.fill();
        ctx.drawImage(logoImg, lx, ly, ls, ls);
        drawLabelAndFooter();
        if (!cancelled) setPreviewDataUrl(canvas.toDataURL("image/png"));
      };
      logoImg.onerror = () => { drawLabelAndFooter(); if (!cancelled) setPreviewDataUrl(canvas.toDataURL("image/png")); };
      logoImg.src = profile.company_logo;
    };
    qrImg.onerror = () => { if (!cancelled) setPreviewDataUrl(null); };
    qrImg.src = qrSrc;
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQrUrl, qrColor, displayLabel, logoWatermark, isPro, hasLogo, profile?.company_logo]);

  const handleDownloadQR = () => {
    if (!previewDataUrl || downloading) return;
    setDownloading(true);
    const a = document.createElement("a");
    a.href = previewDataUrl;
    a.download = `bingoo-qr-${profile?.username || "code"}.png`;
    a.click();
    setTimeout(() => setDownloading(false), 500);
  };

  const handleSave = async () => {
    if (!profile || saving) return;
    setSaving(true);
    try {
      await base44.entities.Profile.update(profile.id, {
        qr_color: qrColor,
        qr_label: qrLabel,
        qr_watermark: logoWatermark,
      });
      // Optimistically update cached profile data so the saved QR settings are
      // reflected immediately when the user returns to this page — without
      // waiting for the background refetch to complete (which races with
      // navigation and can leave stale values on remount).
      const qrPatch = { qr_color: qrColor, qr_label: qrLabel, qr_watermark: logoWatermark };
      qc.setQueriesData(
        { queryKey: ["my-profile"] },
        (old) => Array.isArray(old)
          ? old.map(p => p.id === profile.id ? { ...p, ...qrPatch } : p)
          : old
      );
      qc.setQueryData(["profile-ws", profile.id], (old) => old ? { ...old, ...qrPatch } : old);
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({ queryKey: ["profile-ws", profile.id] });
      setSaved(true);
      toast.success("QR settings saved!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error("Failed to save QR settings.");
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className={`text-sm ${mutedText}`}>Create a profile first to access the QR &amp; Wallet Center.</p>
      </div>
    );
  }

  if (!profile.username) {
    return (
      <div className="text-center py-20">
        <p className={`text-sm ${mutedText}`}>Set a username in your profile settings to generate a QR code.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-black ${headText}`}>QR &amp; Wallet Center</h2>
        <p className={`text-sm mt-0.5 ${mutedText}`}>Customize, download, and share your Bingoo QR code — plus add it to your phone's wallet.</p>
      </div>

      {/* Profile URL */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
        <p className={`font-bold text-sm ${headText} mb-3`}>Profile Link</p>
        <div className="flex gap-2">
          <input readOnly value={profileUrl || ""}
            className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono ${isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-slate-50 border-slate-200 text-slate-600"}`} />
          <button type="button" onClick={copyUrl}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white min-h-[44px]"
            style={{ background: copiedUrl ? "#059669" : "#0b2149" }}>
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedUrl ? "Copied" : "Copy"}
          </button>
          {profileUrl && (
            <a href={profileUrl} target="_blank" rel="noopener noreferrer"
              className={`flex items-center justify-center w-11 h-11 rounded-xl border transition-all ${isDark ? "border-white/10 bg-white/6 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600"}`}>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* QR Code Customization + Live Preview */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}>
        <p className={`font-bold text-sm ${headText}`}>QR Code</p>

        {/* Live preview — composed on canvas, matches the downloaded file exactly */}
        <div className="flex justify-center">
          <div className={`p-4 rounded-2xl text-center ${isDark ? "bg-slate-800" : "bg-slate-50"}`}>
            {previewDataUrl ? (
              <img src={previewDataUrl} alt="QR Code preview" className="rounded-xl mx-auto" style={{ width: 200, height: "auto" }} />
            ) : (
              <div className="w-[200px] h-[250px] flex items-center justify-center">
                <span className={`text-xs ${mutedText}`}>Generating preview…</span>
              </div>
            )}
            <p className={`text-xs mt-2 ${mutedText}`}>Live preview — toggling the watermark updates instantly.</p>
          </div>
        </div>

        {/* QR Color */}
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>QR Color</p>
          <div className="flex gap-2 flex-wrap">
            {QR_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setQrColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center flex-shrink-0"
                style={{ background: c, borderColor: qrColor === c ? "#f97316" : "transparent", transform: qrColor === c ? "scale(1.2)" : "scale(1)" }}>
                {qrColor === c && <Check className="w-3 h-3 text-white" />}
              </button>
            ))}
            <div className="w-7 h-7 rounded-full border-2 border-slate-300 overflow-hidden flex-shrink-0">
              <input type="color" value={qrColor} onChange={e => setQrColor(e.target.value)} className="w-9 h-9 -m-1 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Label */}
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>Label</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {QR_LABELS.map(l => (
              <button key={l} type="button" onClick={() => { setQrLabel(l); setCustomLabel(""); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  qrLabel === l && !customLabel
                    ? "text-white border-orange-400" : isDark ? "border-white/10 text-white/50" : "border-slate-200 text-slate-500"
                }`}
                style={qrLabel === l && !customLabel ? { background: "#f97316" } : {}}>
                {l}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Custom label…"
            value={customLabel}
            onChange={e => setCustomLabel(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl text-sm border outline-none ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/30" : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400"}`}
          />
          <p className={`text-xs mt-1.5 ${mutedText}`}>"Powered by Bingoo Connect" always appears on downloaded QR code.</p>
        </div>

        {/* Logo Watermark — Pro feature */}
        <div className={`rounded-xl border p-3 ${isDark ? "border-white/8 bg-white/4" : "border-slate-100 bg-slate-50"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className={`text-xs font-bold ${headText}`}>Logo Watermark</p>
                <span className="text-[11px] font-black px-1.5 py-0.5 rounded-full text-white" style={{ background: "#f97316" }}>PRO</span>
              </div>
              <p className={`text-xs mt-0.5 ${mutedText}`}>
                {!isPro ? "Upgrade to Professional to embed your logo in the center of the QR code."
                  : !hasLogo ? "Upload a company logo in the Info tab first."
                  : "Your business logo will appear centered on the QR code — preview updates instantly."}
              </p>
            </div>
            {isPro && hasLogo ? (
              <Toggle value={logoWatermark} onChange={setLogoWatermark} />
            ) : (
              <Lock className={`w-4 h-4 flex-shrink-0 ${isDark ? "text-white/25" : "text-slate-300"}`} />
            )}
          </div>
          {isPro && hasLogo && logoWatermark && (
            <div className="mt-2 flex items-center gap-2">
              <img src={profile.company_logo} alt="Logo preview" className="w-8 h-8 rounded-lg object-contain border border-slate-200 bg-white" />
              <p className={`text-xs ${mutedText}`}>This logo will be embedded in the downloaded QR code.</p>
            </div>
          )}
        </div>

        {/* Download + Save */}
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleDownloadQR} disabled={downloading}
            className="flex-1 min-w-[140px] rounded-xl font-bold gap-2 text-white" style={{ background: "#0b2149" }}>
            <Download className="w-4 h-4" /> {downloading ? "Generating…" : "Download QR"}
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 min-w-[140px] rounded-xl font-bold gap-2 text-white" style={{ background: "#f97316" }}>
            {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save QR Settings</>}
          </Button>
        </div>
        {saved && (
          <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <Check className="w-3.5 h-3.5" /> Saved!
          </p>
        )}
      </div>

      {/* Owner-only Apple Wallet / Google Wallet tools */}
      <OwnerWalletPanel profile={profile} isDark={isDark} panelBorder={panelBorder} panelBg={panelBg} headText={headText} mutedText={mutedText} />

      {/* Wallet design guidance — within existing wallet API limits */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
        <div className="flex items-center gap-2 mb-2">
          <Info className={`w-4 h-4 ${isDark ? "text-white/50" : "text-slate-400"}`} />
          <p className={`font-bold text-sm ${headText}`}>Wallet Pass Design</p>
        </div>
        <p className={`text-xs leading-relaxed ${mutedText}`}>
          Your wallet pass is generated from your live profile data — name, photo, and a scannable QR code linking to <span className="font-mono">/p/{profile.username}</span>. For the best result, ensure your profile photo and display name are set, and upload a square company logo (PNG) for a crisp pass icon. Pass accent color follows your profile's cover color.
        </p>
      </div>

      {/* Document Wallet — placeholder (no secure backend yet) */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}>
            <FileText className={`w-5 h-5 ${isDark ? "text-white/50" : "text-slate-400"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`font-bold text-sm ${headText}`}>Document Wallet</p>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase ${isDark ? "bg-white/8 text-white/40" : "bg-slate-100 text-slate-400"}`}>Coming Soon</span>
            </div>
            <p className={`text-xs mt-1 leading-relaxed ${mutedText}`}>
              Securely store and share important documents — IDs, certifications, licenses, and business documents — attached to your Bingoo profile. Document encryption and access controls are under development and will be available in a future release.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}