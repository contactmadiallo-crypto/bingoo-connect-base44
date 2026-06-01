import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, QrCode, Smartphone, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEVICE_BASE_URL = "https://bingooconnect.com/n/";

export default function NFCSetupGuide({ device, onClose }) {
  const [copied, setCopied] = useState(false);
  const [os, setOs] = useState("iphone");

  const deviceUrl = `${DEVICE_BASE_URL}${device.device_code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(deviceUrl)}&color=1e293b&bgcolor=f8fafc`;

  const copyUrl = () => {
    navigator.clipboard.writeText(deviceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const iphoneSteps = [
    { n: 1, text: 'Download "NFC Tools" from the App Store.' },
    { n: 2, text: "Open NFC Tools." },
    { n: 3, text: 'Tap "Write".' },
    { n: 4, text: 'Tap "Add a record" → choose "URL / URI".' },
    { n: 5, text: "Paste your Device URL." },
    { n: 6, text: 'Tap "Write" and hold your phone near the NFC tag.' },
  ];

  const androidSteps = [
    { n: 1, text: 'Download "NFC Tools" from the Play Store.' },
    { n: 2, text: "Open NFC Tools." },
    { n: 3, text: 'Tap "Write" → "Add a record" → "URL".' },
    { n: 4, text: "Paste your Device URL." },
    { n: 5, text: 'Tap "Write / 1 record" and hold near the NFC tag.' },
  ];

  const steps = os === "iphone" ? iphoneSteps : androidSteps;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg">NFC Setup Guide</h2>
              <p className="text-white/70 text-xs">{device.nickname || device.device_code}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Device URL */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Device URL</p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <span className="flex-1 text-sm font-mono text-slate-700 break-all">{deviceUrl}</span>
              <button onClick={copyUrl} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">QR Code</p>
            <div className="inline-block p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <img src={qrUrl} alt="QR Code" className="w-36 h-36 mx-auto rounded-lg" />
            </div>
            <div className="flex justify-center gap-2 mt-3">
              <a href={qrUrl} download={`${device.device_code}-qr.png`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <QrCode className="w-3.5 h-3.5" /> Download QR
                </Button>
              </a>
              <a href={deviceUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" /> Test URL
                </Button>
              </a>
            </div>
          </div>

          {/* OS Toggle */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Programming Instructions</p>
            <div className="flex gap-2 mb-4">
              {[{ id: "iphone", label: "📱 iPhone" }, { id: "android", label: "🤖 Android" }].map(o => (
                <button
                  key={o.id}
                  onClick={() => setOs(o.id)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${
                    os === o.id
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={os}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {steps.map(step => (
                  <div key={step.n} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                      {step.n}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{step.text}</p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Done */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">✅</p>
            <p className="font-bold text-emerald-800 text-sm">After writing, tap your phone against the tag to test it!</p>
            <p className="text-emerald-600 text-xs mt-1">Your profile will open instantly — no app required.</p>
          </div>

          <Button onClick={onClose} className="w-full bg-slate-900 hover:bg-slate-700 text-white font-bold">
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}