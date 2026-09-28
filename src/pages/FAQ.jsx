import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import LandingFooter from "@/components/landing/LandingFooter";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/I18nContext";
import { FAQ_ITEMS, localizeField } from "@/lib/contentHub";
import { useSEO } from "@/hooks/useSEO";

export default function FAQ() {
  const { language } = useI18n();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter((item) => [localizeField(item.question, language), localizeField(item.answer, language), item.category].join(" ").toLowerCase().includes(q));
  }, [query, language]);

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: localizeField(item.question, language),
      acceptedAnswer: { "@type": "Answer", text: localizeField(item.answer, language) }
    }))
  };

  useSEO({
    title: language === "fr" ? "FAQ Bingoo Connect | Tarifs, NFC, QR, livraison et confidentialité" : "Bingoo Connect FAQ | Pricing, NFC, QR, Shipping & Privacy",
    description: language === "fr" ? "Réponses rapides sur les forfaits Bingoo, la compatibilité NFC, le Mode Perdu, les remboursements, la livraison et la suppression de compte." : "Quick answers about Bingoo plans, NFC compatibility, Lost Mode, refunds, shipping, and account deletion.",
    url: "https://bingooconnect.com/faq",
    type: "website",
    structuredData: schema,
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 md:px-6">
          <Link to="/" className="text-lg font-black text-[#0b2149]">∞ Bingoo Connect</Link>
          <Link to="/blog" className="ml-auto hidden text-sm font-bold text-slate-600 hover:text-[#f97316] md:block">Blog</Link>
          <LanguageSwitcher compact />
        </div>
      </header>

      <main>
        <section className="bg-[#071A3D] px-4 py-14 text-white md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-black uppercase tracking-[.18em] text-orange-300">BINGOO SUPPORT</p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">{language === "fr" ? "Questions fréquentes" : "Frequently asked questions"}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-white/65">{language === "fr" ? "Tarifs, NFC, QR, Mode Perdu, livraison, remboursements et gestion du compte." : "Pricing, NFC, QR, Lost Mode, shipping, refunds, and account management."}</p>
            <div className="relative mx-auto mt-7 max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={language === "fr" ? "Rechercher une question..." : "Search questions..."} className="h-12 bg-white pl-10 text-slate-900" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 md:px-6">
          {filtered.length ? (
            <Accordion type="single" collapsible className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-5">
              {filtered.map((item, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-base font-black text-[#0b2149]">{localizeField(item.question, language)}</AccordionTrigger>
                  <AccordionContent className="pb-5 leading-7 text-slate-600">{localizeField(item.answer, language)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">{language === "fr" ? "Aucune question ne correspond à cette recherche." : "No questions match your search."}</div>
          )}
          <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-center">
            <p className="font-black text-[#0b2149]">{language === "fr" ? "Besoin d’aide supplémentaire ?" : "Still need help?"}</p>
            <Link to="/contact-support" className="mt-3 inline-flex rounded-xl bg-[#0b2149] px-5 py-2.5 text-sm font-black text-white">{language === "fr" ? "Contacter l’assistance" : "Contact support"}</Link>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
