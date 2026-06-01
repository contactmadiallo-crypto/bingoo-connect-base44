import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, User, Smartphone, Share2, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    id: "welcome",
    emoji: "👋",
    title: "Welcome to BingooConnect!",
    subtitle: "You're one tap away from growing your business.",
    description: "Let's get you set up in under 2 minutes. We'll walk you through everything step by step.",
  },
  {
    id: "how",
    title: "Here's how it works",
    subtitle: "3 simple steps to go live",
  },
  {
    id: "ready",
    emoji: "🚀",
    title: "Ready to begin?",
    subtitle: "Start by creating your digital profile.",
    description: "Once your profile is live, you can activate your NFC card, keychain, or bracelet and start sharing instantly.",
  },
];

const HOW_STEPS = [
  {
    num: 1,
    icon: User,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    title: "Create Your Profile",
    desc: "Add your name, photo, contact info, and social links. This is what people see when they tap your card.",
  },
  {
    num: 2,
    icon: Smartphone,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    title: "Activate Your NFC Product",
    desc: "Enter the unique code printed on your card, keychain, or bracelet to link it to your profile.",
  },
  {
    num: 3,
    icon: Share2,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    title: "Tap & Share Instantly",
    desc: "Your NFC product is now live. Anyone who taps it sees your full digital profile immediately.",
  },
];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.25 } }),
};

export default function OnboardingWizard({ userName, onCreateProfile, onDismiss }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const goTo = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const handleDismiss = () => {
    localStorage.setItem("bingoo_onboarding_done", "1");
    onDismiss();
  };

  const handleStart = () => {
    localStorage.setItem("bingoo_onboarding_done", "1");
    onCreateProfile();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500" />

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: step === i ? 28 : 8, background: step === i ? "#3b82f6" : step > i ? "#10b981" : "#e2e8f0" }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        {/* Step content */}
        <div className="overflow-hidden" style={{ minHeight: 380 }}>
          <AnimatePresence custom={dir} mode="wait">
            {step === 0 && (
              <motion.div key="step0" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
                className="flex flex-col items-center text-center px-8 pt-8 pb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
                  className="text-6xl mb-5"
                >
                  {STEPS[0].emoji}
                </motion.div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">
                  Welcome{userName ? `, ${userName.split(" ")[0]}` : ""}!
                </h2>
                <p className="text-blue-600 font-bold mb-3">{STEPS[0].subtitle}</p>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm">{STEPS[0].description}</p>

                {/* Quick preview of steps */}
                <div className="flex gap-4 mt-8 w-full">
                  {[{ e: "👤", l: "Profile" }, { e: "📲", l: "Activate" }, { e: "🚀", l: "Share" }].map((s, i) => (
                    <div key={s.l} className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-2xl">{s.e}</span>
                      <span className="text-xs font-bold text-slate-600">{s.l}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
                className="px-8 pt-6 pb-6">
                <h2 className="text-xl font-black text-slate-900 mb-1 text-center">{STEPS[1].title}</h2>
                <p className="text-slate-500 text-sm text-center mb-6">{STEPS[1].subtitle}</p>
                <div className="space-y-3">
                  {HOW_STEPS.map((s, i) => (
                    <motion.div
                      key={s.num}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100"
                      style={{ background: s.bg }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: s.color }}>
                        <s.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span className="text-xs font-black px-1.5 py-0.5 rounded-md text-white" style={{ background: s.color }}>
                            {s.num}
                          </span>
                          {s.title}
                        </p>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{s.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
                className="flex flex-col items-center text-center px-8 pt-8 pb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 280, delay: 0.1 }}
                  className="text-6xl mb-5"
                >
                  {STEPS[2].emoji}
                </motion.div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">{STEPS[2].title}</h2>
                <p className="text-blue-600 font-bold mb-3">{STEPS[2].subtitle}</p>
                <p className="text-slate-500 text-sm leading-relaxed max-w-sm">{STEPS[2].description}</p>

                <div className="mt-8 w-full p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-blue-900 text-sm">Pro tip</p>
                      <p className="text-blue-700 text-xs mt-0.5">Have your device code ready — it's printed on the back of your NFC product (e.g. BG-10001).</p>
                    </div>
                  </div>
                </div>

                <motion.div className="w-full mt-5" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleStart}
                    className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-base py-6 rounded-2xl shadow-lg shadow-blue-200 gap-2"
                  >
                    Create My Profile <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
                <button onClick={handleDismiss} className="mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  I'll do this later
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {step < 2 && (
          <div className="flex items-center justify-between px-8 pb-7 pt-2">
            <button
              onClick={() => goTo(step - 1)}
              disabled={step === 0}
              className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-0"
            >
              Back
            </button>
            <Button
              onClick={() => goTo(step + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 gap-2"
            >
              {step === 0 ? "Let's Go" : "Next"} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}