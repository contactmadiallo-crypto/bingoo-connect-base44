import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 10px", paddingBottom: 8, borderBottom: "2px solid #eff6ff" }}>{title}</h2>
    <div style={{ fontSize: 14, lineHeight: 1.8, color: "#475569" }}>{children}</div>
  </div>
);

export default function TermsOfService() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)", padding: "40px 24px 32px", textAlign: "center" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, textDecoration: "none" }}>
          <img src="https://media.base44.com/images/public/692bd9007b93ba81de543346/d277fc218_BingooConnectBrand.png" alt="Bingoo Connect" style={{ height: 28, objectFit: "contain" }} />
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>Terms of Service</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>Last updated: June 7, 2025</p>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 60px" }}>

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using Bingoo Connect ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
        </Section>

        <Section title="2. Description of Service">
          <p>Bingoo Connect provides digital business card profiles, NFC device management, appointment booking, lead capture, analytics, and related services. Features vary by subscription plan.</p>
        </Section>

        <Section title="3. Accounts">
          <ul style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}>You must provide accurate and complete information when creating an account.</li>
            <li style={{ marginBottom: 6 }}>You are responsible for maintaining the confidentiality of your password.</li>
            <li style={{ marginBottom: 6 }}>You are responsible for all activity that occurs under your account.</li>
            <li style={{ marginBottom: 6 }}>You must be at least 13 years old to use this Service.</li>
          </ul>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree not to:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li style={{ marginBottom: 6 }}>Use the Service for any illegal or unauthorized purpose</li>
            <li style={{ marginBottom: 6 }}>Upload malicious content or attempt to hack the platform</li>
            <li style={{ marginBottom: 6 }}>Impersonate any person or entity</li>
            <li style={{ marginBottom: 6 }}>Spam or harass other users or visitors</li>
            <li style={{ marginBottom: 6 }}>Reverse engineer or copy the Service</li>
            <li style={{ marginBottom: 6 }}>Resell or redistribute the Service without authorization</li>
          </ul>
        </Section>

        <Section title="5. NFC Devices">
          <ul style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}>NFC devices are sold separately and are subject to their own product terms.</li>
            <li style={{ marginBottom: 6 }}>Device codes are unique and non-transferable once activated.</li>
            <li style={{ marginBottom: 6 }}>You may only link a device to profiles you own.</li>
            <li style={{ marginBottom: 6 }}>The Lost Mode feature is provided as a convenience; Bingoo Connect does not guarantee recovery of lost items.</li>
          </ul>
        </Section>

        <Section title="6. Subscriptions & Payments">
          <ul style={{ paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}>Paid plans are billed monthly or annually via Stripe.</li>
            <li style={{ marginBottom: 6 }}>Subscription fees are non-refundable except as required by law or at our discretion.</li>
            <li style={{ marginBottom: 6 }}>We may change pricing with 30 days notice.</li>
            <li style={{ marginBottom: 6 }}>Downgrading may result in loss of access to premium features.</li>
            <li style={{ marginBottom: 6 }}>Failed payments may result in suspension of premium features.</li>
          </ul>
        </Section>

        <Section title="7. Content Ownership">
          <p>You retain ownership of the content you upload to Bingoo Connect (photos, bio, links). By uploading content, you grant us a non-exclusive, worldwide license to host and display it as part of the Service.</p>
          <p style={{ marginTop: 10 }}>You are solely responsible for ensuring your content does not infringe on third-party rights.</p>
        </Section>

        <Section title="8. Public Profiles">
          <p>Your public profile is accessible to anyone with your profile URL or NFC device. You control what information appears on your public profile. We are not responsible for how visitors use your publicly displayed contact information.</p>
        </Section>

        <Section title="9. Termination">
          <p>We reserve the right to suspend or terminate accounts that violate these Terms. You may close your account at any time. Upon termination, your public profile will be deactivated and your data will be processed per our Privacy Policy.</p>
        </Section>

        <Section title="10. Disclaimers">
          <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE SERVICE. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED.</p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, BINGOO CONNECT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.</p>
        </Section>

        <Section title="12. Governing Law">
          <p>These Terms are governed by applicable law. Any disputes shall be resolved through binding arbitration or in the courts of competent jurisdiction.</p>
        </Section>

        <Section title="13. Changes to Terms">
          <p>We may update these Terms at any time. Significant changes will be communicated via email or in-app notice. Continued use of the Service constitutes acceptance of the updated Terms.</p>
        </Section>

        <Section title="14. Contact">
          <p>Questions about these Terms? Contact us at <a href="mailto:legal@bingooconnect.com" style={{ color: "#2563eb" }}>legal@bingooconnect.com</a> or visit our <Link to="/contact-support" style={{ color: "#2563eb" }}>Contact Support</Link> page.</p>
        </Section>

        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 24, display: "flex", flexWrap: "wrap", gap: "8px 20px", justifyContent: "center" }}>
          {[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Data Deletion", "/data-deletion"], ["Contact Support", "/contact-support"]].map(([l, t]) => (
            <Link key={t} to={t} style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12 }}>© {new Date().getFullYear()} Bingoo Connect</p>
      </div>
    </div>
  );
}