import { useState } from "react";
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
import { safeReturnTo } from "@/lib/authReturnTo";
import { useI18n } from '@/lib/I18nContext';

const NAVY = "#0b2149";
const ORANGE = "#f97316";

const getNextUrl = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("returnTo")) return safeReturnTo();
  return params.get("next") || "/bingoo";
};

export default function Register() {
  const { language } = useI18n();
  const tr = (en, fr) => language === 'fr' ? fr : en;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (pw) => {
    if (pw.length < 8) return tr('Password must be at least 8 characters', 'Le mot de passe doit contenir au moins 8 caractères');
    if (!/[A-Z]/.test(pw)) return tr('Password must contain at least one uppercase letter', 'Le mot de passe doit contenir au moins une lettre majuscule');
    if (!/[0-9]/.test(pw)) return tr('Password must contain at least one number', 'Le mot de passe doit contenir au moins un chiffre');
    if (!/[^A-Za-z0-9]/.test(pw)) return tr('Password must contain at least one special character', 'Le mot de passe doit contenir au moins un caractère spécial');
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
      setError(err.message || tr('Registration failed', 'Échec de l’inscription'));
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
      setError(err.message || tr('Invalid verification code', 'Code de vérification invalide'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: tr('Code sent', 'Code envoyé'), description: tr('Check your email for the new code.', 'Consultez votre e-mail pour le nouveau code.') });
    } catch (err) {
      setError(err.message || tr('Failed to resend code', 'Impossible de renvoyer le code'));
    }
  };

  const nextParam = new URLSearchParams(window.location.search).get("next");
  const loginHref = nextParam ? `/login?next=${encodeURIComponent(nextParam)}` : "/login";

  const renderOtpStep = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>
          {tr('Verify your email', 'Vérifiez votre e-mail')}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{tr('We sent a 6-digit code to', 'Nous avons envoyé un code à 6 chiffres à')} {email}</p>
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
            <Loader2 className="w-4 h-4 animate-spin" /> {tr('Verifying...', 'Vérification…')}
          </>
        ) : (
          tr('Verify Email', 'Vérifier l’e-mail')
        )}
      </Button>

      <p className="text-center text-sm text-slate-500 mt-4">
        {tr("Didn't receive the code?", 'Vous n’avez pas reçu le code ?')}{" "}
        <button
          onClick={handleResend}
          className="font-semibold hover:underline"
          style={{ color: ORANGE }}
        >
          {tr('Resend', 'Renvoyer')}
        </button>
      </p>
    </div>
  );

  const renderFormStep = () => (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: NAVY }}>
          {tr('Create your account', 'Créez votre compte')}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{tr('Free forever. No credit card required.', 'Gratuit pour toujours. Aucune carte bancaire requise.')}</p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullname" className="text-slate-700 font-medium">
            {tr('Full Name', 'Nom complet')}
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
            {tr('Email', 'E-mail')}
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
            {tr('Password', 'Mot de passe')}
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
              placeholder={tr('Min. 8 characters', '8 caractères min.')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 rounded-lg bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus-visible:border-orange-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? tr('Hide password', 'Masquer le mot de passe') : tr('Show password', 'Afficher le mot de passe')}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            {tr('Min 8 chars · 1 uppercase · 1 number · 1 special character', '8 caractères min. · 1 majuscule · 1 chiffre · 1 caractère spécial')}
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
              <Loader2 className="w-4 h-4 animate-spin" /> {tr('Creating account...', 'Création du compte…')}
            </>
          ) : (
            <>
              {tr('Create Free Account', 'Créer un compte gratuit')} <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-5">
        {tr('By signing up you agree to our', 'En vous inscrivant, vous acceptez nos')}{" "}
        <Link to="/terms" className="font-medium hover:underline" style={{ color: ORANGE }}>
          {tr('Terms', 'Conditions')}
        </Link>{" "}
        {tr('and', 'et notre')}{" "}
        <Link to="/privacy" className="font-medium hover:underline" style={{ color: ORANGE }}>
          {tr('Privacy Policy', 'Politique de confidentialité')}
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