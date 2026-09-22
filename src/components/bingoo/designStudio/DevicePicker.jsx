import { useState } from 'react';
import { PRODUCT_TYPES, ProductPreview } from './ProductPreview';

// Primary 6 devices shown by default; extras (metal_card, wood_card) behind "View all"
const PRIMARY_IDS = ['card', 'keychain', 'sticker', 'bracelet', 'tag', 'stand'];
const EXTRA_IDS = ['metal_card', 'wood_card'];

const DISPLAY_LABELS = {
  card: 'NFC Card',
  keychain: 'Key Fob',
  sticker: 'Sticker',
  bracelet: 'Bracelet',
  tag: 'Tag',
  stand: 'Table Stand',
  metal_card: 'Metal Card',
  wood_card: 'Wood Card',
};

const THUMB_PROPS = {
  cardColor: '#F8FAFC',
  accentColor: '#f97316',
  logoUrl: null,
  nameText: '',
  holderName: '',
  roleText: '',
  phone: '',
  email: '',
  website: '',
  tagline: '',
  removeBranding: false,
  finish: 'Matte',
  isDark: false,
  brandPattern: { enabled: false },
  templateId: 'modern',
};

export default function DevicePicker({ productType, setProductType }) {
  const [expanded, setExpanded] = useState(false);
  const extras = EXTRA_IDS;
  const visible = expanded ? [...PRIMARY_IDS, ...extras] : PRIMARY_IDS;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-sm text-[#0b2149]"><span className="mr-1 text-[#f97316]">1.</span>Choose Your Device</h3>
        {extras.length > 0 && (
          <button onClick={() => setExpanded(v => !v)} className="text-[11px] font-bold text-[#f97316] hover:underline">
            {expanded ? 'Show less' : 'View all'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {visible.map(id => {
          const p = PRODUCT_TYPES.find(t => t.id === id);
          if (!p) return null;
          const active = productType === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setProductType(p.id)}
              className={`relative rounded-lg border px-1.5 py-2.5 min-h-[92px] flex flex-col items-center justify-between transition-all ${active ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className="h-[58px] w-full rounded-md bg-slate-50 flex items-center justify-center overflow-hidden">
                <div style={{ transform: 'scale(0.24)', transformOrigin: 'center' }}>
                  <ProductPreview {...THUMB_PROPS} productType={p.id} side="front" />
                </div>
              </div>
              <span className={`text-[9px] font-black leading-tight mt-1 text-center ${active ? 'text-[#0b2149]' : 'text-slate-700'}`}>{DISPLAY_LABELS[p.id]}</span>
              {active && <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}