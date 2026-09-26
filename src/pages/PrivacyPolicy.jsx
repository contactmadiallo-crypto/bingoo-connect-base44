import LegalPageLayout, { LegalSection, LegalTOC } from "@/components/legal/LegalPageLayout";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/I18nContext";

const EN = {
  title: "Privacy Policy",
  sections: [
    ["intro","Introduction",[
      "Bingoo Connect (\"we,\" \"our,\" or \"us\") operates the Bingoo Connect platform at bingooconnect.com, including our website, mobile applications, NFC-enabled digital business card services, appointment booking, lead management, document wallet, and shop.",
      "This Privacy Policy explains how we collect, use, share, and protect your personal information. By using Bingoo Connect, you agree to the practices described here.",
      "This is a product/compliance draft, not legal advice. A lawyer should review it before final adoption."
    ]],
    ["collect","Information We Collect",[
      "2.1 Account & Profile Data|Full name, email address, and password (hashed — never stored in plain text)|Phone number and WhatsApp number|Profile photo and cover photo|Job title, company name, and bio|Website URL and social media links|Physical or business location, if you choose to display it|Payment links|Language and theme preferences",
      "2.2 Public Profile Data|Information you choose to display on your public profile, including your name, photo, job title, contact details, social links, services, portfolio items, business hours, and appointment booking options|Public profile data is visible to anyone who visits your profile link or taps your NFC device|You can hide specific fields at any time",
      "2.3 NFC Device Data|Device codes linked to your account|Device type|Activation status|Assignment date and linked profile|Device designs and custom configurations",
      "2.4 QR Scan & Analytics Data|Profile views, link clicks, button interactions, QR scans, and NFC taps|Visitor device type and approximate country or region based on IP, not GPS|Timestamps of interactions|No personally identifying visitor information is collected unless a visitor submits a form",
      "2.5 Leads, Appointments & Booking Data|Lead form submissions|Appointment booking details|Appointment status|Lead status, follow-up dates, CRM timeline entries, and relationship type|This data is visible only to you and authorized admins",
      "2.6 Shop & Order Data|Products purchased, quantity, price, and shipping address|Order status and tracking information|Transaction metadata such as Stripe receipt IDs, but not card numbers|Cart contents stored in your browser until checkout",
      "2.7 Stripe Billing Data|Subscription plan and billing status|Stripe customer and subscription IDs|Payment history and billing period dates|Stripe securely handles payment processing; we do not store raw card numbers, CVVs, or full bank account numbers",
      "2.8 Document Wallet Data|Documents you upload, including file names, types, and sizes|Document categories|Front and back images for ID-type documents|Expiration dates and notes|Documents are private by default and are accessible only to you and authorized admins unless you explicitly share them",
      "2.9 Sensitive Document Types|Government IDs, passports, Social Security cards, work authorization documents, visas, professional licenses and certifications, business documents, tax documents, insurance cards, medical records, education records, pet records, asset proof documents, resumes, and photos|These documents are never shown on your public profile unless you explicitly create a controlled shared link",
      "2.10 Asset Recovery & Lost Mode Data|Lost Mode status and recovery preferences|Finder name, phone, email, self-reported location, message, and scan timestamp when submitted|GPS coordinates only if the finder grants browser permission|Safe contact method selected by the owner|Asset type, name, photo, and recovery instructions for tagged assets",
      "2.11 Admin Access & Audit Logs|Admin is an internal role, not a subscription plan|Authorized admins may access certain data for support and platform management|Admin actions and access to private documents are logged|Admins cannot view raw payment data",
      "2.12 Push Notification Data|Push subscription tokens|Device label, browser type, and platform or operating system|Notification preferences and opt-in or opt-out status",
      "2.13 Cookies, Analytics & Device/Browser Data|Session cookies for login|Local storage for language, dark mode, and cart preferences|Visitor device and browser information for analytics|We do not use third-party advertising cookies|We do not sell analytics data"
    ]],
    ["visibility","Public vs Private Visibility Rules",[
      "Your public profile shows only what you choose to display.",
      "Private documents in your Document Wallet are never shown on your public profile.",
      "Sensitive fields are hidden by default in shared views.",
      "Leads, appointments, CRM data, and analytics are visible only to you and authorized admins.",
      "Visitors to your public profile cannot see your document wallet, leads, appointments, or analytics."
    ]],
    ["sharing","Controlled Sharing (Links, QR, Barcode Document Cards)",[
      "You can create shared document cards with controlled access.",
      "Sharing must be explicitly enabled for each document and can be revoked at any time.",
      "Shared links can expire automatically and show only the information you choose to include.",
      "Visitors using a shared link do not see your other private documents.",
      "Shared links do not require login, are not publicly listed, and are not intended for search indexing unless you opt in."
    ]],
    ["use","How We Use Your Information",[
      "To operate the Bingoo Connect platform, display public profiles, process subscription and shop payments, send notifications, enable Lost Mode recovery, provide analytics, improve the platform, communicate service and security updates, and comply with legal obligations."
    ]],
    ["share","How We Share Information",[
      "We do not sell your personal data. We may share data with Stripe for payments, Base44 for infrastructure and hosting, push-notification services you opt into, and law enforcement when required by applicable law or necessary to protect safety.",
      "Your public profile is visible to anyone with your link or NFC device. Private documents are never shared without your explicit action."
    ]],
    ["retention","Data Retention",[
      "We retain your data while your account is active.",
      "After account deletion, profile and personal data is generally deleted within 30 days.",
      "Billing records may be retained as required by financial regulations; anonymized analytics and security audit logs may be retained longer for legitimate compliance and security purposes.",
      "Shared document links remain active until revoked or expired."
    ]],
    ["deletion","Data Deletion",["You can request deletion of your personal data at any time through our Data Deletion page. We verify identity before processing. Deletion is irreversible, and some records may be retained where required for legal, security, or billing reasons."]],
    ["export","Data Export",["You can request a copy of your data in a structured format through our Data Deletion page by selecting Data Export. We aim to send the export to the email on file within 14 days."]],
    ["correction","Data Correction",["You can update profile information directly in your dashboard. For data you cannot edit yourself, submit a correction request through the Data Deletion page and select Data Correction."]],
    ["consent","User Consent",["By creating an account and using Bingoo Connect, you consent to collection and use of your data as described in this policy. Features such as push notifications require separate opt-in consent that you can revoke."]],
    ["security","Security Practices",[
      "We use HTTPS, authenticated APIs, row-level database security, private document storage with temporary signed URLs, hashed passwords, Stripe for PCI-compliant payment handling, role-restricted admin access, and audit logging.",
      "No system is 100% secure; we continuously improve our security practices."
    ]],
    ["api","API Access & Future Integrations",["We may introduce API access for Enterprise/Bulk plans in the future. API keys would be scoped, rate-limited, and revocable. We will update this policy before launching integrations that materially affect your data."]],
    ["international","International Users",["Bingoo Connect is available globally. If you are outside the United States, your data may be processed in the United States. We comply with applicable data-protection laws, including GDPR where it applies."]],
    ["children","Children's Privacy",["Bingoo Connect is not directed to children under 13. We do not knowingly collect personal data from children. Contact us if you believe a child has provided personal data."]],
    ["changes","Changes to This Policy",["We may update this Privacy Policy from time to time. Significant changes may be communicated by email or an in-app notice. The Last updated date reflects the most recent revision."]],
    ["contact","Contact Us",["For privacy questions or data requests, email privacy@bingooconnect.com, submit a request through the Data Deletion page, or contact general support."]]
  ]
};

