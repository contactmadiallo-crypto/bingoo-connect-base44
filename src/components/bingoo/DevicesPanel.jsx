import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Smartphone, CreditCard, Key, Award, Shield, Wifi } from "lucide-react";

const deviceIcons = { card: CreditCard, keychain: Key, bracelet: Award, stand: Shield, badge: Wifi };
const statusColors = { active: "bg-green-100 text-green-700", inactive: "bg-slate-100 text-slate-500", lost: "bg-red-100 text-red-600" };

export default function DevicesPanel({ profileId }) {
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ["devices", profileId],
    queryFn: () => base44.entities.NFCDevice.filter({ profile_id: profileId }),
    enabled: !!profileId,
  });

  if (!profileId) return (
    <div className="text-center py-20 text-slate-400">
      <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-semibold">Set up your profile first.</p>
    </div>
  );

  if (isLoading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-900">My NFC Devices</h2>
        <p className="text-slate-500 text-sm mt-0.5">{devices.length} device{devices.length !== 1 ? "s" : ""} linked to your profile</p>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Smartphone className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-bold text-slate-700">No devices yet</p>
          <p className="text-slate-400 text-sm mt-1">Contact support to get your NFC card, keychain, or bracelet assigned.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {devices.map(device => {
            const Icon = deviceIcons[device.device_type] || Smartphone;
            return (
              <div key={device.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[device.status] || statusColors.inactive}`}>
                    {device.status}
                  </span>
                </div>
                <p className="font-black text-slate-900 capitalize">{device.device_type}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">Code: {device.device_code}</p>
                {device.assigned_at && <p className="text-xs text-slate-400 mt-1">Assigned: {device.assigned_at?.slice(0,10)}</p>}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Tap URL:</p>
                  <a href={`/n/${device.device_code}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-mono">/n/{device.device_code}</a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}