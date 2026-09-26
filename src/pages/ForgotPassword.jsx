import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

export default function ForgotPassword() {
  const { language } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Always show success regardless
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      title={t("auth_reset_title",language)}
      subtitle={t("auth_reset_subtitle",language)}
      footer={
        <Link to="/login" className="text-blue-400 font-medium hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> {t("auth_back_login",language)}
        </Link>
      }
    >
      {sent ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-4">📬</div>
          <p className="text-white font-semibold mb-1">{t("auth_check_inbox",language)}</p>
          <p className="text-sm text-white/60">
            {t("auth_reset_email_copy",language)}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">{t("auth_email_address",language)}</Label>
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
          <Button type="submit" className="w-full h-12 font-medium bg-blue-500 hover:bg-blue-600 text-white border-0" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("auth_sending",language)}
              </>
            ) : (
              t("auth_send_reset",language)
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}