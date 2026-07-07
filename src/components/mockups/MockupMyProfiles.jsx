import React from 'react';
import { PhoneFrame, MobileBottomNav } from './MockupFrame';

export default function MockupMyProfiles() {
  return (
    <PhoneFrame label="3 · My Profiles">
      <div className="relative min-h-full pb-20">
        {/* Header */}
        <div className="bg-[#0A1F52] px-5 pt-8 pb-6">
          <p className="text-white font-bold text-lg">My Profiles</p>
          <p className="text-white/50 text-[10px]">3 profiles · 1 default</p>
        </div>

        {/* Profile Cards */}
        <div className="px-5 -mt-3 space-y-3">
          {/* Default Profile */}
          <div className="bg-white rounded-xl border-2 border-[#FF7A00] p-4 shadow-md relative">
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-[#FF7A00] rounded-full">
              <span className="text-white text-[8px] font-bold">★ DEFAULT</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0A1F52] to-[#071A3D] rounded-xl flex items-center justify-center">
                <span className="text-[#FF7A00] font-bold text-sm">DLF</span>
              </div>
              <div>
                <p className="font-semibold text-[#0F172A] text-sm">Diallo Law Firm</p>
                <p className="text-[#64748B] text-[10px]">Law Firm · Law Firm Plan</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-3">
              <span>🔗 /p/diallolaw</span>
              <span>📱 2 devices</span>
              <span>👁 247 views</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: '👁', label: 'View' },
                { icon: '🔗', label: 'Share' },
                { icon: '✏️', label: 'Edit' },
                { icon: '🔲', label: 'QR' },
              ].map((a) => (
                <button key={a.label} className="flex flex-col items-center gap-0.5 py-1.5 bg-[#F7F9FC] rounded-lg">
                  <span className="text-xs">{a.icon}</span>
                  <span className="text-[8px] font-medium text-[#0F172A]">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile 2 */}
          <div className="bg-white rounded-xl border border-[#E5EAF2] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF7A00] to-[#fb923c] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">BP</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-[#0F172A] text-sm">Bingoo Personal</p>
                  <span className="px-1.5 py-0.5 bg-[#0A1F52]/10 text-[#0A1F52] text-[8px] font-bold rounded">INDIVIDUAL</span>
                </div>
                <p className="text-[#64748B] text-[10px]">Professional · Pro Plan</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-3">
              <span>🔗 /p/mamadou</span>
              <span>📱 1 device</span>
              <span>👁 89 views</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: '👁', label: 'View' },
                { icon: '🔗', label: 'Share' },
                { icon: '✏️', label: 'Edit' },
                { icon: '🔲', label: 'QR' },
              ].map((a) => (
                <button key={a.label} className="flex flex-col items-center gap-0.5 py-1.5 bg-[#F7F9FC] rounded-lg">
                  <span className="text-xs">{a.icon}</span>
                  <span className="text-[8px] font-medium text-[#0F172A]">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile 3 */}
          <div className="bg-white rounded-xl border border-[#E5EAF2] p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#64748B] to-[#475569] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <div>
                <p className="font-semibold text-[#0F172A] text-sm">Salon Connect</p>
                <p className="text-[#64748B] text-[10px]">Salon · Salon Plan</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#64748B]">
              <span>🔗 /p/salonconnect</span>
              <span>📱 0 devices</span>
              <span>👁 12 views</span>
            </div>
          </div>

          {/* Add Profile */}
          <button className="w-full border-2 border-dashed border-[#E5EAF2] rounded-xl py-4 flex items-center justify-center gap-2 text-[#64748B]">
            <span className="text-lg">＋</span>
            <span className="text-xs font-medium">Create New Profile</span>
          </button>
        </div>

        <MobileBottomNav active="Profiles" />
      </div>
    </PhoneFrame>
  );
}