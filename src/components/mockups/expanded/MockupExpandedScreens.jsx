import React from 'react';
import { PhoneFrame, DesktopFrame, Badge, StatCard, SectionLabel, NFCCardVisual, WalletPassVisual } from '@/components/mockups/MockupFrame';
import { InfinityMark, BingooAppIcon, BingooWordmark, LoadingDots } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', NAVY_LIGHT = '#13284f', ORANGE = '#f97316', BG = '#F7F9FC', BORDER = '#E5EAF2', INK = '#0F172A', MUTED = '#64748B';

function Header({ title, sub, showBack = true }) {
  return (
    <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
      <div className="flex items-center justify-between mb-2">
        {showBack && <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center"><Icon name="arrowRight" size={14} color="#FFFFFF" className="rotate-180" /></div>}
        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center"><Icon name="bell" size={14} color="#FFFFFF" /></div>
      </div>
      <p className="text-white font-black text-base">{title}</p>
      {sub && <p className="text-white/50 text-[10px]">{sub}</p>}
    </div>
  );
}

// ── Screen 39: Welcome / Loading Splash ──
export function MockupWelcomeSplash() {
  return (
    <PhoneFrame label="39 · Welcome Splash — Infinity + Loading Dots">
      <div className="min-h-full flex flex-col items-center justify-center px-6 pb-8" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-20" style={{ background: ORANGE, filter: 'blur(60px)' }} />
        <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full opacity-10" style={{ background: '#3b82f6', filter: 'blur(50px)' }} />
        <div className="relative z-10 text-center">
          <BingooAppIcon size={80} glow={true} />
          <div className="mt-5"><BingooWordmark size="text-3xl" light textColor="#FFFFFF" infinityColor={ORANGE} showConnect /></div>
          <div className="mt-6 flex justify-center"><LoadingDots color={ORANGE} size={10} /></div>
          <p className="text-white/40 text-[10px] mt-4 font-medium">Loading your digital identity...</p>
        </div>
        <div className="absolute bottom-10 left-0 right-0 text-center">
          <InfinityMark size={32} color="rgba(255,255,255,0.12)" strokeWidth={1.5} />
          <p className="text-white/20 text-[8px] mt-2 font-bold tracking-widest">THE OPERATING SYSTEM FOR PROFESSIONAL IDENTITY</p>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 40: OTP Verification ──
export function MockupOTPVerification() {
  return (
    <PhoneFrame label="40 · OTP Verification — Code Entry">
      <div className="min-h-full pb-8" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="px-5 pt-12 text-center">
          <BingooAppIcon size={48} glow={true} />
          <div className="mt-3"><BingooWordmark size="text-lg" light textColor="#FFFFFF" infinityColor={ORANGE} showConnect /></div>
        </div>
        <div className="px-5 mt-8">
          <p className="text-white font-black text-base text-center">Verify Your Email</p>
          <p className="text-white/50 text-[10px] text-center mt-1">Enter the 6-digit code sent to your email</p>
          <div className="flex justify-center gap-2 mt-6">
            {[3, 2, 1, null, null, null].map((d, i) => (
              <div key={i} className="w-10 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ background: i < 3 ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)', border: `1.5px solid ${i < 3 ? ORANGE : 'rgba(255,255,255,0.1)'}` }}>{d}</div>
            ))}
          </div>
          <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg mt-6" style={{ background: ORANGE }}>Verify & Continue</button>
          <p className="text-white/40 text-[10px] text-center mt-4">Didn't receive a code? <span className="font-bold" style={{ color: ORANGE }}>Resend</span></p>
          <div className="flex justify-center mt-6"><LoadingDots color="rgba(255,255,255,0.3)" size={6} /></div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 41: Plan Selection ──
export function MockupPlanSelection() {
  return (
    <PhoneFrame label="41 · Plan Selection — Choose Your Plan">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <Header title="Choose Your Plan" sub="Start free, upgrade anytime" />
        <div className="px-5 mt-4 space-y-3">
          {[
            { name: 'Free', price: '$0', period: 'forever', color: MUTED, features: '1 profile · Basic QR', popular: false },
            { name: 'Professional', price: '$4.99', period: '/month', color: ORANGE, features: 'NFC · Analytics · CRM · Wallet', popular: true },
            { name: 'Salon', price: '$19.99', period: '/month', color: '#ec4899', features: 'Services · Stylists · Loyalty', popular: false },
            { name: 'Law Firm', price: '$49.00', period: '/month', color: NAVY, features: 'Intake · Attorneys · CRM Pipeline', popular: false },
          ].map((p) => (
            <div key={p.name} className={`rounded-2xl p-4 border-2 ${p.popular ? '' : ''}`} style={{ borderColor: p.popular ? ORANGE : BORDER, background: p.popular ? `${ORANGE}08` : '#fff' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <p className="font-black text-sm text-[#0F172A]">{p.name}</p>
                  {p.popular && <Badge color={ORANGE}>POPULAR</Badge>}
                </div>
                <p className="font-black text-base" style={{ color: p.color }}>{p.price}<span className="text-[9px] text-[#64748B]">{p.period}</span></p>
              </div>
              <p className="text-[9px] text-[#64748B]">{p.features}</p>
              <button className="w-full py-2 mt-2 text-[10px] font-black rounded-xl" style={{ background: p.popular ? ORANGE : `${p.color}10`, color: p.popular ? '#fff' : p.color }}>{p.name === 'Free' ? 'Start Free' : `Get ${p.name}`}</button>
            </div>
          ))}
          <div className="flex items-center justify-center gap-1 pt-2"><InfinityMark size={14} color={ORANGE} strokeWidth={2} /><span className="text-[8px] font-bold" style={{ color: ORANGE }}>BINGOO CONNECT</span></div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 42: Profile Activation Success ──
export function MockupProfileActivation() {
  return (
    <PhoneFrame label="42 · Profile Live — Activation Success">
      <div className="min-h-full flex flex-col items-center justify-center px-6 pb-8" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-20" style={{ background: '#22C55E', filter: 'blur(60px)' }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: '#22C55E20' }}>
            <Icon name="checkCircle" size={40} color="#22C55E" />
          </div>
          <p className="text-white font-black text-lg">Your Profile is Live!</p>
          <p className="text-white/50 text-[11px] mt-1">bingooconnect.com/diallo-law</p>
          <div className="mt-4 bg-white/10 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <InfinityMark size={18} color={ORANGE} strokeWidth={2.5} glow={true} />
              <span className="text-white font-black text-xs">Bingoo Connect</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-white font-black text-sm">0</p><p className="text-white/40 text-[8px]">Views</p></div>
              <div><p className="text-white font-black text-sm">0</p><p className="text-white/40 text-[8px]">Taps</p></div>
              <div><p className="text-white font-black text-sm">1</p><p className="text-white/40 text-[8px]">Device</p></div>
            </div>
          </div>
          <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg mt-4" style={{ background: ORANGE }}>Share My Profile</button>
          <button className="w-full py-2.5 text-white/70 text-xs font-bold rounded-xl mt-2 bg-white/10">Go to Dashboard</button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 43: Profile Editor — Info Tab ──
export function MockupProfileEditorInfo() {
  return (
    <PhoneFrame label="43 · Profile Editor — Edit Info">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <Header title="Edit Profile" sub="Diallo Law Firm" />
        <div className="px-5 mt-4">
          <div className="flex gap-2 mb-4">
            {['Info', 'Design', 'Links', 'Media'].map((t, i) => (
              <div key={t} className={`flex-1 py-2 text-center rounded-xl text-[10px] font-black ${i === 0 ? 'text-white' : 'text-[#64748B] bg-white border border-[#E5EAF2]'}`} style={i === 0 ? { background: NAVY } : {}}>{t}</div>
            ))}
          </div>
          <div className="space-y-3">
            {[
              { label: 'Display Name', value: 'Diallo Law Firm' },
              { label: 'Username', value: 'diallo-law' },
              { label: 'Job Title', value: 'Immigration Attorney' },
              { label: 'Company', value: 'Diallo Law Firm PLLC' },
              { label: 'Bio', value: 'Helping families navigate immigration...' },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-[9px] font-bold text-[#64748B] mb-1">{f.label.toUpperCase()}</p>
                <div className="px-3 py-2.5 bg-white rounded-xl border border-[#E5EAF2] text-[10px] font-bold text-[#0F172A]">{f.value}</div>
              </div>
            ))}
            <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg" style={{ background: ORANGE }}>Save Changes</button>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 44: Design Customization ──
export function MockupDesignCustomization() {
  return (
    <PhoneFrame label="44 · Design Studio — Layout & Color">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <Header title="Design Studio" sub="Customize your profile look" />
        <div className="px-5 mt-4">
          <p className="text-[9px] font-bold text-[#64748B] mb-2 tracking-wider">LAYOUT</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['Classic', 'Executive', 'Glass', 'Dark', 'Magazine', 'Luxury'].map((l, i) => (
              <div key={l} className={`rounded-xl p-2 text-center border-2 ${i === 1 ? '' : ''}`} style={{ borderColor: i === 1 ? ORANGE : BORDER, background: i === 1 ? `${ORANGE}08` : '#fff' }}>
                <div className="h-10 rounded-lg mb-1" style={{ background: i === 1 ? `linear-gradient(135deg, ${NAVY}, ${NAVY_DEEP})` : '#F7F9FC' }} />
                <span className="text-[8px] font-bold text-[#0F172A]">{l}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] font-bold text-[#64748B] mb-2 tracking-wider">COVER COLOR</p>
          <div className="flex gap-2 mb-4">
            {['#0b2149', '#f97316', '#ec4899', '#22C55E', '#7c3aed', '#0D9488'].map((c, i) => (
              <div key={c} className={`w-8 h-8 rounded-full border-2 ${i === 0 ? 'border-[#0F172A]' : 'border-white'}`} style={{ background: c, boxShadow: i === 0 ? `0 0 0 2px ${ORANGE}` : 'none' }} />
            ))}
          </div>
          <p className="text-[9px] font-bold text-[#64748B] mb-2 tracking-wider">BUTTON STYLE</p>
          <div className="flex gap-2 mb-4">
            {['Pill', 'Rounded', 'Sharp'].map((s, i) => (
              <div key={s} className={`flex-1 py-2 text-center text-[9px] font-bold rounded-${i === 0 ? 'full' : i === 1 ? 'xl' : 'lg'} ${i === 0 ? 'text-white' : 'text-[#64748B] bg-white border border-[#E5EAF2]'}`} style={i === 0 ? { background: ORANGE } : {}}>{s}</div>
            ))}
          </div>
          <button className="w-full py-3 text-white text-sm font-black rounded-xl" style={{ background: NAVY }}>Apply Design</button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 45: Link Manager ──
export function MockupLinkManager() {
  return (
    <PhoneFrame label="45 · Link Manager — Add & Reorder">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <Header title="Manage Links" sub="6 links · Drag to reorder" />
        <div className="px-5 mt-4 space-y-2">
          {[
            { icon: 'phone', label: 'Call Office', color: '#22C55E' },
            { icon: 'message', label: 'WhatsApp', color: '#25D366' },
            { icon: 'mail', label: 'Email', color: '#3b82f6' },
            { icon: 'globe', label: 'Website', color: ORANGE },
            { icon: 'building', label: 'LinkedIn', color: '#0A66C2' },
          ].map((l, i) => (
            <div key={l.label} className="bg-white rounded-xl p-3 border border-[#E5EAF2] flex items-center gap-3">
              <Icon name="more" size={14} color="#cbd5e1" className="cursor-grab" />
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${l.color}15` }}><Icon name={l.icon} size={14} color={l.color} /></div>
              <span className="text-[10px] font-bold text-[#0F172A] flex-1">{l.label}</span>
              <div className="w-7 h-4 rounded-full flex items-center" style={{ background: ORANGE }}><div className="w-3 h-3 rounded-full bg-white ml-auto mr-0.5" /></div>
            </div>
          ))}
          <button className="w-full py-2.5 text-[10px] font-black rounded-xl border-2 border-dashed" style={{ borderColor: `${ORANGE}40`, color: ORANGE, background: `${ORANGE}08` }}>+ Add New Link</button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 46: Per-Profile Analytics ──
export function MockupProfileAnalytics() {
  return (
    <PhoneFrame label="46 · Profile Analytics — Insights">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <Header title="Analytics" sub="Diallo Law Firm · Last 30 days" />
        <div className="px-5 mt-4">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <StatCard icon="eye" value="1,247" label="Profile Views" color={NAVY} />
            <StatCard icon="nfc" value="89" label="NFC Taps" color={ORANGE} />
            <StatCard icon="message" value="23" label="Leads" color="#22C55E" />
            <StatCard icon="calendar" value="12" label="Bookings" color="#3b82f6" />
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-3">
            <SectionLabel>Views Trend</SectionLabel>
            <div className="flex items-end gap-1 h-20">
              {[40, 55, 35, 70, 50, 80, 60, 90, 75, 100, 85, 95].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i >= 9 ? ORANGE : `${NAVY}40` }} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2]">
            <SectionLabel>Top Sources</SectionLabel>
            {[
              { src: 'NFC Tap', pct: 45, color: ORANGE },
              { src: 'QR Scan', pct: 28, color: NAVY },
              { src: 'Direct Link', pct: 18, color: '#3b82f6' },
              { src: 'Google', pct: 9, color: '#22C55E' },
            ].map((s) => (
              <div key={s.src} className="mb-2">
                <div className="flex justify-between text-[9px] font-bold mb-1"><span className="text-[#0F172A]">{s.src}</span><span style={{ color: s.color }}>{s.pct}%</span></div>
                <div className="h-1.5 rounded-full bg-[#F7F9FC]"><div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 47: NFC Device Details ──
export function MockupNFCDeviceDetails() {
  return (
    <PhoneFrame label="47 · NFC Device Details — Tap Stats">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <Header title="NFC Device" sub="BG-000001 · Business Card" />
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-3 text-center">
            <div className="flex justify-center mb-3"><NFCCardVisual name="Diallo Law" role="Attorney" width={180} /></div>
            <p className="font-black text-sm text-[#0F172A]">NFC Business Card</p>
            <p className="text-[10px] text-[#64748B]">Code: BG-000001 · Active</p>
            <div className="flex justify-center gap-2 mt-2">
              <Badge color="#22C55E">ACTIVE</Badge>
              <Badge color={NAVY}>ASSIGNED</Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard icon="nfc" value="89" label="Total Taps" color={ORANGE} />
            <StatCard icon="eye" value="67" label="Profile Views" color={NAVY} />
            <StatCard icon="share" value="34" label="Shares" color="#22C55E" />
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] mb-3">
            <SectionLabel>Recent Taps</SectionLabel>
            {[
              { time: '2h ago', location: 'New York, NY', device: 'iPhone' },
              { time: '5h ago', location: 'New York, NY', device: 'Android' },
              { time: '1d ago', location: 'Newark, NJ', device: 'iPhone' },
            ].map((t) => (
              <div key={t.time} className="flex items-center gap-2 py-1.5 border-b border-[#E5EAF2] last:border-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ORANGE}15` }}><Icon name="nfc" size={12} color={ORANGE} /></div>
                <div className="flex-1"><p className="text-[9px] font-bold text-[#0F172A]">{t.location}</p><p className="text-[8px] text-[#64748B]">{t.device} · {t.time}</p></div>
              </div>
            ))}
          </div>
          <button className="w-full py-2.5 text-[10px] font-black rounded-xl" style={{ background: '#EF444415', color: '#EF4444' }}>Report Lost</button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 48: Wallet Pass Preview ──
export function MockupWalletPassPreview() {
  return (
    <PhoneFrame label="48 · Wallet Pass Preview — Apple & Google">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <Header title="Wallet Passes" sub="Digital business card in Apple & Google Wallet" />
        <div className="px-5 mt-4 space-y-4">
          <div className="flex justify-center"><WalletPassVisual type="apple" name="Diallo Law Firm" role="Immigration Attorney" /></div>
          <div className="flex justify-center"><WalletPassVisual type="google" name="Diallo Law Firm" role="Immigration Attorney" /></div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2] text-center">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">PASS DETAILS</p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <div><p className="text-[8px] text-[#64748B]">Name</p><p className="text-[9px] font-bold text-[#0F172A]">Diallo Law Firm</p></div>
              <div><p className="text-[8px] text-[#64748B]">Phone</p><p className="text-[9px] font-bold text-[#0F172A]">(212) 555-0192</p></div>
              <div><p className="text-[8px] text-[#64748B]">Email</p><p className="text-[9px] font-bold text-[#0F172A]">contact@dlf.com</p></div>
              <div><p className="text-[8px] text-[#64748B]">Website</p><p className="text-[9px] font-bold text-[#0F172A]">dlf.com</p></div>
            </div>
            <div className="flex items-center justify-center gap-1 mt-3"><InfinityMark size={14} color={ORANGE} strokeWidth={2} /><span className="text-[7px] font-bold" style={{ color: ORANGE }}>BINGOO CONNECT</span></div>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 49: Batch NFC Activation ──
export function MockupBatchActivation() {
  return (
    <PhoneFrame label="49 · Batch NFC Activation — Multiple Devices">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <Header title="Batch Activation" sub="3 devices ready to assign" />
        <div className="px-5 mt-4 space-y-2">
          {[
            { code: 'BG-000010', type: 'Business Card', status: 'ready' },
            { code: 'BG-000011', type: 'Keychain', status: 'ready' },
            { code: 'BG-000012', type: 'Sticker', status: 'ready' },
          ].map((d) => (
            <div key={d.code} className="bg-white rounded-xl p-3 border border-[#E5EAF2] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}15` }}><Icon name="nfc" size={16} color={ORANGE} /></div>
              <div className="flex-1"><p className="text-[10px] font-black text-[#0F172A]">{d.code}</p><p className="text-[8px] text-[#64748B]">{d.type}</p></div>
              <Badge color="#22C55E">READY</Badge>
            </div>
          ))}
          <div className="bg-white rounded-xl p-3 border border-[#E5EAF2] mt-3">
            <p className="text-[9px] font-bold text-[#64748B] mb-2">ASSIGN TO PROFILE</p>
            <div className="flex items-center gap-2 p-2 bg-[#F7F9FC] rounded-lg">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: NAVY }}><span className="text-white font-black text-[10px]" style={{ color: ORANGE }}>DL</span></div>
              <div><p className="text-[10px] font-bold text-[#0F172A]">Diallo Law Firm</p><p className="text-[8px] text-[#64748B]">Immigration Attorney</p></div>
            </div>
          </div>
          <button className="w-full py-3 text-white text-sm font-black rounded-xl shadow-lg" style={{ background: ORANGE }}>Activate All 3 Devices</button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 50: Lead Pipeline Kanban ──
export function MockupLeadPipelineKanban() {
  return (
    <DesktopFrame label="50 · Lead Pipeline — Kanban Board" height="h-[500px]">
      <div className="p-4 bg-[#F7F9FC] h-full overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <InfinityMark size={20} color={ORANGE} strokeWidth={2.5} glow={true} />
            <p className="text-sm font-black text-[#0F172A]">Lead Pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-[10px] font-bold text-white rounded-lg" style={{ background: ORANGE }}>+ New Lead</button>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3 h-[420px]">
          {[
            { col: 'New', color: '#3b82f6', cards: [{ name: 'M. Sylla', source: 'NFC', time: '2h' }, { name: 'A. Fall', source: 'QR', time: '4h' }] },
            { col: 'Contacted', color: '#f97316', cards: [{ name: 'K. Mbaye', source: 'Profile', time: '1d' }] },
            { col: 'Qualified', color: '#7c3aed', cards: [{ name: 'B. Ndiaye', source: 'Referral', time: '2d' }, { name: 'L. Sarr', source: 'Direct', time: '3d' }] },
            { col: 'Consultation', color: '#0D9488', cards: [{ name: 'O. Diallo', source: 'NFC', time: '4d' }] },
            { col: 'Retained', color: '#22C55E', cards: [{ name: 'F. Toure', source: 'Profile', time: '1w' }, { name: 'I. Gueye', source: 'Referral', time: '2w' }] },
          ].map((col) => (
            <div key={col.col} className="bg-white rounded-xl border border-[#E5EAF2] flex flex-col">
              <div className="px-3 py-2 border-b border-[#E5EAF2] flex items-center justify-between">
                <span className="text-[10px] font-black text-[#0F172A]">{col.col}</span>
                <span className="text-[8px] font-bold text-white px-1.5 py-0.5 rounded-full" style={{ background: col.color }}>{col.cards.length}</span>
              </div>
              <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                {col.cards.map((c) => (
                  <div key={c.name} className="bg-[#F7F9FC] rounded-lg p-2 border border-[#E5EAF2] cursor-pointer hover:shadow-sm">
                    <p className="text-[10px] font-bold text-[#0F172A]">{c.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge color={col.color}>{c.source}</Badge>
                      <span className="text-[8px] text-[#64748B]">{c.time}</span>
                    </div>
                  </div>
                ))}
                <div className="text-center py-1 text-[8px] text-[#64748B] font-bold cursor-pointer">+ Add</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopFrame>
  );
}

// ── Screen 51: Appointment Confirmation ──
export function MockupAppointmentConfirmation() {
  return (
    <PhoneFrame label="51 · Appointment Confirmation — Visitor View">
      <div className="min-h-full flex flex-col items-center justify-center px-6 pb-8" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-20" style={{ background: '#22C55E', filter: 'blur(60px)' }} />
        <div className="relative z-10 text-center w-full max-w-[260px]">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: '#22C55E20' }}>
            <Icon name="checkCircle" size={32} color="#22C55E" />
          </div>
          <p className="text-white font-black text-base">Appointment Booked!</p>
          <p className="text-white/50 text-[10px] mt-1">Diallo Law Firm has been notified</p>
          <div className="mt-4 bg-white/10 rounded-2xl p-4 border border-white/10 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="calendar" size={16} color={ORANGE} />
              <p className="text-white font-bold text-[11px]">Consultation</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px]"><span className="text-white/50">Date</span><span className="text-white font-bold">Jul 15, 2026</span></div>
              <div className="flex justify-between text-[9px]"><span className="text-white/50">Time</span><span className="text-white font-bold">10:00 AM</span></div>
              <div className="flex justify-between text-[9px]"><span className="text-white/50">Duration</span><span className="text-white font-bold">30 min</span></div>
              <div className="flex justify-between text-[9px]"><span className="text-white/50">Type</span><span className="text-white font-bold">Immigration</span></div>
            </div>
          </div>
          <button className="w-full py-2.5 text-white text-xs font-black rounded-xl mt-4" style={{ background: ORANGE }}>Add to Calendar</button>
          <p className="text-white/30 text-[9px] mt-3">A confirmation email has been sent</p>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 52: Salon Services Manager ──
export function MockupSalonServicesManager() {
  return (
    <PhoneFrame label="52 · Salon Services Manager — Add & Edit">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <Header title="Services" sub="Bella Studio · 6 services" />
        <div className="px-5 mt-4 space-y-2">
          {[
            { name: 'Haircut & Style', price: '$35', duration: '45 min', active: true },
            { name: 'Manicure', price: '$25', duration: '30 min', active: true },
            { name: 'Hair Coloring', price: '$80', duration: '90 min', active: true },
            { name: 'Beard Trim', price: '$15', duration: '15 min', active: false },
          ].map((s) => (
            <div key={s.name} className="bg-white rounded-xl p-3 border border-[#E5EAF2] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#ec489915' }}><Icon name="scissors" size={16} color="#ec4899" /></div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-[#0F172A]">{s.name}</p>
                <p className="text-[8px] text-[#64748B]">{s.price} · {s.duration}</p>
              </div>
              <div className={`w-7 h-4 rounded-full flex items-center ${s.active ? '' : ''}`} style={{ background: s.active ? '#ec4899' : '#E5EAF2' }}><div className={`w-3 h-3 rounded-full bg-white ${s.active ? 'ml-auto mr-0.5' : 'ml-0.5'}`} /></div>
            </div>
          ))}
          <button className="w-full py-2.5 text-[10px] font-black rounded-xl border-2 border-dashed" style={{ borderColor: '#ec489940', color: '#ec4899', background: '#ec489908' }}>+ Add New Service</button>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 53: Order Tracking ──
export function MockupOrderTracking() {
  return (
    <PhoneFrame label="53 · Order Tracking — Shipment Status">
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <Header title="Order #BG-0042" sub="NFC Business Card × 2" />
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl p-4 border border-[#E5EAF2] mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-[#64748B]">TRACKING</span>
              <Badge color="#3b82f6">SHIPPED</Badge>
            </div>
            <div className="space-y-3">
              {[
                { step: 'Order Placed', date: 'Jul 5', done: true },
                { step: 'Processing', date: 'Jul 6', done: true },
                { step: 'Shipped', date: 'Jul 7', done: true },
                { step: 'In Transit', date: 'Jul 8', done: false, active: true },
                { step: 'Delivered', date: 'Est. Jul 10', done: false },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${s.done ? '' : ''}`} style={{ background: s.done ? '#22C55E' : s.active ? `${ORANGE}20` : '#F7F9FC', border: s.active ? `2px solid ${ORANGE}` : 'none' }}>
                    {s.done ? <Icon name="check" size={10} color="#FFFFFF" /> : s.active ? <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: ORANGE }} /> : null}
                  </div>
                  <div className="flex-1"><p className={`text-[10px] font-bold ${s.done || s.active ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>{s.step}</p></div>
                  <span className="text-[8px] text-[#64748B]">{s.date}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E5EAF2]">
            <p className="text-[9px] font-bold text-[#64748B] mb-1">SHIPPING ADDRESS</p>
            <p className="text-[10px] font-bold text-[#0F172A]">Mamadou Diallo</p>
            <p className="text-[9px] text-[#64748B]">123 W 45th St, Apt 4B<br />New York, NY 10036</p>
            <p className="text-[9px] font-bold text-[#64748B] mt-2">TRACKING NUMBER</p>
            <p className="text-[10px] font-bold text-[#0F172A]">1Z999AA10123456784</p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Screen 54: Revenue Analytics (Admin) ──
export function MockupRevenueAnalytics() {
  return (
    <DesktopFrame label="54 · Admin Revenue Analytics — MRR, Churn, LTV" height="h-[500px]">
      <div className="p-5 bg-[#F7F9FC] h-full overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <InfinityMark size={22} color={ORANGE} strokeWidth={2.5} glow={true} />
            <p className="text-sm font-black text-[#0F172A]">Revenue Analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#64748B]">Last 30 days</span>
            <button className="px-3 py-1.5 text-[10px] font-bold text-white rounded-lg" style={{ background: NAVY }}>Export</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 border border-[#E5EAF2]"><p className="text-[8px] font-bold text-[#64748B]">MRR</p><p className="text-lg font-black" style={{ color: NAVY }}>$3,247</p><p className="text-[8px] text-[#22C55E] font-bold">+12% ↑</p></div>
          <div className="bg-white rounded-xl p-3 border border-[#E5EAF2]"><p className="text-[8px] font-bold text-[#64748B]">ACTIVE SUBS</p><p className="text-lg font-black" style={{ color: ORANGE }}>89</p><p className="text-[8px] text-[#22C55E] font-bold">+5 new</p></div>
          <div className="bg-white rounded-xl p-3 border border-[#E5EAF2]"><p className="text-[8px] font-bold text-[#64748B]">CHURN</p><p className="text-lg font-black" style={{ color: '#EF4444' }}>2.1%</p><p className="text-[8px] text-[#64748B] font-bold">-0.3% ↓</p></div>
          <div className="bg-white rounded-xl p-3 border border-[#E5EAF2]"><p className="text-[8px] font-bold text-[#64748B]">LTV</p><p className="text-lg font-black" style={{ color: '#22C55E' }}>$154</p><p className="text-[8px] text-[#64748B] font-bold">avg</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
            <p className="text-[10px] font-black text-[#0F172A] mb-3">Revenue Trend (12 months)</p>
            <div className="flex items-end gap-1.5 h-32">
              {[45, 52, 48, 60, 65, 58, 70, 75, 68, 80, 85, 92].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i >= 10 ? ORANGE : `${NAVY}50` }} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[#E5EAF2]">
            <p className="text-[10px] font-black text-[#0F172A] mb-3">Plan Distribution</p>
            {[
              { plan: 'Professional', count: 52, pct: 58, color: ORANGE },
              { plan: 'Salon', count: 18, pct: 20, color: '#ec4899' },
              { plan: 'Law Firm', count: 12, pct: 13, color: NAVY },
              { plan: 'Free', count: 7, pct: 9, color: MUTED },
            ].map((p) => (
              <div key={p.plan} className="mb-2">
                <div className="flex justify-between text-[9px] font-bold mb-1"><span className="text-[#0F172A]">{p.plan}</span><span style={{ color: p.color }}>{p.count} · {p.pct}%</span></div>
                <div className="h-2 rounded-full bg-[#F7F9FC]"><div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DesktopFrame>
  );
}