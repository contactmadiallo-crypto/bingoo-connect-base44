import React from 'react';
import { DesktopFrame } from './MockupFrame';

export default function MockupLanding() {
  return (
    <DesktopFrame label="1 · Landing Page">
      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#E5EAF2]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0A1F52] rounded-lg flex items-center justify-center">
            <span className="text-[#FF7A00] font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-[#0A1F52]">Bingoo Connect</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#64748B]">Shop</span>
          <span className="text-xs text-[#64748B]">Pricing</span>
          <span className="text-xs text-[#64748B]">About</span>
          <button className="px-4 py-1.5 bg-[#FF7A00] text-white text-xs font-semibold rounded-lg">Get Started</button>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0A1F52] via-[#071A3D] to-[#0A1F52] px-8 py-12 text-center">
        <span className="inline-block px-3 py-1 bg-[#FF7A00]/20 text-[#FF7A00] text-[10px] font-semibold rounded-full mb-4">
          THE OPERATING SYSTEM FOR PROFESSIONAL IDENTITY
        </span>
        <h1 className="text-3xl font-bold text-white mb-3 leading-tight">
          One Tap.<br />Your Entire Business World.
        </h1>
        <p className="text-sm text-white/70 mb-6 max-w-md mx-auto">
          Connect. Share. Grow. Succeed. — NFC cards, digital profiles, CRM, appointments, analytics, and wallet passes in one premium platform.
        </p>
        <div className="flex justify-center gap-3 mb-6">
          <button className="px-6 py-2.5 bg-[#FF7A00] text-white text-sm font-semibold rounded-lg">Start Free</button>
          <button className="px-6 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-lg border border-white/20">View Plans</button>
        </div>

        {/* NFC Card visual */}
        <div className="mx-auto w-64 h-40 bg-gradient-to-br from-[#13284f] to-[#0A1F52] rounded-2xl shadow-2xl border border-white/10 p-5 flex flex-col justify-between text-left">
          <div className="flex justify-between items-start">
            <div>
              <div className="w-8 h-8 bg-[#FF7A00] rounded-lg flex items-center justify-center mb-2">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <p className="text-white text-sm font-semibold">Mamadou Diallo</p>
              <p className="text-white/50 text-[10px]">Immigration Attorney</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-lg p-1">
              <div className="w-full h-full bg-[#0A1F52] rounded grid grid-cols-4 gap-px p-0.5">
                {Array.from({length:16}).map((_,i)=><div key={i} className="bg-white rounded-[1px]" />)}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#FF7A00] text-[10px] font-bold">BINGOO</span>
            <span className="text-white/30 text-[8px]">Connect · Share · Grow</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-8 py-8 bg-[#F7F9FC]">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '📱', title: 'NFC Sharing', desc: 'One tap to share' },
            { icon: '👥', title: 'CRM', desc: 'Track every lead' },
            { icon: '📅', title: 'Appointments', desc: 'Book online' },
            { icon: '📊', title: 'Analytics', desc: 'Know your reach' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-4 border border-[#E5EAF2] text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="text-xs font-semibold text-[#0F172A]">{f.title}</p>
              <p className="text-[10px] text-[#64748B]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}