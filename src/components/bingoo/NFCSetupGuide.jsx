import { motion } from "framer-motion";
import { Smartphone, X, CheckCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBingooTheme } from "@/hooks/useBingooTheme";

export default function NFCSetupGuide({ device, onClose }) {
  const { isDark } = useBingooTheme();

  const deviceUrl = `${window.location.origin}/n/${device.device_code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(deviceUrl)}&color=1e293b&bgcolor=f8fafc`;

  const cardBg = isDark ? "bg-[#13284f]" : "bg-white";
  const stepBg = isDark ? "bg-white/5" : "bg-slate-50";
  const stepText = isDark ? "text-white/70" : "text-slate-600";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";
  const headText = isDark ? "text-white" : "text-slate-900";
  const labelCls = isDark ? "text-white/40" : "text-slate-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16 }}
        className={`${cardBg} rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto`}
      >
        {/* Header — Bingoo branded */}
        <div className="bg-gradient-to-r from-[#0b2149] to-[#13284f] p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-black text-lg">Your Device is Ready</h2>
              <p className="text-white/60 text-xs font-mono">{device.description || device.device_code}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Pre-programmed notice */}
          <div className={`flex gap-3 p-4 rounded-xl ${isDark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}>
            <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
            <div>
              <p className={`font-bold text-sm ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>Pre-programmed at the factory</p>
              <p className={`text-xs mt-1 ${isDark ? "text-emerald-400/70" : "text-emerald-600"}`}>Your Bingoo NFC device is already configured. No programming needed — just tap it with any NFC-enabled phone.</p>
            </div>
          </div>

          {/* How to use */}
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${labelCls}`}>How to Share Your Profile</p>
            <div className="space-y-3">
              {[
                { n: 1, title: "Tap to Share", desc: "Hold the back of any NFC-enabled phone against your device. Your profile opens instantly." },
                { n: 2, title: "No App Needed", desc: "Most phones wake up automatically on tap. iPhone XR+ and most Androids support background NFC." },
                { n: 3, title: "Scan QR as Backup", desc: "If NFC isn't available, scan the QR code below with any camera app — same result." },
              ].map(step => (
                <div key={step.n} className={`flex items-start gap-3 p-3 rounded-xl ${stepBg}`}>
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</span>
                  <div>
                    <p className={`text-sm font-bold ${headText}`}>{step.title}</p>
                    <p className={`text-xs mt-0.5 ${mutedText}`}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code for testing */}
          <div className="text-center">
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${labelCls}`}>Test Your Device</p>
            <div className="inline-block p-3 bg-white rounded-2xl border border-slate-200">
              <img src={qrUrl} alt="QR Code" className="w-32 h-32 mx-auto rounded-lg" />
            </div>
            <p className={`text-xs mt-2 ${mutedText}`}>Scan to simulate a tap and preview what visitors see</p>
            <a href={deviceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-orange-500 text-xs font-bold hover:underline">
              <QrCode className="w-3.5 h-3.5" /> Open Profile Preview
            </a>
          </div>

          {/* Troubleshooting */}
          <details className={`rounded-xl ${stepBg} p-3`}>
            <summary className={`text-sm font-bold cursor-pointer select-none ${headText}`}>Troubleshooting</summary>
            <div className="mt-3 space-y-2 text-xs">
              <p className={stepText}><strong className={headText}>iPhone not responding?</strong> Ensure NFC is enabled. iPhone 7 and earlier require opening an NFC scanner app first.</p>
              <p className={stepText}><strong className={headText}>Android not responding?</strong> Check Settings → Connections → NFC is turned on.</p>
              <p className={stepText}><strong className={headText}>Need a replacement?</strong> Contact support — we'll transfer your profile to a new device.</p>
            </div>
          </details>

          <Button onClick={onClose} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold">
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
}