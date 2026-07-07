import React from 'react';
import { PhoneFrame, DesktopFrame, Badge } from '@/components/mockups/MockupFrame';
import { BingooLogo, BingooAppIcon, InfinityMark } from '@/components/mockups/brand/InfinityMark';
import { Icon } from '@/components/mockups/BingooIcons';

const NAVY = '#0b2149', NAVY_DEEP = '#071A3D', ORANGE = '#f97316', BG = '#F7F9FC', MUTED = '#64748B', INK = '#0F172A';

// Bilingual content samples — English | French
const TRANSLATIONS = {
  // Onboarding
  welcome: { en: 'Welcome Back', fr: 'Bon Retour' },
  signIn: { en: 'Sign in to your Bingoo account', fr: 'Connectez-vous à votre compte Bingoo' },
  email: { en: 'Email address', fr: 'Adresse e-mail' },
  password: { en: 'Password', fr: 'Mot de passe' },
  signInBtn: { en: 'Sign In', fr: 'Se Connecter' },
  noAccount: { en: "Don't have an account?", fr: "Vous n'avez pas de compte?" },
  signUp: { en: 'Sign up free', fr: "S'inscrire gratuitement" },
  // Dashboard
  goodMorning: { en: 'Good morning', fr: 'Bonjour' },
  yourTools: { en: 'Your Tools', fr: 'Vos Outils' },
  // Profile
  bookConsult: { en: 'Book Consultation', fr: 'Réserver une Consultation' },
  call: { en: 'Call', fr: 'Appeler' },
  emailBtn: { en: 'Email', fr: 'E-mail' },
  website: { en: 'Website', fr: 'Site Web' },
  // Shop
  addToCart: { en: 'Add to Cart', fr: 'Ajouter au Panier' },
  checkout: { en: 'Secure Checkout', fr: 'Paiement Sécurisé' },
  // Plans
  choosePlan: { en: 'Choose Plan', fr: 'Choisir le Forfait' },
  upgrade: { en: 'Upgrade to Unlock', fr: 'Améliorer pour Déverrouiller' },
  // Empty states
  noLeads: { en: 'No leads yet', fr: 'Aucun prospect pour le moment' },
  noLeadsDesc: { en: 'Leads will appear here when visitors submit forms', fr: 'Les prospects apparaîtront ici lorsque les visiteurs soumettront des formulaires' },
  // Errors
  somethingWrong: { en: 'Something went wrong', fr: "Une erreur s'est produite" },
  tryAgain: { en: 'Please try again', fr: 'Veuillez réessayer' },
  // Toasts
  profileSaved: { en: 'Profile saved successfully!', fr: 'Profil enregistré avec succès !' },
  leadCreated: { en: 'New lead captured!', fr: 'Nouveau prospect capturé !' },
  // Admin
  totalUsers: { en: 'Total Users', fr: 'Utilisateurs Totaux' },
  revenue: { en: 'Revenue (MTD)', fr: "Revenus (MTD)" },
};

function BilingualPair({ label, en, fr }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-[#E5EAF2] last:border-0">
      <span className="text-[9px] font-bold text-[#64748B] w-20">{label}</span>
      <div className="flex-1 flex gap-2">
        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#3b82f6]10 text-[#3b82f6] flex items-center gap-1"><span className="text-[7px]">🇬🇧</span>{en}</span>
        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#ec4899]10 text-[#ec4899] flex items-center gap-1"><span className="text-[7px]">🇫🇷</span>{fr}</span>
      </div>
    </div>
  );
}

