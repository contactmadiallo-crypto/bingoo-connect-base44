import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, X, Check, User, Palette, Rocket, Briefcase,
  Scissors, Scale, Users, Building2, Sparkles, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfinityMark } from "@/components/mockups/brand/InfinityMark";
import { base44 } from "@/api/base44Client";
import LayoutPicker from "./LayoutPicker";
import { LAYOUT_CATALOG } from "@/lib/profileLayouts";

const ACCOUNT_TYPES = [
  {
    id: "individual",
    label: "Individual",
    desc: "A personal digital identity for networking and sharing.",
    icon: User,
  },
  {
    id: "business",
    label: "Business",
    desc: "A company, salon, law firm, team, or organization.",
    icon: Building2,
  },
];

const INDIVIDUAL_PLANS = [
  {
    id: "free",
    profileType: "personal",
    label: "Free",
    price: "$0",
    desc: "Basic profile, contact form, QR code, and up to 5 links.",
    icon: User,
  },
  {
    id: "professional",
    profileType: "professional",
    label: "Professional",
    price: "$4.99/month",
    badge: "14-day free trial",
    desc: "Portfolio, media, analytics, appointments, premium layouts, and more.",
    icon: Briefcase,
  },
];

const BUSINESS_PLANS = [
  {
    id: "business",
    profileType: "business",
    label: "Business",
    price: "$14.99/month",
    desc: "Business profile, team tools, services, leads, and advanced analytics.",
    icon: Users,
  },
  {
    id: "salon",
    profileType: "salon",
    label: "Salon / Service",
    price: "$19.99/month",
    desc: "Services, staff profiles, gallery, reviews, and booking.",
    icon: Scissors,
  },
  {
    id: "lawfirm",
    profileType: "lawfirm",
    label: "Law Firm",
    price: "$49/month",
    desc: "Attorneys, practice areas, legal intake, offices, and CRM.",
    icon: Scale,
  },
  {
    id: "corporate",
    profileType: "corporate",
    label: "Corporate",
    price: "$99/month",
    desc: "Employee profiles, team administration, attendance, and API access.",
    icon: Building2,
  },
];

const DEFAULT_LAYOUT_BY_PLAN = {
  free: "classic",
  professional: "executive",
  business: "corporate",
  salon: "premium_salon",
  lawfirm: "modern_law",
  corporate: "corporate",
};

const STEPS = [
  { id: "account", label: "Account", icon: User },
  { id: "plan", label: "Plan", icon: Briefcase },
  { id: "design", label: "Layout", icon: Palette },
  { id: "launch", label: "Launch", icon: Rocket },
];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.18 } }),
};

function readPending() {
  try {
    return JSON.parse(localStorage.getItem("bingoo_onboarding_pending") || "{}");
  } catch {
    return {};
  }
}

