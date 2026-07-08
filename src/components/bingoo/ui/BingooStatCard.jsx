import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const NAVY = '#0b2149', ORANGE = '#f97316';

export default function BingooStatCard({ icon: Icon, value, label, trend, trendDirection, color = NAVY, accent = ORANGE }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start justify-between mb-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}15` }}
        >
          {Icon && <Icon style={{ width: 18, height: 18, color: accent }} />}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-0.5 text-xs font-bold ${trendDirection === 'down' ? 'text-red-500' : 'text-green-500'}`}
          >
            {trendDirection === 'down' ? <TrendingDown style={{ width: 12, height: 12 }} /> : <TrendingUp style={{ width: 12, height: 12 }} />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}