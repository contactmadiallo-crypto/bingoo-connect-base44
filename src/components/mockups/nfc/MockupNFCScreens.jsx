import React from 'react';
import { PhoneFrame, MobileBottomNav, Badge } from '@/components/mockups/MockupFrame';
import { Icon } from '@/components/mockups/BingooIcons';
import { NFCCardVisual } from '@/components/mockups/MockupFrame';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

// ── Screen 20: Activate NFC Device ──
export function MockupActivateNFC() {
  return (
    <PhoneFrame label="20 · Activate NFC Device">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10">
              <Icon name="chevronRight" size={18} color="#FFFFFF" className="rotate-180" />
            </div>
            <p className="text-white font-black text-sm">Activate Device</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-3xl mx-auto mb-3 flex items-center justify-center shadow-2xl" style={{ background: `linear-gradient(135deg, ${ORANGE}, #fb923c)` }}>
              <Icon name="nfc" size={30} color="#FFFFFF" />
            </div>
            <p className="text-white font-black text-base">Tap to Activate</p>
            <p className="text-white/50 text-[10px] mt-1">Enter the code printed on your NFC device</p>
          </div>
        </div>
        <div className="px-5 mt-4">
          {/* Code Input */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] mb-4">
            <p className="text-[10px] font-bold text-[#64748B] mb-3 text-center">DEVICE CODE</p>
            <div className="flex gap-2 justify-center mb-3">
              {['B', 'G', '-', '0', '0', '0', '0', '0', '1'].map((c, i) => (
                <div key={i} className={`w-8 h-10 rounded-lg flex items-center justify-center font-black text-sm ${i === 8 ? 'bg-[#FFF0E5] text-[#f97316] border-2 border-[#f97316]' : 'bg-[#F7F9FC] text-[#0F172A] border border-[#E5EAF2]'}`}>{c}</div>
              ))}
            </div>
            <p className="text-[9px] text-[#64748B] text-center">Found on the back of your NFC card</p>
          </div>
          {/* Visual Guide */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
            <p className="text-[10px] font-bold text-[#64748B] mb-3 flex items-center gap-1"><Icon name="eye" size={11} color={MUTED} /> WHERE TO FIND YOUR CODE</p>
            <div className="flex justify-center">
              <div className="relative">
                <NFCCardVisual name="" width={180} />
                <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-lg text-[8px] font-black text-white" style={{ background: ORANGE }}>BG-000001</div>
              </div>
            </div>
          </div>
          {/* Success State */}
          <div className="bg-[#E8F9EE] rounded-2xl p-4 border border-[#22C55E]/20 mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#22C55E' }}>
              <Icon name="check" size={20} color="#FFFFFF" />
            </div>
            <div>
              <p className="text-xs font-black text-[#0F172A]">Code Verified!</p>
              <p className="text-[10px] text-[#22C55E]">NFC Business Card ready to assign</p>
            </div>
          </div>
          <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
            Assign to Profile <Icon name="arrowRight" size={16} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 21: Assign Device to Profile ──
export function MockupAssignDevice() {
  const profiles = [
    { name: 'Diallo Law Firm', type: 'Law Firm', initial: 'DL', color: NAVY, selected: true },
    { name: 'Mamadou Diallo', type: 'Personal', initial: 'MD', color: ORANGE, selected: false },
    { name: 'Diallo Salon', type: 'Salon', initial: 'DS', color: '#ec4899', selected: false },
  ];
  return (
    <PhoneFrame label="21 · Assign Device to Profile">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10">
              <Icon name="chevronRight" size={18} color="#FFFFFF" className="rotate-180" />
            </div>
            <p className="text-white font-black text-sm">Assign Device</p>
          </div>
          {/* Device Info */}
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
              <Icon name="nfc" size={22} color={ORANGE} />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm text-[#0F172A]">NFC Business Card</p>
              <p className="text-[10px] text-[#64748B]">BG-000001 · Activated</p>
            </div>
            <Badge color="#22C55E">READY</Badge>
          </div>
        </div>
        <div className="px-5 mt-4">
          <p className="text-xs font-black text-[#0F172A] mb-3">Select a Profile to Link</p>
          <div className="space-y-2.5 mb-4">
            {profiles.map((p) => (
              <div key={p.name} className={`bg-white rounded-2xl p-3 border-2 ${p.selected ? 'border-[#f97316] bg-[#FFF0E5]' : 'border-[#E5EAF2]'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)` }}>
                    <span className="text-white font-black text-xs">{p.initial}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#0F172A]">{p.name}</p>
                    <p className="text-[10px] text-[#64748B]">{p.type} · bingooconnect.com/{p.initial.toLowerCase()}</p>
                  </div>
                  {p.selected ? (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: ORANGE }}>
                      <Icon name="check" size={14} color="#FFFFFF" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-[#E5EAF2]" />
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* Preview */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
            <p className="text-[10px] font-bold text-[#64748B] mb-2 flex items-center gap-1"><Icon name="eye" size={11} color={MUTED} /> WHEN TAPPED, VISITORS WILL SEE</p>
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[#F7F9FC] rounded-xl">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: NAVY }}>
                <span className="font-black text-xs" style={{ color: ORANGE }}>DL</span>
              </div>
              <div>
                <p className="font-black text-xs text-[#0F172A]">Diallo Law Firm</p>
                <p className="text-[9px] text-[#64748B]">bingooconnect.com/diallo-law</p>
              </div>
            </div>
          </div>
          <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: ORANGE }}>
            <Icon name="check" size={16} color="#FFFFFF" /> Confirm Assignment
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 24: Lost Mode Setup ──
export function MockupLostModeSetup() {
  return (
    <PhoneFrame label="24 · Lost Mode Setup">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-6" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10">
              <Icon name="chevronRight" size={18} color="#FFFFFF" className="rotate-180" />
            </div>
            <p className="text-white font-black text-sm">Lost Mode Setup</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 backdrop-blur-sm border border-white/10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EF4444' }}>
              <Icon name="alert" size={18} color="#FFFFFF" />
            </div>
            <div className="flex-1">
              <p className="text-white font-black text-xs">NFC Bracelet — BG-000007</p>
              <p className="text-white/50 text-[10px]">Marked as lost · Enable recovery mode</p>
            </div>
          </div>
        </div>
        <div className="px-5 mt-4">
          {/* Toggle */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-[#0F172A]">Enable Lost Mode</p>
                <p className="text-[10px] text-[#64748B]">Show finder your contact info</p>
              </div>
              <div className="w-12 h-6 rounded-full p-0.5" style={{ background: ORANGE }}>
                <div className="w-5 h-5 rounded-full bg-white ml-auto" />
              </div>
            </div>
          </div>
          {/* Settings */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
            <p className="text-[10px] font-bold text-[#64748B] mb-3">FINDER VISION SETTINGS</p>
            {[
              { label: 'Show phone number', on: true },
              { label: 'Show email address', on: true },
              { label: 'Show WhatsApp', on: false },
              { label: 'Show profile photo', on: true },
              { label: 'Allow finder to report location', on: true },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#E5EAF2] last:border-0">
                <span className="text-[11px] font-bold text-[#0F172A]">{s.label}</span>
                <div className="w-9 h-5 rounded-full p-0.5" style={{ background: s.on ? ORANGE : '#E5EAF2' }}>
                  <div className={`w-4 h-4 rounded-full bg-white ${s.on ? 'ml-auto' : ''}`} />
                </div>
              </div>
            ))}
          </div>
          {/* Finder Message */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
            <p className="text-[10px] font-bold text-[#64748B] mb-2">MESSAGE FOR FINDER</p>
            <div className="px-3 py-2.5 bg-[#F7F9FC] rounded-xl">
              <span className="text-[10px] text-[#0F172A]">Thank you for finding my device! Please contact me so I can arrange recovery. Your help is greatly appreciated.</span>
            </div>
          </div>
          {/* Preview */}
          <div className="bg-[#FEF2F2] rounded-2xl p-4 border border-[#EF4444]/20 mb-4">
            <p className="text-[10px] font-bold text-[#EF4444] mb-2 flex items-center gap-1"><Icon name="eye" size={11} color="#EF4444" /> FINDER WILL SEE</p>
            <div className="bg-white rounded-xl p-3">
              <p className="text-[10px] font-black text-[#0F172A]">This device belongs to:</p>
              <p className="text-xs font-black" style={{ color: NAVY }}>Diallo Law Firm</p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-0.5 bg-[#F7F9FC] rounded text-[9px] font-bold text-[#0F172A]">📞 (212) 555-0192</span>
                <span className="px-2 py-0.5 bg-[#F7F9FC] rounded text-[9px] font-bold text-[#0F172A]">✉️ contact@diallolaw.com</span>
              </div>
            </div>
          </div>
          <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2" style={{ background: '#EF4444' }}>
            <Icon name="shield" size={16} color="#FFFFFF" /> Activate Lost Mode
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 25: Lost Mode Finder Flow ──
export function MockupLostModeFinder() {
  return (
    <PhoneFrame label="25 · Lost Mode Finder Flow">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-12 pb-6 text-center" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="w-14 h-14 rounded-3xl mx-auto mb-3 flex items-center justify-center shadow-2xl" style={{ background: '#EF4444' }}>
            <Icon name="alert" size={26} color="#FFFFFF" />
          </div>
          <p className="text-white font-black text-base">Found This Device?</p>
          <p className="text-white/50 text-[10px] mt-1">Help reunite it with its owner</p>
        </div>
        <div className="px-5 mt-4">
          {/* Owner Info Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
                <span className="font-black text-sm" style={{ color: ORANGE }}>DL</span>
              </div>
              <div>
                <p className="text-[10px] text-[#64748B] font-medium">This device belongs to</p>
                <p className="font-black text-sm text-[#0F172A]">Diallo Law Firm</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-[#E5EAF2]">
              <div className="flex items-center gap-2">
                <Icon name="phone" size={14} color="#22C55E" />
                <span className="text-[11px] font-bold text-[#0F172A]">(212) 555-0192</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="mail" size={14} color="#3b82f6" />
                <span className="text-[11px] font-bold text-[#0F172A]">contact@diallolaw.com</span>
              </div>
            </div>
          </div>
          {/* Owner Message */}
          <div className="bg-[#FFF0E5] rounded-2xl p-3 border border-[#f97316]/20 mb-4">
            <p className="text-[10px] font-bold text-[#f97316] mb-1">OWNER'S MESSAGE</p>
            <p className="text-[10px] text-[#0F172A]">Thank you for finding my device! Please contact me so I can arrange recovery. Your help is greatly appreciated.</p>
          </div>
          {/* Finder Form */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-4">
            <p className="text-[10px] font-bold text-[#64748B] mb-3">NOTIFY THE OWNER</p>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-bold text-[#64748B] mb-1">Your Name</p>
                <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[11px] font-medium text-[#0F172A]">Sarah Johnson</div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#64748B] mb-1">Your Phone</p>
                <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[11px] font-medium text-[#0F172A]">(646) 555-0123</div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#64748B] mb-1">Message</p>
                <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] text-[#0F172A]">Found this bracelet at Central Park near the fountain. I can meet you there tomorrow at 2pm.</div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#64748B] mb-1">Location Found</p>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#F7F9FC] rounded-lg">
                  <Icon name="mapPin" size={14} color={ORANGE} />
                  <span className="text-[10px] font-bold text-[#0F172A]">Central Park, NYC</span>
                </div>
              </div>
            </div>
          </div>
          <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg flex items-center justify-center gap-2 mb-3" style={{ background: ORANGE }}>
            <Icon name="message" size={16} color="#FFFFFF" /> Notify Owner
          </button>
          <p className="text-center text-[9px] text-[#64748B]">Your contact info will be shared with the device owner</p>
        </div>
      </div>
    </PhoneFrame>
  );
}