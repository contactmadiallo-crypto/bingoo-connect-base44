export const PUBLIC_APP_ORIGIN = "https://bingooconnect.com";

const cleanUsername = (username) => String(username || "")
  .trim()
  .replace(/^@+/, "")
  .replace(/^\/+|\/+$/g, "");

export function publicProfileUrl(username) {
  const slug = cleanUsername(username);
  return slug ? `${PUBLIC_APP_ORIGIN}/p/${encodeURIComponent(slug)}` : null;
}

export function publicProfileQrUrl(username) {
  const url = publicProfileUrl(username);
  return url ? `${url}?source=qr` : null;
}
