import LegalPageLayout, { LegalSection, LegalTOC } from "@/components/legal/LegalPageLayout";
import { Link } from "react-router-dom";

const TOC = [
  ["1", "Acceptance of Terms", "acceptance"],
  ["2", "Description of Service", "description"],
  ["3", "Account Responsibility", "account"],
  ["4", "Acceptable Use", "acceptable"],
  ["5", "Public Profile Responsibility", "public-profile"],
  ["6", "NFC Device Use", "nfc"],
  ["7", "Asset Recovery Limitations", "asset"],
  ["8", "Document Wallet Terms", "wallet"],
  ["9", "Prohibited Document Uploads", "prohibited"],
  ["10", "No Verification Guarantee", "verification"],
  ["11", "Subscriptions & Billing", "billing"],
  ["12", "Refund Policy", "refund"],
  ["13", "Shop & Order Terms", "shop"],
  ["14", "API Terms (Future Use)", "api"],
  ["15", "Business & Enterprise Accounts", "enterprise"],
  ["16", "Admin / Manual Entitlement Rules", "admin"],
  ["17", "User Content Ownership", "content"],
  ["18", "Platform License", "license"],
  ["19", "Termination & Suspension", "termination"],
  ["20", "Disclaimers", "disclaimers"],
  ["21", "Limitation of Liability", "liability"],
  ["22", "Changes to Terms", "changes"],
  ["23", "Contact", "contact"],
];

