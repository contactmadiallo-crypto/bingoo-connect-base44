import { motion } from 'framer-motion';
import { UserPlus, Link2, Share2, BarChart3, ShieldCheck, Sparkles, ArrowRight, QrCode, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';

const B = {
  navy: '#0b2149',
  navyDark: '#071A3D',
  navyLight: '#13284f',
  orange: '#f97316',
  gold: '#FDBA21',
};

function ScrollReveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Each step teaches a current, shipped capability — no roadmap or unreleased features.
const steps = [
  {
    icon: <UserPlus className="w-5 h-5" />,
    title: 'Create your profile',
    desc: 'Sign up free, pick a layout, and add your name, title, photo, and bio. Your profile is live instantly at a clean link.',
    accent: B.orange,
  },
  {
    icon: <Link2 className="w-5 h-5" />,
    title: 'Add your links & contact',
    desc: 'Connect social links, phone, email, and WhatsApp. Add payment links (CashApp, Wave, Orange Money, and more) and turn on appointment booking.',
    accent: B.navy,
  },
  {
    icon: <Share2 className="w-5 h-5" />,
    title: 'Share with QR or NFC',
    desc: 'Download your profile QR for flyers and cards, or tap a Bingoo NFC device to share your full profile in one tap — no app needed for the other person.',
    accent: B.orange,
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Capture leads & views',
    desc: 'Every tap, scan, and link click is tracked in real time. Visitor inquiries become structured leads you manage in your CRM dashboard.',
    accent: B.gold,
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Protect your assets',
    desc: 'Add an asset (keys, luggage, a pet), turn on lost mode, and print its QR. A finder scans it and reaches you safely — your private details stay hidden.',
    accent: B.orange,
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Upgrade when ready',
    desc: 'Unlock NFC devices, advanced analytics, business tools, team management, and the Design Studio as you grow.',
    accent: B.navy,
  },
];

export default function HowBingooWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 md:px-6" style={{ background: '#f8fafc' }}>
      <div className="max-w-5xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
            style={{ background: B.orange + '15', color: B.orange, border: `1px solid ${B.orange}30` }}>
            How Bingoo works
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4" style={{ color: B.navy }}>
            Get started in minutes
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Everything you need to share your professional identity, capture connections, and protect what matters — built into one platform.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <ScrollReveal key={s.title} delay={(i % 3) * 0.08}>
              <div className="relative h-full rounded-2xl p-6 border transition-all hover:-translate-y-1 bg-white"
                style={{ borderColor: '#e2e8f0' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: s.accent + '15', color: s.accent }}>
                    {s.icon}
                  </div>
                  <span className="text-4xl font-black" style={{ color: s.accent + '22' }}>{i + 1}</span>
                </div>
                <h3 className="font-black text-base mb-2" style={{ color: B.navy }}>{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Quick reference: QR vs NFC */}
        <ScrollReveal delay={0.1} className="mt-8">
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            style={{ background: `linear-gradient(135deg, ${B.navy} 0%, ${B.navyLight} 100%)` }}>
            <div className="flex items-center gap-3 text-white">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm">QR sharing is free for everyone</p>
                <p className="text-white/60 text-xs">Print it anywhere — no NFC device needed.</p>
              </div>
            </div>
            <div className="hidden sm:block h-12 w-px bg-white/10" />
            <div className="flex items-center gap-3 text-white">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.25)' }}>
                <Wifi className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="font-black text-sm">NFC makes it instant</p>
                <p className="text-white/60 text-xs">One tap shares everything — add an NFC device from the shop.</p>
              </div>
            </div>
            <div className="sm:ml-auto flex-shrink-0">
              <Button onClick={() => window.location.href = '/bingoo'}
                className="font-black text-sm w-full sm:w-auto" style={{ background: B.orange, color: '#fff', border: 'none' }}>
                Create your profile <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}