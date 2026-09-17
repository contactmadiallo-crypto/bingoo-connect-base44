import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { CARD_COLORS, ACCENTS, FINISHES, DEFAULT_PATTERN } from './studioConstants';

const TABS = ['Content', 'Style', 'Branding', 'Finish'];
const input = 'w-full h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-orange-300';

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
  logoUrl, uploading, onUpload, fileInputRef,
  cardColor, setCardColor, accentColor, setAccentColor,
  finish, setFinish, removeBranding, setRemoveBranding, brandPattern, setBrandPattern,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="font-black text-sm mb-3 text-[#0b2149]"><span className="mr-1">3.</span>Customize Your Design</h3>
      <div className="flex gap-1 mb-4 border-b border-slate-100">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t.toLowerCase())}
            className={`px-3 py-2 text-xs font-bold border-b-2 -mb-px transition-colors ${tab === t.toLowerCase() ? 'border-orange-500 text-[#f97316]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name"><input className={input} value={holderName} onChange={e => setHolderName(e.target.value)} placeholder="Your Name" /></Field>
            <Field label="Title / Role"><input className={input} value={roleText} onChange={e => setRoleText(e.target.value)} placeholder="Your Role" /></Field>
            <Field label="Company / Organization"><input className={input} value={nameText} onChange={e => setNameText(e.target.value)} placeholder="Your Company" /></Field>
            <Field label="Tagline (optional)"><input className={input} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Your Tagline Here" /></Field>
          </div>
          <Field label="Phone">
            <input className={input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
          </Field>
          <div className="pl-1"><Toggle checked={showPhone} onChange={setShowPhone} label="Show on card" /></div>
          <Field label="Email">
            <input className={input} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourcompany.com" />
          </Field>
          <div className="pl-1"><Toggle checked={showEmail} onChange={setShowEmail} label="Show on card" /></div>
          <Field label="Website">
            <input className={input} value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.yourcompany.com" />
          </Field>
          <div className="pl-1"><Toggle checked={showWebsite} onChange={setShowWebsite} label="Show on card" /></div>
          <button onClick={() => fileInputRef.current?.click()}
            className="mt-1 w-full rounded-xl border-2 border-dashed border-slate-200 p-3 flex items-center gap-3 hover:border-orange-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center overflow-hidden">
              {logoUrl ? <img src={logoUrl} className="max-w-full max-h-full object-contain" /> : <Upload className="w-5 h-5 text-orange-500" />}
            </div>
            <div className="text-left">
              <p className="text-xs font-black">{uploading ? 'Uploading…' : 'Upload Your Logo'}</p>
              <p className="text-[10px] text-slate-400">JPG, PNG or SVG</p>
            </div>
          </button>
          <input ref={fileInputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/svg+xml" onChange={onUpload} />
        </div>
      )}

      {tab === 'style' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold mb-2 text-slate-700">Base Color</p>
            <div className="flex flex-wrap gap-2">
              {CARD_COLORS.map(c => (
                <button key={c.value} onClick={() => setCardColor(c.value)} title={c.name}
                  className={`w-8 h-8 rounded-lg border-2 transition-transform ${cardColor === c.value ? 'ring-2 ring-orange-300 scale-110' : 'border-slate-200'}`}
                  style={{ background: c.value }} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold mb-2 text-slate-700">Accent Color</p>
            <div className="flex flex-wrap gap-2">
              {ACCENTS.map(c => (
                <button key={c} onClick={() => setAccentColor(c)} className={`w-8 h-8 rounded-lg border-2 transition-transform ${accentColor === c ? 'ring-2 ring-orange-300 scale-110' : 'border-slate-200'}`} style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'branding' && (
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <input type="checkbox" checked={removeBranding} onChange={e => setRemoveBranding(e.target.checked)} className="w-4 h-4 accent-orange-500" />
            Remove Bingoo branding (+$2.50)
          </label>
          <div>
            <p className="text-xs font-bold mb-2 text-slate-700">Brand Pattern (Watermark)</p>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-2">
              <input type="checkbox" checked={brandPattern.enabled} onChange={e => setBrandPattern({ ...brandPattern, enabled: e.target.checked })} className="w-4 h-4 accent-orange-500" />
              Repeat logo as watermark
            </label>
            {brandPattern.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Opacity (%)">
                  <input type="range" min="3" max="25" value={brandPattern.opacity} onChange={e => setBrandPattern({ ...brandPattern, opacity: Number(e.target.value) })} className="w-full accent-orange-500" />
                </Field>
                <Field label="Size">
                  <select className={input} value={brandPattern.size} onChange={e => setBrandPattern({ ...brandPattern, size: e.target.value })}>
                    <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option>
                  </select>
                </Field>
                <Field label="Direction">
                  <select className={input} value={brandPattern.direction} onChange={e => setBrandPattern({ ...brandPattern, direction: e.target.value })}>
                    <option value="straight">Straight</option><option value="diagonal">Diagonal</option><option value="offset">Offset</option><option value="centered">Centered</option><option value="corner_fade">Corner Fade</option>
                  </select>
                </Field>
                <Field label="Coverage">
                  <select className={input} value={brandPattern.coverage} onChange={e => setBrandPattern({ ...brandPattern, coverage: e.target.value })}>
                    <option value="full">Full</option><option value="top_fade">Top Fade</option><option value="bottom_fade">Bottom Fade</option><option value="edge_fade">Edge Fade</option>
                  </select>
                </Field>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'finish' && (
        <div className="grid grid-cols-3 gap-2">
          {FINISHES.map(f => (
            <button key={f} onClick={() => setFinish(f)}
              className={`py-3 rounded-lg border text-xs font-bold transition-colors ${finish === f ? 'bg-[#0b2149] text-white border-[#0b2149]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}