// ── Login Screen (Bilingual) ──
function BilingualLogin({ lang = 'en' }) {
  const t = (key) => TRANSLATIONS[key]?.[lang] || key;
  return (
    <PhoneFrame label={`OAuth / Login — ${lang === 'en' ? 'English' : 'Français'}`}>
      <div className="min-h-full flex flex-col items-center justify-center px-6 pb-8" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
        <div className="mb-6 text-center">
          <BingooAppIcon size={56} glow={true} />
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <span className="font-black text-lg text-white">Bing</span>
            <InfinityMark size={18} color={ORANGE} strokeWidth={2.5} />
          </div>
        </div>
        <div className="w-full max-w-[240px] bg-white rounded-2xl p-4 shadow-2xl">
          <p className="text-xs font-black text-[#0F172A] mb-1">{t('welcome')}</p>
          <p className="text-[9px] text-[#64748B] mb-3">{t('signIn')}</p>
          <div className="space-y-2 mb-3">
            <div className="px-3 py-2 bg-[#F7F9FC] rounded-xl text-[9px] font-medium text-[#cbd5e1]">{t('email')}</div>
            <div className="px-3 py-2 bg-[#F7F9FC] rounded-xl text-[9px] font-medium text-[#cbd5e1]">{t('password')}</div>
          </div>
          <button className="w-full py-2.5 text-white text-xs font-black rounded-xl shadow-lg" style={{ background: ORANGE }}>{t('signInBtn')}</button>
        </div>
        <p className="text-white/30 text-[9px] mt-4">{t('noAccount')} <span className="font-bold" style={{ color: ORANGE }}>{t('signUp')}</span></p>
        {/* Language Toggle */}
        <div className="flex items-center gap-1 mt-4 px-2 py-1 bg-white/10 rounded-lg">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${lang === 'en' ? 'bg-white/20 text-white' : 'text-white/40'}`}>EN</span>
          <span className="text-white/20">|</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${lang === 'fr' ? 'bg-white/20 text-white' : 'text-white/40'}`}>FR</span>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Dashboard (Bilingual) ──
function BilingualDashboard({ lang = 'fr' }) {
  const t = (key) => TRANSLATIONS[key]?.[lang] || key;
  return (
    <PhoneFrame label={`Dashboard — ${lang === 'en' ? 'English' : 'Français'}`}>
      <div className="min-h-full pb-8" style={{ background: BG }}>
        <div className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(160deg, ${NAVY}, ${NAVY_DEEP})` }}>
          <BingooLogo size={28} light showText={false} />
          <p className="text-white/40 text-[10px] font-medium mt-3">{t('goodMorning')}</p>
          <p className="text-white font-black text-base">Mamadou Diallo</p>
        </div>
        <div className="px-5 mt-4">
          <p className="text-xs font-black text-[#0F172A] mb-3">{t('yourTools')}</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: 'share', label: lang === 'fr' ? 'Partager' : 'Share', color: ORANGE },
              { icon: 'nfc', label: lang === 'fr' ? 'Appareils' : 'Devices', color: NAVY },
              { icon: 'chart', label: lang === 'fr' ? 'Analyses' : 'Analytics', color: '#22C55E' },
            ].map((a) => (
              <div key={a.label} className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1.5 border border-[#E5EAF2]">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${a.color}15` }}><Icon name={a.icon} size={16} color={a.color} /></div>
                <span className="text-[9px] font-bold text-[#0F172A]">{a.label}</span>
              </div>
            ))}
          </div>
          {/* Empty State */}
          <div className="mt-4 bg-white rounded-2xl p-5 border border-[#E5EAF2] text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center" style={{ background: `${MUTED}10` }}><Icon name="message" size={20} color={MUTED} /></div>
            <p className="text-xs font-black text-[#0F172A]">{t('noLeads')}</p>
            <p className="text-[9px] text-[#64748B] mt-1">{t('noLeadsDesc')}</p>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// ── Toast Notification (Bilingual) ──
