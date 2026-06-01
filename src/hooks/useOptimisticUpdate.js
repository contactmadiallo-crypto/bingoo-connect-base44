import { useCallback } from 'react';

/**
 * Hook for optimistic UI updates
 * @param {Function} updateFn - Function that takes (prevState, change) and returns new state
 * @param {Function} setStateFn - State setter function
 * @returns {Object} - { optimisticUpdate: function }
 */
export function useOptimisticUpdate(updateFn, setStateFn) {
  const optimisticUpdate = useCallback((prevState, change) => {
    const newState = updateFn(prevState, change);
    setStateFn(newState);
  }, [updateFn, setStateFn]);

  return { optimisticUpdate };
}