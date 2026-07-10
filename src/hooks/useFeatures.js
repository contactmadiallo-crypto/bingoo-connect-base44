import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook to load and cache user features from the backend.
 * Returns { features: string[], plan: string, loading: boolean, error: null|string }
 */
export function useFeatures() {
  const [data, setData] = useState({ features: [], plan: 'free', loading: true, error: null });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setData({ features: [], plan: 'free', loading: false, error: null });
      return;
    }
    let cancelled = false;
    setData(prev => ({ ...prev, loading: true }));
    base44.functions.invoke('getUserFeatures', {})
      .then(result => {
        if (cancelled) return;
        setData({
          features: result.data.features || [],
          plan: result.data.plan || 'free',
          loading: false,
          error: null
        });
      })
      .catch(err => {
        if (cancelled) return;
        setData({ features: [], plan: 'free', loading: false, error: err.message });
      });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  return data;
}

/**
 * Check if a feature array includes a specific feature key.
 * Usage: hasFeature(features, "appointments")
 */
export function hasFeature(features, featureKey) {
  return Array.isArray(features) && features.includes(featureKey);
}

/**
 * Hook: loads features and checks for a single key.
 * Returns false while loading (avoid false gates).
 */
export function useHasFeature(featureKey) {
  const { features, loading } = useFeatures();
  if (loading) return true; // open while loading
  return hasFeature(features, featureKey);
}

/**
 * Returns true only when features are loaded AND the feature is NOT present.
 * Use instead of !hasFeature() to avoid false gate screens during loading.
 */
export function isFeatureGated(features, loading, featureKey) {
  if (loading) return false; // don't gate while loading
  return !hasFeature(features, featureKey);
}