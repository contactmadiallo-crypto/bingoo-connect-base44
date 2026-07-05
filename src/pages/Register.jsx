import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import { toast } from "@/components/ui/use-toast";

const getNextUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || "/bingoo";
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

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
    if (pwError) { setError(pwError); return; }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
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
      base44.functions.invoke('onUserSignup', { data: { email, full_name: email.split('@')[0] } }).catch(() => {});
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
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
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

  if (showOtp) {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle={`We sent a 6-digit code to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
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
          className="w-full h-12 font-medium bg-blue-500 hover:bg-blue-600 text-white border-0"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
        <p className="text-center text-sm text-white/50 mt-4">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-blue-400 font-medium hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  const nextParam = new URLSearchParams(window.location.search).get("next");
  const loginHref = nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login";

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Bingoo Connect for free"
      footer={
        <>
          <span className="text-white/60">Already have an account?</span>{" "}
          <Link to={loginHref} className="text-blue-400 font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-3 bg-white/10 border-white/30 text-white hover:bg-white/20"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6 bg-white/10 border-white/30 text-white hover:bg-white/20"
        onClick={handleApple}
      >
        <AppleIcon className="w-5 h-5 mr-2" />
        Continue with Apple
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-3 text-white/50">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/80">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-400"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/80">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-400"
              required
            />
          </div>
          <p className="text-xs text-white/40">Min 8 chars · 1 uppercase · 1 number · 1 special character</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-white/80">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-400"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium bg-blue-500 hover:bg-blue-600 text-white border-0" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}