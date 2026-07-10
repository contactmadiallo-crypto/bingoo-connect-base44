import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Check, User, Palette, Rocket, Briefcase, Scissors, Scale, Users, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfinityMark } from "@/components/mockups/brand/InfinityMark";

const PROFILE_TYPES = [
  { id: 'professional', label: 'Professional', icon: Briefcase, desc: 'Consultant, freelancer, executive' },
  { id: 'salon', label: 'Salon / Service', icon: Scissors, desc: 'Hair, nails, beauty, spa' },
  { id: 'lawfirm', label: 'Law Firm', icon: Scale, desc: 'Immigration, civil, criminal' },
  { id: 'business', label: 'Business Team', icon: Users, desc: 'Company with multiple staff' },
  { id: 'creative', label: 'Creative / Influencer', icon: Mic, desc: 'Content creator, artist, musician' },
];

const LAYOUT_PREVIEWS = [
  { id: 'executive', name: 'Executive Premium', desc: 'Bold, corporate, luxury feel' },
  { id: 'creative', name: 'Creative / Influencer', desc: 'Vibrant, media-rich, expressive' },
  { id: 'premium_salon', name: 'Salon / Service', desc: 'Service menu, stylist showcase' },
  { id: 'modern_law', name: 'Law Firm', desc: 'Practice areas, attorney profiles' },
  { id: 'corporate', name: 'Business Team', desc: 'Team directory, company branding' },
  { id: 'aurora', name: 'Event Networking', desc: 'Vibrant, social, eye-catching' },
  { id: 'minimal', name: 'Minimal NFC Card', desc: 'Clean, fast, contact-first' },
  { id: 'image_hero', name: 'Rich Media', desc: 'Full-bleed photo, media-rich' },
];

const PROFILE_TYPE_LAYOUTS = {
  professional: 'executive',
  salon: 'premium_salon',
  lawfirm: 'modern_law',
  business: 'corporate',
  creative: 'creative',
};

const STEPS = [
  { id: 'account', num: 1, label: 'Account', icon: User },
  { id: 'profile', num: 2, label: 'Profile Info', icon: Briefcase },
  { id: 'design', num: 3, label: 'Design / Layout', icon: Palette },
  { id: 'launch', num: 4, label: 'Launch', icon: Rocket },
];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.2 } }),
};

