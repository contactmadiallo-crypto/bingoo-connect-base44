import React from 'react';

export function BingooSkeleton({ width = '100%', height = 16, rounded = 'rounded-lg', className = '', isDark = false }) {
  return (
    <div
      className={`animate-pulse ${isDark ? 'bg-white/10' : 'bg-slate-200'} ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
}

export function BingooSkeletonCard({ lines = 3, isDark = false }) {
  const bg     = isDark ? 'bg-white/[0.05]' : 'bg-white';
  const border = isDark ? 'border-white/8' : 'border-slate-200';
  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${bg} ${border}`}>
      <div className="flex items-center gap-3">
        <BingooSkeleton width={40} height={40} rounded="rounded-full" isDark={isDark} />
        <div className="flex-1 space-y-2">
          <BingooSkeleton width="60%" height={14} isDark={isDark} />
          <BingooSkeleton width="40%" height={12} isDark={isDark} />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <BingooSkeleton key={i} width={i === lines - 1 ? '70%' : '100%'} height={12} isDark={isDark} />
      ))}
    </div>
  );
}

export function BingooSkeletonList({ count = 3, cardLines = 2, isDark = false }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <BingooSkeletonCard key={i} lines={cardLines} isDark={isDark} />
      ))}
    </div>
  );
}

export default BingooSkeleton;