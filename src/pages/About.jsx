import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const B = { navy: "#0b2149", orange: "#f97316", gold: "#FDBA21" };

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b"
        style={{ background: 'rgba(11,33,73,0.97)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1 text-white/60 hover:text-white transition-colors font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="h-5 w-px bg-white/10 mx-1" />
          <span className="text-white font-bold">About Bingoo Connect</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-black mb-6" style={{ color: B.navy }}>
          About Bingoo Connect
        </h1>

        <div className="prose prose-lg max-w-none text-slate-600 space-y-6">
          <p>
            Bingoo Connect is a modern digital identity platform that transforms the way professionals,
            businesses, and entrepreneurs share their contact information and connect with the world.
            By combining NFC (Near Field Communication) smart cards with beautiful, customizable digital
            profiles, Bingoo Connect replaces outdated paper business cards with a smarter, more powerful solution.
          </p>

          <p>
            Whether you're a freelancer, a salon owner, a restaurant operator, a law firm, or a corporate
            team — Bingoo Connect offers tailored plans designed specifically for your industry. Our platform
            enables you to create a stunning digital business card that can be shared instantly via a tap of
            an NFC card, a QR code, or a personal link.
          </p>

          <p>
            With Bingoo Connect, you get more than just a digital business card. You get a full suite of
            business tools: appointment booking, a lead capture CRM, analytics dashboards, portfolio
            showcases, payment links, and seamless integrations with WhatsApp, Instagram, and other
            social platforms — all in one place.
          </p>

          <p>
            Our platform is built for people who value their time and their professional image. We believe
            first impressions matter, and a Bingoo Connect profile ensures yours is always up-to-date,
            interactive, and memorable. From solo professionals to enterprise teams managing dozens of
            employee profiles, Bingoo Connect scales with your needs.
          </p>

          <p>
            Bingoo Connect is developed and maintained by a passionate team dedicated to bridging the gap
            between the physical and digital worlds through innovative NFC technology. Our mission is to
            help every professional make a lasting impression and turn every interaction into an opportunity.
          </p>

          <div className="flex gap-4 mt-10">
            <Link to="/plans"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white"
              style={{ background: B.orange }}>
              View Plans
            </Link>
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold border-2"
              style={{ color: B.navy, borderColor: B.navy }}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <footer className="border-t mt-16 py-8 text-center text-sm text-slate-400">
        <div className="flex justify-center gap-6">
          <Link to="/" className="hover:text-slate-600 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-slate-600 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-slate-600 transition-colors">Contact</Link>
          <Link to="/plans" className="hover:text-slate-600 transition-colors">Pricing</Link>
        </div>
        <p className="mt-4">© {new Date().getFullYear()} Bingoo Connect. All rights reserved.</p>
      </footer>
    </div>
  );
}