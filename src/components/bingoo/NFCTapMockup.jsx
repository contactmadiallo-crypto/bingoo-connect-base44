import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

const profileRows = [
  { delay: 0.04, content: (
    <div className="flex flex-col items-center pt-2 pb-1 px-2">
      <p className="font-black text-slate-800 text-xs mt-1 leading-tight">Bingoo Connect</p>
      <p className="text-[9px] font-semibold mt-0.5" style={{ color: "#6b7280" }}>Digital Business Platform</p>
    </div>
  )},
  { delay: 0.10, content: (
    <div className="grid grid-cols-3 gap-1 px-3 mb-2">
      {["📞","💬","📧"].map(ic => (
        <div key={ic} className="rounded-xl py-1.5 text-center text-sm font-medium"
          style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {ic}
        </div>
      ))}
    </div>
  )},
  { delay: 0.16, content: (
    <div className="px-3 space-y-1">
      {["📅 Book Appointment","🔗 View Profile","📍 Location"].map(b => (
        <div key={b} className="rounded-xl py-1 px-2 text-[9px] font-semibold text-center"
          style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.65)", color: "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          {b}
        </div>
      ))}
    </div>
  )},
];

export default function NFCTapMockup() {
  const cardCtrl  = useAnimation();
  const profileCtrl = useAnimation();
  const rippleCtrl  = useAnimation();
  const glowCtrl    = useAnimation();
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startLoop = async () => {
      // Wait for component to be fully mounted
      await new Promise(r => setTimeout(r, 500));
      if (!mountedRef.current || cancelled) return;

      while (mountedRef.current && !cancelled) {
        try {
          // Reset positions
          cardCtrl.set({ x: 88, y: -28, rotateY: 32, rotateX: -8, rotateZ: -11, opacity: 1 });
          profileCtrl.set({ y: "100%", opacity: 0 });
          rippleCtrl.set({ scale: 0, opacity: 0 });
          glowCtrl.set({ opacity: 0, scale: 0.8 });
          await new Promise(r => setTimeout(r, 500));

          // Card floats up
          await cardCtrl.start({ y: -48, rotateY: 26, rotateX: -6, transition: { duration: 0.9, ease: "easeOut" } });
          await new Promise(r => setTimeout(r, 300));

          // Card taps phone — FAST
          await cardCtrl.start({ x: 8, y: -8, rotateY: 3, rotateX: 0, rotateZ: -2, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } });

          // Ripple + glow instantly
          rippleCtrl.start({ scale: [0, 2], opacity: [0.9, 0], transition: { duration: 0.45, ease: "easeOut" } });
          glowCtrl.start({ opacity: [0, 1, 0], scale: [0.8, 1.4, 1], transition: { duration: 0.5 } });

          // Profile slides up fast
          await profileCtrl.start({ y: "0%", opacity: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.06 } });

          await new Promise(r => setTimeout(r, 2200));

          // Card retreats
          cardCtrl.start({ x: 88, y: -28, rotateY: 32, rotateX: -8, rotateZ: -11, transition: { duration: 0.55, ease: "easeIn" } });
          await profileCtrl.start({ y: "100%", opacity: 0, transition: { duration: 0.3, ease: "easeIn" } });
          await new Promise(r => setTimeout(r, 600));
        } catch (e) {
          // Animation cancelled or component unmounted
          break;
        }
      }
    };

    startLoop();
    return () => { cancelled = true; };
  }, [cardCtrl, profileCtrl, rippleCtrl, glowCtrl]);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ perspective: "900px", height: 340 }}>

      {/* iPhone frame */}
      <div className="relative z-10" style={{ transformStyle: "preserve-3d" }}>
        <div
          className="relative w-48 bg-[#111] rounded-[2.2rem] p-[3px]"
          style={{ boxShadow: "0 32px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.07)" }}
        >
          {/* Physical side buttons */}
          <div className="absolute -left-[3px] top-16 w-[3px] h-7 bg-[#222] rounded-l" />
          <div className="absolute -left-[3px] top-24 w-[3px] h-10 bg-[#222] rounded-l" />
          <div className="absolute -right-[3px] top-20 w-[3px] h-12 bg-[#222] rounded-r" />

          {/* Screen */}
          <div className="bg-white rounded-[2rem] overflow-hidden" style={{ minHeight: 266 }}>
            {/* Status bar */}
            <div className="bg-[#0a0a0a] flex justify-between items-center px-4 pt-2 pb-1">
              <span className="text-white text-[8px] font-bold">9:41</span>
              <div className="w-14 h-4 bg-black rounded-full border border-[#222]" />
              <span className="text-white text-[8px] font-bold">●●●</span>
            </div>

            {/* Profile area */}
            <div className="relative overflow-hidden" style={{ minHeight: 248 }}>
              {/* Idle state */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #b8c8e8 0%, #c5b8d8 35%, #d4c5a8 70%, #b8c0d8 100%)" }}>
                <motion.div animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <div className="w-10 h-10 rounded-full border-2 border-blue-200 flex items-center justify-center">
                    <span className="text-blue-300 text-base">📶</span>
                  </div>
                </motion.div>
              </div>

              {/* Tap ripple */}
              <motion.div
                animate={rippleCtrl}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-[2.5px] border-blue-400 z-20 pointer-events-none"
              />

              {/* Profile panel — slides up */}
              <motion.div animate={profileCtrl} className="absolute inset-0 z-10 flex flex-col"
                style={{ background: "linear-gradient(135deg, #b8c8e8 0%, #c5b8d8 35%, #d4c5a8 70%, #b8c0d8 100%)" }}>
                {/* Glassmorphic card top */}
                <div className="flex flex-col items-center pt-4 pb-2 mx-2 mt-2 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.38)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
                  <div className="w-11 h-11 rounded-xl bg-white shadow-md overflow-hidden flex items-center justify-center mb-1.5">
                    <img src="https://media.base44.com/images/public/692bd9007b93ba81de543346/e30f4e65a_BingooConnectBrand.png" alt="Bingoo" className="w-full h-full object-contain p-1" />
                  </div>
                  {profileRows[0] && (
                    <motion.div
                      key={0}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28 + profileRows[0].delay, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {profileRows[0].content}
                    </motion.div>
                  )}
                </div>

                <div className="mx-2 mt-2 rounded-2xl pb-2 pt-1"
                  style={{ background: "rgba(255,255,255,0.32)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.55)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                  {profileRows.slice(1).map((row, i) => (
                    <motion.div
                      key={i + 1}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28 + row.delay, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {row.content}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Screen glow on tap */}
        <motion.div animate={glowCtrl} className="absolute inset-0 rounded-[2.2rem] bg-blue-400/30 blur-lg -z-10 pointer-events-none" />
      </div>

      {/* NFC Card — 3D floating */}
      <motion.div
        animate={cardCtrl}
        className="absolute z-20 w-32 h-20 rounded-xl flex flex-col items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 55%, #162d4f 100%)",
          transformStyle: "preserve-3d",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
          right: 0,
          top: "12%",
        }}
      >
        {/* Shine overlay */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%)", height: "100%" }} />
        </div>

        {/* Chip */}
        <motion.div
          animate={{ boxShadow: ["0 0 5px rgba(96,165,250,0.4)", "0 0 18px rgba(96,165,250,0.9)", "0 0 5px rgba(96,165,250,0.4)"] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="w-6 h-4 rounded border border-blue-400/70 bg-gradient-to-br from-blue-900/60 to-blue-800/40 mb-1.5"
        />
        <span className="text-white/90 text-[8px] font-black tracking-widest">BINGOO</span>
        <span className="text-blue-400/80 text-[7px] tracking-wide font-medium">NFC · CONNECT</span>

        {/* Animated NFC waves */}
        <div className="absolute right-2 top-2 flex flex-col gap-[3px] opacity-50">
          {[0,1,2].map(i => (
            <motion.div
              key={i}
              className="border-r-2 border-t-2 border-blue-400 rounded-tr"
              style={{ width: 4 + i * 3, height: 4 + i * 3 }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}