import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useEffect } from "react";
import LostDevicePage from "./LostDevicePage";
import DeviceActivationPage from "./DeviceActivationPage";

export default function NFCRedirect() {
  const { deviceCode } = useParams();
  const normalizedCode = deviceCode?.toUpperCase().trim();

  const { data: deviceData, isLoading } = useQuery({
    queryKey: ["bingoo-device", normalizedCode],
    queryFn: () => base44.functions.invoke("getDeviceByCode", { device_code: normalizedCode }),
    enabled: !!normalizedCode,
    staleTime: 0,
  });

  const result = deviceData?.data;
  const device = result?.device;
  const profile = result?.profile;
  const asset = result?.asset;
  const isAsset = result?.is_asset;
  const isClaimed = result?.is_claimed;
  const isLost = result?.is_lost;
  const isUnclaimed = result?.is_unclaimed;
  // Non-activatable statuses that should show DeviceActivationPage's error_state
  const isReplaced = device?.status === "replaced";
  const isDisabled = device?.status === "disabled";

  // Track NFC tap (profile or asset context)
  useEffect(() => {
    if (isClaimed && device?.id) {
      const trackProfileId = isAsset ? (asset?.profile_id || null) : (profile?.id || null);
      if (trackProfileId) {
        base44.entities.Analytics.create({
          profile_id: trackProfileId,
          device_id: device.id,
          event_type: "nfc_tap",
          visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
          created_at: new Date().toISOString(),
        }).catch(() => {});
      }
    }
  }, [isClaimed, isAsset, asset?.profile_id, profile?.id, device?.id]);

  // ASSET REDIRECT: If device is assigned to an asset, route to asset finder.
  // Asset assignment takes precedence over profile assignment.
  // AssetFinder handles both normal and lost states.
  useEffect(() => {
    if (isAsset && normalizedCode) {
      window.location.replace(`/asset/${normalizedCode}`);
    }
  }, [isAsset, normalizedCode]);

  // Redirect claimed (non-lost, non-asset) devices to the profile.
  // Lost devices must NOT redirect — they render LostDevicePage below.
  // Include the device code so PublicProfile can re-verify it isn't lost.
  useEffect(() => {
    if (isClaimed && !isLost && !isAsset && profile?.username) {
      window.location.replace(`/p/${profile.username}?source=nfc&device=${normalizedCode}`);
    }
  }, [isClaimed, isLost, isAsset, profile?.username]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #071A3D 0%, #0b2149 100%)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse"
            style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)" }}>
            <span className="text-white font-black text-2xl">B</span>
          </div>
          <p className="text-white/60 font-semibold">Checking device...</p>
        </div>
      </div>
    );
  }

  // Unknown device
  if (!device) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #071A3D 0%, #0b2149 100%)" }}>
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">📵</div>
          <h2 className="text-2xl font-bold text-white mb-2">Device Not Found</h2>
          <p className="text-white/50 text-sm mb-1">
            Code <span className="font-mono font-bold text-orange-400">{normalizedCode}</span> is not registered.
          </p>
          <p className="text-white/30 text-xs mb-6">
            Check the code printed on your device and try again, or activate manually.
          </p>
          <div className="flex flex-col gap-2">
            <a href={`/activate-device?code=${normalizedCode}`}
              className="inline-block px-6 py-3 rounded-2xl font-bold text-sm transition-all"
              style={{ background: "linear-gradient(135deg, #f97316, #e86e00)", color: "#fff" }}>
              Try Activate Manually →
            </a>
            <a href="https://bingooconnect.com" className="inline-block text-sm text-orange-400 hover:underline">Go to Bingoo →</a>
          </div>
        </div>
      </div>
    );
  }

  // Replaced or disabled devices (no profile) → show activation page with error_state
  // (only if not assigned to an asset, which takes precedence)
  if ((isReplaced || isDisabled) && !isAsset) {
    return <DeviceActivationPage deviceCode={normalizedCode} device={device} />;
  }

  // Asset redirect takes precedence over lost/unclaimed states.
  // AssetFinder handles both normal and lost asset states — never show LostDevicePage for assets.
  if (isAsset) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #071A3D 0%, #0b2149 100%)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse"
            style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)" }}>
            <span className="text-white font-black text-2xl">B</span>
          </div>
          <p className="text-white/60 font-semibold">Opening asset recovery page...</p>
        </div>
      </div>
    );
  }

  // Lost device
  if (isLost) {
    return <LostDevicePage deviceCodeProp={normalizedCode} deviceProp={device} profileProp={profile} />;
  }

  // Unclaimed — show customer activation flow
  if (isUnclaimed || !isClaimed) {
    return <DeviceActivationPage deviceCode={normalizedCode} device={device} />;
  }

  // While redirecting
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #071A3D 0%, #0b2149 100%)" }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #f97316, #FDBA21)" }}>
          <span className="text-white font-black text-2xl">B</span>
        </div>
        <p className="text-white/60">Redirecting to profile...</p>
      </div>
    </div>
  );
}