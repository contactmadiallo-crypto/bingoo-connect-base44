import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to load and cache user features
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
 * Helper to check if user has a specific feature
 * Usage: hasFeature(features, "appointments")
 */
export function hasFeature(features, featureKey) {
  return Array.isArray(features) && features.includes(featureKey);
}

/**
 * Hook version: useHasFeature(featureKey)
 * Loads features and checks for the key
 */
export function useHasFeature(featureKey) {
  const { features, loading, error } = useFeatures();
  return hasFeature(features, featureKey) && !loading;
}