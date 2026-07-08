import React from 'react';
import { InfinityMark, BingooAppIcon } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

function MiniProfile({ children, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[200px] h-[360px] bg-[#0F172A] rounded-[2rem] p-[6px] shadow-xl shadow-[#0b2149]/20">
        <div className="w-full h-full bg-white rounded-[1.7rem] overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#0F172A] rounded-b-xl z-20" />
          <div className="w-full h-full overflow-hidden">{children}</div>
        </div>
      </div>
      <span className="text-xs font-bold text-[#64748B]">{label}</span>
    </div>
  );
}

// ── Layout 9: Restaurant / Digital Menu ──
function RestaurantMenuLayout() {
  return (
    <MiniProfile label="Restaurant / Digital Menu">
      <div className="h-full bg-[#FFF8F0]">
        <div className="h-14 relative" style={{ background: `linear-gradient(135deg, #c2410c, #ea580c)` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black text-sm">Chez Teranga</span>
          </div>
        </div>
        <div className="px-4 pt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Badge color="#22C55E">OPEN NOW</Badge>
            <Badge color={NAVY}>DELIVERY</Badge>
          </div>
          <p className="text-[8px] font-bold text-[#64748B] mb-1.5 tracking-wider">POPULAR DISHES</p>
          {[
            { name: 'Thieboudienne', price: '$15', emoji: '🐟' },
            { name: 'Yassa Poulet', price: '$12', emoji: '🍗' },
            { name: 'Mafe Beef', price: '$14', emoji: '🥘' },
          ].map((d) => (
            <div key={d.name} className="flex items-center gap-2 py-1.5 bg-white rounded-lg px-2 mb-1.5 border border-[#FFF0E5]">
              <span className="text-lg">{d.emoji}</span>
              <div className="flex-1"><p className="text-[9px] font-black text-[#0F172A]">{d.name}</p><p className="text-[7px] text-[#64748B]">Senegalese specialty</p></div>
              <span className="text-[10px] font-black" style={{ color: '#c2410c' }}>{d.price}</span>
            </div>
          ))}
          <button className="w-full py-2 mt-1 text-white text-[9px] font-black rounded-xl" style={{ background: '#c2410c' }}>View Full Menu</button>
          <div className="flex justify-center mt-2 gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-[#E5EAF2]"><Icon name="phone" size={10} color="#22C55E" /><span className="text-[7px] font-bold">Call</span></div>
            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-[#E5EAF2]"><Icon name="globe" size={10} color={ORANGE} /><span className="text-[7px] font-bold">Order</span></div>
          </div>
        </div>
      </div>
    </MiniProfile>
  );
}

function Badge({ children, color }) {
  return <span className="px-1.5 py-0.5 text-[7px] font-black rounded-md tracking-wider" style={{ color, background: `${color}18` }}>{children}</span>;
}

// ── Layout 10: Real Estate Agent ──
function RealEstateLayout() {
  return (
    <MiniProfile label="Real Estate Agent">
      <div className="h-full bg-white">
        <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${NAVY}, #13284f)` }}>
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20" style={{ background: ORANGE, filter: 'blur(30px)' }} />
        </div>
        <div className="px-4 -mt-8 relative z-10">
          <div className="w-14 h-14 rounded-2xl border-3 border-white shadow-lg flex items-center justify-center mb-2" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
            <span className="font-black text-sm" style={{ color: ORANGE }}>SR</span>
          </div>
          <p className="font-black text-sm text-[#0F172A]">Sarah Reeves</p>
          <p className="text-[8px] text-[#64748B]">Realtor · NYC Luxury Homes</p>
          <div className="flex items-center gap-1 mt-1">
            <Icon name="star" size={10} color={ORANGE} />
            <span className="text-[8px] font-bold text-[#64748B]">4.9 · 127 sales</span>
          </div>
        </div>
        <div className="px-4 mt-3">
          <p className="text-[8px] font-bold text-[#64748B] mb-1.5 tracking-wider">FEATURED LISTINGS</p>
          {[
            { addr: '350 W 42nd St', price: '$2.4M', beds: '3BD · 2BA' },
            { addr: '15 Central Park W', price: '$8.9M', beds: '4BD · 3BA' },
          ].map((l) => (
            <div key={l.addr} className="bg-[#F7F9FC] rounded-xl p-2 mb-1.5 border border-[#E5EAF2]">
              <div className="flex items-center justify-between">
                <div><p className="text-[9px] font-black text-[#0F172A]">{l.addr}</p><p className="text-[7px] text-[#64748B]">{l.beds}</p></div>
                <span className="text-[10px] font-black" style={{ color: ORANGE }}>{l.price}</span>
              </div>
            </div>
          ))}
          <button className="w-full py-2 mt-1 text-white text-[9px] font-black rounded-xl" style={{ background: NAVY }}>Book a Viewing</button>
        </div>
      </div>
    </MiniProfile>
  );
}

// ── Layout 11: Medical / Health Professional ──
function MedicalProfessionalLayout() {
  return (
    <MiniProfile label="Medical / Health Pro">
      <div className="h-full bg-[#F0FDF4]">
        <div className="h-14" style={{ background: `linear-gradient(135deg, #0D9488, #0F766E)` }} />
        <div className="px-4 -mt-7 relative z-10">
          <div className="w-12 h-12 rounded-full border-3 border-white shadow-lg flex items-center justify-center mb-2" style={{ background: '#0D9488' }}>
            <span className="text-white font-black text-sm">DR</span>
          </div>
          <p className="font-black text-sm text-[#0F172A]">Dr. Patel</p>
          <p className="text-[8px] text-[#64748B]">Cardiologist · Manhattan Heart Clinic</p>
          <div className="mt-2 bg-white rounded-xl p-2 border border-[#E5EAF2]">
            <p className="text-[7px] font-bold text-[#64748B] mb-1">SPECIALTIES</p>
            <div className="flex flex-wrap gap-1">
              {['Cardiology', 'Preventive', 'ECG'].map((s) => (
                <span key={s} className="px-1.5 py-0.5 text-[7px] font-bold rounded-md" style={{ color: '#0D9488', background: '#0D948815' }}>{s}</span>
              ))}
            </div>
          </div>
          <div className="mt-2 bg-white rounded-xl p-2 border border-[#E5EAF2]">
            <p className="text-[7px] font-bold text-[#64748B] mb-1">OFFICE HOURS</p>
            <div className="text-[8px] font-bold text-[#0F172A]">Mon–Fri · 9am–5pm</div>
          </div>
          <div className="space-y-1.5 mt-2">
            <button className="w-full py-2 text-white text-[9px] font-black rounded-xl" style={{ background: '#0D9488' }}>Book Appointment</button>
            <div className="flex items-center justify-center py-1.5 rounded-xl text-[8px] font-bold text-white bg-[#0D948815]" style={{ color: '#0D9488' }}><Icon name="phone" size={10} color="#0D9488" /> Call Clinic</div>
          </div>
        </div>
      </div>
    </MiniProfile>
  );
}

// ── Layout 12: Musician / Artist ──
function MusicianArtistLayout() {
  return (
    <MiniProfile label="Musician / Artist">
      <div className="h-full bg-[#0F172A]">
        <div className="h-24 relative" style={{ background: `linear-gradient(135deg, #7c3aed, #ec4899)` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-0 h-0 border-l-[8px] border-l-white border-y-[5px] border-y-transparent ml-1" />
            </div>
          </div>
        </div>
        <div className="px-4 -mt-5 relative z-10">
          <div className="w-12 h-12 rounded-2xl border-2 border-[#0F172A] flex items-center justify-center mb-2" style={{ background: '#7c3aed' }}>
            <span className="text-white font-black text-xs">MK</span>
          </div>
          <p className="text-white font-black text-sm">Maya Kora</p>
          <p className="text-white/50 text-[8px]">Afrobeat Artist · 2M Streams</p>
          <div className="flex justify-center gap-1.5 mt-2 mb-2">
            {['🎵', '▶️', '📷', '📘'].map((e, i) => (
              <div key={i} className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center text-[10px]">{e}</div>
            ))}
          </div>
          <p className="text-[7px] font-bold text-white/40 mb-1.5 tracking-wider">TOUR DATES</p>
          {[
            { date: 'JUL 15', city: 'Dakar, SN' },
            { date: 'JUL 22', city: 'Paris, FR' },
            { date: 'AUG 03', city: 'NYC, USA' },
          ].map((t) => (
            <div key={t.date} className="flex items-center gap-2 py-1">
              <span className="text-[8px] font-black w-10" style={{ color: '#ec4899' }}>{t.date}</span>
              <span className="text-[8px] font-bold text-white/80">{t.city}</span>
              <Icon name="chevronRight" size={10} color="rgba(255,255,255,0.2)" className="ml-auto" />
            </div>
          ))}
          <button className="w-full py-2 mt-2 text-[9px] font-black rounded-xl text-white" style={{ background: '#7c3aed' }}>Book May</button>
        </div>
      </div>
    </MiniProfile>
  );
}

// ── Layout 13: Nonprofit / Community Leader ──
function NonprofitLayout() {
  return (
    <MiniProfile label="Nonprofit / Community">
      <div className="h-full bg-[#FFFBF0]">
        <div className="h-16" style={{ background: `linear-gradient(135deg, #15803d, #22C55E)` }}>
          <div className="flex items-center justify-center h-full">
            <span className="text-white font-black text-xs">Teranga Hope Foundation</span>
          </div>
        </div>
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#22C55E15' }}>
              <span className="text-lg">🌍</span>
            </div>
            <div>
              <p className="text-[8px] font-bold text-[#64748B]">NONPROFIT</p>
              <p className="text-[8px] text-[#15803d] font-bold">Education · Clean Water · Health</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-2 border border-[#E5EAF2] mb-2">
            <p className="text-[7px] font-bold text-[#64748B] mb-1">IMPACT</p>
            <div className="grid grid-cols-3 gap-1 text-center">
              <div><p className="text-[12px] font-black" style={{ color: '#15803d' }}>5K</p><p className="text-[6px] text-[#64748B]">Kids</p></div>
              <div><p className="text-[12px] font-black" style={{ color: '#15803d' }}>12</p><p className="text-[6px] text-[#64748B]">Wells</p></div>
              <div><p className="text-[12px] font-black" style={{ color: '#15803d' }}>3</p><p className="text-[6px] text-[#64748B]">Clinics</p></div>
            </div>
          </div>
          <button className="w-full py-2 text-white text-[9px] font-black rounded-xl" style={{ background: '#15803d' }}>Donate Now</button>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Icon name="globe" size={10} color="#15803d" />
            <span className="text-[8px] font-bold text-[#15803d]">terangahope.org</span>
          </div>
        </div>
      </div>
    </MiniProfile>
  );
}

// ── Layout 14: Fitness Trainer ──
function FitnessTrainerLayout() {
  return (
    <MiniProfile label="Fitness Trainer">
      <div className="h-full bg-[#FFF5F5]">
        <div className="h-20 relative" style={{ background: `linear-gradient(135deg, #dc2626, #f97316)` }}>
          <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-20" style={{ background: '#FFFFFF', filter: 'blur(20px)' }} />
        </div>
        <div className="px-4 -mt-6 relative z-10">
          <div className="w-12 h-12 rounded-full border-3 border-white shadow-lg flex items-center justify-center mb-2" style={{ background: '#dc2626' }}>
            <span className="text-white font-black text-xs">JT</span>
          </div>
          <p className="font-black text-sm text-[#0F172A]">Jake Torres</p>
          <p className="text-[8px] text-[#64748B]">Personal Trainer · CrossFit L3</p>
          <div className="flex items-center gap-1 mt-1">
            <Icon name="star" size={10} color="#f97316" />
            <span className="text-[8px] font-bold text-[#64748B]">5.0 · 340 sessions</span>
          </div>
          <div className="mt-2 bg-white rounded-xl p-2 border border-[#E5EAF2]">
            <p className="text-[7px] font-bold text-[#64748B] mb-1">PROGRAMS</p>
            {['Strength & Conditioning', 'Weight Loss', 'CrossFit Prep'].map((p) => (
              <div key={p} className="flex items-center gap-1.5 py-1">
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: '#dc262615' }}><Icon name="check" size={8} color="#dc2626" /></div>
                <span className="text-[8px] font-bold text-[#0F172A]">{p}</span>
              </div>
            ))}
          </div>
          <button className="w-full py-2 mt-2 text-white text-[9px] font-black rounded-xl" style={{ background: '#dc2626' }}>Book Session — $60</button>
        </div>
      </div>
    </MiniProfile>
  );
}

export default function ExpandedProfileLayouts() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xs font-black text-[#0F172A] mb-1">Expanded Layout Gallery — Industry-Specific</p>
        <p className="text-[10px] text-[#64748B]">6 more unique layouts — each designed for a specific professional context, not just color variants</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <RestaurantMenuLayout />
        <RealEstateLayout />
        <MedicalProfessionalLayout />
        <MusicianArtistLayout />
        <NonprofitLayout />
        <FitnessTrainerLayout />
      </div>
      <div className="flex items-center justify-center gap-2 pt-4">
        <InfinityMark size={20} color={ORANGE} strokeWidth={2.5} glow={true} />
        <span className="text-[10px] font-bold text-[#64748B]">BINGOO CONNECT — One identity, endless contexts</span>
      </div>
    </div>
  );
}