import LegalPageLayout, { LegalSection, LegalTOC } from "@/components/legal/LegalPageLayout";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/I18nContext";

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
  const { language } = useI18n();
  if (language === "fr") return <FrenchTerms />;
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

const FR_SECTIONS = [
  ["acceptance","Acceptation des conditions",["En accédant à Bingoo Connect ou en l’utilisant, vous acceptez les présentes Conditions d’utilisation. Si vous ne les acceptez pas, n’utilisez pas le Service.","Il s’agit d’un projet produit/conformité et non d’un avis juridique. Un avocat devrait l’examiner avant son adoption définitive."]],
  ["description","Description du Service",["Bingoo Connect fournit des profils de cartes de visite numériques, la gestion d’appareils NFC, la prise de rendez-vous, la capture de prospects, des analyses, un portefeuille de documents, une boutique et des services associés. Les fonctionnalités varient selon le forfait."]],
  ["account","Responsabilité du compte",["Vous devez fournir des informations exactes et complètes lors de la création d’un compte.","Vous êtes responsable de la confidentialité de votre mot de passe et de toute activité effectuée avec votre compte.","Vous devez avoir au moins 13 ans pour utiliser le Service.","Les propriétaires de comptes Business et Enterprise sont responsables de l’activité des membres de leur équipe."]],
  ["acceptable","Utilisation acceptable",["Vous ne devez pas utiliser le Service à des fins illégales ou non autorisées, importer du contenu malveillant, tenter de pirater la plateforme, usurper une identité, harceler des utilisateurs, faire de l’ingénierie inverse, redistribuer le Service sans autorisation ou utiliser des outils automatisés pour extraire les données d’autres utilisateurs."]],
  ["public-profile","Responsabilité du profil public",["Vous contrôlez ce qui apparaît sur votre profil public et êtes responsable de l’exactitude et de la légalité du contenu publié.","Nous ne sommes pas responsables de la manière dont les visiteurs utilisent les coordonnées que vous rendez publiques.","Vous pouvez désactiver votre profil public à tout moment."]],
  ["nfc","Utilisation des appareils NFC",["Les appareils NFC sont vendus séparément et soumis à leurs propres conditions produit.","Les codes d’appareil sont uniques et ne sont plus transférables après activation.","Vous ne pouvez associer un appareil qu’à des profils que vous possédez.","Vous êtes responsable de la sécurité de vos appareils. Le Mode Perdu facilite la récupération mais ne la garantit pas."]],
  ["asset","Limites de la récupération d’actifs",["Le Mode Perdu et les fonctions de récupération aident à mettre en relation les personnes qui trouvent un objet avec son propriétaire, sans garantir sa récupération.","Bingoo Connect n’est pas responsable de la perte, du vol ou des dommages affectant vos appareils ou actifs étiquetés. Les informations fournies par les personnes qui trouvent un objet sont déclaratives et non vérifiées."]],
  ["wallet","Conditions du portefeuille de documents",["Le portefeuille de documents est un espace privé pour vos documents personnels. Vous êtes responsable des documents importés.","Les documents sont privés par défaut. Vous pouvez créer des liens de partage spécifiques, révocables et éventuellement limités dans le temps.","Vous êtes responsable des liens que vous partagez et devez les révoquer lorsqu’ils ne sont plus nécessaires."]],
  ["prohibited","Documents interdits",["Vous ne pouvez pas importer de documents que vous ne possédez pas ou pour lesquels vous n’avez pas de droits, de contenu illégal, de logiciels malveillants, de documents appartenant à autrui sans consentement, de contenu portant atteinte à la vie privée de tiers ou de documents gouvernementaux classifiés ou restreints que vous n’êtes pas autorisé à posséder."]],
  ["verification","Aucune garantie de vérification",["Bingoo Connect ne vérifie pas l’authenticité des documents importés et ne fournit pas de vérification d’identité gouvernementale ni de certification juridique, médicale ou gouvernementale.","Les badges de vérification, lorsqu’ils sont affichés, sont des indicateurs visuels et ne constituent pas une vérification légale sauf mention explicite contraire."]],
  ["billing","Abonnements et facturation",["Les forfaits payants sont facturés mensuellement ou annuellement via Stripe. Les tarifs peuvent évoluer avec un préavis de 30 jours.","Une rétrogradation ou un échec de paiement peut limiter l’accès aux fonctions premium. Admin est un rôle interne, pas un forfait d’abonnement."]],
  ["refund","Politique de remboursement",["Les frais d’abonnement ne sont pas remboursables sauf obligation légale ou décision discrétionnaire de Bingoo Connect.","En cas d’annulation en cours de cycle, l’accès reste disponible jusqu’à la fin de la période facturée. Les commandes boutique peuvent être remboursées selon la politique de retour applicable."]],
  ["shop","Conditions de la boutique et des commandes",["Les appareils NFC et accessoires sont vendus sous réserve de disponibilité. Les délais de livraison sont des estimations et non des garanties.","Les prix sont indiqués en USD ; toute conversion de devise affichée est approximative. Les produits défectueux peuvent être éligibles à un remplacement après examen par l’assistance."]],
  ["api","Conditions API (utilisation future)",["Un accès API pourra être proposé à l’avenir pour les forfaits Enterprise/Bulk. Les utilisateurs de l’API devront respecter ces Conditions. Les clés API seront limitées, soumises à des quotas et révocables."]],
  ["enterprise","Comptes Business et Enterprise",["Les forfaits Business, Salon, Cabinet juridique et Enterprise sont destinés aux organisations. Le propriétaire du compte est responsable des membres de son équipe et peut leur attribuer différents niveaux d’accès.","Les forfaits Enterprise/Bulk nécessitent un accompagnement personnalisé."]],
  ["admin","Règles Admin et droits manuels",["Admin est un rôle interne de la plateforme, non achetable. Les administrateurs autorisés peuvent ajuster manuellement certains droits à des fins d’assistance.","Les changements manuels sont journalisés. Les administrateurs n’ont pas accès aux données de paiement brutes."]],
  ["content","Propriété du contenu utilisateur",["Vous conservez la propriété du contenu que vous importez. En l’important, vous nous accordez une licence non exclusive et mondiale pour l’héberger et l’afficher dans le cadre du Service.","Vous êtes responsable du respect des droits de tiers et pouvez supprimer votre contenu à tout moment."]],
  ["license","Licence de la plateforme",["Bingoo Connect vous accorde une licence limitée, non exclusive et révocable d’utilisation du Service. Vous ne pouvez pas copier, modifier ou distribuer le Service lui-même. Les marques et éléments de marque restent la propriété de Bingoo Connect."]],
  ["termination","Résiliation et suspension",["Nous pouvons suspendre ou fermer les comptes qui enfreignent ces Conditions. Vous pouvez fermer votre compte à tout moment. À la résiliation, votre profil public est désactivé et vos données sont traitées conformément à notre Politique de confidentialité."]],
  ["disclaimers","Exclusions de garantie",["Le Service est fourni « en l’état » sans garantie d’aucune sorte. Nous ne garantissons pas un service ininterrompu ou exempt d’erreurs, ni l’authenticité des documents ou la vérification d’identité, dans toute la mesure permise par la loi."]],
  ["liability","Limitation de responsabilité",["Bingoo Connect ne pourra être tenu responsable des dommages indirects, accessoires, spéciaux, consécutifs ou punitifs dans toute la mesure permise par la loi.","Notre responsabilité totale ne dépassera pas le montant que vous nous avez payé au cours des 12 derniers mois. Nous ne sommes pas responsables des objets perdus, appareils volés ou accès non autorisés résultant de liens partagés que vous avez créés."]],
  ["changes","Modification des Conditions",["Nous pouvons mettre à jour ces Conditions. Les changements importants peuvent être communiqués par e-mail ou dans l’application. La poursuite de l’utilisation du Service après modification vaut acceptation des Conditions mises à jour."]],
  ["contact","Contact",["Pour toute question concernant ces Conditions, écrivez à legal@bingooconnect.com ou utilisez notre page Contact."]]
];

function FrenchTerms() {
  const toc = FR_SECTIONS.map(([id,title],i) => [String(i+1),title,id]);
  return (
    <LegalPageLayout title="Conditions d’utilisation" lastUpdated="July 11, 2026">
      <LegalTOC items={toc} />
      {FR_SECTIONS.map(([id,title,blocks],i) => (
        <LegalSection key={id} id={id} title={`${i+1}. ${title}`}>
          {blocks.map((block,j) => <p key={j}>{block}</p>)}
          {id === "termination" && <p><Link to="/privacy">Politique de confidentialité</Link></p>}
          {id === "contact" && <p><Link to="/contact">Nous contacter</Link></p>}
        </LegalSection>
      ))}
    </LegalPageLayout>
  );
}
