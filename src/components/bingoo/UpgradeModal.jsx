import { X, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FEATURE_DESCRIPTIONS, COMING_SOON_PLANS } from '@/lib/planPermissions';
import { useI18n } from '@/lib/I18nContext';
import { localizePlanText } from '@/lib/planI18n';

const B = { navy: "#0b2149", orange: "#f97316", gold: "#FDBA21" };

export default function UpgradeModal({ featureKey, onClose }) {
  const { language } = useI18n();
  const tr = (en, fr) => language === 'fr' ? fr : en;
  const info = FEATURE_DESCRIPTIONS[featureKey] || {
    title: 'Premium Feature',
    upgradeTarget: 'Professional',
    message: 'Upgrade your plan to unlock this feature.',
  };

  const targetPlan = info.upgradeTarget?.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain"
        style={{ background: '#fff' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center"
          style={{ background: `linear-gradient(135deg, ${B.navy}, #1a3f8a)` }}>
          <button onClick={onClose} aria-label={tr("Close","Fermer")}
            className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: `${B.orange}25`, border: `2px solid ${B.orange}40` }}>
            <Zap className="w-7 h-7" style={{ color: B.gold }} />
          </div>
          <h2 className="text-xl font-black text-white mb-1">{language === "fr" ? tr("Premium Feature","Fonctionnalité premium") : info.title}</h2>
          <p className="text-sm font-semibold" style={{ color: B.gold }}>
            {localizePlanText(info.upgradeTarget, language)} {tr("Plan Required","requis")}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-slate-600 text-sm text-center leading-relaxed mb-5">
            {language === "fr" ? tr("Upgrade your plan to unlock this feature.","Passez à un forfait supérieur pour débloquer cette fonctionnalité.") : info.message}
          </p>

          {COMING_SOON_PLANS.includes(targetPlan) ? (
            <div className="w-full py-3 rounded-xl text-center text-sm font-bold" style={{ background: '#f1f5f9', color: '#64748b' }}>
              {tr("This plan is coming soon — we'll notify you when it launches.", "Ce forfait arrive bientôt — nous vous informerons dès son lancement.")}
            </div>
          ) : (
            <Link to={`/plans?highlight=${targetPlan}`} onClick={onClose}>
              <Button className="w-full min-h-[44px] font-bold flex items-center justify-center gap-2"
                style={{ background: B.orange, color: '#fff', border: 'none' }}>
                {tr("Upgrade to","Passer à")} {localizePlanText(info.upgradeTarget, language)}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}

          <button onClick={onClose}
            className="w-full min-h-[44px] mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium">
            {tr("Maybe later","Plus tard")}
          </button>
        </div>
      </div>
    </div>
  );
}