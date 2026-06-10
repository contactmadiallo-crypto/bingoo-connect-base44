import React from "react";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}>
      <div className="w-full max-w-md">
        {/* Bingoo Connect Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xl"
                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                B
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">
                Bingoo <span className="text-blue-400">Connect</span>
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-blue-200 mt-1 text-sm">{subtitle}</p>}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
          {children}
        </div>

        {footer && (
          <p className="text-center text-sm text-blue-200 mt-6">{footer}</p>
        )}

        <p className="text-center text-xs text-white/30 mt-6">
          © 2024 Bingoo Connect · All rights reserved
        </p>
      </div>
    </div>
  );
}