/**
 * BingooLogo — single source of truth for the official Bingoo Connect brand logo.
 * Uses the official navy-background brand mark (#0b2149 + orange #f97316) that
 * blends seamlessly with the app's navy auth/dashboard backgrounds.
 * Use this everywhere: sidebar, mobile header, billing, workspace header, etc.
 * Never use a hardcoded image URL or a "B" letter box for the app logo.
 */
export const BINGOO_LOGO_URL =
  "https://media.base44.com/images/public/692bd9007b93ba81de543346/fcd602ba9_store_icon.png";

export default function BingooLogo({ className = "h-10 w-auto object-contain" }) {
  return (
    <img
      src={BINGOO_LOGO_URL}
      alt="Bingoo Connect"
      className={className}
      style={{ background: "transparent" }}
    />
  );
}