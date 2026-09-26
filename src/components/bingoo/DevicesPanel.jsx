import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, CreditCard, Key, Award, Shield, Wifi } from "lucide-react";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

const deviceIcons = { card: CreditCard, keychain: Key, bracelet: Award, stand: Shield, badge: Wifi };
const statusColors = { active: "bg-green-100 text-green-700", inactive: "bg-slate-100 text-slate-500", lost: "bg-red-100 text-red-600" };

export default function DevicesPanel({ profileId }) {
  const { language } = useI18n();
  const { data: allDevices = [], isLoading } = useQuery({
    queryKey: ["my-nfc-devices-page"],
    queryFn: async () => {
      const res = await base44.functions.invoke("getMyNfcDevices", {});
      return res?.data?.devices || [];
    },
    refetchInterval: 10000,
  });

  // Filter to just this profile's devices on the client side
  const devices = profileId ? allDevices.filter(d => d.profile_id === profileId) : [];

  if (!profileId) return (
    <div className="text-center py-20 text-slate-400">
      <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-semibold">{t("nfc_panel_setup_profile",language)}</p>
    </div>
  );

  if (isLoading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-slate-900">{t("nfc_panel_title",language)}</h2>
        <p className="text-slate-500 text-sm mt-0.5">{devices.length} {t(devices.length === 1 ? "nfc_panel_linked_one" : "nfc_panel_linked_many",language)}</p>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-slate-100">
          <Smartphone className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          <p className="font-bold text-slate-700">{t("nfc_panel_none",language)}</p>
          <p className="text-slate-400 text-sm mt-1 mb-5">{t("nfc_panel_none_copy",language)}</p>
          <a href="/shop?category=cards"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ background: '#f97316' }}>
            {t("nfc_panel_order_card",language)} →
          </a>
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
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{t("nfc_panel_code",language)}: {device.device_code}</p>
                {device.assigned_at && <p className="text-xs text-slate-400 mt-1">{t("nfc_panel_assigned",language)}: {device.assigned_at?.slice(0,10)}</p>}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">{t("nfc_panel_tap_url",language)}</p>
                  <a href={`/d/${device.device_code}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-mono">/d/{device.device_code}</a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}