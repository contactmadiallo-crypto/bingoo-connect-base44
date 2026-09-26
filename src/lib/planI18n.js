const FR = {
  'Free':'Gratuit','Professional':'Professionnel','Business':'Entreprise','Law Firm':'Cabinet juridique','Enterprise / Bulk':'Entreprise / Volume',
  'Basic personal profile and QR sharing':'Profil personnel de base et partage QR',
  'Premium profile, NFC, analytics, leads, and appointments':'Profil premium, NFC, analyses, prospects et rendez-vous',
  'Company profile, team, services, business tools, and multi-device':'Profil entreprise, équipe, services, outils professionnels et multi-appareils',
  'Business foundation plus salon services, staff, gallery, reviews, and booking':'Base entreprise avec services de salon, personnel, galerie, avis et réservations',
  'Business foundation plus attorneys, practice areas, legal intake, and offices':'Base entreprise avec avocats, domaines de pratique, accueil juridique et bureaux',
  'Custom onboarding, teams, API, bulk NFC, and admin support':'Intégration personnalisée, équipes, API, NFC en volume et assistance admin',
  '1 profile':'1 profil','Public profile link':'Lien de profil public','Basic contact links':'Liens de contact de base','Social links':'Liens sociaux','QR code':'Code QR','Save contact':'Enregistrer le contact','Limited analytics preview':'Aperçu limité des analyses',
  'Everything in Free':'Tout le forfait Gratuit','Multiple NFC Devices':'Plusieurs appareils NFC','Lead Collection':'Collecte de prospects','Analytics Dashboard':'Tableau de bord analytique','Portfolio & Gallery':'Portfolio et galerie','Custom Branding':'Personnalisation de marque','QR Code Download':'Téléchargement du code QR','Save Contact Button':'Bouton Enregistrer le contact','Appointment Booking':'Prise de rendez-vous','Lost Mode for NFC':'Mode perdu pour NFC','Instagram Integration':'Intégration Instagram','Calendar View':'Vue calendrier','Google Wallet Pass':'Pass Google Wallet','Apple Wallet Pass':'Pass Apple Wallet',
  'Everything in Professional':'Tout le forfait Professionnel','Business Public Profile':'Profil public entreprise','Design Studio':'Studio de design','Team Management':'Gestion d’équipe','Services & Product Showcase':'Présentation des services et produits','WhatsApp Booking':'Réservation WhatsApp','NFC Counter Stand Compatibility':'Compatibilité avec support de comptoir NFC','Business Hours':'Horaires d’ouverture','Team Member Profiles':'Profils des membres de l’équipe','Lead Capture & Customer Inquiries':'Capture de prospects et demandes clients','Multi-Profile Management':'Gestion multi-profils','Business QR/NFC Landing':'Page entreprise QR/NFC','Advanced Analytics':'Analyses avancées','Lead Export':'Export des prospects',
  'Everything in Business':'Tout le forfait Entreprise','Salon Business Profile':'Profil entreprise Salon','Staff Profiles':'Profils du personnel','Services Menu':'Menu des services','Instagram Gallery':'Galerie Instagram','Google Reviews':'Avis Google','NFC Counter Stand':'Support de comptoir NFC',
  'Law Firm Profile':'Profil du cabinet juridique','Practice Areas':'Domaines de pratique','Attorney Profiles':'Profils des avocats','Legal Services':'Services juridiques','Office Locations':'Emplacements des bureaux','Team Members':'Membres de l’équipe','Lead Intake Forms':'Formulaires d’accueil des prospects','CRM Pipeline':'Pipeline CRM','Case Dashboard':'Tableau de bord des dossiers','Immigration, Criminal, Civil & Family Forms':'Formulaires immigration, pénal, civil et famille',
  'Custom Onboarding':'Intégration personnalisée','API Access':'Accès API','Bulk NFC Orders':'Commandes NFC en volume','Admin Support':'Assistance admin','Employee Profiles':'Profils des employés','Attendance Dashboard':'Tableau de bord des présences'
};

export function localizePlanText(value, language) {
  if (language !== 'fr' || typeof value !== 'string') return value;
  return FR[value] || value;
}

export function planLabel(planId, fallback, language) {
  return localizePlanText(fallback || planId, language);
}
