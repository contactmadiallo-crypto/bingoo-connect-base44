import { X, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FEATURE_DESCRIPTIONS } from '@/lib/planPermissions';

const B = { navy: "#0B2E6B", orange: "#FF7A00", gold: "#FDBA21" };

export default function UpgradeModal({ featureKey, onClose }) {
  const info = FEATURE_DESCRIPTIONS[featureKey] || {
    title: 'Premium Feature',
    upgradeTarget: 'Pro',
    message: 'Upgrade your plan to unlock this feature.',
  };

  const targetPlan = info.upgradeTarget?.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#fff' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 text-center"
          style={{ background: `linear-gradient(135deg, ${B.navy}, #1a3f8a)` }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: `${B.orange}25`, border: `2px solid ${B.orange}40` }}>
            <Zap className="w-7 h-7" style={{ color: B.gold }} />
          </div>
          <h2 className="text-xl font-black text-white mb-1">{info.title}</h2>
          <p className="text-sm font-semibold" style={{ color: B.gold }}>
            {info.upgradeTarget} Plan Required
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-slate-600 text-sm text-center leading-relaxed mb-5">
            {info.message}
          </p>

          <Link to={`/plans?highlight=${targetPlan}`} onClick={onClose}>
            <Button className="w-full font-bold flex items-center justify-center gap-2"
              style={{ background: B.orange, color: '#fff', border: 'none' }}>
              Upgrade to {info.upgradeTarget}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <button onClick={onClose}
            className="w-full mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}