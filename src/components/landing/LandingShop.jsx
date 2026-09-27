import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, PackageCheck, ShieldCheck, ShoppingCart, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCTS, COLLECTIONS, LANDING_FLAGSHIP_IDS, isPurchasable } from "@/lib/shopProducts";
import FactoryProductMedia from "@/components/shop/FactoryProductMedia";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";
import { localizeCollection, localizeShopProduct } from "@/lib/shopI18n";

const B = {
  navy: "#0b2149",
  navyDark: "#071A3D",
  orange: "#f97316",
  gold: "#FDBA21",
  slate: "#64748b",
};

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

function ScrollReveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProductCard({ product, language }) {
  const localizedProduct = localizeShopProduct(product, language);
  const collection = localizeCollection(COLLECTIONS.find((c) => c.id === product.collection), language);
  const buy = isPurchasable(product);

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -5 }}
      className="group overflow-hidden rounded-[18px] border border-white/10"
      style={{ background: "#0a0a0a", boxShadow: "0 10px 34px rgba(0,0,0,.28)" }}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#111]">
          <FactoryProductMedia product={product} fit="cover" className="h-full w-full transition-transform duration-300 group-hover:scale-[1.025]" />
          {product.badge && (
            <span className="absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[.11em] text-white" style={{ background: buy ? B.orange : "#64748b" }}>
              {product.badge}
            </span>
          )}
        </div>
      </Link>
      <div className="border-t border-white/10 p-3.5">
        <p className="mb-1 text-[8px] font-black uppercase tracking-[.12em] line-clamp-1" style={{ color: B.orange }}>
          {t(product.flow === "asset_protection" ? "landing_asset_device" : "landing_profile_device",language)} · {collection?.label}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-base font-black text-white">{localizedProduct.name}</h3>
        </Link>
        <p className="mt-1 min-h-[36px] line-clamp-2 text-xs leading-5 text-slate-400">{localizedProduct.tagline}</p>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="max-w-[120px] truncate text-[9px] font-bold uppercase tracking-wider text-slate-500">{localizedProduct.bestFor}</p>
            <p className="text-lg font-black text-white">{buy ? `$${product.price.toFixed(2)}` : t("landing_coming_soon",language)}</p>
          </div>
          <Link
            to={`/product/${product.id}`}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-[10px] font-black text-white"
            style={{ background: B.navy }}
          >
            {t("landing_view_device",language)} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function LandingShop() {
  const { language } = useI18n();
  const navigate = useNavigate();
  const flagshipProducts = LANDING_FLAGSHIP_IDS
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean);
  const metalCard = PRODUCTS.find((p) => p.id === "nfc-metal-card");

  return (
    <section id="shop" className="bg-slate-50 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-black" style={{ color: B.navy }}>
            <ShoppingCart className="h-4 w-4" /> {t("landing_store_title",language)}
          </div>
          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight md:text-5xl" style={{ color: B.navy }}>
            {t("landing_store_heading",language)}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
            {t("landing_store_intro",language)}
          </p>
        </ScrollReveal>

        {metalCard && (
          <ScrollReveal delay={0.08} className="mb-8">
            <div className="overflow-hidden rounded-[24px] border border-white/10" style={{ background: "linear-gradient(145deg,#05070c,#071A3D 55%,#0b2149)" }}>
              <div className="grid items-center gap-5 p-5 md:grid-cols-[1.1fr_.9fr] md:p-6 lg:p-7">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-orange-300">
                    <Sparkles className="h-3.5 w-3.5" /> {t("landing_flagship_hardware",language)}
                  </div>
                  <h3 className="text-2xl font-black text-white md:text-3xl">{localizeShopProduct(metalCard,language).name}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">{localizeShopProduct(metalCard,language).description}</p>
                  <div className="mt-3 grid gap-1.5 text-xs text-white/70 sm:grid-cols-2">
                    {localizeShopProduct(metalCard,language).features.slice(0, 4).map((feature) => (
                      <span key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: B.gold }} /> {feature}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button onClick={() => navigate(`/product/${metalCard.id}`)} className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-black text-white hover:bg-orange-600">
                      {t("landing_view_device",language)} {localizeShopProduct(metalCard,language).name} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <span className="text-lg font-black text-white">${metalCard.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
                  <FactoryProductMedia product={metalCard} fit="cover" className="h-[220px] w-full md:h-[240px]" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-500">{t("landing_featured_collection",language)}</p>
            <h3 className="mt-1 text-2xl font-black" style={{ color: B.navy }}>{t("landing_choose_use",language)}</h3>
            <p className="mt-1 text-sm text-slate-500">{t("landing_choose_use_copy",language)}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/shop")} className="rounded-xl border-slate-300 bg-white font-black" style={{ color: B.navy }}>
            {t("landing_explore_store",language)} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </ScrollReveal>

        <motion.div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
          {flagshipProducts.map((product) => <ProductCard key={product.id} product={product} language={language} />)}
        </motion.div>

        <ScrollReveal delay={0.08} className="mt-10">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: t("landing_secure_payment",language), text: t("landing_secure_payment_copy",language) },
              { icon: PackageCheck, title: t("landing_product_identity",language), text: t("landing_product_identity_copy",language) },
              { icon: Truck, title: t("landing_retail_flow",language), text: t("landing_retail_flow_copy",language) },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <Icon className="h-5 w-5" style={{ color: B.orange }} />
                  <p className="mt-3 font-black" style={{ color: B.navy }}>{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.text}</p>
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12} className="mt-10 text-center">
          <h3 className="text-2xl font-black" style={{ color: B.navy }}>{t("landing_explore_catalog",language)}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500">{t("landing_catalog_copy",language)}</p>
          <Button size="lg" onClick={() => navigate("/shop")} className="mt-5 h-13 rounded-2xl px-8 font-black text-white" style={{ background: B.navy }}>
            {t("landing_shop_nfc_devices",language)} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}