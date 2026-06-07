import { Link } from "react-router-dom";

export default function PublicFooter({ dark = false }) {
  const text = dark ? "rgba(255,255,255,0.35)" : "#94a3b8";
  const hover = dark ? "rgba(255,255,255,0.65)" : "#64748b";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  return (
    <div style={{
      textAlign: "center",
      padding: "16px 20px",
      borderTop: `1px solid ${border}`,
      marginTop: 8,
    }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px" }}>
        {[
          { label: "Privacy Policy", to: "/privacy" },
          { label: "Terms of Service", to: "/terms" },
          { label: "Data Deletion", to: "/data-deletion" },
          { label: "Contact Support", to: "/contact-support" },
        ].map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: text,
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => e.target.style.color = hover}
            onMouseLeave={e => e.target.style.color = text}
          >
            {label}
          </Link>
        ))}
      </div>
      <p style={{ fontSize: 10, color: text, margin: "6px 0 0", fontWeight: 500 }}>
        © {new Date().getFullYear()} Bingoo Connect. All rights reserved.
      </p>
    </div>
  );
}