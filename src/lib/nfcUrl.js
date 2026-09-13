export const BINGOO_PROD_ORIGIN = "https://bingooconnect.com";

export function normalizeDeviceCode(code) {
  return String(code || "").trim().toUpperCase();
}

export function deviceUrl(code, origin = BINGOO_PROD_ORIGIN) {
  const normalized = normalizeDeviceCode(code);
  return normalized ? `${origin}/d/${encodeURIComponent(normalized)}` : `${origin}/d`;
}

export function activationUrl(code, origin = BINGOO_PROD_ORIGIN) {
  const normalized = normalizeDeviceCode(code);
  return normalized
    ? `${origin}/activate-device?code=${encodeURIComponent(normalized)}`
    : `${origin}/activate-device`;
}
