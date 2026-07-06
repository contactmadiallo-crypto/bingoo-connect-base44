/**
 * BingooLogo — single source of truth for the official Bingoo Connect brand logo.
 * Official navy-background brand mark with infinity "oo" — #0b2149 + orange #f97316.
 * Use this everywhere: sidebar, mobile header, billing, workspace header, auth pages, etc.
 * Never use a hardcoded image URL or a "B" letter box for the app logo.
 */
export const BINGOO_LOGO_URL =
  "https://media.base44.com/images/public/692bd9007b93ba81de543346/d4eb4836d_generated_image.png";

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