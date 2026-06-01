import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import usePullToRefresh from '@/hooks/usePullToRefresh';

export function PullToRefreshContainer({ onRefresh, children }) {
  const { refreshing, pullDistance } = usePullToRefresh(onRefresh, 60);
  const progress = Math.min(pullDistance / 80, 1);

  return (
    <div data-pull-refresh className="relative w-full overflow-y-auto" style={{ minHeight: '100vh' }}>
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex items-center justify-center h-16 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: refreshing ? 360 : progress * 180 }}
            transition={{ duration: refreshing ? 1 : 0, repeat: refreshing ? Infinity : 0 }}
            className="text-blue-600"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        animate={{ paddingTop: Math.max(pullDistance, 0) }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}