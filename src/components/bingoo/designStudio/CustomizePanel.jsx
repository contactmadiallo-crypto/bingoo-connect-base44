import { Upload, X } from 'lucide-react';
import { CARD_COLORS, ACCENTS, FINISHES } from './studioConstants';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

const TABS = [
  { id: 'content', key: 'ds_tab_content' }, { id: 'style', key: 'ds_tab_style' },
  { id: 'branding', key: 'ds_tab_branding' }, { id: 'finish', key: 'ds_tab_finish' },
];
const input = 'w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-slate-400';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
      <span className={`w-8 h-4 rounded-full p-0.5 transition-colors ${checked ? 'bg-orange-500' : 'bg-slate-300'}`}>
        <span className={`block w-3 h-3 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </span>
      {label}
    </button>
  );
}

export default function CustomizePanel({
  tab, setTab,
  holderName, setHolderName, roleText, setRoleText, nameText, setNameText,
  phone, setPhone, email, setEmail, website, setWebsite, tagline, setTagline,
  showPhone, setShowPhone, showEmail, setShowEmail, showWebsite, setShowWebsite,
  logoUrl, uploading, onUpload, fileInputRef, onRemoveLogo,
  cardColor, setCardColor, accentColor, setAccentColor,
  finish, setFinish, removeBranding, setRemoveBranding,
}) {
  const { language } = useI18n();
  const finishLabel = (f) => t(`ds_finish_${String(f).toLowerCase()}`, language);
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="font-black text-sm mb-3 text-[#0b2149]"><span className="mr-1 text-[#f97316]">3.</span>{t("ds_customize", language)}</h3>
      <div className="flex gap-1 mb-4 border-b border-slate-100">
        {TABS.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            className={`px-3 py-2 text-xs font-bold border-b-2 -mb-px transition-colors ${tab === item.id ? 'border-orange-500 text-[#f97316]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            {t(item.key, language)}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("ds_full_name", language)}><input className={input} value={holderName} onChange={e => setHolderName(e.target.value)} placeholder={t("ds_your_name", language)} /></Field>
            <Field label={t("ds_title_role", language)}><input className={input} value={roleText} onChange={e => setRoleText(e.target.value)} placeholder={t("ds_your_role", language)} /></Field>
            <Field label={t("ds_company_org", language)}><input className={input} value={nameText} onChange={e => setNameText(e.target.value)} placeholder={t("ds_your_company", language)} /></Field>
            <Field label={t("ds_tagline", language)}><input className={input} value={tagline} onChange={e => setTagline(e.target.value)} placeholder={t("ds_tagline_placeholder", language)} /></Field>
          </div>
          <Field label={t("ds_phone", language)}>
            <input className={input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
          </Field>
          <div className="pl-1"><Toggle checked={showPhone} onChange={setShowPhone} label={t("ds_show_on_card", language)} /></div>
          <Field label={t("ds_email", language)}>
            <input className={input} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          </Field>
          <div className="pl-1"><Toggle checked={showEmail} onChange={setShowEmail} label={t("ds_show_on_card", language)} /></div>
          <Field label={t("ds_website", language)}>
            <input className={input} value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.yourcompany.com" />
          </Field>
          <div className="pl-1"><Toggle checked={showWebsite} onChange={setShowWebsite} label={t("ds_show_on_card", language)} /></div>
          <div className="relative">
            <button onClick={() => fileInputRef.current?.click()}
              className="mt-1 w-full rounded-xl border-2 border-dashed border-slate-200 p-3 flex items-center gap-3 hover:border-orange-400 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center overflow-hidden shrink-0">
                {logoUrl ? <img src={logoUrl} className="max-w-full max-h-full object-contain" /> : <Upload className="w-5 h-5 text-orange-500" />}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-black">{uploading ? t("ds_uploading", language) : logoUrl ? t("ds_logo_uploaded", language) : t("ds_upload_logo", language)}</p>
                <p className="text-[10px] text-slate-400">{logoUrl ? t("ds_click_replace", language) : "JPG, PNG or SVG"}</p>
              </div>
            </button>
            {logoUrl && (
              <button onClick={onRemoveLogo} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <input ref={fileInputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/svg+xml" onChange={onUpload} />
          </div>
        </div>
      )}

      {tab === 'style' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold mb-2 text-slate-700">{t("ds_base_color", language)} <span className="text-slate-400 font-normal">— {t("ds_base_color_copy", language)}</span></p>
            <div className="flex flex-wrap gap-2">
              {CARD_COLORS.map(c => (
                <button key={c.value} onClick={() => setCardColor(c.value)} title={c.name}
                  className={`w-8 h-8 rounded-lg border-2 transition-transform ${cardColor === c.value ? 'ring-2 ring-orange-300 scale-110 border-white' : 'border-slate-200'}`}
                  style={{ background: c.value }} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold mb-2 text-slate-700">{t("ds_accent_color", language)} <span className="text-slate-400 font-normal">— {t("ds_accent_color_copy", language)}</span></p>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map(c => (
                <button key={c} onClick={() => setAccentColor(c)} className={`w-8 h-8 rounded-lg border-2 transition-transform ${accentColor === c ? 'ring-2 ring-orange-300 scale-110 border-white' : 'border-slate-200'}`} style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'branding' && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <input type="checkbox" checked={removeBranding} onChange={e => setRemoveBranding(e.target.checked)} className="w-4 h-4 accent-orange-500" />
            {t("ds_remove_branding", language)}
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-black text-[#0b2149]">{t("ds_logo_artwork", language)}</p>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              {t("ds_logo_artwork_copy", language)}
            </p>
          </div>
        </div>
      )}

      {tab === 'finish' && (
        <div className="grid grid-cols-3 gap-2">
          {FINISHES.map(f => (
            <button key={f} onClick={() => setFinish(f)}
              className={`py-3 rounded-lg border text-xs font-bold transition-colors ${finish === f ? 'bg-[#0b2149] text-white border-[#0b2149]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {finishLabel(f)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}