export default function OnboardingWizard({ userName, onCreateProfile, onDismiss }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [profileType, setProfileType] = useState('professional');
  const [layoutChoice, setLayoutChoice] = useState('executive');

  const goTo = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const handleDismiss = () => {
    localStorage.setItem("bingoo_onboarding_done", "1");
    onDismiss();
  };

  const handleLaunch = () => {
    localStorage.setItem("bingoo_onboarding_done", "1");
    localStorage.setItem("bingoo_onboarding_profile_type", profileType);
    localStorage.setItem("bingoo_onboarding_layout", layoutChoice);
    onCreateProfile();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Brand bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #0b2149, #f97316)' }} />

        {/* Dismiss */}
        <button onClick={handleDismiss} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10">
          <X className="w-4 h-4" />
        </button>

        {/* Brand header */}
        <div className="flex items-center gap-2 px-6 pt-5">
          <InfinityMark className="w-7 h-7" />
          <span className="text-sm font-black text-slate-900 tracking-tight">Bingoo<span style={{ color: '#f97316' }}>Connect</span></span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-1.5 px-6 pt-4 pb-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <motion.div
                animate={{
                  scale: step === i ? 1.15 : 1,
                  background: step === i ? '#f97316' : step > i ? '#0b2149' : '#e2e8f0',
                }}
                transition={{ duration: 0.25 }}
                className="w-7 h-7 rounded-full flex items-center justify-center"
              >
                {step > i ? <Check className="w-3.5 h-3.5 text-white" /> : <s.icon className="w-3.5 h-3.5" style={{ color: step === i ? '#fff' : '#94a3b8' }} />}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className="w-6 h-0.5 rounded-full" style={{ background: step > i ? '#0b2149' : '#e2e8f0' }} />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 px-6 pb-2">
          {STEPS.map((s, i) => (
            <span key={s.id} className={`text-[10px] font-bold ${step === i ? 'text-slate-900' : 'text-slate-300'}`}>{s.label}</span>
          ))}
        </div>

        {/* Step content */}
        <div className="overflow-hidden" style={{ minHeight: 360 }}>
          <AnimatePresence custom={dir} mode="wait">
            {/* Step 1: Account */}
            {step === 0 && (
              <motion.div key="step0" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
                className="flex flex-col items-center text-center px-8 pt-4 pb-6">
                <h2 className="text-xl font-black text-slate-900 mb-1">Welcome{userName ? `, ${userName.split(" ")[0]}` : ""}!</h2>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-5">
                  Your account is ready. Let's build your professional identity in 4 quick steps.
                </p>
                <div className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#0b2149' }}>
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 text-sm">Account Verified</p>
                      <p className="text-xs text-slate-500">{userName || 'Your account'} is ready to go</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-4">Next: Tell us about your professional profile</p>
              </motion.div>
            )}

            {/* Step 2: Profile Info */}
            {step === 1 && (
              <motion.div key="step1" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
                className="px-8 pt-4 pb-6">
                <h2 className="text-xl font-black text-slate-900 mb-1 text-center">What describes you best?</h2>
                <p className="text-sm text-slate-500 text-center mb-4">Select your profile type to customize your experience</p>
                <div className="space-y-2">
                  {PROFILE_TYPES.map(pt => (
                    <button key={pt.id} onClick={() => {
                      setProfileType(pt.id);
                      setLayoutChoice(PROFILE_TYPE_LAYOUTS[pt.id] || 'executive');
                    }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        profileType === pt.id ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200'
                      }`}>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${profileType === pt.id ? 'bg-orange-500' : 'bg-slate-100'}`}>
                        <pt.icon className={`w-4 h-4 ${profileType === pt.id ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${profileType === pt.id ? 'text-slate-900' : 'text-slate-700'}`}>{pt.label}</p>
                        <p className="text-xs text-slate-400">{pt.desc}</p>
                      </div>
                      {profileType === pt.id && <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Design / Layout */}
            {step === 2 && (
              <motion.div key="step2" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
                className="px-8 pt-4 pb-6">
                <h2 className="text-xl font-black text-slate-900 mb-1 text-center">Pick your layout</h2>
                <p className="text-sm text-slate-500 text-center mb-4">Choose how your profile looks — you can change this anytime</p>
                <div className="grid grid-cols-2 gap-2">
                  {LAYOUT_PREVIEWS.map(l => (
                    <button key={l.id} onClick={() => setLayoutChoice(l.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${layoutChoice === l.id ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-200'}`}>
                      <div className={`w-full h-16 rounded-lg mb-2 ${layoutChoice === l.id ? 'bg-orange-100' : 'bg-slate-100'}`}>
                        <div className="w-full h-full flex items-center justify-center">
                          <div className={`w-8 h-8 rounded-full ${layoutChoice === l.id ? 'bg-orange-300' : 'bg-slate-300'}`} />
                        </div>
                      </div>
                      <p className={`font-bold text-xs ${layoutChoice === l.id ? 'text-slate-900' : 'text-slate-700'}`}>{l.name}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">{l.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Launch */}
            {step === 3 && (
              <motion.div key="step3" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
                className="flex flex-col items-center text-center px-8 pt-4 pb-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 280, delay: 0.1 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#0b2149' }}>
                  <Rocket className="w-7 h-7 text-white" />
                </motion.div>
                <h2 className="text-xl font-black text-slate-900 mb-1">Ready to launch!</h2>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-4">
                  We'll create your profile with your selected settings. You can customize everything after.
                </p>

                {/* Summary */}
                <div className="w-full space-y-2 mb-5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                    <span className="text-xs font-semibold text-slate-500">Profile Type</span>
                    <span className="text-xs font-bold text-slate-900">{PROFILE_TYPES.find(p => p.id === profileType)?.label}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                    <span className="text-xs font-semibold text-slate-500">Layout</span>
                    <span className="text-xs font-bold text-slate-900">{LAYOUT_PREVIEWS.find(l => l.id === layoutChoice)?.name}</span>
                  </div>
                </div>

                <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={handleLaunch}
                    className="w-full text-white font-bold text-base py-5 rounded-2xl shadow-lg gap-2"
                    style={{ background: 'linear-gradient(to right, #0b2149, #f97316)' }}>
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
        {step < 3 && (
          <div className="flex items-center justify-between px-8 pb-6 pt-2">
            <button onClick={() => goTo(step - 1)} disabled={step === 0}
              className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-0">
              Back
            </button>
            <Button onClick={() => goTo(step + 1)}
              className="text-white font-bold px-7 gap-2" style={{ background: '#0b2149' }}>
              {step === 0 ? "Start" : "Continue"} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}