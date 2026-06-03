import { motion } from "framer-motion";
import { createPortal } from "react-dom";

export default function ZelleQRModal({ qrUrl, link, label, emoji, onClose }) {
  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 24, padding: 28, maxWidth: 320, width: "100%", textAlign: "center", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", position: "relative" }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>{emoji || "💳"}</div>
        <h3 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 900, color: "#0f172a" }}>Pay with {label || "Zelle"}</h3>

        {qrUrl ? (
          <>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>Scan this QR code with your banking app</p>
            <img
              src={qrUrl}
              alt="QR Code"
              style={{ width: "100%", maxWidth: 240, borderRadius: 12, border: "2px solid #e2e8f0", display: "block", margin: "0 auto 20px" }}
            />
          </>
        ) : (
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>Tap the button below to send money via {label || "Zelle"}</p>
        )}

        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", width: "100%", padding: "13px", borderRadius: 12, background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", marginBottom: 10 }}
          >
            Open {label || "Zelle"} →
          </a>
        )}

        <button
          onClick={onClose}
          style={{ width: "100%", padding: "13px", borderRadius: 12, background: "#f1f5f9", border: "none", fontSize: 14, fontWeight: 700, color: "#374151", cursor: "pointer" }}
        >
          Close
        </button>
      </motion.div>
    </div>,
    document.body
  );
}