const FR = {
  title: "Politique de confidentialité",
  sections: [
    ["intro","Introduction",[
      "Bingoo Connect (« nous », « notre » ou « nos ») exploite la plateforme Bingoo Connect sur bingooconnect.com, y compris notre site web, nos applications mobiles, les services de cartes de visite numériques compatibles NFC, la prise de rendez-vous, la gestion des prospects, le portefeuille de documents et la boutique.",
      "La présente Politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations personnelles. En utilisant Bingoo Connect, vous acceptez les pratiques décrites ici.",
      "Il s’agit d’un projet produit/conformité et non d’un avis juridique. Un avocat devrait l’examiner avant son adoption définitive."
    ]],
    ["collect","Informations que nous collectons",[
      "2.1 Données de compte et de profil|Nom complet, adresse e-mail et mot de passe (haché — jamais stocké en clair)|Numéro de téléphone et numéro WhatsApp|Photo de profil et photo de couverture|Poste, nom de l’entreprise et bio|URL du site web et liens vers les réseaux sociaux|Adresse physique ou professionnelle si vous choisissez de l’afficher|Liens de paiement|Préférences de langue et de thème",
      "2.2 Données du profil public|Informations que vous choisissez d’afficher sur votre profil public, notamment votre nom, photo, poste, coordonnées, liens sociaux, services, portfolio, horaires et options de rendez-vous|Les données du profil public sont visibles par toute personne qui visite votre lien ou utilise votre appareil NFC|Vous pouvez masquer certains champs à tout moment",
      "2.3 Données des appareils NFC|Codes d’appareil liés à votre compte|Type d’appareil|Statut d’activation|Date d’attribution et profil associé|Designs et configurations personnalisées",
      "2.4 Données de scan QR et d’analyse|Vues de profil, clics, interactions avec les boutons, scans QR et contacts NFC|Type d’appareil du visiteur et pays ou région approximatifs basés sur l’IP, et non sur le GPS|Horodatage des interactions|Aucune information permettant d’identifier personnellement les visiteurs n’est collectée sauf s’ils soumettent un formulaire",
      "2.5 Données de prospects, rendez-vous et réservations|Soumissions de formulaires de prospects|Détails des réservations de rendez-vous|Statut des rendez-vous|Statut des prospects, dates de suivi, chronologie CRM et type de relation|Ces données sont visibles uniquement par vous et les administrateurs autorisés",
      "2.6 Données de boutique et de commande|Produits achetés, quantité, prix et adresse de livraison|Statut de commande et informations de suivi|Métadonnées de transaction telles que les identifiants de reçu Stripe, mais pas les numéros de carte|Contenu du panier stocké dans votre navigateur jusqu’au paiement",
      "2.7 Données de facturation Stripe|Forfait d’abonnement et statut de facturation|Identifiants client et abonnement Stripe|Historique des paiements et périodes de facturation|Stripe traite les paiements de manière sécurisée ; nous ne stockons pas les numéros de carte bruts, CVV ni numéros complets de compte bancaire",
      "2.8 Données du portefeuille de documents|Documents importés, y compris noms, types et tailles de fichiers|Catégories de documents|Images recto et verso pour les pièces d’identité|Dates d’expiration et notes|Les documents sont privés par défaut et accessibles uniquement à vous et aux administrateurs autorisés sauf partage explicite",
      "2.9 Types de documents sensibles|Pièces d’identité gouvernementales, passeports, cartes de sécurité sociale, autorisations de travail, visas, licences et certifications professionnelles, documents professionnels, fiscaux, d’assurance, médicaux, scolaires, dossiers d’animaux, preuves de propriété, CV et photos|Ces documents ne sont jamais affichés sur votre profil public sauf si vous créez explicitement un lien de partage contrôlé",
      "2.10 Données de récupération d’actifs et Mode Perdu|Statut Mode Perdu et préférences de récupération|Nom, téléphone, e-mail, localisation déclarée, message et horodatage du scan fournis par la personne qui trouve l’objet|Coordonnées GPS uniquement si la personne accorde l’autorisation du navigateur|Méthode de contact sécurisée choisie par le propriétaire|Type, nom, photo et instructions de récupération des actifs étiquetés",
      "2.11 Accès administrateur et journaux d’audit|Admin est un rôle interne et non un forfait d’abonnement|Les administrateurs autorisés peuvent accéder à certaines données pour l’assistance et la gestion de la plateforme|Les actions administrateur et l’accès aux documents privés sont journalisés|Les administrateurs ne peuvent pas voir les données de paiement brutes",
      "2.12 Données de notifications push|Jetons d’abonnement push|Nom de l’appareil, type de navigateur et plateforme ou système d’exploitation|Préférences de notification et statut d’acceptation ou de refus",
      "2.13 Cookies, analyses et données appareil/navigateur|Cookies de session pour maintenir la connexion|Stockage local pour la langue, le mode sombre et le panier|Informations sur l’appareil et le navigateur pour l’analyse|Nous n’utilisons pas de cookies publicitaires tiers|Nous ne vendons pas les données analytiques"
    ]],
    ["visibility","Règles de visibilité publique et privée",[
      "Votre profil public affiche uniquement ce que vous choisissez de rendre visible.",
      "Les documents privés de votre portefeuille de documents ne sont jamais affichés sur votre profil public.",
      "Les champs sensibles sont masqués par défaut dans les vues partagées.",
      "Les prospects, rendez-vous, données CRM et analyses sont visibles uniquement par vous et les administrateurs autorisés.",
      "Les visiteurs de votre profil public ne peuvent pas voir votre portefeuille de documents, vos prospects, vos rendez-vous ni vos analyses."
    ]],
    ["sharing","Partage contrôlé (liens, QR, cartes de documents à code-barres)",[
      "Vous pouvez créer des cartes de documents partagées avec un accès contrôlé.",
      "Le partage doit être activé explicitement pour chaque document et peut être révoqué à tout moment.",
      "Les liens partagés peuvent expirer automatiquement et n’affichent que les informations que vous choisissez d’inclure.",
      "Les visiteurs utilisant un lien partagé ne voient pas vos autres documents privés.",
      "Les liens partagés ne nécessitent pas de connexion, ne sont pas publiquement répertoriés et ne sont pas destinés à être indexés par les moteurs de recherche sauf si vous l’autorisez."
    ]],
    ["use","Comment nous utilisons vos informations",["Pour exploiter Bingoo Connect, afficher les profils publics, traiter les abonnements et achats, envoyer des notifications, permettre la récupération en Mode Perdu, fournir des analyses, améliorer la plateforme, communiquer des mises à jour de service et de sécurité et respecter nos obligations légales."]],
    ["share","Comment nous partageons les informations",[
      "Nous ne vendons pas vos données personnelles. Nous pouvons les partager avec Stripe pour les paiements, Base44 pour l’infrastructure et l’hébergement, les services de notifications push auxquels vous avez souscrit et les autorités lorsque la loi l’exige ou que la sécurité doit être protégée.",
      "Votre profil public est visible par toute personne disposant de votre lien ou de votre appareil NFC. Les documents privés ne sont jamais partagés sans votre action explicite."
    ]],
    ["retention","Conservation des données",[
      "Nous conservons vos données tant que votre compte est actif.",
      "Après suppression du compte, les données de profil et personnelles sont généralement supprimées sous 30 jours.",
      "Les données de facturation peuvent être conservées selon les obligations financières ; les analyses anonymisées et journaux de sécurité peuvent être conservés plus longtemps pour des besoins légitimes de conformité et de sécurité.",
      "Les liens de documents partagés restent actifs jusqu’à leur révocation ou leur expiration."
    ]],
    ["deletion","Suppression des données",["Vous pouvez demander la suppression de vos données personnelles à tout moment depuis notre page Suppression des données. Nous vérifions votre identité avant traitement. La suppression est irréversible et certains dossiers peuvent être conservés lorsque la loi, la sécurité ou la facturation l’exigent."]],
    ["export","Export des données",["Vous pouvez demander une copie de vos données dans un format structuré depuis la page Suppression des données en sélectionnant Export des données. Nous visons à envoyer l’export à l’adresse e-mail enregistrée sous 14 jours."]],
    ["correction","Correction des données",["Vous pouvez modifier vos informations de profil directement dans votre tableau de bord. Pour les données que vous ne pouvez pas modifier vous-même, envoyez une demande de correction depuis la page Suppression des données."]],
    ["consent","Consentement de l’utilisateur",["En créant un compte et en utilisant Bingoo Connect, vous consentez à la collecte et à l’utilisation de vos données telles que décrites dans cette politique. Certaines fonctions, comme les notifications push, nécessitent un consentement séparé que vous pouvez retirer."]],
    ["security","Pratiques de sécurité",[
      "Nous utilisons HTTPS, des API authentifiées, la sécurité au niveau des lignes de la base de données, un stockage privé avec URL signées temporaires, des mots de passe hachés, Stripe pour le traitement PCI des paiements, un accès administrateur limité par rôle et des journaux d’audit.",
      "Aucun système n’est sécurisé à 100 % ; nous améliorons continuellement nos pratiques de sécurité."
    ]],
    ["api","Accès API et intégrations futures",["Nous pourrons proposer à l’avenir un accès API aux forfaits Enterprise/Bulk. Les clés API seraient limitées, soumises à des quotas et révocables. Nous mettrons à jour cette politique avant de lancer des intégrations affectant sensiblement vos données."]],
    ["international","Utilisateurs internationaux",["Bingoo Connect est disponible dans le monde entier. Si vous êtes hors des États-Unis, vos données peuvent être traitées aux États-Unis. Nous respectons les lois applicables en matière de protection des données, y compris le RGPD lorsqu’il s’applique."]],
    ["children","Confidentialité des enfants",["Bingoo Connect ne s’adresse pas aux enfants de moins de 13 ans. Nous ne collectons pas sciemment de données personnelles d’enfants. Contactez-nous si vous pensez qu’un enfant nous a transmis des données personnelles."]],
    ["changes","Modifications de cette politique",["Nous pouvons mettre à jour cette Politique de confidentialité. Les changements importants peuvent être communiqués par e-mail ou dans l’application. La date Dernière mise à jour reflète la révision la plus récente."]],
    ["contact","Nous contacter",["Pour toute question de confidentialité ou demande relative aux données, écrivez à privacy@bingooconnect.com, utilisez la page Suppression des données ou contactez l’assistance générale."]]
  ]
};

function renderBlock(text, key) {
  if (text.includes("|")) {
    const [heading, ...items] = text.split("|");
    return <div key={key}><p><strong>{heading}</strong></p><ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul></div>;
  }
  return <p key={key}>{text}</p>;
}

export default function PrivacyPolicy() {
  const { language } = useI18n();
  const copy = language === "fr" ? FR : EN;
  const toc = copy.sections.map(([id, title], index) => [String(index + 1), title, id]);
  return (
    <LegalPageLayout title={copy.title} lastUpdated="July 11, 2026">
      <LegalTOC items={toc} />
      {copy.sections.map(([id, title, blocks], index) => (
        <LegalSection key={id} id={id} title={`${index + 1}. ${title}`}>
          {blocks.map((block, i) => renderBlock(block, `${id}-${i}`))}
          {id === "deletion" && <p><Link to="/data-deletion">{language === "fr" ? "Ouvrir la page Suppression des données" : "Open the Data Deletion page"}</Link></p>}
          {id === "contact" && <p><Link to="/contact">{language === "fr" ? "Contacter l’assistance" : "Contact support"}</Link></p>}
        </LegalSection>
      ))}
    </LegalPageLayout>
  );
}
