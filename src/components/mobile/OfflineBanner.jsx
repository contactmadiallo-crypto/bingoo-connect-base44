import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useI18n } from "@/lib/I18nContext";

export default function OfflineBanner() {
  const { language } = useI18n();
  const [online, setOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-3 right-3 z-[200] mx-auto flex max-w-md items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-900 shadow-lg"
      style={{ bottom: "calc(80px + env(safe-area-inset-bottom))" }}
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>
        {language === "fr"
          ? "Vous êtes hors ligne. Certaines actions reprendront après la reconnexion."
          : "You’re offline. Some actions will resume after you reconnect."}
      </span>
    </div>
  );
}
