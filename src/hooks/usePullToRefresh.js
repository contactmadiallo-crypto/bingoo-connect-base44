import { useEffect, useRef, useState } from 'react';

export default function usePullToRefresh(onRefresh, threshold = 80) {
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullDistanceRef = useRef(0);

  useEffect(() => {
    const container = document.querySelector('[data-pull-refresh]') || window;
    
    const handleTouchStart = (e) => {
      const scrollElement = e.target.closest('[data-pull-refresh]') || window;
      const scrollTop = scrollElement === window 
        ? window.scrollY 
        : scrollElement.scrollTop;
      
      if (scrollTop === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (startYRef.current === 0) return;
      
      const currentY = e.touches[0].clientY;
      const distance = currentY - startYRef.current;
      
      if (distance > 0) {
        pullDistanceRef.current = distance;
        e.preventDefault?.();
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistanceRef.current > threshold && !refreshing) {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }
      startYRef.current = 0;
      pullDistanceRef.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, false);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, refreshing, threshold]);

  return { refreshing, pullDistance: pullDistanceRef.current };
}