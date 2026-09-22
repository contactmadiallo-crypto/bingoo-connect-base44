import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

export const isNativeAndroid = () =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";

export const isNativeApp = () => Capacitor.isNativePlatform();

export async function openExternalUrl(url) {
  if (!url) return;
  if (isNativeApp()) {
    await Browser.open({ url, presentationStyle: "popover" });
    return;
  }
  window.location.assign(url);
}

export function productionCallback(path) {
  const normalized = String(path || "/").startsWith("/") ? path : `/${path}`;
  return isNativeApp()
    ? `bingooconnect://auth${normalized}`
    : `${window.location.origin}${normalized}`;
}

export function validateUpload(file, { imagesOnly = false, maxBytes = 10 * 1024 * 1024 } = {}) {
  if (!file) return "Choose a file first.";
  if (file.size > maxBytes) return `File is too large. Maximum size is ${Math.round(maxBytes / 1024 / 1024)} MB.`;
  if (imagesOnly && !String(file.type || "").startsWith("image/")) return "Please choose an image file.";
  return null;
}
