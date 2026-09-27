import { InfinityMark } from '@/components/bingoo/ui/BingooBrand';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

const NAVY = '#0b2149';
const ORANGE = '#f97316';

export default function FactoryProductMedia({ product, className = '', compact = false, showLabel = false, selectedColor = null, fit = 'contain', applyFrame = true }) {
  const { language } = useI18n();
  const active = product?.availability === 'active';
  const hasProductImage = Boolean(product?.image);

  // Never recolor or tint the approved factory photograph in CSS.
  // If an approved true-color photo exists for a selected variant, use it.
  // Otherwise keep the original product photograph unchanged.
  const variantImage = selectedColor && product?.variantImages?.[selectedColor];
  const imageSrc = variantImage || product?.image;
  const frame = applyFrame ? (product?.mediaFrame || {}) : {};
  const scale = Number(frame.scale) || 1;
  const x = Number(frame.x) || 0;
  const y = Number(frame.y) || 0;
  const imageStyle = {
    ...(compact && fit !== 'cover' ? { padding: 6 } : {}),
    objectPosition: frame.objectPosition || 'center center',
    transform: `translate(${x}%, ${y}%) scale(${scale})`,
    transformOrigin: frame.origin || 'center center',
  };

  if (active && hasProductImage) {
    return (
      <div
        className={`relative overflow-hidden flex items-center justify-center ${className}`}
        style={{ background: 'transparent' }}
      >
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full ${fit === 'cover' ? 'object-cover' : 'object-contain'}`}
          style={imageStyle}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ background: 'linear-gradient(180deg,#fbfcfe 0%,#f1f5f9 100%)' }}
    >
      <div className="text-center px-5">
        <div
          className="mx-auto mb-3 flex items-center justify-center rounded-2xl"
          style={{ width: compact ? 42 : 62, height: compact ? 42 : 62, background: NAVY }}
        >
          <InfinityMark size={compact ? 22 : 32} color={ORANGE} strokeWidth={3.2} />
        </div>
        {showLabel && (
          <>
            <p className="text-xs font-black uppercase tracking-[.14em] text-slate-500">{t("product_media_pending",language)}</p>
            <p className="text-[10px] text-slate-400 mt-1">{t("product_media_pending_copy",language)}</p>
          </>
        )}
      </div>
    </div>
  );
}
