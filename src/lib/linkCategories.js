/**
 * Shared link category resolver — single source of truth.
 * Used by ProfileContentSections (public), LinksPanel (editor), and LivePreview.
 */

// catalog_id → category mapping (mirrors LINK_CATALOG in LinkStore)
const CATALOG_CATEGORY = {
  phone:            "contact",
  whatsapp_number:  "contact",
  email:            "contact",
  website:          "business",
  location:         "business",
  instagram_url:    "social",
  linkedin_url:     "social",
  facebook_url:     "social",
  tiktok_url:       "social",
  youtube_url:      "social",
  twitter_url:      "social",
  snapchat_url:     "social",
  pinterest_url:    "social",
  discord_url:      "social",
  twitch_url:       "social",
  threads_url:      "social",
  payment_link:     "payment",
  cashapp_link:     "payment",
  zelle_link:       "payment",
  wave_link:        "payment",
  orangemoney_link: "payment",
  venmo_url:        "payment",
  booking:          "business",
  music_link:       "content",
  shop_link:        "content",
};

// Resolve category for a custom_links entry by catalog_id → URL → label fallback
export function getLinkCategory(link) {
  // 1. Explicit category saved on the link itself
  if (link.category) return link.category;

  // 2. Canonical catalog_id
  if (link._catalog_id && CATALOG_CATEGORY[link._catalog_id]) {
    return CATALOG_CATEGORY[link._catalog_id];
  }

  // 3. URL domain fallback
  const url = (link.url || "").toLowerCase();
  if (url.includes("snapchat.com"))   return "social";
  if (url.includes("instagram.com"))  return "social";
  if (url.includes("facebook.com") || url.includes("fb.com")) return "social";
  if (url.includes("tiktok.com"))     return "social";
  if (url.includes("linkedin.com"))   return "social";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "social";
  if (url.includes("x.com") || url.includes("twitter.com")) return "social";
  if (url.includes("threads.net"))    return "social";
  if (url.includes("pinterest.com"))  return "social";
  if (url.includes("discord."))       return "social";
  if (url.includes("twitch.tv"))      return "social";
  if (url.includes("paypal."))        return "payment";
  if (url.includes("cash.app") || url.includes("cashapp")) return "payment";
  if (url.includes("venmo.com"))      return "payment";
  if (url.includes("zellepay") || url.includes("zelle")) return "payment";
  if (url.includes("wave.com"))       return "payment";
  if (url.includes("orange"))         return "payment";
  if (url.includes("calendly.com") || url.includes("cal.com")) return "business";
  if (url.includes("spotify.com"))    return "content";

  return "content"; // default for true custom/generic web links
}