import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";

const getNextUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || "/bingoo";
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    // fromUrl must be a full absolute URL pointing to our /auth callback handler.
    // The platform appends ?access_token=... to this URL after OAuth completes.
    // We encode the intended post-auth destination as a `next` param so AuthCallback
    // can forward the user there after the session is established.
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

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Bingoo Connect account"
      footer={
        <>
          <span className="text-white/60">Don't have an account?</span>{" "}
          <Link to={registerHref} className="text-blue-400 font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6 bg-white/10 border-white/30 text-white hover:bg-white/20"
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <Link to="/forgot-password" className="text-xs text-blue-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-400"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium bg-blue-500 hover:bg-blue-600 text-white border-0" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}