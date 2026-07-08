import React from 'react';

export function BingooSkeleton({ width = '100%', height = 16, rounded = 'rounded-lg', className = '' }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
}

export function BingooSkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <BingooSkeleton width={40} height={40} rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <BingooSkeleton width="60%" height={14} />
          <BingooSkeleton width="40%" height={12} />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <BingooSkeleton key={i} width={i === lines - 1 ? '70%' : '100%'} height={12} />
      ))}
    </div>
  );
}

export function BingooSkeletonList({ count = 3, cardLines = 2 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <BingooSkeletonCard key={i} lines={cardLines} />
      ))}
    </div>
  );
}

export default BingooSkeleton;