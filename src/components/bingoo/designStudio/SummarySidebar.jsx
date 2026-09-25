import { ShoppingCart, Save, Check, Shield, Truck, Headphones, MessageCircle } from 'lucide-react';
import { ProductPreview } from './ProductPreview';
import { FINISHES, SETUP_FEE, SHIPPING } from './studioConstants';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

function Row({ a, b }) {
  return <div className="flex justify-between gap-3"><span className="text-slate-500">{a}</span><span className="font-bold text-right">{b}</span></div>;
}

export default function SummarySidebar({
  previewProps, productLabel, finish, setFinish, cardColor, accentColor, quantity, setQuantity,
  removeBranding, subtotal, total, onAdd, onSave, ordered, saved,
}) {
  const { language } = useI18n();
  const finishLabel = (f) => t(`ds_finish_${String(f).toLowerCase()}`, language);
  return (
    <aside className="bg-white rounded-xl border border-slate-200 p-4 h-fit min-w-0 xl:sticky xl:top-4 space-y-4">
      <h2 className="font-black text-[#0b2149]"><span className="mr-1 text-[#f97316]">6.</span>{t("ds_product_summary", language)}</h2>
      <div className="flex gap-3 items-center pb-4 border-b">
        <div className="w-24 h-20 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
          <div style={{ transform: 'scale(0.24)' }}><ProductPreview {...previewProps} side="front" /></div>
        </div>
        <div className="min-w-0">
          <p className="font-black text-sm">{t("ds_custom_nfc", language)} {productLabel}</p>
          <p className="text-lg font-black mt-1">${subtotal.toFixed(2)} <span className="text-[10px] text-slate-400 font-bold">{t("ds_total_suffix", language)}</span></p>
          <p className="text-[9px] text-slate-400 mt-1">{t("ds_design_setup", language)}: ${SETUP_FEE.toFixed(2)} + hardware</p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 mb-1">{t("ds_finish", language)}</p>
          <select value={finish} onChange={e => setFinish(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-300">
            {FINISHES.map(f => <option key={f} value={f}>{finishLabel(f)}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-slate-500 mb-1">{t("ds_base_color", language)}</p>
            <div className="w-8 h-8 rounded-lg border-2 border-slate-200" style={{ background: cardColor }} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-slate-500 mb-1">{t("ds_accent_color", language)}</p>
            <div className="w-8 h-8 rounded-lg border-2 border-slate-200" style={{ background: accentColor }} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">{t("ds_quantity", language)}</span>
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-slate-50">−</button>
            <span className="px-3 py-2 font-black border-x">{quantity}</span>
            <button onClick={() => setQuantity(q => Math.min(500, q + 1))} className="px-3 py-2 hover:bg-slate-50">+</button>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 space-y-2 text-sm">
        <Row a={t("ds_hardware_design", language)} b={`$${subtotal.toFixed(2)}`} />
        <Row a={t("ds_shipping", language)} b={`$${SHIPPING.toFixed(2)}`} />
        <div className="flex justify-between text-lg font-black pt-2 border-t"><span>{t("ds_total", language)}</span><span>${total.toFixed(2)}</span></div>
      </div>

      <button onClick={onAdd} className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 font-black flex items-center justify-center gap-2 transition-colors">
        <ShoppingCart className="w-4 h-4" />{ordered ? t("ds_added_cart", language) : t("ds_add_cart", language)}
      </button>
      <button onClick={onSave} className="w-full border border-[#0b2149] text-[#0b2149] rounded-lg py-3 font-black flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
        {saved ? <><Check className="w-4 h-4" /> {t("ds_design_saved", language)}</> : <><Save className="w-4 h-4" /> {t("ds_save_design", language)}</>}
      </button>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t text-center text-[9px] text-slate-500">
        <span className="flex flex-col items-center gap-1"><Shield className="w-4 h-4 text-slate-400" />{t("ds_secure_checkout", language)}</span>
        <span className="flex flex-col items-center gap-1"><Truck className="w-4 h-4 text-slate-400" />{t("ds_worldwide_shipping", language)}</span>
        <span className="flex flex-col items-center gap-1"><Headphones className="w-4 h-4 text-slate-400" />{t("ds_expert_support", language)}</span>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
        <p className="text-xs font-black text-[#0b2149]">{t("ds_need_help", language)}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{t("ds_team_help", language)}</p>
        <button className="mt-2 text-xs font-bold text-[#f97316] flex items-center gap-1 hover:underline">
          <MessageCircle className="w-3.5 h-3.5" /> {t("ds_chat_support", language)} →
        </button>
      </div>
    </aside>
  );
}