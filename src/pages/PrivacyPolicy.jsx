import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 10px", paddingBottom: 8, borderBottom: "2px solid #eff6ff" }}>{title}</h2>
    <div style={{ fontSize: 14, lineHeight: 1.8, color: "#475569" }}>{children}</div>
  </div>
);

const Li = ({ children }) => (
  <li style={{ marginBottom: 6, paddingLeft: 4 }}>{children}</li>
);

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0B2E6B, #1a4a9e)", padding: "40px 24px 32px", textAlign: "center" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", marginBottom: 20, textDecoration: "none", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 14 }}>
          ← Bingoo Connect
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>Last updated: June 7, 2025</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 60px" }}>

        <Section title="1. Introduction">
          <p>Bingoo Connect ("we," "our," or "us") operates the Bingoo Connect platform, including our website at <strong>bingooconnect.com</strong>, mobile applications, and NFC-enabled digital business card services. This Privacy Policy explains how we collect, use, share, and protect your personal information.</p>
          <p style={{ marginTop: 10 }}>By using Bingoo Connect, you agree to the collection and use of information in accordance with this policy.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p style={{ marginBottom: 12 }}><strong>2.1 Account & Profile Information</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <Li>Full name, email address, and password</Li>
            <Li>Phone number and WhatsApp number</Li>
            <Li>Profile photo and cover photo</Li>
            <Li>Job title, company name, and business bio</Li>
            <Li>Website URL, social media links (Instagram, Facebook, TikTok, LinkedIn, YouTube)</Li>
            <Li>Physical or business location (if you choose to display it)</Li>
            <Li>Payment links (Zelle, Cash App, Wave, Orange Money, custom)</Li>
          </ul>

          <p style={{ marginBottom: 12, marginTop: 20 }}><strong>2.2 NFC Device & Scan Data</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <Li>NFC device codes linked to your account</Li>
            <Li>Device type (card, keychain, bracelet, stand, badge, sticker)</Li>
            <Li>Activation status (active / inactive / lost)</Li>
            <Li>Scan events: timestamp, visitor device type, and visitor country</Li>
          </ul>

          <p style={{ marginBottom: 12, marginTop: 20 }}><strong>2.3 Appointment & Booking Data</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <Li>Visitor name, email, and phone for appointment bookings</Li>
            <Li>Selected date, time slot, and appointment notes</Li>
            <Li>Appointment status (pending, confirmed, cancelled)</Li>
          </ul>

          <p style={{ marginBottom: 12, marginTop: 20 }}><strong>2.4 Lead Form Data</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <Li>Name, phone, email submitted through your public profile's lead capture form</Li>
            <Li>Preferred contact method and message</Li>
            <Li>Source profile and submission timestamp</Li>
          </ul>

          <p style={{ marginBottom: 12, marginTop: 20 }}><strong>2.5 Payment & Subscription Data</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <Li>Subscription plan and billing status</Li>
            <Li>Stripe customer ID and subscription ID (we do not store raw card numbers)</Li>
            <Li>Payment history and billing period dates</Li>
            <Li>All payment processing is handled securely by <strong>Stripe</strong> in accordance with their <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Privacy Policy</a></Li>
          </ul>

          <p style={{ marginBottom: 12, marginTop: 20 }}><strong>2.6 Push Notification Data</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <Li>Browser push notification subscription tokens (VAPID)</Li>
            <Li>Notification preferences and opt-in/opt-out status</Li>
          </ul>

          <p style={{ marginBottom: 12, marginTop: 20 }}><strong>2.7 Lost Mode & Device Recovery Data</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <Li>When you mark a device as "Lost," we store that status on your device record</Li>
            <Li>When a finder scans a lost device, we collect: their name, phone, email, self-reported location, message, GPS coordinates (if they grant permission), and scan timestamp</Li>
            <Li>This data is visible only to you (the device owner) in your dashboard</Li>
          </ul>

          <p style={{ marginBottom: 12, marginTop: 20 }}><strong>2.8 Analytics & Usage Data</strong></p>
          <ul style={{ paddingLeft: 20 }}>
            <Li>Profile views, link clicks, and button interactions</Li>
            <Li>Visitor device type and country (no personally identifying information)</Li>
            <Li>Portfolio views and interaction counts</Li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul style={{ paddingLeft: 20 }}>
            <Li>To provide and operate the Bingoo Connect platform and NFC card services</Li>
            <Li>To display your public digital business card profile to visitors</Li>
            <Li>To process subscription payments via Stripe</Li>
            <Li>To send you notifications about new leads, appointments, and finder reports</Li>
            <Li>To enable the Lost Mode recovery feature so finders can contact you</Li>
            <Li>To provide analytics on your profile's performance</Li>
            <Li>To improve our platform, fix bugs, and develop new features</Li>
            <Li>To communicate important service updates and security notices</Li>
            <Li>To comply with legal obligations</Li>
          </ul>
        </Section>

        <Section title="4. How We Share Your Information">
          <p>We do <strong>not</strong> sell your personal data. We may share data with:</p>
          <ul style={{ paddingLeft: 20, marginTop: 10 }}>
            <Li><strong>Stripe</strong> — for payment processing and subscription management</Li>
            <Li><strong>Base44</strong> — our infrastructure and hosting provider</Li>
            <Li><strong>Push notification services</strong> — to deliver browser notifications you opt into</Li>
            <Li><strong>Law enforcement</strong> — if required by applicable law or to protect safety</Li>
          </ul>
          <p style={{ marginTop: 12 }}>Your <strong>public profile</strong> (name, photo, job title, contact info you choose to display) is visible to anyone with your profile link or NFC device.</p>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain your data for as long as your account is active. If you delete your account or request data deletion:</p>
          <ul style={{ paddingLeft: 20, marginTop: 10 }}>
            <Li>Profile and personal data is deleted within 30 days</Li>
            <Li>Stripe billing records are retained as required by financial regulations</Li>
            <Li>Analytics data may be retained in anonymized/aggregated form</Li>
          </ul>
        </Section>

        <Section title="6. Your Rights">
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: 20, marginTop: 10 }}>
            <Li><strong>Access</strong> — request a copy of the data we hold about you</Li>
            <Li><strong>Correction</strong> — update inaccurate information in your profile</Li>
            <Li><strong>Deletion</strong> — request erasure of your personal data</Li>
            <Li><strong>Portability</strong> — receive your data in a structured format</Li>
            <Li><strong>Opt-out</strong> — unsubscribe from push notifications at any time</Li>
          </ul>
          <p style={{ marginTop: 12 }}>To exercise these rights, visit our <Link to="/data-deletion" style={{ color: "#2563eb" }}>Data Deletion Request</Link> page or email us at <a href="mailto:privacy@bingooconnect.com" style={{ color: "#2563eb" }}>privacy@bingooconnect.com</a>.</p>
        </Section>

        <Section title="7. Cookies & Tracking">
          <p>Bingoo Connect uses cookies and local storage to maintain your login session and remember your preferences (e.g., language, dark mode). We do not use third-party advertising cookies.</p>
        </Section>

        <Section title="8. Security">
          <p>We implement industry-standard security measures including HTTPS encryption, secure API authentication, and row-level security on our database. However, no method of transmission over the Internet is 100% secure.</p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>Bingoo Connect is not directed to children under 13. We do not knowingly collect data from children. If you believe a child has provided us with personal data, please contact us immediately.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a notice in the app. Continued use after changes constitutes acceptance.</p>
        </Section>

        <Section title="11. Contact Us">
          <p>For privacy questions or data requests:</p>
          <ul style={{ paddingLeft: 20, marginTop: 10 }}>
            <Li>Email: <a href="mailto:privacy@bingooconnect.com" style={{ color: "#2563eb" }}>privacy@bingooconnect.com</a></Li>
            <Li>Website: <Link to="/contact-support" style={{ color: "#2563eb" }}>Contact Support</Link></Li>
            <Li>Data Deletion: <Link to="/data-deletion" style={{ color: "#2563eb" }}>Submit a Request</Link></Li>
          </ul>
        </Section>

        {/* Footer nav */}
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