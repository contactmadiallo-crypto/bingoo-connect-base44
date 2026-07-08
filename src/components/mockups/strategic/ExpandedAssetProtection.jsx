import React from 'react';
import { PhoneFrame, DesktopFrame, Badge } from '@/components/mockups/MockupFrame';
import { InfinityMark, BingooStamp } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', MUTED = '#64748B';

// ── Bike / Equipment Protection ──
function BikeProtection() {
  return (
    <PhoneFrame label="Bike Protection — NFC Frame Tag">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10"><Icon name="zap" size={16} color={ORANGE} /></div>
            <div><p className="text-white font-black text-sm">Bike Protection</p><p className="text-white/50 text-[8px]">Bingoo Connect · Connected Asset</p></div>
          </div>
        </div>
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl overflow-hidden border border-[#E5EAF2] mb-3">
            <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-4xl">🚲</span></div>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-30" style={{ background: ORANGE, filter: 'blur(25px)' }} />
            </div>
            <div className="px-4 pt-3 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-lg flex items-center justify-center" style={{ background: `${ORANGE}15` }}>
                  <span className="text-xl">🚲</span>
                </div>
                <div>
                  <p className="font-black text-sm text-[#0F172A]">Trek Marlin 7</p>
                  <p className="text-[9px] text-[#64748B]">Matte Black · SN: TM7-2024-0892</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge color={NAVY}>REGISTERED</Badge>
                <Badge color="#22C55E">ACTIVE</Badge>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">OWNER — IF FOUND, CONTACT</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="users" size={14} color={NAVY} /></div>
              <div><p className="text-[10px] font-bold text-[#0F172A]">Alex Kumar</p><p className="text-[8px] text-[#64748B]">(646) 555-0177</p></div>
            </div>
            <button className="w-full py-2 text-white text-[10px] font-black rounded-xl" style={{ background: '#22C55E' }}>Call Owner</button>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] text-center">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">NFC FRAME TAG</p>
            <div className="inline-block rounded-2xl p-3 shadow-xl" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
              <BingooStamp size={28} color={ORANGE} showText={false} variant="outline" />
              <p className="text-white font-bold text-[7px] mt-1">BING∞ CONNECT</p>
            </div>
            <p className="text-[8px] text-[#64748B] mt-2">Tap tag on bike frame to view ownership</p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Key Finder ──
function KeyFinderProtection() {
  return (
    <PhoneFrame label="Key Finder — NFC Key Tag">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10"><Icon name="lock" size={16} color={ORANGE} /></div>
            <div><p className="text-white font-black text-sm">Key Finder</p><p className="text-white/50 text-[8px]">Bingoo Connect · Connected Asset</p></div>
          </div>
        </div>
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl overflow-hidden border border-[#E5EAF2] mb-3">
            <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-4xl">🔑</span></div>
            </div>
            <div className="px-4 pt-3 pb-3">
              <p className="font-black text-sm text-[#0F172A]">Apartment Keys</p>
              <p className="text-[9px] text-[#64748B]">Tag ID: BG-KEY-0017 · Apt 4B</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">OWNER — IF FOUND, CONTACT</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="users" size={14} color={NAVY} /></div>
              <div><p className="text-[10px] font-bold text-[#0F172A]">Sarah Reeves</p><p className="text-[8px] text-[#64748B]">(212) 555-0192</p></div>
            </div>
            <button className="w-full py-2 text-[10px] font-black rounded-xl" style={{ background: '#25D36615', color: '#25D366' }}>Send WhatsApp</button>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] text-center">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">NFC KEY TAG</p>
            <div className="inline-block rounded-2xl p-3 shadow-xl" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
              <BingooStamp size={28} color={ORANGE} showText={false} variant="outline" />
              <p className="text-white font-bold text-[7px] mt-1">BING∞ CONNECT</p>
            </div>
            <p className="text-[8px] text-[#64748B] mt-2">Tap key tag to contact owner</p>
            <div className="flex items-center justify-center gap-1 mt-1"><InfinityMark size={14} color={ORANGE} strokeWidth={2} /><span className="text-[7px] font-bold" style={{ color: ORANGE }}>BINGOO CONNECT</span></div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Document Wallet ──
function DocumentProtection() {
  return (
    <PhoneFrame label="Document Wallet — QR Tag">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10"><Icon name="shield" size={16} color={ORANGE} /></div>
            <div><p className="text-white font-black text-sm">Document Wallet</p><p className="text-white/50 text-[8px]">Bingoo Connect · Connected Asset</p></div>
          </div>
        </div>
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl overflow-hidden border border-[#E5EAF2] mb-3">
            <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-4xl">📋</span></div>
            </div>
            <div className="px-4 pt-3 pb-3">
              <p className="font-black text-sm text-[#0F172A]">Important Documents Folder</p>
              <p className="text-[9px] text-[#64748B]">Tag ID: BG-DOC-0099</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">CONTENTS</p>
            {['Passport', 'Insurance Cards', 'Property Deed'].map((d) => (
              <div key={d} className="flex items-center gap-2 py-1"><div className="w-1.5 h-1.5 rounded-full" style={{ background: ORANGE }} /><span className="text-[9px] font-bold text-[#0F172A]">{d}</span></div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] text-center">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">QR TAG — IF FOUND, SCAN</p>
            <div className="inline-block p-2 rounded-xl" style={{ background: NAVY }}>
              <div className="w-16 h-16 grid grid-cols-5 gap-px p-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
            <p className="text-[8px] text-[#64748B] mt-2">Scan to contact owner — no data exposed</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mt-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="users" size={14} color={NAVY} /></div>
              <div><p className="text-[10px] font-bold text-[#0F172A]">Mamadou Diallo</p><p className="text-[8px] text-[#64748B]">(212) 555-0192</p></div>
            </div>
            <button className="w-full py-2 text-white text-[10px] font-black rounded-xl" style={{ background: ORANGE }}>Notify Owner</button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Asset Dashboard — All Connected Assets ──
function AssetDashboard() {
  return (
    <PhoneFrame label="Asset Dashboard — All Connected Assets">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center justify-between mb-3">
            <div><p className="text-white font-black text-sm">My Assets</p><p className="text-white/50 text-[8px]">4 connected items</p></div>
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center"><Icon name="plus" size={16} color="#FFFFFF" /></div>
          </div>
        </div>
        <div className="px-5 mt-4 space-y-2.5">
          {[
            { icon: '🐕', name: 'Buddy', sub: 'Pet · Golden Retriever', status: '#22C55E', statusLabel: 'SAFE' },
            { icon: '🧳', name: 'Travel Luggage', sub: 'Travel · Tag BG-TRAVEL-0042', status: '#22C55E', statusLabel: 'SAFE' },
            { icon: '🚲', name: 'Trek Marlin 7', sub: 'Bike · SN: TM7-2024-0892', status: '#22C55E', statusLabel: 'SAFE' },
            { icon: '🔑', name: 'Apartment Keys', sub: 'Keys · Apt 4B', status: ORANGE, statusLabel: 'REPORTED' },
          ].map((a) => (
            <div key={a.name} className="bg-white rounded-2xl p-3 border border-[#E5EAF2] flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${NAVY}08` }}><span className="text-xl">{a.icon}</span></div>
              <div className="flex-1"><p className="font-bold text-[11px] text-[#0F172A]">{a.name}</p><p className="text-[9px] text-[#64748B]">{a.sub}</p></div>
              <Badge color={a.status}>{a.statusLabel}</Badge>
            </div>
          ))}
          <div className="flex items-center justify-center gap-1 pt-2"><InfinityMark size={16} color={ORANGE} strokeWidth={2} /><span className="text-[8px] font-bold" style={{ color: ORANGE }}>BINGOO CONNECT</span></div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export default function ExpandedAssetProtection() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3" style={{ background: `${NAVY}08` }}>
          <Icon name="shield" size={14} color={NAVY} />
          <span className="text-xs font-black tracking-wider" style={{ color: NAVY }}>EXPANDED ASSET PROTECTION</span>
        </div>
        <p className="text-xs font-black text-[#0F172A] mb-1">Bikes, Keys, Documents & More</p>
        <p className="text-[10px] text-[#64748B] max-w-lg mx-auto">Beyond pets and luggage — Bingoo Connect devices protect anything valuable. Tap to identify, scan to return, no app needed.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <BikeProtection />
        <KeyFinderProtection />
        <DocumentProtection />
      </div>
      <div className="pt-4 flex justify-center">
        <AssetDashboard />
      </div>
    </div>
  );
}