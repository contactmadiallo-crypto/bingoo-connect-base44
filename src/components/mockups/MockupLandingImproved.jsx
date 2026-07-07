import React from 'react';
import { Badge } from '@/components/mockups/MockupFrame';
import { BingooLogo, BingooAppIcon, BingooWordmark, InfinityMark } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', MUTED = '#64748B', INK = '#0F172A';

const APP_ICON_URL = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/8792d3cda_generated_image.png';
const NFC_CARD_URL = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/49bd24382_generated_image.png';
const META_GLASS_URL = 'https://media.base44.com/images/public/692bd9007b93ba81de543346/6185126c6_generated_image.png';

export default function MockupLandingImproved() {
  return (
    <div className="bg-[#F7F9FC]">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden px-8 py-16 text-center" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full opacity-20" style={{ background: ORANGE, filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: '#3b82f6', filter: 'blur(120px)' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <BingooLogo size={48} light />
          <h1 className="text-3xl font-black text-white mt-6 mb-3">The Operating System for Professional Identity</h1>
          <p className="text-white/60 text-sm mb-6">NFC cards, digital profiles, CRM, appointments, analytics, and business tools — all in one platform.</p>
          <div className="flex justify-center gap-3">
            <button className="px-6 py-3 text-white text-sm font-black rounded-xl shadow-lg" style={{ background: ORANGE }}>Get Started Free</button>
            <button className="px-6 py-3 text-white text-sm font-bold rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">Watch Demo</button>
          </div>
          <div className="mt-8 flex justify-center"><img src={NFC_CARD_URL} alt="NFC Card" className="w-48 h-32 object-cover rounded-2xl shadow-2xl" /></div>
        </div>
      </div>

      {/* ── What is Bingoo ── */}
      <Section title="What is Bingoo?" subtitle="Your complete digital identity platform">
        <p className="text-xs text-[#64748B] max-w-2xl mx-auto text-center mb-6">Bingoo replaces paper business cards with a smart NFC-enabled digital identity system. Tap a card, scan a QR, or share a link — your full professional profile, contact info, services, and booking tools appear instantly on any phone.</p>
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { icon: 'nfc', title: 'NFC Hardware', desc: 'Premium cards, keychains, bracelets with embedded NFC chips', color: ORANGE },
            { icon: 'globe', title: 'Digital Profile', desc: 'Your professional identity, always up-to-date, shareable anywhere', color: NAVY },
            { icon: 'briefcase', title: 'Business Tools', desc: 'CRM, appointments, analytics, team management built-in', color: '#22C55E' },
          ].map((c) => (
            <div key={c.title} className="bg-white rounded-2xl p-4 border border-[#E5EAF2] text-center">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: `${c.color}15` }}><Icon name={c.icon} size={22} color={c.color} /></div>
              <p className="font-black text-sm text-[#0F172A] mb-1">{c.title}</p>
              <p className="text-[10px] text-[#64748B]">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── How It Works ── */}
      <Section title="How NFC + QR Digital Identity Works" subtitle="Three ways to share, one platform">
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { num: '1', icon: 'nfc', title: 'Tap', desc: 'Phone taps NFC card → profile opens instantly', color: ORANGE },
            { num: '2', icon: 'qr', title: 'Scan', desc: 'Camera scans QR code → profile loads in browser', color: '#3b82f6' },
            { num: '3', icon: 'share', title: 'Share', desc: 'Send profile link via any messaging app', color: '#22C55E' },
          ].map((s) => (
            <div key={s.num} className="bg-white rounded-2xl p-4 border border-[#E5EAF2]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white" style={{ background: s.color }}>{s.num}</div>
                <Icon name={s.icon} size={18} color={s.color} />
              </div>
              <p className="font-black text-sm text-[#0F172A] mb-1">{s.title}</p>
              <p className="text-[10px] text-[#64748B]">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Business Model ── */}
      <Section title="Business Model" subtitle="Hardware + Subscription = Complete Platform">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
            <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ORANGE}15` }}><Icon name="shop" size={16} color={ORANGE} /></div><p className="font-black text-sm text-[#0F172A]">NFC Hardware Sales</p></div>
            <p className="text-[10px] text-[#64748B] mb-2">One-time purchase of premium NFC products</p>
            <p className="text-xs font-black" style={{ color: ORANGE }}>$11.99 – $29.99 per unit</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2]">
            <div className="flex items-center gap-2 mb-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${NAVY}10` }}><Icon name="wallet" size={16} color={NAVY} /></div><p className="font-black text-sm text-[#0F172A]">Subscription Plans</p></div>
            <p className="text-[10px] text-[#64748B] mb-2">Monthly/annual recurring revenue</p>
            <p className="text-xs font-black" style={{ color: NAVY }}>$9.99 – $49.00 / month</p>
          </div>
        </div>
      </Section>

      {/* ── Advantages ── */}
      <Section title="Why Bingoo?" subtitle="Advantages over paper cards & link-in-bio tools">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { icon: 'nfc', title: 'Instant Sharing', desc: 'No app needed — just tap', color: ORANGE },
            { icon: 'chart', title: 'Real Analytics', desc: 'Track every tap, view, lead', color: '#3b82f6' },
            { icon: 'message', title: 'Built-in CRM', desc: 'Capture leads automatically', color: '#22C55E' },
            { icon: 'shield', title: 'Lost Mode', desc: 'Recover lost devices', color: NAVY },
            { icon: 'wallet', title: 'Wallet Passes', desc: 'Apple + Google Wallet', color: '#8b5cf6' },
            { icon: 'calendar', title: 'Bookings', desc: 'Integrated scheduling', color: '#ec4899' },
            { icon: 'building', title: 'Team Tools', desc: 'Multi-profile management', color: '#fbbf24' },
            { icon: 'palette', title: 'Custom Design', desc: 'Brand your NFC products', color: '#22C55E' },
          ].map((a) => (
            <div key={a.title} className="bg-white rounded-xl p-3 border border-[#E5EAF2] text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${a.color}15` }}><Icon name={a.icon} size={18} color={a.color} /></div>
              <p className="font-bold text-[10px] text-[#0F172A] mb-0.5">{a.title}</p>
              <p className="text-[8px] text-[#64748B]">{a.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Mission & Vision ── */}
      <Section title="Mission & Vision" subtitle="">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}>
            <Icon name="sparkles" size={20} color={ORANGE} />
            <p className="font-black text-sm mt-2 mb-1">Our Mission</p>
            <p className="text-[10px] text-white/60">Empower every professional with a smart, permanent digital identity that turns every encounter into an opportunity.</p>
          </div>
          <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${ORANGE}, #fb923c)` }}>
            <Icon name="eye" size={20} color="#FFFFFF" />
            <p className="font-black text-sm mt-2 mb-1">Our Vision</p>
            <p className="text-[10px] text-white/80">A world where paper business cards no longer exist — every connection is digital, smart, and measurable.</p>
          </div>
        </div>
      </Section>

      {/* ── Services ── */}
      <Section title="Services" subtitle="Everything you need to manage your professional identity">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-w-3xl mx-auto">
          {[
            { icon: 'users', label: 'Profiles', color: NAVY },
            { icon: 'nfc', label: 'NFC Devices', color: ORANGE },
            { icon: 'qr', label: 'QR Designer', color: '#3b82f6' },
            { icon: 'wallet', label: 'Wallet Passes', color: '#8b5cf6' },
            { icon: 'chart', label: 'Analytics', color: '#22C55E' },
            { icon: 'message', label: 'Leads CRM', color: '#ec4899' },
            { icon: 'calendar', label: 'Appointments', color: '#fbbf24' },
            { icon: 'palette', label: 'Design Studio', color: ORANGE },
            { icon: 'star', label: 'Reviews', color: '#FFD700' },
            { icon: 'users', label: 'Team Mgmt', color: NAVY },
            { icon: 'building', label: 'Offices', color: '#3b82f6' },
            { icon: 'shield', label: 'Lost Mode', color: '#EF4444' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-2.5 border border-[#E5EAF2] text-center">
              <div className="w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center" style={{ background: `${s.color}15` }}><Icon name={s.icon} size={14} color={s.color} /></div>
              <span className="text-[8px] font-bold text-[#0F172A]">{s.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Shop Preview ── */}
      <Section title="Shop — NFC Products" subtitle="Premium hardware with infinity branding">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-3xl mx-auto">
          {[
            { name: 'NFC Card', price: '$19.99', color: NAVY, img: NFC_CARD_URL },
            { name: 'Metal Card', price: '$29.99', color: '#8b5cf6' },
            { name: 'Keychain', price: '$11.99', color: ORANGE },
            { name: 'Bracelet', price: '$24.99', color: '#ec4899' },
            { name: 'Sticker', price: '$12.99', color: '#22C55E' },
          ].map((p) => (
            <div key={p.name} className="bg-white rounded-2xl border border-[#E5EAF2] overflow-hidden">
              <div className="h-20 flex items-center justify-center" style={{ background: p.img ? `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` : `${p.color}08` }}>
                {p.img ? <img src={p.img} alt={p.name} className="h-full w-full object-cover" /> : <div className="rounded-lg p-2" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` }}><InfinityMark size={20} color={p.color} /></div>}
              </div>
              <div className="p-2"><p className="text-[9px] font-bold text-[#0F172A]">{p.name}</p><p className="text-xs font-black" style={{ color: ORANGE }}>{p.price}</p></div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Subscription Plans ── */}
      <Section title="Subscription Plans" subtitle="Choose the plan that fits your professional needs">
        <div className="grid grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { name: 'Professional', price: '$9.99', features: ['Unlimited profiles', 'NFC + QR + Wallet', 'Analytics + CRM'], color: ORANGE, popular: true },
            { name: 'Business', price: '$14.99', features: ['Everything in Pro', 'Team management', 'Design Studio'], color: '#22C55E' },
            { name: 'Salon', price: '$19.99', features: ['Service menu', 'Loyalty program', 'Portfolio gallery'], color: '#ec4899' },
            { name: 'Law Firm', price: '$49.00', features: ['Legal intake forms', 'Practice areas', 'Team + offices'], color: NAVY },
          ].map((p) => (
            <div key={p.name} className={`bg-white rounded-2xl p-4 border-2 ${p.popular ? 'border-[#f97316] shadow-lg' : 'border-[#E5EAF2]'}`}>
              {p.popular && <div className="flex justify-end mb-1"><Badge color={ORANGE}>POPULAR</Badge></div>}
              <div className="w-10 h-10 rounded-xl mb-2 flex items-center justify-center" style={{ background: `${p.color}15` }}><Icon name="briefcase" size={16} color={p.color} /></div>
              <p className="font-black text-sm text-[#0F172A]">{p.name}</p>
              <p className="text-lg font-black mb-2" style={{ color: p.color }}>{p.price}<span className="text-[8px] text-[#64748B]">/mo</span></p>
              {p.features.map((f) => <div key={f} className="flex items-center gap-1.5 mb-1"><Icon name="check" size={10} color={p.color} /><span className="text-[8px] font-bold text-[#0F172A]">{f}</span></div>)}
              <button className="w-full py-1.5 mt-2 text-[9px] font-black text-white rounded-lg" style={{ background: p.color }}>Choose Plan</button>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Payment & Checkout ── */}
      <Section title="Payment & Checkout" subtitle="Secure Stripe-powered payments">
        <div className="max-w-md mx-auto bg-white rounded-2xl p-5 border border-[#E5EAF2]">
          <div className="flex items-center gap-2 mb-3"><Icon name="lock" size={16} color="#22C55E" /><p className="font-black text-sm text-[#0F172A]">Secure Checkout</p></div>
          <div className="space-y-2 mb-3">
            <div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] font-medium text-[#cbd5e1]">Card number</div>
            <div className="grid grid-cols-2 gap-2"><div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] font-medium text-[#cbd5e1]">MM / YY</div><div className="px-3 py-2 bg-[#F7F9FC] rounded-lg text-[10px] font-medium text-[#cbd5e1]">CVC</div></div>
          </div>
          <button className="w-full py-2.5 text-white text-xs font-black rounded-xl" style={{ background: ORANGE }}>Pay $19.99</button>
          <p className="text-center text-[9px] text-[#64748B] mt-2 flex items-center justify-center gap-1"><Icon name="shield" size={10} color="#22C55E" /> Secured by Stripe · 256-bit encryption</p>
        </div>
      </Section>

      {/* ── Use Cases by Profession ── */}
      <Section title="Use Cases by Profession" subtitle="Bingoo works for every professional">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            { icon: 'shield', prof: 'Attorneys', desc: 'Legal intake, practice areas', color: NAVY },
            { icon: 'palette', prof: 'Salon Owners', desc: 'Services, bookings, loyalty', color: '#ec4899' },
            { icon: 'building', prof: 'Real Estate', desc: 'Listings, contact, tours', color: '#3b82f6' },
            { icon: 'briefcase', prof: 'Consultants', desc: 'Portfolio, scheduling', color: ORANGE },
            { icon: 'users', prof: 'Teams', desc: 'Multi-profile management', color: '#22C55E' },
            { icon: 'star', prof: 'Creators', desc: 'Media profiles, links', color: '#8b5cf6' },
            { icon: 'shop', prof: 'Restaurants', desc: 'Menus, reviews, loyalty', color: '#fbbf24' },
            { icon: 'zap', prof: 'Events', desc: 'Networking, badges', color: '#ec4899' },
          ].map((u) => (
            <div key={u.prof} className="bg-white rounded-xl p-3 border border-[#E5EAF2] text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${u.color}15` }}><Icon name={u.icon} size={18} color={u.color} /></div>
              <p className="font-bold text-[10px] text-[#0F172A]">{u.prof}</p>
              <p className="text-[8px] text-[#64748B]">{u.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Privacy & Security ── */}
      <Section title="Privacy & Security" subtitle="Your data is protected">
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
          {[
            { icon: 'lock', title: 'Data Encryption', desc: '256-bit SSL encryption', color: NAVY },
            { icon: 'shield', title: 'Privacy Controls', desc: 'Control who sees your info', color: '#22C55E' },
            { icon: 'checkCircle', title: 'GDPR Compliant', desc: 'Full data deletion support', color: '#3b82f6' },
          ].map((p) => (
            <div key={p.title} className="bg-white rounded-xl p-4 border border-[#E5EAF2] text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${p.color}15` }}><Icon name={p.icon} size={18} color={p.color} /></div>
              <p className="font-bold text-[10px] text-[#0F172A]">{p.title}</p>
              <p className="text-[8px] text-[#64748B]">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Support & Onboarding ── */}
      <Section title="Support & Onboarding" subtitle="We're with you every step">
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
          {[
            { icon: 'message', title: '24/7 Chat Support', desc: 'Real humans, real help', color: '#3b82f6' },
            { icon: 'sparkles', title: 'AI Onboarding', desc: 'Guided profile builder', color: ORANGE },
            { icon: 'users', title: 'Concierge Service', desc: 'White-glove for business', color: '#8b5cf6' },
          ].map((s) => (
            <div key={s.title} className="bg-white rounded-xl p-4 border border-[#E5EAF2] text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${s.color}15` }}><Icon name={s.icon} size={18} color={s.color} /></div>
              <p className="font-bold text-[10px] text-[#0F172A]">{s.title}</p>
              <p className="text-[8px] text-[#64748B]">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── How to Use ── */}
      <Section title="How to Use Bingoo" subtitle="Get started in 4 simple steps">
        <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
          {[
            { num: '1', title: 'Sign Up', desc: 'Choose your plan & profile type', color: ORANGE },
            { num: '2', title: 'Build Profile', desc: 'Add info, links, photo, design', color: '#3b82f6' },
            { num: '3', title: 'Order NFC', desc: 'Buy cards, keychains, or bundles', color: '#22C55E' },
            { num: '4', title: 'Tap & Share', desc: 'Start networking smarter', color: NAVY },
          ].map((s) => (
            <div key={s.num} className="bg-white rounded-2xl p-4 border border-[#E5EAF2] text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center font-black text-sm text-white" style={{ background: s.color }}>{s.num}</div>
              <p className="font-bold text-[10px] text-[#0F172A]">{s.title}</p>
              <p className="text-[8px] text-[#64748B]">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Video Placeholder (Meta Glass) ── */}
      <Section title="The Future of Networking" subtitle="Bingoo + Meta Glass — Coming Soon">
        <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-xl relative" style={{ height: 200 }}>
          <img src={META_GLASS_URL} alt="Meta Glass" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(11,33,73,0.3)' }}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center border border-white/30 mb-2">
                <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
              </div>
              <p className="text-white font-black text-sm">Bingoo + Meta Glass</p>
              <p className="text-white/60 text-[10px]">Video coming soon</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Footer ── */}
      <div className="py-12 text-center" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <BingooLogo size={40} light />
        <p className="text-white/50 text-xs mt-4 mb-2">The Operating System for Professional Identity</p>
        <InfinityMark size={24} color="rgba(255,255,255,0.15)" strokeWidth={1.5} className="mx-auto mt-4" />
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="py-10 px-8 border-b border-[#E5EAF2]">
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-[#0F172A] mb-1">{title}</h2>
        {subtitle && <p className="text-[10px] text-[#64748B]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}