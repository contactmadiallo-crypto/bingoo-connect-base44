import { TEMPLATES } from './studioConstants';
import { ProductPreview } from './ProductPreview';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

export default function TemplatePicker({ activeTemplate, onSelect, previewProps }) {
  const { language } = useI18n();
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-sm text-[#0b2149]"><span className="mr-1 text-[#f97316]">2.</span>{t("ds_select_template", language)}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => onSelect(t)}
            className={`rounded-xl border-2 p-1.5 transition-all ${activeTemplate === t.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="h-16 rounded-lg relative overflow-hidden bg-slate-50 flex items-center justify-center">
              <div style={{ transform: 'scale(.22)', transformOrigin: 'center' }}>
                <ProductPreview {...previewProps} productType="card" templateId={t.id} cardColor={t.cardColor} accentColor={t.accentColor} finish={t.finish} brandPattern={t.pattern} side="front" />
              </div>
            </div>
            <p className={`text-[10px] font-bold mt-1 text-center ${activeTemplate === t.id ? 'text-[#f97316]' : 'text-slate-700'}`}>{t(`ds_template_${t.id}`, language)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}