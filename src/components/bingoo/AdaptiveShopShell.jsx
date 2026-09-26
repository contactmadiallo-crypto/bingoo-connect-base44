import BingooLayout from "@/components/bingoo/BingooLayout";
import { isInstalledAppShell } from "@/lib/nativePlatform";
import { usePlan } from "@/hooks/usePlan";

export default function AdaptiveShopShell({ children }) {
  const { plan } = usePlan();
  if (!isInstalledAppShell()) return children;
  return <BingooLayout accountPlan={plan}>{children}</BingooLayout>;
}
