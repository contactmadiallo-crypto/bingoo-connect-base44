import React from 'react';
import { DesktopFrame } from './MockupFrame';
import { Icon, IconBadge } from './BingooIcons';
import { NFCCardVisual, NFCKeychainVisual, NFCStickerVisual, NFCBraceletVisual, NFCStandVisual, NFCBadgeVisual } from './MockupFrame';

const NAVY = '#0b2149';
const NAVY_DEEP = '#071A3D';
const NAVY_LIGHT = '#13284f';
const ORANGE = '#f97316';
const BG = '#F7F9FC';
const BORDER = '#E5EAF2';
const INK = '#0F172A';
const MUTED = '#64748B';

function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="absolute top-0 right-0 w-6 h-6 rounded-full opacity-25" style={{ background: ORANGE, filter: 'blur(12px)' }} />
        <svg width="20" height="10" viewBox="0 0 48 24" fill="none" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="relative z-10" style={{ filter: `drop-shadow(0 0 4px ${ORANGE}66)` }}>
          <path d="M 14 12 C 14 6 20 6 24 12 C 28 18 34 18 34 12 C 34 6 28 6 24 12 C 20 18 14 18 14 12 Z" />
        </svg>
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className={`font-black text-base tracking-tight ${light ? 'text-white' : 'text-[#0b2149]'}`}>Bing</span>
        <svg width="14" height="7" viewBox="0 0 48 24" fill="none" stroke={light ? '#FFFFFF' : ORANGE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 2 }}>
          <path d="M 14 12 C 14 6 20 6 24 12 C 28 18 34 18 34 12 C 34 6 28 6 24 12 C 20 18 14 18 14 12 Z" />
        </svg>
        <span className={`text-[10px] font-bold ml-1.5 ${light ? 'text-white/50' : 'text-[#f97316]'}`}>CONNECT</span>
      </div>
    </div>
  );
}

