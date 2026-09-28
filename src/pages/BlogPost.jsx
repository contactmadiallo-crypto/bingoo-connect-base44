import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import LandingFooter from "@/components/landing/LandingFooter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/I18nContext";
import { getBlogPost, localizeField } from "@/lib/contentHub";
import { useSEO } from "@/hooks/useSEO";
import PageNotFound from "@/lib/PageNotFound";

export default function BlogPost() {
  const { slug } = useParams();
  const { language } = useI18n();
  const post = getBlogPost(slug);
  const title = post ? localizeField(post.title, language) : "Bingoo Connect";
  const excerpt = post ? localizeField(post.excerpt, language) : "";
  useSEO({
    title: post ? `${title} | Bingoo Connect` : "Article not found | Bingoo Connect",
    description: excerpt,
    url: post ? `https://bingooconnect.com/blog/${post.slug}` : window.location.href,
    type: "website",
    noindex: !post,
    structuredData: post ? {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: excerpt,
      datePublished: post.date,
      author: { "@type": "Organization", name: post.author },
      publisher: { "@type": "Organization", name: "Bingoo Connect" },
      mainEntityOfPage: `https://bingooconnect.com/blog/${post.slug}`
    } : undefined
  });
  if (!post) return <PageNotFound />;

  const body = post.body[language] || post.body.en;
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 md:px-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-black text-[#0b2149]"><ArrowLeft className="h-4 w-4" /> {language === "fr" ? "Blog" : "Blog"}</Link>
          <LanguageSwitcher compact />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#f97316]">{post.category}</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-[#0b2149] md:text-5xl">{title}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span>{post.author}</span><span>{post.date}</span><span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {post.readingTime} min</span>
        </div>
        <p className="mt-7 border-l-4 border-[#f97316] pl-4 text-lg leading-8 text-slate-600">{excerpt}</p>
        <article className="mt-9 space-y-6">
          {body.map((paragraph, index) => <p key={index} className="text-base leading-8 text-slate-700">{paragraph}</p>)}
        </article>
        <div className="mt-10 rounded-2xl bg-[#071A3D] p-6 text-white">
          <h2 className="text-xl font-black">{language === "fr" ? "Transformez votre profil en point de connexion." : "Turn your profile into a real connection point."}</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">{language === "fr" ? "Créez votre profil Bingoo, partagez-le par QR ou NFC et gardez vos informations professionnelles à jour." : "Create your Bingoo profile, share it with QR or NFC, and keep your professional information current."}</p>
          <Link to="/pricing" className="mt-4 inline-flex rounded-xl bg-[#f97316] px-5 py-2.5 text-sm font-black text-white">{language === "fr" ? "Voir les forfaits" : "View plans"}</Link>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
