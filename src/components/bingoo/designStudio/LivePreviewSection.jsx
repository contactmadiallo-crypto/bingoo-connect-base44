import { ProductPreview } from './ProductPreview';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

const THUMBS = [
  { id: 'front', key: 'ds_front' }, { id: 'back', key: 'ds_back' },
  { id: 'angled', key: 'ds_angled' }, { id: 'inhand', key: 'ds_in_hand' },
];

export default function LivePreviewSection({ previewProps, previewView, setPreviewView }) {
  const { language } = useI18n();
  const side = previewView === 'back' ? 'back' : 'front';
  const isAngled = previewView === 'angled';
  const isInHand = previewView === 'inhand';
  const transform = isAngled ? 'perspective(900px) rotateY(-22deg) rotateX(4deg)' : 'none';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-[#0b2149]"><span className="mr-1 text-[#f97316]">4.</span>{t("ds_live_preview", language)}</h2>
        <div className="flex gap-1 bg-slate-100 rounded-full p-0.5">
          <button onClick={() => setPreviewView('front')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${previewView === 'front' ? 'bg-[#0b2149] text-white' : 'text-slate-500'}`}>{t("ds_front", language)}</button>
          <button onClick={() => setPreviewView('back')}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${previewView === 'back' ? 'bg-[#0b2149] text-white' : 'text-slate-500'}`}>{t("ds_back", language)}</button>
        </div>
      </div>
      <div className={`min-h-[420px] rounded-xl flex items-center justify-center p-8 overflow-hidden ${isInHand ? 'bg-gradient-to-b from-amber-50 to-orange-50' : 'bg-gradient-to-b from-slate-50 to-slate-100'}`}>
        <div style={{ transform, transformOrigin: 'center', transition: 'transform 0.3s' }}>
          <div style={{ transform: `scale(${isInHand ? 0.92 : 1.15})`, transformOrigin: 'center' }}>
            <ProductPreview {...previewProps} side={side} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4">
        {THUMBS.map(t => (
          <button key={t.id} onClick={() => setPreviewView(t.id)}
            className={`rounded-xl border-2 p-2 transition-colors ${previewView === t.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="h-20 flex items-center justify-center overflow-hidden">
              <div style={{ transform: 'scale(0.42)', transformOrigin: 'center' }}>
                <ProductPreview {...previewProps} side={t.id === 'back' ? 'back' : 'front'} />
              </div>
            </div>
            <p className={`text-[10px] font-bold text-center mt-1 ${previewView === t.id ? 'text-[#f97316]' : 'text-slate-600'}`}>{t(t.key, language)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}