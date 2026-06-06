import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Splash screen shown only once when the app is opened from home screen (standalone mode).
 * Fades out after 1.8s.
 */
export default function PWASplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    // Only show on first standalone launch per session
    if (!isStandalone) return;
    const shown = sessionStorage.getItem("splash_shown");
    if (shown) return;

    sessionStorage.setItem("splash_shown", "1");
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(145deg, #071d47 0%, #0B2E6B 50%, #0f3d8c 100%)",
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Animated rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-white/10"
              style={{ width: 200 + i * 140, height: 200 + i * 140 }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.1, 0.03, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
            />
          ))}

          <motion.img
            src="https://media.base44.com/images/public/692bd9007b93ba81de543346/c1fc2bab8_bingooLogoNfc.png"
            alt="Bingoo Connect"
            className="w-28 h-28 object-contain relative z-10"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.p
            className="mt-5 text-sm font-black tracking-[0.3em] uppercase relative z-10"
            style={{ color: "rgba(255,255,255,0.35)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            CONNECT • SHARE • GROW
          </motion.p>

          {/* Loading bar */}
          <motion.div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 h-0.5 rounded-full overflow-hidden"
            style={{ width: 80, background: "rgba(255,255,255,0.1)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "#FF7A00" }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}