function BilingualToast({ lang = 'fr' }) {
  const t = (key) => TRANSLATIONS[key]?.[lang] || key;
  return (
    <PhoneFrame label={`Toast Notification — ${lang === 'en' ? 'English' : 'Français'}`}>
      <div className="min-h-full flex flex-col items-center justify-center px-6" style={{ background: BG }}>
        {/* Success Toast */}
        <div className="w-full max-w-[240px] bg-white rounded-2xl p-3 border border-[#22C55E]/20 shadow-xl mb-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#22C55E' }}><Icon name="check" size={16} color="#FFFFFF" /></div>
          <div><p className="text-[10px] font-black text-[#0F172A]">{t('profileSaved')}</p></div>
        </div>
        {/* Lead Toast */}
        <div className="w-full max-w-[240px] bg-white rounded-2xl p-3 border border-[#E5EAF2] shadow-xl mb-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ORANGE }}><Icon name="message" size={16} color="#FFFFFF" /></div>
          <div><p className="text-[10px] font-black text-[#0F172A]">{t('leadCreated')}</p></div>
        </div>
        {/* Error Toast */}
        <div className="w-full max-w-[240px] bg-white rounded-2xl p-3 border border-[#EF4444]/20 shadow-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#EF4444' }}><Icon name="alert" size={16} color="#FFFFFF" /></div>
          <div><p className="text-[10px] font-black text-[#0F172A]">{t('somethingWrong')}</p><p className="text-[8px] text-[#64748B]">{t('tryAgain')}</p></div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export default function MockupTranslationUX() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3" style={{ background: `${NAVY}08` }}>
          <span className="text-base">🇬🇧</span><InfinityMark size={14} color={ORANGE} /><span className="text-base">🇫🇷</span>
          <span className="text-xs font-black tracking-wider" style={{ color: NAVY }}>BILINGUAL — ENGLISH / FRENCH</span>
        </div>
        <p className="text-xs font-black text-[#0F172A] mb-1">Full French Translation Coverage</p>
        <p className="text-[10px] text-[#64748B] max-w-lg mx-auto">Every screen, button, toast, error, and empty state must be fully translated — not partially</p>
      </div>

      {/* Translation Coverage Matrix */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="globe" size={16} color={ORANGE} />
          <p className="text-xs font-black text-[#0F172A]">Translation Coverage Matrix</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { area: 'Homepage', pct: 100, color: '#22C55E' },
            { area: 'OAuth / Login', pct: 100, color: '#22C55E' },
            { area: 'Onboarding', pct: 100, color: '#22C55E' },
            { area: 'Dashboard', pct: 100, color: '#22C55E' },
            { area: 'Profile Studio', pct: 95, color: ORANGE },
            { area: 'Public Profiles', pct: 100, color: '#22C55E' },
            { area: 'NFC Activation', pct: 100, color: '#22C55E' },
            { area: 'Shop', pct: 100, color: '#22C55E' },
            { area: 'Plans', pct: 100, color: '#22C55E' },
            { area: 'Upgrade Prompts', pct: 100, color: '#22C55E' },
            { area: 'Forms & Buttons', pct: 100, color: '#22C55E' },
            { area: 'Toasts & Errors', pct: 100, color: '#22C55E' },
            { area: 'Empty States', pct: 100, color: '#22C55E' },
            { area: 'Admin Labels', pct: 85, color: ORANGE },
            { area: 'Email Templates', pct: 80, color: ORANGE },
          ].map((c) => (
            <div key={c.area} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `${c.color}15` }}>
                {c.pct === 100 ? <Icon name="check" size={12} color={c.color} /> : <Icon name="clock" size={12} color={c.color} />}
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-bold text-[#0F172A]">{c.area}</p>
                <div className="h-1 bg-[#F7F9FC] rounded-full overflow-hidden mt-0.5">
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                </div>
              </div>
              <span className="text-[8px] font-bold" style={{ color: c.color }}>{c.pct}%</span>
            </div>
          ))}
        </div>
        {/* Audit Note */}
        <div className="rounded-xl p-3 border" style={{ background: '#FFF0E5', borderColor: `${ORANGE}30` }}>
          <div className="flex items-start gap-2">
            <Icon name="alert" size={14} color={ORANGE} />
            <div>
              <p className="text-[10px] font-black text-[#0F172A]">Translation Audit Note</p>
              <p className="text-[9px] text-[#64748B]">3 areas need completion: Profile Studio (5% remaining — some design labels), Admin Labels (15% — audit log entries), Email Templates (20% — notification emails). All user-facing UI is 100% translated. Untranslated strings are internal/admin-only.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bilingual Screen Examples */}
      <div className="flex flex-wrap justify-center gap-6">
        <BilingualLogin lang="en" />
        <BilingualLogin lang="fr" />
        <BilingualDashboard lang="fr" />
        <BilingualToast lang="fr" />
      </div>

      {/* Translation Dictionary Sample */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5EAF2] max-w-2xl mx-auto">
        <p className="text-xs font-black text-[#0F172A] mb-3">Translation Dictionary Sample</p>
        <BilingualPair label="Welcome" en="Welcome Back" fr="Bon Retour" />
        <BilingualPair label="Sign In" en="Sign In" fr="Se Connecter" />
        <BilingualPair label="Book" en="Book Consultation" fr="Réserver une Consultation" />
        <BilingualPair label="Cart" en="Add to Cart" fr="Ajouter au Panier" />
        <BilingualPair label="Upgrade" en="Upgrade to Unlock" fr="Améliorer pour Déverrouiller" />
        <BilingualPair label="No Leads" en="No leads yet" fr="Aucun prospect pour le moment" />
        <BilingualPair label="Error" en="Something went wrong" fr="Une erreur s'est produite" />
        <BilingualPair label="Success" en="Profile saved!" fr="Profil enregistré !" />
      </div>
    </div>
  );
}