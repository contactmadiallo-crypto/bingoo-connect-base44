import { useState } from "react";
import { Smartphone, AlertTriangle, CheckCircle2 } from "lucide-react";

const steps = {
  iphone: [
    "Download NFC Tools from the App Store.",
    "Open NFC Tools.",
    "Tap Write.",
    "Tap Add Record.",
    "Select URL/URI.",
    "Paste the Bingoo device URL.",
    "Tap Write.",
    "Hold the NFC card behind the phone until it writes successfully.",
    "Tap the card again to test.",
  ],
  android: [
    "Download NFC Tools from the Play Store.",
    "Open NFC Tools.",
    "Tap Write.",
    "Tap Add Record → URL/URI.",
    "Paste the Bingoo device URL.",
    "Tap Write.",
    "Hold the NFC device to the back of your phone.",
    "Tap the card again to test.",
  ],
};

export default function NFCSetupInstructions({ deviceUrl }) {
  const [platform, setPlatform] = useState("iphone");

  return (
    <div className="space-y-4">
      {/* Warning */}
      <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <span className="font-bold">Do not use the hidden tag serial number for activation.</span>{" "}
          Bingoo Connect uses its own device code for better control, analytics, reassignment, and security.
        </p>
      </div>

      {/* URL to program */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Program this URL onto your NFC tag</p>
        <p className="font-mono text-sm font-bold text-blue-700 break-all">{deviceUrl}</p>
      </div>

      {/* Platform toggle */}
      <div className="flex gap-2">
        {["iphone", "android"].map(p => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              platform === p
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {p === "iphone" ? "📱 iPhone" : "🤖 Android"}
          </button>
        ))}
      </div>

      {/* Steps */}
      <ol className="space-y-2">
        {steps[platform].map((step, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-slate-700">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}