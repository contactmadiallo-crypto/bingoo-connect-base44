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

export function BingooSkeletonStatCard({ isDark = false }) {
  const bg     = isDark ? 'bg-white/[0.05]' : 'bg-white';
  const border = isDark ? 'border-white/8' : 'border-slate-200';
  return (
    <div className={`rounded-2xl border p-3 ${bg} ${border}`}>
      <BingooSkeleton width={28} height={28} rounded="rounded-lg" isDark={isDark} />
      <div className="mt-2 space-y-1.5">
        <BingooSkeleton width="60%" height={20} isDark={isDark} />
        <BingooSkeleton width="45%" height={10} isDark={isDark} />
      </div>
    </div>
  );
}

export function BingooSkeletonStatGrid({ count = 3, isDark = false }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <BingooSkeletonStatCard key={i} isDark={isDark} />
      ))}
    </div>
  );
}

export function BingooSkeletonProfileCard({ isDark = false }) {
  const bg     = isDark ? 'bg-white/[0.05]' : 'bg-white';
  const border = isDark ? 'border-white/8' : 'border-slate-200';
  return (
    <div className={`rounded-2xl border overflow-hidden ${bg} ${border}`}>
      <BingooSkeleton width="100%" height={120} rounded="rounded-none" isDark={isDark} />
      <div className="px-4 pb-4">
        <div className="flex items-end gap-3 -mt-8">
          <BingooSkeleton width={64} height={64} rounded="rounded-2xl" isDark={isDark} />
          <div className="flex-1 space-y-2 pb-1">
            <BingooSkeleton width="70%" height={16} isDark={isDark} />
            <BingooSkeleton width="50%" height={12} isDark={isDark} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BingooSkeletonProfileGrid({ count = 2, isDark = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <BingooSkeletonProfileCard key={i} isDark={isDark} />
      ))}
    </div>
  );
}

export function BingooSkeletonQuickActions({ isDark = false }) {
  const bg     = isDark ? 'bg-white/[0.05]' : 'bg-white';
  const border = isDark ? 'border-white/8' : 'border-slate-200';
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={`rounded-2xl border p-3 flex flex-col items-center gap-2 ${bg} ${border}`}>
          <BingooSkeleton width={36} height={36} rounded="rounded-xl" isDark={isDark} />
          <BingooSkeleton width={40} height={10} isDark={isDark} />
        </div>
      ))}
    </div>
  );
}

export default BingooSkeleton;