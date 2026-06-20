/**
 * AuthCallback — handles the /auth route that Base44 OAuth redirects to after Google sign-in.
 * app-params.js already strips access_token from the URL and stores it in localStorage
 * on every page load, so by the time this component mounts the SDK token is set.
 * We just wait for AuthContext to confirm the session, then redirect to the right place.
 *
 * CRITICAL: After Google OAuth, owned_profile_ids is often empty (never populated during
 * the OAuth flow). We sync it here so NFCDevice/Appointment/Lead RLS works immediately.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

export default function AuthCallback() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoadingAuth) return; // wait for auth check to finish

    if (isAuthenticated) {
      // Sync owned_profile_ids immediately after OAuth login so RLS-gated entities work.
      const syncAndRedirect = async () => {
        try {
          const user = await base44.auth.me();
          const currentOwned = user?.owned_profile_ids || [];
          if (currentOwned.length === 0) {
            // User has no owned_profile_ids — fetch their profiles and sync
            const profiles = await base44.entities.Profile.filter({ created_by_id: user.id });
            if (profiles.length > 0) {
              const ids = profiles.map(p => p.id);
              await base44.auth.updateMe({ owned_profile_ids: ids });
              console.log("[AuthCallback] Synced owned_profile_ids:", ids);
            }
          }
        } catch (e) {
          console.warn("[AuthCallback] owned_profile_ids sync failed (non-critical):", e.message);
        }

        const params = new URLSearchParams(window.location.search);
        const next = params.get("next");
        const destination = (next && next.startsWith("/") && next !== "/auth") ? next : "/bingoo";
        navigate(destination, { replace: true });
      };

      syncAndRedirect();
    } else {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}>
      <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
      <p className="text-blue-200 text-sm font-medium">Completing sign in…</p>
    </div>
  );
}