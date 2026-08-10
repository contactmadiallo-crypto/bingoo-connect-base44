const BUSINESS_PLANS = new Set(["business", "salon", "restaurant", "lawfirm", "corporate"]);
const PRO_PLANS = new Set(["professional", "pro", ...BUSINESS_PLANS]);

export const PROFILE_CATEGORIES = [
  {
    id: "personal",
    label: "Personal",
    description: "Simple personal profile with direct contact actions.",
    profileType: "personal",
    ctaLabel: null,
  },
  {
    id: "content_creator",
    label: "Content Creator",
    description: "Open collaboration requests from brands and partners.",
    profileType: "creative",
    ctaLabel: "Book a Collab",
  },
  {
    id: "photographer",
    label: "Photographer / Filmmaker",
    description: "Capture session and project inquiries as leads.",
    profileType: "creative",
    ctaLabel: "Book a Session",
  },
  {
    id: "model",
    label: "Model",
    description: "Open collaboration and shooting inquiries.",
    profileType: "creative",
    ctaLabel: "Collab / Shooting",
  },
  {
    id: "business",
    label: "Business / Brand",
    description: "Company identity with business contact and conversion actions.",
    profileType: "business",
    ctaLabel: "Let's Connect",
  },
];

export function normalizeProfilePlan(plan) {
  const value = String(plan || "free").toLowerCase().trim();
  return value === "pro" ? "professional" : value;
}

export function isBusinessProfilePlan(plan) {
  return BUSINESS_PLANS.has(normalizeProfilePlan(plan));
}

export function canUseProfessionalCategories(plan) {
  return PRO_PLANS.has(normalizeProfilePlan(plan));
}

export function canUseBusinessCategory(plan) {
  return BUSINESS_PLANS.has(normalizeProfilePlan(plan));
}

export function getAvailableProfileCategories(plan) {
  const normalized = normalizeProfilePlan(plan);
  if (normalized === "free") return PROFILE_CATEGORIES.filter((item) => item.id === "personal");
  if (BUSINESS_PLANS.has(normalized)) return PROFILE_CATEGORIES;
  return PROFILE_CATEGORIES.filter((item) => item.id !== "business");
}

export function resolveProfileCategory(profile) {
  const stored = String(profile?.profile_category || "").toLowerCase().trim();
  if (PROFILE_CATEGORIES.some((item) => item.id === stored)) return stored;

  const type = String(profile?.profile_type || "").toLowerCase().trim();
  if (["business", "salon", "restaurant", "lawfirm", "corporate"].includes(type)) return "business";
  if (type === "creative") return "content_creator";
  return "personal";
}

export function getProfileCategoryDefinition(profileOrCategory) {
  const category = typeof profileOrCategory === "string"
    ? profileOrCategory
    : resolveProfileCategory(profileOrCategory);
  return PROFILE_CATEGORIES.find((item) => item.id === category) || PROFILE_CATEGORIES[0];
}

export function getProfilePublicCta(profile) {
  const plan = normalizeProfilePlan(profile?.effective_plan || profile?.plan || "free");
  const category = resolveProfileCategory(profile);
  const definition = getProfileCategoryDefinition(category);

  if (plan === "free" || category === "personal") return null;
  if (category === "business" && !BUSINESS_PLANS.has(plan)) return null;
  if (!["content_creator", "photographer", "model", "business"].includes(category)) return null;

  return {
    category,
    label: definition.ctaLabel,
    formTitle: definition.ctaLabel,
    formSubtitle: category === "business"
      ? "Tell us how we can help and we'll get back to you."
      : "Share a few details and we'll get back to you soon.",
  };
}
