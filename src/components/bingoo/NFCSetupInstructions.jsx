import { CheckCircle2, Zap, QrCode as QrIcon } from "lucide-react";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

export default function NFCSetupInstructions({ deviceUrl }) {
  const { language } = useI18n();
  return (
    <div className="space-y-4">
      {/* Pre-programmed notice */}
      <div className="flex gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-emerald-800">
          <span className="font-bold">{t("nfc_setup_factory",language)}.</span>{" "}
          {t("nfc_setup_factory_inline_copy",language)}
        </p>
      </div>

      {/* How it works */}
      <div className="space-y-3">
        <div className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
          <div>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-orange-500" /> {t("nfc_setup_tap",language)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t("nfc_setup_tap_copy",language)}</p>
          </div>
        </div>
        <div className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
          <div>
            <p className="text-sm font-bold text-slate-900">{t("nfc_setup_no_app",language)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t("nfc_setup_no_app_copy",language)}</p>
          </div>
        </div>
        <div className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
          <div>
            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5"><QrIcon className="w-3.5 h-3.5 text-orange-500" /> {t("nfc_setup_qr_backup_short",language)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t("nfc_setup_qr_device_copy",language)}</p>
          </div>
        </div>
      </div>

      {/* Test URL */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">{t("nfc_setup_test_url",language)}</p>
        <a href={deviceUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-sm font-bold text-blue-600 hover:underline break-all">{deviceUrl}</a>
      </div>
    </div>
  );
}