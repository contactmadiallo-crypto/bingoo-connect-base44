import { Outlet } from "react-router-dom";
import BingooLayout from "@/components/bingoo/BingooLayout";
import { usePlan } from "@/hooks/usePlan";

/**
 * Layout route wrapper that renders the Bingoo sidebar around nested routes.
 * Resolves the user's effective plan so the sidebar shows the correct nav items
 * (e.g. NFC / Lost Mode for paid users, Admin items for admins).
 */
export default function BingooLayoutWrapper() {
  const { plan } = usePlan();
  return (
    <BingooLayout accountPlan={plan}>
      <Outlet />
    </BingooLayout>
  );
}