import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useEffect } from "react";
import LostDevicePage from "./LostDevicePage";

export default function NFCRedirect() {
  const { deviceCode } = useParams();

  const normalizedCode = deviceCode?.toUpperCase();

  const { data: deviceData, isLoading: deviceLoading } = useQuery({
    queryKey: ["bingoo-device", normalizedCode],
    queryFn: () => base44.functions.invoke("getDeviceByCode", { device_code: normalizedCode }),
    enabled: !!normalizedCode,
  });

  const device = deviceData?.data?.device;

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["bingoo-nfc-profile", device?.assigned_profile],
    queryFn: () => base44.functions.invoke("getProfileById", { profile_id: device.assigned_profile }),
    enabled: !!device?.assigned_profile,
  });

  const profile = profileData?.data?.profile;

  useEffect(() => {
    if (device?.status === "lost") return; // Don't redirect, show lost page
    if (profile?.username) {
      base44.entities.Analytics.create({
        profile_id: profile.id,
        device_id: device?.id,
        event_type: "profile_view",
        visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
        created_at: new Date().toISOString(),
      }).catch(() => {});
      window.location.replace(`/p/${profile.username}`);
    }
  }, [profile?.username, device?.status]);

  // Show lost mode page
  if (device?.status === "lost" && !deviceLoading) {
    return <LostDevicePage deviceCodeProp={normalizedCode} deviceProp={device} profileProp={profile} />;
  }

  if (deviceLoading || (device?.assigned_profile && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 animate-pulse">
            <span className="text-white font-black text-2xl">B</span>
          </div>
          <p className="text-slate-500 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📵</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Device Not Found</h2>
          <p className="text-slate-500">This NFC device code <span className="font-mono font-bold">{deviceCode}</span> is not registered.</p>
        </div>
      </div>
    );
  }

  return null;
}