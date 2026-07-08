import React from 'react';
import { PhoneFrame, DesktopFrame, Badge } from '@/components/mockups/MockupFrame';
import { BingooLogo, BingooAppIcon, InfinityMark, BingooStamp } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', MUTED = '#64748B';
const PET_TAG_URL = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/ccdd42577_generated_image.png';
const SUITCASE_TAG_URL = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/25a30b139_generated_image.png';

// ── Pet Protection Profile ──
function PetProtection() {
  return (
    <PhoneFrame label="Pet Protection — NFC Collar Tag">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10"><Icon name="star" size={16} color={ORANGE} /></div>
            <div><p className="text-white font-black text-sm">Pet Protection</p><p className="text-white/50 text-[8px]">Bingoo Connect · Connected Asset</p></div>
          </div>
        </div>
        <div className="px-5 mt-4">
          {/* Pet Profile Card */}
          <div className="bg-white rounded-2xl overflow-hidden border border-[#E5EAF2] mb-3">
            <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
              <img src={PET_TAG_URL} alt="Pet NFC Collar" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-30" style={{ background: ORANGE, filter: 'blur(25px)' }} />
            </div>
            <div className="px-4 pt-3 pb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-lg flex items-center justify-center" style={{ background: `${ORANGE}15` }}>
                  <span className="text-xl">🐕</span>
                </div>
                <div>
                  <p className="font-black text-sm text-[#0F172A]">Buddy</p>
                  <p className="text-[9px] text-[#64748B]">Golden Retriever · 3 yrs · Male</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge color="#22C55E">VACCINATED</Badge>
                <Badge color={NAVY}>MICROCHIPPED</Badge>
              </div>
            </div>
          </div>
          {/* Owner Contact */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">OWNER — IF FOUND, CONTACT</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="users" size={14} color={NAVY} /></div>
              <div><p className="text-[10px] font-bold text-[#0F172A]">Mamadou Diallo</p><p className="text-[8px] text-[#64748B]">(212) 555-0192</p></div>
            </div>
            <button className="w-full py-2 text-white text-[10px] font-black rounded-xl flex items-center justify-center gap-1.5" style={{ background: '#22C55E' }}><Icon name="phone" size={12} color="#FFFFFF" /> Call Owner</button>
            <button className="w-full py-2 mt-1.5 text-[10px] font-black rounded-xl flex items-center justify-center gap-1.5" style={{ background: '#25D36615', color: '#25D366' }}><Icon name="message" size={12} color="#25D366" /> Send WhatsApp</button>
          </div>
          {/* NFC Collar Tag */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] text-center">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">NFC COLLAR TAG</p>
            <div className="inline-block rounded-2xl p-3 shadow-xl" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
              <BingooStamp size={28} color={ORANGE} showText={false} variant="outline" />
              <p className="text-white font-bold text-[7px] mt-1">BING∞ CONNECT</p>
            </div>
            <p className="text-[8px] text-[#64748B] mt-2">Tap this tag with any phone to view Buddy's profile</p>
            <div className="flex items-center justify-center gap-1 mt-1"><InfinityMark size={14} color={ORANGE} strokeWidth={2} /><span className="text-[7px] font-bold" style={{ color: ORANGE }}>BINGOO CONNECT</span></div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Travel Protection ──
function TravelProtection() {
  return (
    <PhoneFrame label="Travel Protection — QR Luggage Tag">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10"><Icon name="globe" size={16} color={ORANGE} /></div>
            <div><p className="text-white font-black text-sm">Travel Protection</p><p className="text-white/50 text-[8px]">Bingoo Connect · Connected Asset</p></div>
          </div>
        </div>
        <div className="px-5 mt-4">
          {/* Suitcase Card */}
          <div className="bg-white rounded-2xl overflow-hidden border border-[#E5EAF2] mb-3">
            <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
              <img src={SUITCASE_TAG_URL} alt="Suitcase QR Tag" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="p-3">
              <p className="font-black text-sm text-[#0F172A]">Travel Luggage Tag</p>
              <p className="text-[9px] text-[#64748B]">Tag ID: BG-TRAVEL-0042</p>
            </div>
          </div>
          {/* Travel Info */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">TRAVEL INFO</p>
            {[
              { icon: 'globe', label: 'Destination', value: 'Dakar, Senegal' },
              { icon: 'calendar', label: 'Flight', value: 'DL 587 · Jul 10' },
              { icon: 'building', label: 'Hotel', value: 'Teranga Hotel' },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2 py-1.5 border-b border-[#E5EAF2] last:border-0">
                <Icon name={t.icon} size={12} color={MUTED} />
                <span className="text-[9px] font-bold text-[#64748B] w-16">{t.label}</span>
                <span className="text-[9px] font-bold text-[#0F172A] ml-auto">{t.value}</span>
              </div>
            ))}
          </div>
          {/* QR Tag */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] text-center mb-3">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">QR TAG — IF FOUND, SCAN</p>
            <div className="inline-block p-2 rounded-xl" style={{ background: NAVY }}>
              <div className="w-16 h-16 grid grid-cols-5 gap-px p-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`} />
                ))}
              </div>
            </div>
            <p className="text-[8px] text-[#64748B] mt-2">Scan QR or tap NFC to contact owner</p>
          </div>
          {/* Owner */}
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2]">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">OWNER — IF FOUND, CONTACT</p>
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

// ── Finder Flow (4 steps) ──
function FinderFlow() {
  return (
    <DesktopFrame label="Finder Flow — Scan, View, Message, Notify" height="h-[480px]">
      <div className="p-6 bg-[#F7F9FC] h-full">
        <div className="grid grid-cols-4 gap-4 h-full">
          {/* Step 1: Scan */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white" style={{ background: ORANGE }}>1</div>
              <p className="text-[10px] font-black text-[#0F172A]">Tap / Scan</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
                  <div className="absolute top-0 right-0 w-12 h-12 rounded-full opacity-30" style={{ background: ORANGE, filter: 'blur(20px)' }} />
                  <Icon name="nfc" size={28} color={ORANGE} />
                </div>
                <p className="text-[9px] font-bold text-[#0F172A] mt-3">Finder taps NFC tag</p>
                <p className="text-[8px] text-[#64748B]">No app needed — opens in browser</p>
              </div>
            </div>
            <div className="flex items-center justify-center"><InfinityMark size={16} color="#E5EAF2" strokeWidth={2} /></div>
          </div>
          {/* Step 2: View */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white" style={{ background: '#3b82f6' }}>2</div>
              <p className="text-[10px] font-black text-[#0F172A]">View Profile</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border-2 border-[#E5EAF2]" style={{ background: `${ORANGE}15` }}>
                  <span className="text-lg">🐕</span>
                </div>
                <p className="text-[10px] font-black text-[#0F172A] mt-2">Buddy</p>
                <p className="text-[8px] text-[#64748B]">Safe recovery profile</p>
                <p className="text-[7px] text-[#22C55E] mt-1">No sensitive data exposed</p>
              </div>
            </div>
            <div className="flex items-center justify-center"><InfinityMark size={16} color="#E5EAF2" strokeWidth={2} /></div>
          </div>
          {/* Step 3: Message */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white" style={{ background: '#22C55E' }}>3</div>
              <p className="text-[10px] font-black text-[#0F172A]">Send Message</p>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              <div className="px-2 py-1.5 bg-[#F7F9FC] rounded-lg text-[8px] font-medium text-[#cbd5e1]">Your name</div>
              <div className="px-2 py-1.5 bg-[#F7F9FC] rounded-lg text-[8px] font-medium text-[#cbd5e1]">Your phone</div>
              <div className="px-2 py-2 bg-[#F7F9FC] rounded-lg text-[8px] text-[#cbd5e1] h-12">I found Buddy near Central Park...</div>
              <button className="py-1.5 text-white text-[9px] font-black rounded-lg" style={{ background: '#22C55E' }}>Send Recovery Message</button>
            </div>
            <div className="flex items-center justify-center"><InfinityMark size={16} color="#E5EAF2" strokeWidth={2} /></div>
          </div>
          {/* Step 4: Notify */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white" style={{ background: NAVY }}>4</div>
              <p className="text-[10px] font-black text-[#0F172A]">Owner Notified</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: '#22C55E15' }}><Icon name="bell" size={24} color="#22C55E" /></div>
                <p className="text-[9px] font-black text-[#0F172A] mt-3">Owner received push notification</p>
                <p className="text-[8px] text-[#64748B]">+ SMS + Email alert</p>
                <Badge color="#22C55E">RECOVERY INITIATED</Badge>
              </div>
            </div>
            <div className="flex items-center justify-center"><InfinityMark size={16} color={ORANGE} strokeWidth={2} /></div>
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}

export default function AssetProtectionShowcase() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3" style={{ background: `${NAVY}08` }}>
          <Icon name="shield" size={14} color={NAVY} />
          <span className="text-xs font-black tracking-wider" style={{ color: NAVY }}>CONNECTED ASSET PROTECTION</span>
        </div>
        <p className="text-xs font-black text-[#0F172A] mb-1">Asset Protection — Pets, Travel & Beyond</p>
        <p className="text-[10px] text-[#64748B] max-w-lg mx-auto">Bingoo Connect devices aren't just for business cards. Attach them to pets, luggage, and valuables. If lost, anyone who finds them can tap to contact the owner — no app needed.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <PetProtection />
        <TravelProtection />
      </div>
      <div className="pt-4">
        <FinderFlow />
      </div>
    </div>
  );
}