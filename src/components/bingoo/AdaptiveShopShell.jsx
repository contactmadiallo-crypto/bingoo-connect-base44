import BingooLayout from "@/components/bingoo/BingooLayout";
import { isNativeApp } from "@/lib/nativePlatform";
import { usePlan } from "@/hooks/usePlan";

export default function AdaptiveShopShell({ children }) {
  const { plan } = usePlan();
  if (!isNativeApp()) return children;
  return <BingooLayout accountPlan={plan}>{children}</BingooLayout>;
}
