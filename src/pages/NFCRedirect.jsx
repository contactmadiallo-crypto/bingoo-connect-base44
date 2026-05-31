import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useEffect } from "react";

export default function NFCRedirect() {
  const { deviceCode } = useParams();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["nfc-device", deviceCode],
    queryFn: () => base44.entities.NFCDevice.filter({ device_code: deviceCode }),
  });

  const device = devices[0];

  const { data: profiles = [] } = useQuery({
    queryKey: ["nfc-profile", device?.profile_id],
    queryFn: () => base44.entities.Profile.filter({ id: device.profile_id }),
    enabled: !!device?.profile_id,
  });

  const profile = profiles[0];

  useEffect(() => {
    if (profile?.id) {
      // Track tap event with device info
      base44.entities.Analytics.create({
        profile_id: profile.id,
        device_id: device.id,
        event_type: "profile_view",
        visitor_device: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
        created_at: new Date().toISOString(),
      }).catch(() => {});
      // Redirect to public profile
      window.location.replace(`/p/${profile.username}`);
    }
  }, [profile?.id]);

  if (isLoading || (device && !profile)) {
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