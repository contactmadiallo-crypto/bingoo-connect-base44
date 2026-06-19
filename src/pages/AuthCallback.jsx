/**
 * AuthCallback — handles the /auth route that Base44 OAuth redirects to after Google sign-in.
 * app-params.js already strips access_token from the URL and stores it in localStorage
 * on every page load, so by the time this component mounts the SDK token is set.
 * We just wait for AuthContext to confirm the session, then redirect to the right place.
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
      // Check if the user has any profiles — new users go to /bingoo (which shows onboarding)
      // Existing users also go to /bingoo (overview). Both cases land on /bingoo.
      const fromUrl = new URLSearchParams(window.location.search).get("from_url");
      if (fromUrl && fromUrl.startsWith("/") && fromUrl !== "/auth") {
        navigate(fromUrl, { replace: true });
      } else {
        navigate("/bingoo", { replace: true });
      }
    } else {
      // Auth failed — send back to login
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