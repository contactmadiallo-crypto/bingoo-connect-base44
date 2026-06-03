import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function ZelleQRModal({ qrUrl, label, emoji, onClose }) {
  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          onClick={e => e.stopPropagation()}
          style={{ background: "#fff", borderRadius: 24, padding: 28, maxWidth: 320, width: "100%", textAlign: "center", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>{emoji || "💳"}</div>
          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 900, color: "#0f172a" }}>Pay with {label || "Zelle"}</h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>Scan this QR code with your banking app</p>
          <img src={qrUrl} alt="QR Code" style={{ width: "100%", maxWidth: 220, borderRadius: 12, border: "1px solid #e2e8f0", display: "block", margin: "0 auto 20px" }} />
          <button
            onClick={onClose}
            style={{ width: "100%", padding: "12px", borderRadius: 12, background: "#f1f5f9", border: "none", fontSize: 14, fontWeight: 700, color: "#374151", cursor: "pointer" }}
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}