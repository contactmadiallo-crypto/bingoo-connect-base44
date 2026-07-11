import LegalPageLayout, { LegalSection, LegalTOC } from "@/components/legal/LegalPageLayout";
import { Link } from "react-router-dom";

const TOC = [
  ["1", "Introduction", "intro"],
  ["2", "Information We Collect", "collect"],
  ["3", "Public vs Private Visibility", "visibility"],
  ["4", "Controlled Sharing", "sharing"],
  ["5", "How We Use Your Information", "use"],
  ["6", "How We Share Information", "share"],
  ["7", "Data Retention", "retention"],
  ["8", "Data Deletion", "deletion"],
  ["9", "Data Export", "export"],
  ["10", "Data Correction", "correction"],
  ["11", "User Consent", "consent"],
  ["12", "Security Practices", "security"],
  ["13", "API Access & Future Integrations", "api"],
  ["14", "International Users", "international"],
  ["15", "Children's Privacy", "children"],
  ["16", "Changes to This Policy", "changes"],
  ["17", "Contact Us", "contact"],
];

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="July 11, 2026">
      <LegalTOC items={TOC} />

      <LegalSection id="intro" title="1. Introduction">
        <p>
          Bingoo Connect ("we," "our," or "us") operates the Bingoo Connect platform at{" "}
          <strong>bingooconnect.com</strong>, including our website, mobile applications,
          NFC-enabled digital business card services, appointment booking, lead management,
          document wallet, and shop.
        </p>
        <p>
          This Privacy Policy explains how we collect, use, share, and protect your personal
          information. By using Bingoo Connect, you agree to the practices described here.
        </p>
        <p className="text-xs text-slate-400 italic">
          This is a product/compliance draft, not legal advice. A lawyer should review it before final adoption.
        </p>
      </LegalSection>

      <LegalSection id="collect" title="2. Information We Collect">
        <p><strong>2.1 Account & Profile Data</strong></p>
        <ul>
          <li>Full name, email address, and password (hashed — never stored in plain text)</li>
          <li>Phone number and WhatsApp number</li>
          <li>Profile photo and cover photo</li>
          <li>Job title, company name, and bio</li>
          <li>Website URL, social media links (Instagram, Facebook, TikTok, LinkedIn, YouTube)</li>
          <li>Physical or business location (if you choose to display it)</li>
          <li>Payment links (Zelle, Cash App, Wave, Orange Money, custom)</li>
          <li>Language and theme preferences (light/dark mode)</li>
        </ul>

        <p><strong>2.2 Public Profile Data</strong></p>
        <ul>
          <li>Any information you choose to display on your public profile page</li>
          <li>This includes your name, photo, job title, contact details, social links, services, portfolio items, business hours, and appointment booking options</li>
          <li>Public profile data is visible to anyone who visits your profile link or taps your NFC device</li>
          <li>You control what appears — you can hide specific fields at any time</li>
        </ul>

        <p><strong>2.3 NFC Device Data</strong></p>
        <ul>
          <li>Device codes linked to your account</li>
          <li>Device type (card, metal card, keychain, bracelet, stand, badge, sticker, tag)</li>
          <li>Activation status (available, assigned, active, lost, disabled, replaced)</li>
          <li>Assignment date and linked profile</li>
          <li>Device designs and custom configurations</li>
        </ul>

        <p><strong>2.4 QR Scan & Analytics Data</strong></p>
        <ul>
          <li>Profile views, link clicks, and button interactions (WhatsApp, phone, email, social, payment)</li>
          <li>QR code scans and NFC tap events</li>
          <li>Visitor device type and approximate country/region (based on IP, not GPS)</li>
          <li>Timestamps of all interactions</li>
          <li>No personally identifying information about visitors is collected unless they submit a form</li>
        </ul>

        <p><strong>2.5 Leads, Appointments & Booking Data</strong></p>
        <ul>
          <li>Lead form submissions: name, phone, email, preferred contact method, message</li>
          <li>Appointment bookings: visitor name, email, phone, date, time slot, service requested, notes</li>
          <li>Appointment status (pending, confirmed, completed, cancelled, no-show)</li>
          <li>Lead status, follow-up dates, CRM timeline entries, and relationship type</li>
          <li>This data is visible only to you (the profile owner) and authorized admins</li>
        </ul>

        <p><strong>2.6 Shop & Order Data</strong></p>
        <ul>
          <li>Shop orders: product purchased, quantity, price, shipping address</li>
          <li>Order status and tracking information</li>
          <li>Transaction metadata (Stripe receipt ID — not card numbers)</li>
          <li>Cart contents (stored in your browser until checkout)</li>
        </ul>

        <p><strong>2.7 Stripe Billing Data</strong></p>
        <ul>
          <li>Subscription plan and billing status (active, trial, past due, canceled)</li>
          <li>Stripe customer ID and subscription ID</li>
          <li>Payment history and billing period dates</li>
          <li>All payment processing is handled securely by <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe</a>. We do not store raw card numbers, CVVs, or full bank account numbers</li>
        </ul>

        <p><strong>2.8 Document Wallet Data</strong></p>
        <ul>
          <li>Documents you upload to your private Document Wallet (files, file names, file types, file sizes)</li>
          <li>Document categories (see 2.9 for the full list)</li>
          <li>Front and back side images for ID-type documents</li>
          <li>Expiration dates and personal notes you add</li>
          <li>Visibility setting: <strong>private by default</strong>, or shared if you explicitly enable it</li>
          <li>Documents are <strong>PRIVATE BY DEFAULT</strong>. Only you (the owner) and authorized admins can access private documents</li>
        </ul>

        <p><strong>2.9 Sensitive Document Types</strong></p>
        <p>Specific document types you may store in the Document Wallet include:</p>
        <ul>
          <li>Government ID cards (front and back)</li>
          <li>Passports</li>
          <li>Social Security cards</li>
          <li>Work authorization documents</li>
          <li>Visas</li>
          <li>Professional certifications and licenses</li>
          <li>Business documents and contracts</li>
          <li>Tax documents</li>
          <li>Insurance cards</li>
          <li>Medical records</li>
          <li>Education records and diplomas</li>
          <li>Pet records and vaccination cards</li>
          <li>Asset proof documents (receipts, ownership records)</li>
          <li>Resumes and photos</li>
        </ul>
        <p>
          These documents are <strong>private by default</strong>. They are{" "}
          <strong>never shown on your public profile</strong>. They are only accessible to you
          and authorized admins. Shared document links are intentional, revocable, and can be set to expire.
        </p>

        <p><strong>2.10 Asset Recovery & Lost Mode Data</strong></p>
        <ul>
          <li>When you mark an NFC device as "Lost," we store that status and your recovery preferences</li>
          <li>When a finder scans a lost device, we collect: their name, phone, email, self-reported location, message, and scan timestamp</li>
          <li>GPS coordinates may be collected if the finder grants browser permission</li>
          <li>Your preferred safe contact method is shown to the finder (phone, email, WhatsApp, or none)</li>
          <li>This data is visible only to you (the device owner) in your dashboard</li>
          <li>For asset items (pets, luggage, keys, equipment, vehicles), we store asset type, name, photo, and recovery instructions</li>
        </ul>

        <p><strong>2.11 Admin Access & Audit Logs</strong></p>
        <ul>
          <li>Admin is an <strong>internal role</strong>, not a subscription plan — admins are authorized Bingoo Connect staff</li>
          <li>Admins can access certain data for support and platform management</li>
          <li>All admin actions are logged in our audit system: action type, who performed it, target entity, old value, new value, and timestamp</li>
          <li>Admin access to private documents is logged</li>
          <li>Admins cannot view raw payment data (Stripe handles that)</li>
        </ul>

        <p><strong>2.12 Push Notification Data</strong></p>
        <ul>
          <li>Browser push notification subscription tokens (VAPID keys)</li>
          <li>Device label, browser type, and platform/OS</li>
          <li>Notification preferences and opt-in/opt-out status</li>
        </ul>

        <p><strong>2.13 Cookies, Analytics & Device/Browser Data</strong></p>
        <ul>
          <li>Session cookies to maintain your login</li>
          <li>Local storage for preferences (language, dark mode, cart contents)</li>
          <li>Visitor device type and browser (for analytics, not personally identifying)</li>
          <li>We do <strong>not</strong> use third-party advertising cookies</li>
          <li>We do <strong>not</strong> sell analytics data</li>
        </ul>
      </LegalSection>

      <LegalSection id="visibility" title="3. Public vs Private Visibility Rules">
        <ul>
          <li>Your public profile shows only what you choose to display: name, photo, contact info, social links, services, portfolio, business hours, and booking options</li>
          <li><strong>Private documents in your Document Wallet are NEVER shown on your public profile</strong></li>
          <li>Sensitive fields (like SSN, full ID numbers) are hidden by default in any shared view</li>
          <li>Leads, appointments, and CRM data are visible only to you (the profile owner) and admins</li>
          <li>Analytics data is visible only to you and admins</li>
          <li>You control what is public vs private through your profile settings and privacy controls</li>
          <li>Visitors to your public profile cannot see your document wallet, leads, appointments, or analytics</li>
        </ul>
      </LegalSection>

      <LegalSection id="sharing" title="4. Controlled Sharing (Links, QR, Barcode Document Cards)">
        <ul>
          <li>You can create shared document cards with controlled access</li>
          <li>Shared links are <strong>intentional</strong> — you must explicitly enable sharing for each document</li>
          <li>Shared links are <strong>revocable</strong> — you can disable sharing at any time</li>
          <li>Shared links can be set to <strong>expire</strong> automatically</li>
          <li>Shared document cards show only the information you choose to include</li>
          <li>Visitors accessing a shared link do <strong>not</strong> see your other private documents</li>
          <li>Shared links do not require a login, but they are unique URLs that are not publicly listed or indexed by search engines (unless you opt in)</li>
        </ul>
      </LegalSection>

      <LegalSection id="use" title="5. How We Use Your Information">
        <ul>
          <li>To provide and operate the Bingoo Connect platform</li>
          <li>To display your public profile to visitors</li>
          <li>To process subscription and shop payments via Stripe</li>
          <li>To send notifications about new leads, appointments, and finder reports</li>
          <li>To enable Lost Mode recovery</li>
          <li>To provide analytics on your profile performance</li>
          <li>To improve our platform and develop new features</li>
          <li>To communicate service updates and security notices</li>
          <li>To comply with legal obligations</li>
        </ul>
      </LegalSection>

      <LegalSection id="share" title="6. How We Share Information">
        <p>We do <strong>not</strong> sell your personal data. We may share data with:</p>
        <ul>
          <li><strong>Stripe</strong> — for payment processing and subscription management</li>
          <li><strong>Base44</strong> — our infrastructure and hosting provider</li>
          <li><strong>Push notification services</strong> — to deliver notifications you opt into</li>
          <li><strong>Law enforcement</strong> — if required by applicable law or to protect safety</li>
        </ul>
        <p>
          Your public profile is visible to anyone with your link or NFC device. Private documents
          are <strong>never</strong> shared without your explicit action.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="7. Data Retention">
        <ul>
          <li>We retain your data for as long as your account is active</li>
          <li>If you delete your account: profile and personal data is deleted within 30 days</li>
          <li>Stripe billing records are retained as required by financial regulations</li>
          <li>Anonymized/aggregated analytics may be retained indefinitely</li>
          <li>Admin audit logs are retained for security and compliance purposes</li>
          <li>Shared document links remain active until you revoke them or they expire</li>
        </ul>
      </LegalSection>

      <LegalSection id="deletion" title="8. Data Deletion">
        <p>
          You can request deletion of your personal data at any time. Visit our{" "}
          <Link to="/data-deletion">Data Deletion</Link> page to submit a request. We will verify
          your identity before processing. Deletion is <strong>irreversible</strong>. Some data may
          be retained for legal, security, or billing reasons (see section 7).
        </p>
      </LegalSection>

      <LegalSection id="export" title="9. Data Export">
        <p>
          You can request a copy of your data in a structured format. Visit our{" "}
          <Link to="/data-deletion">Data Deletion</Link> page and select "Data Export" as the
          request type. We will send your data to the email on file within 14 days.
        </p>
      </LegalSection>

      <LegalSection id="correction" title="10. Data Correction">
        <p>
          You can update your profile information directly in your dashboard at any time. For data
          you cannot edit yourself, submit a correction request through our{" "}
          <Link to="/data-deletion">Data Deletion</Link> page and select "Data Correction."
        </p>
      </LegalSection>

      <LegalSection id="consent" title="11. User Consent">
        <p>
          By creating an account and using Bingoo Connect, you consent to the collection and use of
          your data as described in this policy. You can withdraw consent by deleting your account.
          Specific features (like push notifications) require separate opt-in consent that you can
          revoke at any time.
        </p>
      </LegalSection>

      <LegalSection id="security" title="12. Security Practices">
        <ul>
          <li>HTTPS encryption for all data transmission</li>
          <li>Secure API authentication with row-level security on our database</li>
          <li>Documents stored in private storage with signed URLs for temporary access</li>
          <li>Passwords are hashed, never stored in plain text</li>
          <li>Payment data is handled entirely by Stripe (PCI-compliant)</li>
          <li>Admin access is role-restricted and logged in the audit system</li>
          <li>No system is 100% secure; we continuously improve our security practices</li>
        </ul>
      </LegalSection>

      <LegalSection id="api" title="13. API Access & Future Integrations">
        <ul>
          <li>We may introduce API access for Enterprise/Bulk plans in the future</li>
          <li>API keys would be scoped, rate-limited, and revocable</li>
          <li>API users would be subject to these same privacy rules</li>
          <li>We will update this policy before launching any API or new integration that affects your data</li>
        </ul>
      </LegalSection>

      <LegalSection id="international" title="14. International Users">
        <p>
          Bingoo Connect is available globally. If you are outside the United States, your data may
          be processed in the US. By using our service, you consent to this transfer. We comply with
          applicable data protection laws, including GDPR where it applies.
        </p>
      </LegalSection>

      <LegalSection id="children" title="15. Children's Privacy">
        <p>
          Bingoo Connect is not directed to children under 13. We do not knowingly collect data from
          children. If you believe a child has provided us with personal data, please contact us
          immediately.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="16. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of significant
          changes by email or through a notice in the app. The "Last updated" date at the top of this
          page reflects the most recent revision.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="17. Contact Us">
        <p>For privacy questions or data requests:</p>
        <ul>
          <li>Email: <a href="mailto:privacy@bingooconnect.com">privacy@bingooconnect.com</a></li>
          <li>Data requests: <Link to="/data-deletion">Submit a request</Link></li>
          <li>General support: <Link to="/contact">Contact us</Link></li>
        </ul>
      </LegalSection>
    </LegalPageLayout>
  );
}