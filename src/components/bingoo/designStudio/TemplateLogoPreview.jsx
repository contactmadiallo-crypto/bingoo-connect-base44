import { TEMPLATES } from './studioConstants';
import { ProductPreview } from './ProductPreview';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

export default function TemplateLogoPreview({ previewProps, activeTemplate, onSelect }) {
  const { language } = useI18n();
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-sm text-[#0b2149]"><span className="mr-1 text-[#f97316]">5.</span>{t("ds_template_logo_preview", language)}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TEMPLATES.map(t => {
          const active = activeTemplate === t.id;
          return (
            <button key={t.id} onClick={() => onSelect(t)}
              className={`rounded-xl border-2 p-3 flex flex-col items-center bg-slate-50 transition-all ${active ? 'border-orange-500 bg-orange-50' : 'border-slate-100 hover:border-slate-300'}`}>
              <div className="h-28 flex items-center justify-center overflow-hidden">
                <div style={{ transform: 'scale(0.38)', transformOrigin: 'center' }}>
                  <ProductPreview {...previewProps} templateId={t.id} cardColor={t.cardColor} accentColor={t.accentColor} finish={t.finish} side="front" />
                </div>
              </div>
              <p className={`text-[11px] font-bold mt-2 ${active ? 'text-[#f97316]' : 'text-slate-700'}`}>{t(`ds_template_${t.id}`, language)}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}