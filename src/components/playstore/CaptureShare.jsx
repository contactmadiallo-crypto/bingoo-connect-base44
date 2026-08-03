import { publicProfileQrUrl, publicProfileUrl } from '@/lib/publicProfileUrl';
// Capture-only mirror of the real QrWalletCenter QR + Profile Link + Google Wallet UI.
// Apple Wallet is intentionally omitted (feature on hold). No network writes.
import { useState, useEffect } from "react";
import { Copy, Check, ExternalLink, Download, Save, Info } from "lucide-react";
import { demoProfile } from "@/lib/playstoreCaptureData";

const isDark = true;
const headText = "text-white";
const mutedText = "text-white/40";
const panelBg = "bg-[#13162a]";
const panelBorder = "border-white/8";

const QR_COLORS = ["#1e293b", "#0b2149", "#f97316", "#7c3aed", "#059669", "#dc2626", "#0891b2", "#000000"];
const QR_LABELS = ["Scan Me", "Find Owner", "Return Me", "Contact Owner", "Help Me Get Home"];

const GoogleLogo = ({ size = 13 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function CaptureShare() {
  const profile = demoProfile;
  const profileUrl = publicProfileUrl(profile?.username) || "";
  const profileQrUrl = publicProfileQrUrl(profile?.username) || "";
  const [qrColor, setQrColor] = useState("#1e293b");
  const [qrLabel, setQrLabel] = useState("Scan Me");
  const [customLabel, setCustomLabel] = useState("");
  const [preview, setPreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const displayLabel = customLabel.trim() || qrLabel;

  useEffect(() => {
    let cancelled = false;
    const fg = qrColor.replace("#", "");
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileQrUrl)}&color=${fg}&bgcolor=ffffff`;
    const canvas = document.createElement("canvas");
    canvas.width = 400; canvas.height = 500;
    const ctx = canvas.getContext("2d");
    const drawFooter = () => {
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
      drawFooter();
      if (!cancelled) setPreview(canvas.toDataURL("image/png"));
    };
    qrImg.onerror = () => { if (!cancelled) setPreview(null); };
    qrImg.src = qrSrc;
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQrUrl, qrColor, displayLabel]);

  const copyUrl = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="space-y-5">
      <div>
        <h2 className={`text-xl font-black ${headText}`}>QR &amp; Wallet Center</h2>
        <p className={`text-sm mt-0.5 ${mutedText}`}>Customize, download, and share your Bingoo QR code — plus add it to your phone's wallet.</p>
      </div>

      {/* Profile Link */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
        <p className={`font-bold text-sm ${headText} mb-3`}>Profile Link</p>
        <div className="flex gap-2">
          <input readOnly value={profileUrl}
            className="flex-1 px-3 py-2 rounded-xl border text-xs font-mono bg-white/5 border-white/10 text-white/70" />
          <button type="button" onClick={copyUrl}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white min-h-[44px]"
            style={{ background: copied ? "#059669" : "#0b2149" }}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 bg-white/6 text-blue-400">
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* QR Code */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5 space-y-4`}>
        <p className={`font-bold text-sm ${headText}`}>QR Code</p>
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl text-center bg-slate-800">
            {preview ? (
              <img src={preview} alt="QR Code preview" className="rounded-xl mx-auto" style={{ width: 200, height: "auto" }} />
            ) : (
              <div className="w-[200px] h-[250px] flex items-center justify-center">
                <span className={`text-xs ${mutedText}`}>Generating preview…</span>
              </div>
            )}
            <p className={`text-xs mt-2 ${mutedText}`}>Live preview — toggling the watermark updates instantly.</p>
          </div>
        </div>

        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>QR Color</p>
          <div className="flex gap-2 flex-wrap">
            {QR_COLORS.map(c => (
              <button key={c} type="button"
                className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ background: c, borderColor: qrColor === c ? "#f97316" : "transparent", transform: qrColor === c ? "scale(1.2)" : "scale(1)" }}>
                {qrColor === c && <Check className="w-3 h-3 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${mutedText}`}>Label</p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {QR_LABELS.map(l => (
              <button key={l} type="button"
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${qrLabel === l && !customLabel ? "text-white border-orange-400" : "border-white/10 text-white/50"}`}
                style={qrLabel === l && !customLabel ? { background: "#f97316" } : {}}>
                {l}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Custom label…" value={customLabel} readOnly
            className="w-full px-3 py-2 rounded-xl text-sm border outline-none bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          <p className={`text-xs mt-1.5 ${mutedText}`}>"Powered by Bingoo Connect" always appears on downloaded QR code.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="flex-1 min-w-[140px] rounded-xl font-bold gap-2 text-white inline-flex items-center justify-center py-2.5" style={{ background: "#0b2149" }}>
            <Download className="w-4 h-4" /> Download QR
          </button>
          <button type="button" className="flex-1 min-w-[140px] rounded-xl font-bold gap-2 text-white inline-flex items-center justify-center py-2.5" style={{ background: "#f97316" }}>
            <Save className="w-4 h-4" /> Save QR Settings
          </button>
        </div>
      </div>

      {/* Add to Wallet — Google only (Apple Wallet omitted) */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
        <p className={`font-bold text-sm ${headText} mb-1`}>Add to Wallet</p>
        <p className={`text-xs mb-3 ${mutedText}`}>Save your Bingoo QR card to your phone's wallet for quick sharing.</p>
        <div className="flex gap-2">
          <button type="button"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-2xl bg-white text-[#3c4043] font-bold text-xs"
            style={{ border: "1px solid #dadce0" }}>
            <GoogleLogo size={14} /> Google Wallet
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
        <div className="flex items-center gap-2 mb-2">
          <Info className={`w-4 h-4 ${mutedText}`} />
          <p className={`font-bold text-sm ${headText}`}>Wallet Pass Design</p>
        </div>
        <p className={`text-xs leading-relaxed ${mutedText}`}>
          Your wallet pass is generated from your live profile data — name, photo, and a scannable QR code linking to <span className="font-mono">/p/{profile.username}</span>.
        </p>
      </div>
    </div>
  );
}