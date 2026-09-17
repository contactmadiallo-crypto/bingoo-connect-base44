import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { ProductPreview } from './ProductPreview';

const VIEW_MODES = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
];

const THUMBS = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'angled', label: 'Angled View' },
  { id: 'inhand', label: 'In Hand' },
];

export default function LivePreviewSection({ previewProps, viewMode, setViewMode, previewView, setPreviewView }) {
  const scaleMap = { desktop: 1.18, tablet: 0.95, mobile: 0.72 };
  const scale = scaleMap[viewMode] || 1.18;
  const side = previewView === 'back' ? 'back' : 'front';
  const transform = previewView === 'angled' ? 'perspective(900px) rotateY(-22deg) rotateX(4deg)' : 'none';
  const inHand = previewView === 'inhand';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-black text-[#0b2149]">Live Preview</h2>
        <div className="bg-slate-100 rounded-full p-1 flex text-xs font-bold">
          {VIEW_MODES.map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)}
              className={`px-3 py-2 rounded-full flex items-center gap-1.5 transition-colors ${viewMode === v.id ? 'bg-[#0b2149] text-white' : 'text-slate-500'}`}>
              <v.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={`min-h-[430px] rounded-xl flex items-center justify-center p-8 overflow-hidden ${inHand ? 'bg-gradient-to-b from-amber-50 to-orange-50' : 'bg-gradient-to-b from-slate-50 to-slate-100'}`}>
        <div style={{ transform, transformOrigin: 'center', transition: 'transform 0.3s' }}>
          <div style={{ transform: `scale(${inHand ? scale * 0.78 : scale})`, transformOrigin: 'center' }}>
            <ProductPreview {...previewProps} side={side} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {THUMBS.map(t => (
          <button key={t.id} onClick={() => setPreviewView(t.id)}
            className={`rounded-xl border-2 p-2 transition-colors ${previewView === t.id ? 'border-orange-500' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className="h-20 flex items-center justify-center overflow-hidden">
              <div style={{ transform: 'scale(0.42)', transformOrigin: 'center' }}>
                <ProductPreview {...previewProps} side={t.id === 'back' ? 'back' : 'front'} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-center mt-1">{t.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}