export default function TermsOfService() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="July 11, 2026">
      <LegalTOC items={TOC} />

      <LegalSection id="acceptance" title="1. Acceptance of Terms">
        <p>
          By accessing or using Bingoo Connect ("the Service"), you agree to be bound by these Terms
          of Service. If you do not agree, please do not use the Service.
        </p>
        <p className="text-xs text-slate-400 italic">
          This is a product/compliance draft, not legal advice. A lawyer should review it before final adoption.
        </p>
      </LegalSection>

      <LegalSection id="description" title="2. Description of Service">
        <p>
          Bingoo Connect provides digital business card profiles, NFC device management, appointment
          booking, lead capture, analytics, document wallet, shop, and related services. Features
          vary by subscription plan. Available plans: Free, Professional, Business, Salon, Law Firm,
          and Enterprise/Bulk.
        </p>
      </LegalSection>

      <LegalSection id="account" title="3. Account Responsibility">
        <ul>
          <li>You must provide accurate and complete information when creating an account</li>
          <li>You are responsible for maintaining the confidentiality of your password</li>
          <li>You are responsible for all activity that occurs under your account</li>
          <li>You must be at least 13 years old to use this Service</li>
          <li>Business and enterprise account owners are responsible for their team members' activity</li>
        </ul>
      </LegalSection>

      <LegalSection id="acceptable" title="4. Acceptable Use">
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for any illegal or unauthorized purpose</li>
          <li>Upload malicious content or attempt to hack the platform</li>
          <li>Impersonate any person or entity</li>
          <li>Spam or harass other users or visitors</li>
          <li>Reverse engineer or copy the Service</li>
          <li>Resell or redistribute the Service without authorization</li>
          <li>Use bots or automated tools to scrape data from other users' profiles</li>
        </ul>
      </LegalSection>

      <LegalSection id="public-profile" title="5. Public Profile Responsibility">
        <ul>
          <li>You control what appears on your public profile</li>
          <li>You are responsible for the accuracy and legality of your public content</li>
          <li>We are not responsible for how visitors use your publicly displayed contact information</li>
          <li>Do not display content that infringes on others' rights</li>
          <li>You can deactivate your public profile at any time by setting it to inactive</li>
        </ul>
      </LegalSection>

      <LegalSection id="nfc" title="6. NFC Device Use">
        <ul>
          <li>NFC devices are sold separately and are subject to their own product terms</li>
          <li>Device codes are unique and non-transferable once activated</li>
          <li>You may only link a device to profiles you own</li>
          <li>You are responsible for keeping your devices secure</li>
          <li>Lost Mode is a convenience feature; Bingoo Connect does not guarantee recovery</li>
        </ul>
      </LegalSection>

      <LegalSection id="asset" title="7. Asset Recovery Limitations">
        <ul>
          <li>The Lost Mode and asset recovery features help connect finders with owners</li>
          <li>Bingoo Connect does <strong>not</strong> guarantee that lost items will be recovered</li>
          <li>We are not liable for loss, theft, or damage to your NFC devices or tagged assets</li>
          <li>Finder-provided information is self-reported and not verified by us</li>
        </ul>
      </LegalSection>

      <LegalSection id="wallet" title="8. Document Wallet Terms">
        <ul>
          <li>The Document Wallet is a private storage feature for your personal documents</li>
          <li>You are responsible for the documents you upload</li>
          <li>Documents are <strong>private by default</strong> — they are never shown on your public profile</li>
          <li>You may create shared links for specific documents — these are revocable and can expire</li>
          <li>Shared links are your responsibility; manage them carefully and revoke them when no longer needed</li>
          <li>We are not responsible for unauthorized access if you share a link with someone</li>
        </ul>
      </LegalSection>

      <LegalSection id="prohibited" title="9. Prohibited Document Uploads">
        <p>You may <strong>not</strong> upload:</p>
        <ul>
          <li>Documents you do not own or do not have rights to</li>
          <li>Illegal content or content depicting illegal activity</li>
          <li>Malware or files designed to harm systems</li>
          <li>Documents belonging to others without their consent</li>
          <li>Content that violates third-party privacy rights</li>
          <li>Classified or restricted government documents you are not authorized to possess</li>
        </ul>
      </LegalSection>

      <LegalSection id="verification" title="10. No Verification Guarantee">
        <ul>
          <li>Bingoo Connect does <strong>not</strong> verify the authenticity of uploaded documents</li>
          <li>We do <strong>not</strong> provide government identity verification</li>
          <li>We do <strong>not</strong> provide legal, medical, or government certification</li>
          <li>ID cards, passports, licenses, and certifications stored in the Document Wallet are stored as-is — we do not validate them</li>
          <li>Verification badges (if displayed on a profile) are visual indicators only and do not constitute legal verification unless explicitly stated otherwise</li>
        </ul>
      </LegalSection>

      <LegalSection id="billing" title="11. Subscriptions & Billing">
        <ul>
          <li>Paid plans are billed monthly or annually via Stripe</li>
          <li>Plans: Free, Professional, Business, Salon, Law Firm, Enterprise/Bulk</li>
          <li>We may change pricing with 30 days' notice</li>
          <li>Downgrading may result in loss of access to premium features</li>
          <li>Failed payments may result in suspension of premium features</li>
          <li>Admin is an internal role, not a subscription plan</li>
        </ul>
      </LegalSection>

      <LegalSection id="refund" title="12. Refund Policy">
        <ul>
          <li>Subscription fees are non-refundable except as required by law or at our discretion</li>
          <li>If you cancel mid-cycle, you retain access until the end of the billing period</li>
          <li>Shop orders may be eligible for refund per our shop return policy</li>
          <li>Contact us within 14 days of a billing issue for review</li>
        </ul>
      </LegalSection>

      <LegalSection id="shop" title="13. Shop & Order Terms">
        <ul>
          <li>NFC hardware and accessories are sold through our shop</li>
          <li>Products are subject to availability</li>
          <li>Shipping times are estimates, not guarantees</li>
          <li>Prices are listed in USD; currency conversion shown at checkout is approximate</li>
          <li>Defective products may be eligible for replacement — contact support</li>
        </ul>
      </LegalSection>

      <LegalSection id="api" title="14. API Terms (Future Use)">
        <ul>
          <li>API access may be available for Enterprise/Bulk plans in the future</li>
          <li>API users must comply with these Terms</li>
          <li>API keys are scoped, rate-limited, and revocable</li>
          <li>We are not liable for damages from API downtime or changes</li>
        </ul>
      </LegalSection>

      <LegalSection id="enterprise" title="15. Business & Enterprise Accounts">
        <ul>
          <li>Business, Salon, Law Firm, and Enterprise plans are for organizational use</li>
          <li>The account owner is responsible for their team members' activity</li>
          <li>Team members may have different access levels set by the account owner</li>
          <li>Enterprise/Bulk plans require custom onboarding — contact sales</li>
        </ul>
      </LegalSection>

      <LegalSection id="admin" title="16. Admin / Manual Entitlement Rules">
        <ul>
          <li>Admin is an <strong>internal platform role</strong>, not a purchasable plan</li>
          <li>Admins can manually adjust entitlements (plan overrides) for support purposes</li>
          <li>Manual entitlement changes are logged in the audit system</li>
          <li>Admins cannot access raw payment data</li>
          <li>Admin access is restricted to authorized Bingoo Connect personnel only</li>
        </ul>
      </LegalSection>

      <LegalSection id="content" title="17. User Content Ownership">
        <ul>
          <li>You retain ownership of content you upload (photos, documents, bio, links)</li>
          <li>By uploading, you grant us a non-exclusive, worldwide license to host and display it as part of the Service</li>
          <li>You are responsible for ensuring your content does not infringe on third-party rights</li>
          <li>You can delete your content at any time</li>
        </ul>
      </LegalSection>

      <LegalSection id="license" title="18. Platform License">
        <ul>
          <li>Bingoo Connect grants you a limited, non-exclusive, revocable license to use the Service</li>
          <li>You may not copy, modify, or distribute the Service itself</li>
          <li>Trademarks and branding remain the property of Bingoo Connect</li>
        </ul>
      </LegalSection>

      <LegalSection id="termination" title="19. Termination & Suspension">
        <ul>
          <li>We may suspend or terminate accounts that violate these Terms</li>
          <li>You may close your account at any time</li>
          <li>Upon termination, your public profile is deactivated</li>
          <li>Your data is processed per our <Link to="/privacy">Privacy Policy</Link> after termination</li>
        </ul>
      </LegalSection>

      <LegalSection id="disclaimers" title="20. Disclaimers">
        <ul>
          <li>The Service is provided "as is" without warranty of any kind</li>
          <li>We do not guarantee uninterrupted or error-free service</li>
          <li>We do not guarantee document authenticity or identity verification</li>
          <li>We disclaim all warranties, express or implied, to the fullest extent permitted by law</li>
        </ul>
      </LegalSection>

      <LegalSection id="liability" title="21. Limitation of Liability">
        <ul>
          <li>Bingoo Connect shall not be liable for indirect, incidental, special, consequential, or punitive damages</li>
          <li>Our total liability shall not exceed the amount you paid us in the past 12 months</li>
          <li>We are not liable for lost items, stolen devices, or unauthorized document access from shared links you created</li>
        </ul>
      </LegalSection>

      <LegalSection id="changes" title="22. Changes to Terms">
        <p>
          We may update these Terms at any time. Significant changes will be communicated via email
          or in-app notice. Continued use of the Service after changes constitutes acceptance of the
          updated Terms.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="23. Contact">
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href="mailto:legal@bingooconnect.com">legal@bingooconnect.com</a> or visit our{" "}
          <Link to="/contact">Contact</Link> page.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}