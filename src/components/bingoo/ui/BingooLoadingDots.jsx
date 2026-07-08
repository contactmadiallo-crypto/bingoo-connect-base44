import React from 'react';

const ORANGE = '#f97316';

export default function BingooLoadingDots({ color = ORANGE, size = 6, className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 py-4 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: size,
            height: size,
            background: color,
            animation: `bingoo-dots-wave 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bingoo-dots-wave {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}