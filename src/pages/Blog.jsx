import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import LandingFooter from "@/components/landing/LandingFooter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/I18nContext";
import { BLOG_POSTS, localizeField } from "@/lib/contentHub";
import { useSEO } from "@/hooks/useSEO";

export default function Blog() {
  const { language } = useI18n();
  useSEO({
    title: language === "fr" ? "Blog Bingoo Connect | NFC, identité digitale et cartes de visite" : "Bingoo Connect Blog | NFC, Digital Identity & Business Cards",
    description: language === "fr" ? "Guides pratiques sur les cartes de visite digitales, le NFC, le QR, la protection d’objets et l’identité professionnelle." : "Practical guides about digital business cards, NFC, QR sharing, asset protection, and professional digital identity.",
    url: "https://bingooconnect.com/blog",
    type: "website",
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
          <Link to="/" className="text-lg font-black text-[#0b2149]">∞ Bingoo Connect</Link>
          <nav className="ml-auto hidden items-center gap-5 text-sm font-bold text-slate-600 md:flex">
            <Link to="/pricing" className="hover:text-[#f97316]">{language === "fr" ? "Tarifs" : "Pricing"}</Link>
            <Link to="/shop" className="hover:text-[#f97316]">{language === "fr" ? "Boutique" : "Shop"}</Link>
            <Link to="/faq" className="hover:text-[#f97316]">FAQ</Link>
          </nav>
          <LanguageSwitcher compact />
        </div>
      </header>

      <main>
        <section className="bg-[#071A3D] px-4 py-14 text-white md:px-6 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-black uppercase tracking-[.16em] text-orange-300">
              <BookOpen className="h-4 w-4" /> {language === "fr" ? "Ressources Bingoo" : "Bingoo Resources"}
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
              {language === "fr" ? "Identité digitale, NFC et connexions utiles." : "Digital identity, NFC, and connections that keep working."}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              {language === "fr" ? "Des guides simples pour comprendre les cartes de visite digitales, le partage NFC et QR, la protection d’objets et les outils professionnels Bingoo." : "Simple guides for understanding digital business cards, NFC and QR sharing, asset protection, and Bingoo’s professional tools."}
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 md:grid-cols-2 md:px-6 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="flex min-h-[280px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[.14em] text-[#f97316]">{post.category}</p>
              <h2 className="mt-3 text-xl font-black leading-tight text-[#0b2149]">{localizeField(post.title, language)}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{localizeField(post.excerpt, language)}</p>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="flex items-center gap-1.5 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" /> {post.readingTime} min</span>
                <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-sm font-black text-[#0b2149] hover:text-[#f97316]">
                  {language === "fr" ? "Lire" : "Read"} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
