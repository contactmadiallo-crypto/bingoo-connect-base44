import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/components/ui/use-toast";
import AuthTopNav from "@/components/auth/AuthTopNav";
import RegisterBenefitsPanel from "@/components/auth/RegisterBenefitsPanel";

const NAVY = "#0b2149";
const ORANGE = "#f97316";

const getNextUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || "/bingoo";
};

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (pw) => {
    if (pw.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(pw)) return "Password must contain at least one number";
    if (!/[^A-Za-z0-9]/.test(pw)) return "Password must contain at least one special character";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      // Fire the welcome email — best-effort, never blocks the redirect.
      base44.functions
        .invoke("onUserSignup", { data: { email, full_name: fullName || email.split("@")[0] } })
        .catch(() => {});
      window.location.href = getNextUrl();
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const nextParam = new URLSearchParams(window.location.search).get("next");
  const loginHref = nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login";

  const renderOtpStep = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-slate-500">We sent a 6-digit code to {email}</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-center mb-6">
        <InputOTP
          maxLength={6}
          value={otpCode}
          onChange={setOtpCode}
          autoFocus
          autoComplete="one-time-code"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        className="w-full h-12 font-semibold rounded-lg border-0"
        style={{ background: ORANGE, color: "#ffffff" }}
        onClick={handleVerify}
        disabled={loading || otpCode.length < 6}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
          </>
        ) : (
          "Verify Email"
        )}
      </Button>

      <p className="text-center text-sm text-slate-500 mt-4">
        Didn't receive the code?{" "}
        <button
          onClick={handleResend}
          className="font-semibold hover:underline"
          style={{ color: ORANGE }}
        >
          Resend
        </button>
      </p>
    </div>
  );

  const renderFormStep = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-500">Free forever. No credit card required.</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullname" className="text-slate-700 font-medium">
            Full Name
          </Label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <Input
              id="fullname"
              type="text"
              autoComplete="name"
              autoFocus
              placeholder="James Carter"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 h-12 rounded-lg bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus-visible:border-orange-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-lg bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus-visible:border-orange-400"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700 font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 rounded-lg bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus-visible:border-orange-400"
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
          <p className="text-xs text-slate-400">
            Min 8 chars · 1 uppercase · 1 number · 1 special character
          </p>
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-semibold rounded-lg border-0"
          style={{ background: ORANGE, color: "#ffffff" }}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
            </>
          ) : (
            <>
              Create Free Account <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-5">
        By signing up you agree to our{" "}
        <Link to="/terms" className="font-medium hover:underline" style={{ color: ORANGE }}>
          Terms
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="font-medium hover:underline" style={{ color: ORANGE }}>
          Privacy Policy
        </Link>
        .
      </p>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <Link to={loginHref} className="font-semibold hover:underline" style={{ color: ORANGE }}>
          Log in
        </Link>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthTopNav loginHref={loginHref} />
      <div className="flex-1 flex flex-col lg:flex-row lg:items-stretch">
        {/* Left — benefits panel (desktop only) */}
        <div className="hidden lg:block lg:w-1/2">
          <RegisterBenefitsPanel />
        </div>
        {/* Right — form / OTP panel */}
        <div className="flex-1 lg:w-1/2 flex items-center justify-center px-5 sm:px-8 py-10 lg:py-16 bg-white">
          {showOtp ? renderOtpStep() : renderFormStep()}
        </div>
      </div>
    </div>
  );
}