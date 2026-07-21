/**
 * Shared NFC device type metadata — single source of truth.
 * Mirrors the NFCDevice entity schema enum: card, metal_card, keychain,
 * bracelet, stand, badge, sticker, tag.
 */
export const DEVICE_TYPES = [
  { value: "card",       label: "NFC Card",         shortLabel: "Business Card",  emoji: "💳" },
  { value: "metal_card", label: "NFC Metal Card",    shortLabel: "Metal Card",     emoji: "💳" },
  { value: "keychain",   label: "NFC Key Fob",       shortLabel: "Keychain",       emoji: "🔑" },
  { value: "bracelet",   label: "NFC Bracelet",      shortLabel: "Bracelet",       emoji: "📿" },
  { value: "stand",      label: "NFC Phone Stand",   shortLabel: "Counter Stand",  emoji: "🪧" },
  { value: "sticker",    label: "NFC Sticker",       shortLabel: "Sticker",        emoji: "🏷️" },
  { value: "badge",      label: "NFC Badge",         shortLabel: "Badge",          emoji: "🎫" },
  { value: "tag",        label: "NFC Tag",           shortLabel: "Tag",            emoji: "📡" },
  { value: "pet_collar", label: "NFC Pet Collar Tag", shortLabel: "Pet Collar",     emoji: "🐾" },
  { value: "luggage",     label: "NFC Luggage Tag",    shortLabel: "Luggage Tag",    emoji: "🧳" },
  { value: "profile_qr",  label: "Profile QR Code",    shortLabel: "Profile QR",     emoji: "📱" },
];

/** Quick lookup by type value → full metadata object */
export const DEVICE_TYPE_MAP = Object.fromEntries(
  DEVICE_TYPES.map(t => [t.value, t])
);

/** Friendly label for a device type (falls back to the raw value) */
export function getDeviceTypeLabel(type) {
  return DEVICE_TYPE_MAP[type]?.label || type;
}

/** Short label (for compact UI like assign modals) */
export function getDeviceShortLabel(type) {
  return DEVICE_TYPE_MAP[type]?.shortLabel || type;
}

/** Emoji for a device type */
export function getDeviceEmoji(type) {
  return DEVICE_TYPE_MAP[type]?.emoji || "📶";
}

/**
 * Best display name for a device — prefers the shop product_name (e.g.
 * "NFC Pet Collar Tag", "NFC Luggage Tag") so devices don't all show as
 * "NFC Card". Falls back to the device_type label, then a generic name.
 */
export function getDeviceDisplayName(device) {
  if (!device) return "Unknown Device";
  if (device.product_name) return device.product_name;
  return getDeviceTypeLabel(device.device_type) || "Bingoo Device";
}

/** Product image URL from the shop catalog, if the device record has one. */
export function getDeviceDisplayImage(device) {
  return (device && device.product_image) || null;
}