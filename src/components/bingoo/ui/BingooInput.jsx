import React from 'react';
import { AlertCircle } from 'lucide-react';

const NAVY = '#0b2149', ORANGE = '#f97316';

export default function BingooInput({
  label, value, onChange, placeholder, type = 'text', error, icon: Icon,
  required = false, disabled = false, className = '', ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold mb-1.5" style={{ color: NAVY }}>
          {label}{required && <span style={{ color: ORANGE }}> *</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 16, height: 16 }} />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium transition-colors ${Icon ? 'pl-9' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} focus:outline-none focus:ring-2`}
          style={{
            borderColor: error ? '#ef4444' : '#e2e8f0',
            color: NAVY,
            '--tw-ring-color': error ? '#ef444433' : `${ORANGE}33`,
          }}
          {...props}
        />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="text-red-500" style={{ width: 14, height: 14 }} />
          <span className="text-xs font-medium text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
}