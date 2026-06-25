/**
 * BingooLogo — single source of truth for the official Bingoo Connect brand logo.
 * Use this everywhere: sidebar, mobile header, billing, workspace header, etc.
 * Never use a hardcoded image URL or a "B" letter box for the app logo.
 */
export const BINGOO_LOGO_URL =
  "https://media.base44.com/images/public/692bd9007b93ba81de543346/e30f4e65a_BingooConnectBrand.png";

export default function BingooLogo({ className = "h-9 w-auto object-contain" }) {
  return (
    <img
      src={BINGOO_LOGO_URL}
      alt="Bingoo Connect"
      className={className}
    />
  );
}