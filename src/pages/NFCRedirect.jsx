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
  const isClaimed = result?.is_claimed;
  const isLost = result?.is_lost;
  const isUnclaimed = result?.is_unclaimed;

  // Track NFC tap
  useEffect(() => {
    if (isClaimed && profile?.id && device?.id) {
      base44.entities.Analytics.create({
        profile_id: profile.id,
        device_id: device.id,
        event_type: "nfc_tap",
        visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
        created_at: new Date().toISOString(),
      }).catch(() => {});
    }
  }, [isClaimed, profile?.id, device?.id]);

  // Redirect claimed (non-lost) devices to the profile.
  // Lost devices must NOT redirect — they render LostDevicePage below.
  useEffect(() => {
    if (isClaimed && !isLost && profile?.username) {
      window.location.replace(`/p/${profile.username}?source=nfc`);
    }
  }, [isClaimed, isLost, profile?.username]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #071d47 0%, #0B2E6B 100%)" }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse"
            style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)" }}>
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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #071d47 0%, #0B2E6B 100%)" }}>
        <div className="text-center">
          <div className="text-6xl mb-4">📵</div>
          <h2 className="text-2xl font-bold text-white mb-2">Device Not Found</h2>
          <p className="text-white/50">Code <span className="font-mono font-bold text-orange-400">{normalizedCode}</span> is not registered.</p>
          <a href="https://bingooconnect.com" className="mt-6 inline-block text-sm text-orange-400 hover:underline">Go to Bingoo →</a>
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #071d47 0%, #0B2E6B 100%)" }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #FF7A00, #FDBA21)" }}>
          <span className="text-white font-black text-2xl">B</span>
        </div>
        <p className="text-white/60">Redirecting to profile...</p>
      </div>
    </div>
  );
}