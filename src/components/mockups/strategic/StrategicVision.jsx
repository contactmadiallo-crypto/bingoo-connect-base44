import React from 'react';
import { DesktopFrame, Badge } from '@/components/mockups/MockupFrame';
import { InfinityMark, BingooAppIcon, BingooWordmark } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', MUTED = '#64748B', INK = '#0F172A';

export default function StrategicVision() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3" style={{ background: `${ORANGE}15` }}>
          <InfinityMark size={14} color={ORANGE} />
          <span className="text-xs font-black tracking-wider" style={{ color: ORANGE }}>STRATEGIC VISION</span>
        </div>
        <p className="text-xs font-black text-[#0F172A] mb-1">Bingoo Connect — The Worldwide Marketplace Ecosystem</p>
        <p className="text-[10px] text-[#64748B] max-w-lg mx-auto">Not just an NFC card app. Bingoo Connect is growing into a global platform for digital identity, verified businesses, service discovery, and connected assets.</p>
      </div>

      {/* Ecosystem Map */}
      <DesktopFrame label="Ecosystem Vision — 7 Connected Pillars" height="h-[520px]">
        <div className="p-8 h-full flex flex-col" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="text-center mb-6">
            <BingooAppIcon size={48} glow={true} imageUrl="https://media.base44.com/images/public/692bd9007b93ba81de543346/8792d3cda_generated_image.png" />
            <div className="mt-2"><BingooWordmark size="text-2xl" light textColor="#FFFFFF" infinityColor={ORANGE} showConnect /></div>
            <p className="text-white/40 text-[10px] mt-2">The Operating System for Professional Identity</p>
          </div>
          {/* Central Hub with 7 Pillars */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-2xl">
              {/* Central Hub */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl" style={{ background: `linear-gradient(135deg, ${ORANGE}, #fb923c)` }}>
                  <InfinityMark size={36} color="#FFFFFF" strokeWidth={3} />
                </div>
                <p className="text-white font-black text-[10px] text-center mt-2">Bingoo Connect</p>
              </div>
              {/* 7 Pillars */}
              {[
                { label: 'Digital Identity', desc: 'Smart profiles', icon: 'users', angle: 0 },
                { label: 'NFC Products', desc: 'Hardware ecosystem', icon: 'nfc', angle: 51 },
                { label: 'Verified Businesses', desc: 'Trust badges', icon: 'shield', angle: 103 },
                { label: 'Service Providers', desc: 'Marketplace', icon: 'briefcase', angle: 154 },
                { label: 'Professional Discovery', desc: 'Find & connect', icon: 'globe', angle: 206 },
                { label: 'Connected Assets', desc: 'Pets, travel, more', icon: 'package', angle: 257 },
                { label: 'Business Tools', desc: 'CRM, analytics', icon: 'chart', angle: 309 },
              ].map((p) => {
                const rad = (p.angle * Math.PI) / 180;
                const x = Math.cos(rad) * 180;
                const y = Math.sin(rad) * 130;
                return (
                  <div key={p.label} className="absolute" style={{ left: `calc(50% + ${x}px - 60px)`, top: `calc(50% + ${y}px - 40px)` }}>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 text-center w-[120px]">
                      <div className="w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center" style={{ background: `${ORANGE}25` }}><Icon name={p.icon} size={14} color={ORANGE} /></div>
                      <p className="text-white font-bold text-[8px]">{p.label}</p>
                      <p className="text-white/40 text-[7px]">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
              {/* Connecting Lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                {[0, 51, 103, 154, 206, 257, 309].map((angle) => {
                  const rad = (angle * Math.PI) / 180;
                  const x = Math.cos(rad) * 180 + 250;
                  const y = Math.sin(rad) * 130 + 160;
                  return <line key={angle} x1="250" y1="160" x2={x} y2={y} stroke="rgba(249,115,22,0.3)" strokeWidth="1" strokeDasharray="4 4" />;
                })}
              </svg>
            </div>
          </div>
        </div>
      </DesktopFrame>

      {/* Roadmap Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF2] max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="trend" size={16} color={ORANGE} />
          <p className="text-xs font-black text-[#0F172A]">Product Roadmap — Future Direction</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { phase: 'Phase 1', status: 'LIVE', title: 'Core Platform', items: ['NFC cards & devices', 'Digital profiles', 'CRM & appointments', 'Analytics'], color: '#22C55E' },
            { phase: 'Phase 2', status: 'IN PROGRESS', title: 'Business Verticals', items: ['Salon tools', 'Law firm tools', 'Business team profiles', 'Event mode'], color: ORANGE },
            { phase: 'Phase 3', status: 'PLANNED', title: 'Connected Assets', items: ['Pet protection', 'Travel protection', 'Valuables tracking', 'Finder network'], color: '#3b82f6' },
            { phase: 'Phase 4', status: 'VISION', title: 'Global Marketplace', items: ['Verified business directory', 'Service provider discovery', 'Professional search', 'Bingoo Connect ecosystem'], color: '#8b5cf6' },
          ].map((p) => (
            <div key={p.phase} className="rounded-xl p-3 border" style={{ borderColor: `${p.color}30`, background: `${p.color}08` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold" style={{ color: p.color }}>{p.phase}</span>
                <Badge color={p.color}>{p.status}</Badge>
              </div>
              <p className="text-[10px] font-black text-[#0F172A] mb-2">{p.title}</p>
              {p.items.map((item) => (
                <div key={item} className="flex items-center gap-1.5 mb-1">
                  <div className="w-1 h-1 rounded-full" style={{ background: p.color }} />
                  <span className="text-[8px] font-medium text-[#64748B]">{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Vision Statement */}
      <div className="max-w-2xl mx-auto rounded-2xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <InfinityMark size={32} color={ORANGE} strokeWidth={2.5} glow={true} className="mx-auto" />
        <p className="text-white font-black text-sm mt-4 mb-2">Our Vision</p>
        <p className="text-white/60 text-[11px] max-w-md mx-auto">To become the worldwide marketplace ecosystem for digital identity — where every professional, business, and connected asset is linked through Bingoo Connect's infinity network. One tap. Infinite connections.</p>
        <div className="flex justify-center gap-4 mt-4">
          {['🇺🇸', '🇫🇷', '🇸🇳', '🇨🇦', '🇬🇧', '🇩🇪', '🌍'].map((flag, i) => (
            <span key={i} className="text-base opacity-60">{flag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}