import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to load and cache user features from the backend.
 * Returns { features: string[], plan: string, loading: boolean, error: null|string }
 */
export function useFeatures() {
  const [data, setData] = useState({ features: [], plan: 'free', loading: true, error: null });

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          setData({ features: [], plan: 'free', loading: false, error: null });
          return;
        }

        const result = await base44.functions.invoke('getUserFeatures', {});
        setData({
          features: result.data.features || [],
          plan: result.data.plan || 'free',
          loading: false,
          error: null
        });
      } catch (err) {
        console.error('Failed to load features:', err);
        setData({ features: [], plan: 'free', loading: false, error: err.message });
      }
    };

    loadFeatures();
  }, []);

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