export default function MockupLanding() {
  return (
    <DesktopFrame label="1 · Landing Page — Full Business Model">
      {/* ── NAV ── */}
      <div className="flex items-center justify-between px-8 py-4 bg-white/95 backdrop-blur-md border-b border-[#E5EAF2] sticky top-0 z-50">
        <Logo />
        <div className="flex items-center gap-6">
          {['Features', 'Products', 'Use Cases', 'Pricing', 'Shop'].map((n) => (
            <span key={n} className="text-xs font-semibold text-[#64748B] hover:text-[#0b2149] cursor-pointer">{n}</span>
          ))}
          <button className="px-5 py-2 text-xs font-bold text-white rounded-lg shadow-md transition-transform hover:scale-105" style={{ background: ORANGE }}>Get Started Free</button>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden px-8 py-16 text-center" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20" style={{ background: ORANGE, filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full opacity-10" style={{ background: '#3b82f6', filter: 'blur(120px)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white text-[10px] font-bold rounded-full mb-6 tracking-widest backdrop-blur-sm border border-white/10">
            <Icon name="sparkles" size={12} color={ORANGE} /> THE OPERATING SYSTEM FOR PROFESSIONAL IDENTITY
          </span>
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            One Tap.<br />Your Entire Business World.
          </h1>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Bingoo Connect unifies NFC sharing, digital profiles, CRM, appointments, analytics, wallet passes, and custom business tools into one premium platform.
          </p>
          <div className="flex justify-center gap-3 mb-10">
            <button className="px-7 py-3 text-white text-sm font-bold rounded-xl shadow-xl transition-transform hover:scale-105 flex items-center gap-2" style={{ background: ORANGE }}>
              Start Free <Icon name="arrowRight" size={16} color="#FFFFFF" />
            </button>
            <button className="px-7 py-3 bg-white/10 text-white text-sm font-bold rounded-xl border border-white/20 backdrop-blur-sm">View Plans</button>
          </div>
          {/* Floating product visual */}
          <div className="flex justify-center gap-4 items-end">
            <div className="transform rotate-[-6deg] hover:rotate-0 transition-transform duration-500">
              <NFCCardVisual name="Mamadou Diallo" role="Immigration Attorney" width={220} />
            </div>
            <div className="transform rotate-[4deg] hover:rotate-0 transition-transform duration-500 mb-2">
              <NFCKeychainVisual width={80} />
            </div>
          </div>
        </div>
      </div>

      {/* ── TRUST BAR ── */}
      <div className="px-8 py-6 bg-white border-b border-[#E5EAF2]">
        <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: '10K+', label: 'Professionals' },
            { value: '500K+', label: 'Profile Views' },
            { value: '50K+', label: 'NFC Devices' },
            { value: '4.9★', label: 'User Rating' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black" style={{ color: NAVY }}>{s.value}</p>
              <p className="text-[10px] text-[#64748B] font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PILLARS: Connect / Share / Grow / Succeed ── */}
      <div className="px-8 py-14" style={{ background: BG }}>
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold text-[#f97316] tracking-widest">THE BINGOO WAY</span>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">Connect. Share. Grow. Succeed.</h2>
        </div>
        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { icon: 'nfc', title: 'Connect', desc: 'One tap of your Bingoo NFC device instantly shares your digital identity, contact info, and business profile.', color: ORANGE },
            { icon: 'share', title: 'Share', desc: 'QR codes, direct links, Google & Apple Wallet passes — share your profile across every channel.', color: '#3b82f6' },
            { icon: 'trend', title: 'Grow', desc: 'Capture leads, book appointments, track analytics, and turn every interaction into opportunity.', color: '#22C55E' },
            { icon: 'shield', title: 'Succeed', desc: 'Lost Mode protection, team tools, CRM pipeline, and admin manufacturing — everything to scale.', color: NAVY },
          ].map((p) => (
            <div key={p.title} className="bg-white rounded-2xl p-5 border border-[#E5EAF2] hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-md" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}dd)` }}>
                <Icon name={p.icon} size={22} color="#FFFFFF" />
              </div>
              <p className="font-black text-sm text-[#0F172A] mb-2">{p.title}</p>
              <p className="text-[10px] text-[#64748B] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURE GRID ── */}
      <div className="px-8 py-14 bg-white border-y border-[#E5EAF2]">
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold text-[#f97316] tracking-widest">EVERYTHING IN ONE PLATFORM</span>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">12 Tools. One Identity.</h2>
          <p className="text-xs text-[#64748B] mt-2">Stop paying for 5 different apps. Bingoo replaces them all.</p>
        </div>
        <div className="grid grid-cols-4 gap-3 max-w-4xl mx-auto">
          {[
            { icon: 'users', title: 'Digital Identity', desc: 'Premium profiles with layouts, themes, media' },
            { icon: 'nfc', title: 'NFC Sharing', desc: 'Cards, keychains, bracelets, stands, badges' },
            { icon: 'qr', title: 'QR & Links', desc: 'Custom QR with watermark, smart links' },
            { icon: 'wallet', title: 'Wallet Passes', desc: 'Google & Apple Wallet integration' },
            { icon: 'message', title: 'Leads CRM', desc: 'Pipeline, status tracking, CSV export' },
            { icon: 'calendar', title: 'Appointments', desc: 'Online booking, reminders, calendar sync' },
            { icon: 'chart', title: 'Analytics', desc: 'Views, taps, scans, sources, conversions' },
            { icon: 'star', title: 'Reviews', desc: 'Google Reviews, feedback collection' },
            { icon: 'shield', title: 'Lost Mode', desc: 'Finder reports, safe recovery flow' },
            { icon: 'shop', title: 'Shop', desc: 'Premium NFC products with bundles' },
            { icon: 'palette', title: 'Design Studio', desc: 'Custom branded NFC for businesses' },
            { icon: 'building', title: 'Team Tools', desc: 'Multi-profile, attorneys, stylists, staff' },
          ].map((f) => (
            <div key={f.title} className="bg-[#F7F9FC] rounded-xl p-4 border border-[#E5EAF2] hover:border-[#f97316] transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: NAVY }}>
                <Icon name={f.icon} size={18} color={ORANGE} />
              </div>
              <p className="font-bold text-xs text-[#0F172A] mb-1">{f.title}</p>
              <p className="text-[9px] text-[#64748B] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRODUCT SHOWCASE ── */}
      <div className="px-8 py-14" style={{ background: `linear-gradient(180deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold text-[#f97316] tracking-widest">PREMIUM NFC PRODUCTS</span>
          <h2 className="text-2xl font-black text-white mt-1">Tap to Connect</h2>
          <p className="text-xs text-white/50 mt-2">Designer-grade NFC devices, manufactured in-house</p>
        </div>
        <div className="flex justify-center items-end gap-6 flex-wrap max-w-3xl mx-auto">
          {[
            { vis: <NFCCardVisual name="Business Card" width={160} />, label: 'NFC Card', price: '$19.99' },
            { vis: <NFCKeychainVisual width={70} />, label: 'Keychain', price: '$11.99' },
            { vis: <NFCBraceletVisual width={100} />, label: 'Bracelet', price: '$24.99' },
            { vis: <NFCStickerVisual width={70} />, label: 'Sticker', price: '$12.99' },
            { vis: <NFCStandVisual width={80} />, label: 'Phone Stand', price: '$22.99' },
            { vis: <NFCBadgeVisual width={70} />, label: 'Badge', price: '$19.99' },
          ].map((p) => (
            <div key={p.label} className="text-center">
              <div className="mb-3 flex items-end justify-center h-32">{p.vis}</div>
              <p className="text-white font-bold text-xs">{p.label}</p>
              <p className="text-[#f97316] font-black text-sm">{p.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── USE CASES ── */}
      <div className="px-8 py-14 bg-white">
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold text-[#f97316] tracking-widest">BUILT FOR EVERY PROFESSIONAL</span>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">Your Industry, Supercharged</h2>
        </div>
        <div className="grid grid-cols-5 gap-3 max-w-4xl mx-auto">
          {[
            { icon: 'users', title: 'Individual', desc: 'Creators, freelancers, job seekers', color: '#3b82f6' },
            { icon: 'briefcase', title: 'Professional', desc: 'Consultants, agents, realtors', color: ORANGE },
            { icon: 'palette', title: 'Salon', desc: 'Stylists, barbers, spas', color: '#ec4899' },
            { icon: 'shield', title: 'Law Firm', desc: 'Attorneys, immigration, civil', color: NAVY },
            { icon: 'building', title: 'Business', desc: 'Teams, restaurants, retail', color: '#22C55E' },
          ].map((u) => (
            <div key={u.title} className="text-center group cursor-pointer">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 transition-all group-hover:scale-105 shadow-md" style={{ borderColor: u.color, background: `${u.color}10` }}>
                <Icon name={u.icon} size={26} color={u.color} />
              </div>
              <p className="font-black text-xs text-[#0F172A]">{u.title}</p>
              <p className="text-[9px] text-[#64748B] mt-0.5 leading-snug">{u.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMPARISON ── */}
      <div className="px-8 py-14" style={{ background: BG }}>
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold text-[#f97316] tracking-widest">WHY BINGOO</span>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">Beyond a Business Card</h2>
          <p className="text-xs text-[#64748B] mt-2">Competitors share contacts. Bingoo runs your business.</p>
        </div>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden shadow-lg">
          <div className="grid grid-cols-8 gap-0 text-[10px]">
            <div className="col-span-2 p-3 font-bold text-[#0F172A] border-b border-[#E5EAF2]">Feature</div>
            <div className="p-3 text-center font-black text-white border-b border-[#E5EAF2]" style={{ background: NAVY }}>Bingoo</div>
            <div className="p-3 text-center font-bold text-[#64748B] border-b border-[#E5EAF2]">Circo</div>
            <div className="p-3 text-center font-bold text-[#64748B] border-b border-[#E5EAF2]">Dot</div>
            <div className="p-3 text-center font-bold text-[#64748B] border-b border-[#E5EAF2]">Popl</div>
            <div className="p-3 text-center font-bold text-[#64748B] border-b border-[#E5EAF2]">Linq</div>
            <div className="p-3 text-center font-bold text-[#64748B] border-b border-[#E5EAF2]">HiHello</div>
            {[
              ['NFC + QR + Wallet', true, false, false, true, true, false],
              ['Leads CRM Pipeline', true, false, false, false, false, false],
              ['Appointments & Booking', true, false, false, false, false, false],
              ['Analytics Dashboard', true, true, false, true, false, false],
              ['Lost Mode Recovery', true, false, false, false, false, false],
              ['Custom Design Studio', true, false, false, false, false, false],
              ['Team / Multi-Profile', true, false, false, true, false, true],
              ['Admin Manufacturing', true, false, false, false, false, false],
            ].map((row, i) => (
              <React.Fragment key={i}>
                <div className={`col-span-2 p-3 font-medium text-[#0F172A] ${i < 7 ? 'border-b border-[#E5EAF2]' : ''}`}>{row[0]}</div>
                <div className={`p-3 text-center ${i < 7 ? 'border-b border-[#E5EAF2]' : ''}`} style={{ background: `${NAVY}08` }}>
                  {row[1] ? <Icon name="check" size={14} color={ORANGE} /> : <span className="text-[#cbd5e1]">—</span>}
                </div>
                {row.slice(2).map((v, j) => (
                  <div key={j} className={`p-3 text-center ${i < 7 ? 'border-b border-[#E5EAF2]' : ''}`}>
                    {v ? <Icon name="check" size={14} color="#22C55E" /> : <span className="text-[#cbd5e1]">—</span>}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING PREVIEW ── */}
      <div className="px-8 py-14 bg-white border-y border-[#E5EAF2]">
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold text-[#f97316] tracking-widest">SIMPLE PRICING</span>
          <h2 className="text-2xl font-black text-[#0F172A] mt-1">Plans for Every Stage</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { name: 'Professional', price: '$9.99', period: '/mo', color: ORANGE, features: ['Unlimited profiles', 'NFC + QR + Wallet', 'Analytics', 'Leads CRM'], popular: true },
            { name: 'Salon', price: '$19.99', period: '/mo', color: '#ec4899', features: ['Everything in Pro', 'Services & pricing', 'Appointment booking', 'Team management'] },
            { name: 'Law Firm', price: '$49.00', period: '/mo', color: NAVY, features: ['Everything in Pro', 'Legal intake forms', 'Attorney profiles', 'Practice areas'] },
          ].map((p) => (
            <div key={p.name} className={`rounded-2xl p-5 border-2 ${p.popular ? 'border-[#f97316] shadow-xl' : 'border-[#E5EAF2]'}`}>
              {p.popular && <span className="block text-[9px] font-bold text-white text-center py-1 rounded-md mb-3" style={{ background: ORANGE }}>MOST POPULAR</span>}
              <p className="font-black text-sm text-[#0F172A]">{p.name}</p>
              <p className="my-3"><span className="text-2xl font-black" style={{ color: p.color }}>{p.price}</span><span className="text-xs text-[#64748B]">{p.period}</span></p>
              {p.features.map((f) => (
                <div key={f} className="flex items-center gap-2 mb-2">
                  <Icon name="check" size={12} color={p.color} />
                  <span className="text-[10px] text-[#64748B]">{f}</span>
                </div>
              ))}
              <button className={`w-full mt-3 py-2 text-xs font-bold rounded-lg ${p.popular ? 'text-white' : 'border border-[#E5EAF2] text-[#0F172A]'}`} style={p.popular ? { background: p.color } : {}}>Choose Plan</button>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="px-8 py-16 text-center" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <h2 className="text-3xl font-black text-white mb-3">Start Your Free Profile Today</h2>
        <p className="text-white/50 text-sm mb-8">No credit card required. Upgrade when you're ready.</p>
        <button className="px-8 py-3 text-white text-sm font-black rounded-xl shadow-2xl transition-transform hover:scale-105 flex items-center gap-2 mx-auto" style={{ background: ORANGE }}>
          Create Your Bingoo <Icon name="arrowRight" size={16} color="#FFFFFF" />
        </button>
      </div>

      {/* ── FOOTER ── */}
      <div className="px-8 py-8 bg-[#0F172A]">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <Logo light />
          <div className="flex gap-6">
            {['About', 'Privacy', 'Terms', 'Contact', 'Shop'].map((l) => (
              <span key={l} className="text-[10px] text-white/40 font-medium">{l}</span>
            ))}
          </div>
          <span className="text-[10px] text-white/30">© 2026 Bingoo Connect</span>
        </div>
      </div>
    </DesktopFrame>
  );
}