export default function OnboardingWizard({ userName, currentPlan = "free", onCreateProfile, onDismiss }) {
  const pending = readPending();
  const returnedFromCheckout = new URLSearchParams(window.location.search).get("subscription") === "success";
  const [step, setStep] = useState(returnedFromCheckout ? 2 : 0);
  const [dir, setDir] = useState(1);
  const [accountType, setAccountType] = useState(pending.accountType || "individual");
  const [selectedPlan, setSelectedPlan] = useState(pending.selectedPlan || "free");
  const [profileType, setProfileType] = useState(pending.profileType || "personal");
  const [layoutChoice, setLayoutChoice] = useState(
    pending.layoutChoice || DEFAULT_LAYOUT_BY_PLAN[pending.selectedPlan] || "classic"
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const planOptions = accountType === "business" ? BUSINESS_PLANS : INDIVIDUAL_PLANS;
  const selectedPlanInfo = useMemo(
    () => [...INDIVIDUAL_PLANS, ...BUSINESS_PLANS].find((item) => item.id === selectedPlan),
    [selectedPlan]
  );
  const selectedLayout = LAYOUT_CATALOG.find((item) => item.id === layoutChoice);

  const goTo = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const selectAccountType = (value) => {
    setAccountType(value);
    const first = value === "business" ? BUSINESS_PLANS[0] : INDIVIDUAL_PLANS[0];
    setSelectedPlan(first.id);
    setProfileType(first.profileType);
    setLayoutChoice(DEFAULT_LAYOUT_BY_PLAN[first.id]);
  };

  const selectPlan = (option) => {
    setSelectedPlan(option.id);
    setProfileType(option.profileType);
    setLayoutChoice(DEFAULT_LAYOUT_BY_PLAN[option.id] || "classic");
    setCheckoutError("");
  };

  const persistPending = () => {
    localStorage.setItem("bingoo_onboarding_pending", JSON.stringify({
      accountType, selectedPlan, profileType, layoutChoice,
    }));
  };

  const continueFromPlan = async () => {
    if (selectedPlan === "free" || currentPlan === selectedPlan || returnedFromCheckout) {
      goTo(2);
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError("");
    persistPending();
    try {
      const result = await base44.functions.invoke("createSubscriptionSession", {
        plan: selectedPlan,
        billing_cycle: "monthly",
        success_url: `${window.location.origin}/bingoo?onboarding=resume&subscription=success`,
        cancel_url: `${window.location.origin}/bingoo?onboarding=resume&subscription=canceled`,
      });
      const data = result?.data || result;
      if (data?.updated) {
        goTo(2);
      } else if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Checkout could not be started.");
      }
    } catch (error) {
      setCheckoutError(error?.message || "Checkout could not be started. Please try again.");
      setCheckoutLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("bingoo_onboarding_done", "1");
    localStorage.removeItem("bingoo_onboarding_pending");
    onDismiss();
  };

  const handleLaunch = () => {
    localStorage.setItem("bingoo_onboarding_done", "1");
    localStorage.setItem("bingoo_onboarding_account_type", accountType);
    localStorage.setItem("bingoo_onboarding_selected_plan", selectedPlan);
    localStorage.setItem("bingoo_onboarding_profile_type", profileType);
    localStorage.setItem("bingoo_onboarding_layout", layoutChoice);
    localStorage.removeItem("bingoo_onboarding_pending");
    onCreateProfile();
  };

  const handleContinue = () => {
    if (step === 1) {
      continueFromPlan();
      return;
    }
    goTo(step + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col"
      >
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(to right, #0b2149, #f97316)" }} />
        <button onClick={handleDismiss} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 z-10" aria-label="Close onboarding">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-6 pt-5">
          <InfinityMark className="w-7 h-7" />
          <span className="text-sm font-black text-slate-900">Bingoo<span className="text-orange-500">Connect</span></span>
        </div>

        <div className="flex items-center justify-center gap-1.5 px-6 pt-4 pb-2">
          {STEPS.map((item, index) => (
            <div key={item.id} className="flex items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: step === index ? "#f97316" : step > index ? "#0b2149" : "#e2e8f0" }}
              >
                {step > index
                  ? <Check className="w-4 h-4 text-white" />
                  : <item.icon className="w-4 h-4" style={{ color: step === index ? "#fff" : "#94a3b8" }} />}
              </div>
              {index < STEPS.length - 1 && (
                <div className="w-7 h-0.5 rounded-full" style={{ background: step > index ? "#0b2149" : "#e2e8f0" }} />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-7 px-6 pb-2">
          {STEPS.map((item, index) => (
            <span key={item.id} className={`text-[10px] font-bold ${step === index ? "text-slate-900" : "text-slate-300"}`}>
              {item.label}
            </span>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 scrollbar-hide" style={{ minHeight: 380 }}>
          <AnimatePresence custom={dir} mode="wait">
            {step === 0 && (
              <motion.div key="account" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" className="px-8 pt-5 pb-6">
                <h2 className="text-2xl font-black text-slate-900 text-center">Welcome{userName ? `, ${userName.split(" ")[0]}` : ""}!</h2>
                <p className="text-sm text-slate-500 text-center mt-1 mb-5">First, choose how you will use Bingoo Connect.</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {ACCOUNT_TYPES.map((option) => (
                    <button key={option.id} onClick={() => selectAccountType(option.id)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${accountType === option.id ? "border-orange-500 bg-orange-50" : "border-slate-150 hover:border-slate-300"}`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${accountType === option.id ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-black text-slate-900">{option.label}</p>
                        {accountType === option.id && <Check className="w-4 h-4 text-orange-500" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="plan" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" className="px-8 pt-4 pb-6">
                <h2 className="text-2xl font-black text-slate-900 text-center">Choose your plan</h2>
                <p className="text-sm text-slate-500 text-center mt-1 mb-4">
                  {accountType === "individual" ? "Start free or unlock Professional features." : "Choose the plan built for your organization."}
                </p>
                <div className="space-y-2.5">
                  {planOptions.map((option) => (
                    <button key={option.id} onClick={() => selectPlan(option)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${selectedPlan === option.id ? "border-orange-500 bg-orange-50" : "border-slate-100 hover:border-slate-250"}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPlan === option.id ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black text-sm text-slate-900">{option.label}</p>
                          {option.badge && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{option.badge}</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{option.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900">{option.price}</p>
                        {selectedPlan === option.id && <Check className="w-4 h-4 text-orange-500 ml-auto mt-1" />}
                      </div>
                    </button>
                  ))}
                </div>
                {selectedPlan !== "free" && (
                  <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800 flex gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0" />
                    <span>{selectedPlan === "professional" ? "Your 14-day trial starts securely through Stripe before layout selection." : "Your subscription starts securely through Stripe before layout selection."}</span>
                  </div>
                )}
                {checkoutError && <p className="text-xs font-semibold text-red-600 mt-3">{checkoutError}</p>}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="layout" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" className="px-6 pt-4 pb-6">
                <h2 className="text-2xl font-black text-slate-900 text-center">Pick your official layout</h2>
                <p className="text-sm text-slate-500 text-center mt-1 mb-4">The same layouts available in the profile editor—swipe left or right.</p>
                <LayoutPicker
                  value={layoutChoice}
                  onChange={setLayoutChoice}
                  plan={selectedPlan}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="launch" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" className="flex flex-col items-center text-center px-8 pt-5 pb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[#0b2149]">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Ready to launch</h2>
                <p className="text-sm text-slate-500 mt-1 mb-5">Create your profile now, then add its basic information.</p>
                <div className="w-full space-y-2 mb-5">
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50 text-xs">
                    <span className="font-semibold text-slate-500">Account</span>
                    <span className="font-black text-slate-900">{ACCOUNT_TYPES.find((item) => item.id === accountType)?.label}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50 text-xs">
                    <span className="font-semibold text-slate-500">Plan</span>
                    <span className="font-black text-slate-900">{selectedPlanInfo?.label}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50 text-xs">
                    <span className="font-semibold text-slate-500">Layout</span>
                    <span className="font-black text-slate-900">{selectedLayout?.name}</span>
                  </div>
                </div>
                <Button onClick={handleLaunch} className="w-full text-white font-bold text-base py-5 rounded-2xl gap-2" style={{ background: "linear-gradient(to right, #0b2149, #f97316)" }}>
                  Create My Profile <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < 3 && (
          <div className="flex items-center justify-between px-8 pb-6 pt-2">
            <button onClick={() => goTo(step - 1)} disabled={step === 0 || checkoutLoading}
              className="text-sm font-semibold text-slate-400 hover:text-slate-600 disabled:opacity-0">
              Back
            </button>
            <Button onClick={handleContinue} disabled={checkoutLoading}
              className="text-white font-bold px-7 gap-2 bg-[#0b2149]">
              {checkoutLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening checkout</> : <>Continue <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
