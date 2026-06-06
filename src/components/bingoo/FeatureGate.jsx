import { useState } from 'react';
import { Lock } from 'lucide-react';
import { usePlan } from '@/hooks/usePlan';
import UpgradeModal from './UpgradeModal';
import { FEATURE_DESCRIPTIONS } from '@/lib/planPermissions';

/**
 * Wraps children with a plan gate.
 * If the user doesn't have access, shows a locked overlay and upgrade modal on click.
 *
 * Usage:
 *   <FeatureGate feature="analytics">
 *     <AnalyticsPanel />
 *   </FeatureGate>
 *
 * Or as a hook-style guard (showLock=false, onClick fires modal):
 *   <FeatureGate feature="nfc_devices" showLock={false}>
 *     <button>Activate Device</button>
 *   </FeatureGate>
 */
export default function FeatureGate({ feature, children, showLock = true }) {
  const { canAccess, isLoading } = usePlan();
  const [showModal, setShowModal] = useState(false);

  if (isLoading) return children;
  if (canAccess(feature)) return children;

  const info = FEATURE_DESCRIPTIONS[feature];

  return (
    <>
      <div className="relative" onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
        <div style={{ pointerEvents: 'none', opacity: 0.4 }}>{children}</div>
        {showLock && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
            style={{ background: 'rgba(11,46,107,0.07)', border: '1.5px dashed #0B2E6B30' }}>
            <Lock className="w-6 h-6 mb-1.5" style={{ color: '#0B2E6B' }} />
            <p className="text-xs font-bold text-center px-3" style={{ color: '#0B2E6B' }}>
              {info?.upgradeTarget} Plan
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <UpgradeModal featureKey={feature} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}