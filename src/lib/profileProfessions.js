export const PROFILE_PROFESSIONS = [
  { id: "personal", profileType: "personal", minPlan: "free", en: "Personal", fr: "Personnel", icon: "user" },
  { id: "content_creator", profileType: "professional", minPlan: "professional", en: "Content Creator", fr: "Créateur de contenu", icon: "sparkles" },
  { id: "photographer", profileType: "professional", minPlan: "professional", en: "Photographer / Filmmaker", fr: "Photographe / Réalisateur", icon: "camera" },
  { id: "model", profileType: "professional", minPlan: "professional", en: "Model", fr: "Mannequin", icon: "aperture" },
  { id: "consultant", profileType: "professional", minPlan: "professional", en: "Consultant", fr: "Consultant", icon: "briefcase" },
  { id: "entrepreneur", profileType: "professional", minPlan: "professional", en: "Entrepreneur / Founder", fr: "Entrepreneur / Fondateur", icon: "rocket" },
  { id: "real_estate", profileType: "professional", minPlan: "professional", en: "Real Estate", fr: "Immobilier", icon: "home" },
  { id: "lawyer", profileType: "lawfirm", minPlan: "professional", en: "Lawyer / Legal", fr: "Avocat / Juridique", icon: "scale" },
  { id: "healthcare", profileType: "professional", minPlan: "professional", en: "Healthcare Professional", fr: "Professionnel de santé", icon: "heart" },
  { id: "fitness", profileType: "professional", minPlan: "professional", en: "Fitness / Trainer", fr: "Fitness / Coach sportif", icon: "dumbbell" },
  { id: "coach", profileType: "professional", minPlan: "professional", en: "Coach / Mentor", fr: "Coach / Mentor", icon: "message" },
  { id: "educator", profileType: "professional", minPlan: "professional", en: "Educator / Teacher", fr: "Éducateur / Enseignant", icon: "graduation" },
  { id: "designer", profileType: "creative", minPlan: "professional", en: "Designer", fr: "Designer", icon: "palette" },
  { id: "artist", profileType: "creative", minPlan: "professional", en: "Artist", fr: "Artiste", icon: "brush" },
  { id: "musician", profileType: "creative", minPlan: "professional", en: "Musician / DJ", fr: "Musicien / DJ", icon: "music" },
  { id: "beauty", profileType: "salon", minPlan: "professional", en: "Beauty / Salon Professional", fr: "Beauté / Salon", icon: "scissors" },
  { id: "restaurant", profileType: "business", minPlan: "professional", en: "Restaurant / Hospitality", fr: "Restaurant / Hôtellerie", icon: "utensils" },
  { id: "technology", profileType: "professional", minPlan: "professional", en: "Technology / Developer", fr: "Technologie / Développeur", icon: "code" },
  { id: "sales", profileType: "professional", minPlan: "professional", en: "Sales / Business Development", fr: "Vente / Développement commercial", icon: "trending" },
  { id: "nonprofit", profileType: "professional", minPlan: "professional", en: "Nonprofit / Community", fr: "Association / Communauté", icon: "users" },
  { id: "business", profileType: "business", minPlan: "business", en: "Business / Brand", fr: "Entreprise / Marque", icon: "building" },
];

export function getProfileProfession(id) {
  return PROFILE_PROFESSIONS.find((item) => item.id === id) || PROFILE_PROFESSIONS[0];
}

export function profileProfessionLabel(id, language = "en") {
  const item = getProfileProfession(id);
  return language === "fr" ? item.fr : item.en;
}
