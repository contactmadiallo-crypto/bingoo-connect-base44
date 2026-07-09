import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";

/**
 * PWA Install Banner
 * - Shows native "Add to Home Screen" prompt on Android/Chrome
 * - Shows iOS instructions (Safari doesn't support beforeinstallprompt)
 * - Dismissible, remembers dismissal for 7 days
 */
export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (isStandalone) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem("pwa_banner_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // Detect iOS Safari
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !window.MSStream &&
      !/crios|fxios/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      // Show iOS instructions after 3s delay
      const t = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(t);
    }

    // Android/Chrome — wait for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const t = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(t);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_banner_dismissed", Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner || isInstalled) return null;

  if (isIOS) {
    return (
      <div className="fixed left-3 right-3 z-50 md:hidden" style={{ bottom: "calc(4rem + env(safe-area-inset-bottom) + 8px)" }}>
        <div
          className="rounded-2xl p-4 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #0b2149 0%, #13284f 100%)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <X className="w-3.5 h-3.5 text-white/60" />
          </button>

          <div className="flex items-start gap-3">
            <img
              src="/favicon.svg"
              alt="Bingoo"
              className="w-12 h-12 rounded-xl object-contain flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
            <div className="flex-1 pr-4">
              <p className="text-white font-black text-sm">Add to Home Screen</p>
              <p className="text-white/60 text-xs mt-0.5 leading-relaxed">
                Install Bingoo Connect for the best experience — works offline too!
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-white/50 text-xs mb-2 font-semibold uppercase tracking-wider">How to install on iOS</p>
            <div className="space-y-1.5">
              {[
                { step: "1", text: "Tap the Share button", icon: <Share className="w-3.5 h-3.5 text-blue-300" /> },
                { step: "2", text: 'Scroll down and tap "Add to Home Screen"', icon: <Download className="w-3.5 h-3.5 text-blue-300" /> },
                { step: "3", text: 'Tap "Add" — done! 🎉', icon: <span className="text-sm">✅</span> },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(249,115,22,0.3)" }}>
                    <span className="text-xs font-black text-orange-300">{s.step}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {s.icon}
                    <p className="text-white/70 text-xs">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android / Chrome
  return (
    <div className="fixed left-3 right-3 z-50 md:hidden" style={{ bottom: "calc(4rem + env(safe-area-inset-bottom) + 8px)" }}>
      <div
        className="rounded-2xl p-4 shadow-2xl flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #0b2149 0%, #13284f 100%)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <img
          src="/favicon.svg"
          alt="Bingoo"
          className="w-12 h-12 rounded-xl object-contain flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.1)" }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-sm">Install Bingoo Connect</p>
          <p className="text-white/55 text-xs mt-0.5">Works offline • Instant access</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="px-3 py-2 rounded-xl text-xs font-black text-white"
            style={{ background: "#f97316" }}
          >
            Install
          </button>
          <button onClick={handleDismiss} className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}>
            <X className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>
      </div>
    </div>
  );
}