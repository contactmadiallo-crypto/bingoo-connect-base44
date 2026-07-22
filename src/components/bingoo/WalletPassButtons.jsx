import { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

const FONT_BODY = "'Inter', system-ui, sans-serif";

const AppleLogo = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.08 1.85-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const GoogleLogo = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function WalletPassButtons({ profile, color, isDark }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const handleApple = async () => {
    setLoading("apple");
    setError(null);
    try {
      const response = await fetch("/api/functions/generateAppleWalletPass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profile.id, username: profile.username }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate pass");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${profile.username || "bingoo"}.pkpass`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Apple Wallet error:", err);
      setError("Apple Wallet pass unavailable — certificates may not be configured yet.");
    } finally {
      setLoading(null);
    }
  };

  const handleGoogle = async () => {
    setLoading("google");
    setError(null);
    try {
      // Use the SDK so the Base44 auth token is injected — raw fetch() does not
      // send it, which makes the backend ownership check (auth.me()) fail with
      // "Authentication required to view users".
      const response = await base44.functions.invoke("generateGoogleWalletPass", {
        profile_id: profile.id,
        username: profile.username,
      });
      const saveUrl = response?.data?.save_url;
      if (!saveUrl) throw new Error("No save URL returned");
      window.open(saveUrl, "_blank");
    } catch (err) {
      console.error("Google Wallet error:", err);
      setError(err?.response?.data?.error || err?.message || "Google Wallet pass unavailable — try again later.");
    } finally {
      setLoading(null);
    }
  };

  const isBusy = loading !== null;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <motion.button
          onClick={() => {}}
          disabled
          whileHover={{ scale: 1 }}
          whileTap={{ scale: 1 }}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "11px 8px",
            borderRadius: 14,
            background: "#000",
            color: "#fff",
            fontWeight: 700,
            fontSize: 11.5,
            border: "none",
            cursor: "not-allowed",
            fontFamily: FONT_BODY,
            opacity: 0.5,
          }}
          title="Apple Wallet passes are coming very soon"
        >
          <AppleLogo size={13} />
          Apple Wallet · Very soon
        </motion.button>
        <motion.button
          onClick={handleGoogle}
          disabled={isBusy}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "11px 8px",
            borderRadius: 14,
            background: "#fff",
            color: "#3c4043",
            fontWeight: 700,
            fontSize: 11.5,
            border: "1px solid #dadce0",
            cursor: isBusy ? "wait" : "pointer",
            fontFamily: FONT_BODY,
            opacity: isBusy ? 0.6 : 1,
          }}
        >
          <GoogleLogo size={13} />
          {loading === "google" ? "Generating…" : "Google Wallet"}
        </motion.button>
      </div>
      {error && (
        <p style={{ fontSize: 11, color: "#ef4444", textAlign: "center", margin: "6px 0 0", fontFamily: FONT_BODY }}>
          {error}
        </p>
      )}
    </div>
  );
}