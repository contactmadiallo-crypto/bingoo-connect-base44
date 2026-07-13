import { CheckCircle2, Zap, QrCode as QrIcon } from "lucide-react";

export default function NFCSetupInstructions({ deviceUrl }) {
  return (
    <div className="space-y-4">
      {/* Pre-programmed notice */}
      <div className="flex gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-800">
          <span className="font-bold">Your device is pre-programmed at the factory.</span>{" "}
          No manual programming needed — just tap it with any NFC-enabled phone to share your profile.
        </p>
      </div>

      {/* How it works */}
      <div className="space-y-3">
        <div className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
          <div>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-orange-500" /> Tap to Share</p>
            <p className="text-xs text-slate-500 mt-0.5">Hold the back of any NFC-enabled phone against your device. Your profile opens instantly.</p>
          </div>
        </div>
        <div className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
          <div>
            <p className="text-sm font-bold text-slate-900">No App Needed</p>
            <p className="text-xs text-slate-500 mt-0.5">Most phones wake up automatically on tap. iPhone XR+ and most Androids support background NFC.</p>
          </div>
        </div>
        <div className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
          <div>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><QrIcon className="w-3.5 h-3.5 text-orange-500" /> QR Backup</p>
            <p className="text-xs text-slate-500 mt-0.5">If NFC isn't available, scan the QR code on your device with any camera app — same result.</p>
          </div>
        </div>
      </div>

      {/* Test URL */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Test your device URL</p>
        <a href={deviceUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-sm font-bold text-blue-600 hover:underline break-all">{deviceUrl}</a>
      </div>
    </div>
  );
}