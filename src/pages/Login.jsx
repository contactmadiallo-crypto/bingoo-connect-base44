import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import AuthTopNav from "@/components/auth/AuthTopNav";
import RegisterBenefitsPanel from "@/components/auth/RegisterBenefitsPanel";

// V3 split-screen palette (from Figma source of truth)
const HEADING = "#0f172a";
const SUBTEXT = "#64748b";
const BORDER = "#e2e8f0";
const INPUT_BG = "#f9fafb";
const ORANGE = "#f97316";

const getNextUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || "/bingoo";
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      // Log login to ActivityLog after successful auth
      const user = await base44.auth.me().catch(() => null);
      if (user) {
        base44.entities.ActivityLog.create({
          user_id: user.id,
          user_email: user.email,
          action: "login",
          description: `Login via email/password from ${navigator.userAgent.includes("Mobile") ? "mobile" : "desktop"}`,
          user_agent: navigator.userAgent.slice(0, 200),
          timestamp: new Date().toISOString(),
        }).catch(() => {});
      }
      window.location.replace(getNextUrl());
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    const nextUrl = getNextUrl();
    const callbackUrl = `${window.location.origin}/auth?next=${encodeURIComponent(nextUrl)}`;
    base44.auth.loginWithProvider("google", callbackUrl);
  };

  const handleApple = () => {
    const nextUrl = getNextUrl();
    const callbackUrl = `${window.location.origin}/auth?next=${encodeURIComponent(nextUrl)}`;
    base44.auth.loginWithProvider("apple", callbackUrl);
  };

  const nextParam = new URLSearchParams(window.location.search).get("next");
  const registerHref = nextParam ? `/register?next=${encodeURIComponent(nextParam)}` : "/register";
  const loginHref = nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login";

  const inputClass =
    "h-12 rounded-lg bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus-visible:border-orange-400";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthTopNav loginHref={loginHref} />
      <div className="flex-1 flex flex-col lg:flex-row lg:items-stretch">
        {/* Left — brand benefits panel (desktop only) */}
        <div className="hidden lg:block lg:w-1/2">
          <RegisterBenefitsPanel />
        </div>

        {/* Right — login form panel */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center px-5 sm:px-8 py-10 lg:py-16 bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                style={{ color: HEADING }}
              >
                Welcome back
              </h1>
              <p className="mt-2 text-sm" style={{ color: SUBTEXT }}>
                Sign in to your Bingoo Connect account
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-sm font-medium mb-3 bg-white hover:bg-slate-50"
              style={{ border: `1px solid ${BORDER}`, color: HEADING }}
              onClick={handleGoogle}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = ORANGE)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
            >
              <GoogleIcon className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 text-sm font-medium mb-6 bg-white hover:bg-slate-50"
              style={{ border: `1px solid ${BORDER}`, color: HEADING }}
              onClick={handleApple}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = ORANGE)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = BORDER)}
            >
              <AppleIcon className="w-5 h-5 mr-2" />
              Continue with Apple
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: BORDER }} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 bg-white" style={{ color: SUBTEXT }}>
                  or
                </span>
              </div>
            </div>

            {error && (
              <div
                className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium" style={{ color: SUBTEXT }}>
                  Email
                </Label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: ORANGE }}
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${inputClass}`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-medium" style={{ color: SUBTEXT }}>
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium hover:underline"
                    style={{ color: ORANGE }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: ORANGE }}
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 ${inputClass}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-semibold rounded-lg border-0"
                style={{ background: ORANGE, color: "#ffffff" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                  </>
                ) : (
                  <>
                    Log in <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: SUBTEXT }}>
              Don't have an account?{" "}
              <Link
                to={registerHref}
                className="font-semibold hover:underline"
                style={{ color: ORANGE }}
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}