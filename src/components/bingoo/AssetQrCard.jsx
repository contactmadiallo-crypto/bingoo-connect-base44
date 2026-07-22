import { useState, useEffect, useRef } from 'react';
import { X, Download, Share2, Printer, QrCode as QrIcon, Wifi, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import BingooLogo from '@/components/bingoo/BingooLogo';

const ASSET_TYPES = [
  { value: 'pet', label: 'Pet', icon: '🐾' },
  { value: 'luggage', label: 'Luggage', icon: '🧳' },
  { value: 'bag', label: 'Bag', icon: '👜' },
  { value: 'keys', label: 'Keys', icon: '🔑' },
  { value: 'equipment', label: 'Equipment', icon: '📷' },
  { value: 'vehicle', label: 'Vehicle', icon: '🚗' },
  { value: 'other', label: 'Other', icon: '📦' },
];

function typeLabel(t) {
  return ASSET_TYPES.find(x => x.value === t)?.label || t;
}
function typeIcon(t) {
  return ASSET_TYPES.find(x => x.value === t)?.icon || '📦';
}

/**
 * AssetQrCard — modal showing an asset's dedicated QR code.
 * The QR opens the public asset lost/found page (/a/:assetId), NOT a profile.
 * Includes preview, Download, Share, Print, and an NFC-protection upgrade CTA.
 * Available to every asset, including Free accounts with no NFC device.
 */
export default function AssetQrCard({ open, asset, onClose, isDark, hasNfcDevice }) {
  const [preview, setPreview] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const canvasRef = useRef(null);

  const assetUrl = asset ? `${window.location.origin}/a/${asset.id}?source=qr` : null;

  // Build the QR preview on a canvas (QR + asset name label + Bingoo footer).
  useEffect(() => {
    if (!open || !assetUrl) { setPreview(null); return; }
    let cancelled = false;
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 500;
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(assetUrl)}&color=0b2149&bgcolor=ffffff`;
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = () => {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 400, 500);
      ctx.drawImage(qrImg, 0, 24, 400, 400);
      ctx.fillStyle = '#0b2149'; ctx.font = 'bold 22px system-ui,sans-serif';
      ctx.textAlign = 'center';
      const name = (asset?.name || 'My Asset').slice(0, 28);
      ctx.fillText(name, 200, 452);
      ctx.fillStyle = '#0b2149'; ctx.fillRect(0, 466, 400, 34);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px system-ui,sans-serif';
      ctx.fillText('Powered by Bingoo Connect', 200, 488);
      if (!cancelled) setPreview(canvas.toDataURL('image/png'));
    };
    qrImg.onerror = () => { if (!cancelled) setPreview(null); };
    qrImg.src = qrSrc;
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, assetUrl, asset?.name]);

  const handleDownload = () => {
    if (!preview || downloading) return;
    setDownloading(true);
    const a = document.createElement('a');
    a.href = preview;
    a.download = `bingoo-asset-qr-${(asset?.name || 'asset').replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
    setTimeout(() => setDownloading(false), 500);
  };

  const handleShare = async () => {
    if (!assetUrl || sharing) return;
    setSharing(true);
    try {
      // Prefer sharing the QR image file when the platform supports it.
      if (preview && navigator.canShare) {
        const blob = await (await fetch(preview)).blob();
        const file = new File([blob], `bingoo-asset-qr.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `${asset?.name || 'My asset'} — Bingoo Asset QR`,
            text: `If you find this, scan to help return it: ${assetUrl}`,
          });
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: `${asset?.name || 'My asset'} — Bingoo Asset QR`, text: `If you find this, scan to help return it.`, url: assetUrl });
        return;
      }
      navigator.clipboard.writeText(assetUrl);
      toast.success('Asset link copied!');
    } catch (e) {
      // user cancelled — not an error
      if (e?.name !== 'AbortError') toast.error('Share unavailable — link copied instead.');
    } finally {
      setSharing(false);
    }
  };

  const handlePrint = () => {
    if (!preview) return;
    const w = window.open('', '_blank', 'width=480,height=640');
    if (!w) { toast.error('Pop-up blocked — allow pop-ups to print.'); return; }
    w.document.write(`
      <html><head><title>Bingoo Asset QR — ${asset?.name || ''}</title>
      <style>body{margin:0;display:flex;flex-direction:column;align-items:center;font-family:system-ui,sans-serif;padding:24px}
      img{width:380px;height:auto;border:1px solid #e2e8f0;border-radius:12px}
      h1{font-size:18px;color:#0b2149;margin:12px 0 4px}
      p{color:#64748b;font-size:13px;margin:0}</style></head>
      <body><img src="${preview}" alt="Asset QR" />
      <h1>${asset?.name || 'My Asset'}</h1>
      <p>${typeIcon(asset?.asset_type)} ${typeLabel(asset?.asset_type)} · Scan to help return this item</p>
      <p style="margin-top:6px;font-size:11px;color:#94a3b8">Powered by Bingoo Connect</p>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  return (
    <AnimatePresence>
      {open && asset && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#13162a]' : 'bg-white'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4" style={{ background: 'linear-gradient(135deg,#0b2149,#13284f)' }}>
              <div className="flex items-center gap-2.5">
                <BingooLogo className="w-8 h-8" animated={false} />
                <div>
                  <p className="text-white font-black text-sm leading-none">Asset QR Code</p>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mt-0.5">Opens lost &amp; found page</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Asset summary */}
              <div className={`flex items-center gap-3 rounded-2xl p-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                {asset.photo_url ? (
                  <img src={asset.photo_url} alt={asset.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: '#FFF5EB' }}>{typeIcon(asset.asset_type)}</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`font-black text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{asset.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ${isDark ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-500'}`}>{typeIcon(asset.asset_type)} {typeLabel(asset.asset_type)}</span>
                    {asset.lost_mode_enabled ? (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase text-white" style={{ background: '#f97316' }}>Lost mode on</span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase text-emerald-700" style={{ background: '#dcfce7' }}>Safe</span>
                    )}
                  </div>
                </div>
              </div>

              {/* QR preview */}
              <div className="flex justify-center">
                <div className={`rounded-2xl p-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  {preview ? (
                    <img src={preview} alt="Asset QR preview" className="w-52 h-65 object-contain" style={{ height: '260px' }} />
                  ) : (
                    <div className="w-52 h-65 flex items-center justify-center" style={{ height: '260px' }}>
                      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button onClick={handleDownload} disabled={!preview || downloading}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-bold text-white disabled:opacity-50" style={{ background: '#0b2149' }}>
                  <Download className="w-4 h-4" /> Download
                </button>
                <button onClick={handleShare} disabled={sharing}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-bold text-white disabled:opacity-50" style={{ background: '#f97316' }}>
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button onClick={handlePrint} disabled={!preview}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-bold disabled:opacity-50 ${isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>

              {/* NFC protection CTA */}
              {hasNfcDevice ? (
                <div className={`flex items-center gap-2 rounded-xl p-3 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                  <Wifi className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>NFC protected — this asset also taps with an NFC device.</p>
                </div>
              ) : (
                <div className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'linear-gradient(135deg,#FFF5EB,#fff7ed)', border: '1px solid #fed7aa' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f97316' }}>
                    <QrIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900">Add NFC protection</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">A QR works everywhere — but an NFC tag lets anyone tap to report your item found in one second.</p>
                    <a href="/shop" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ background: '#f97316' }}>
                      Get an NFC device <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              <p className={`text-center text-[11px] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                Print this QR on luggage tags, pet collars, or stickers. Scanning it opens the safe recovery page — your private details stay hidden.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}