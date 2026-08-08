import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, PackageCheck, ShieldCheck, ShoppingCart, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCTS, COLLECTIONS, LANDING_FLAGSHIP_IDS, isPurchasable } from "@/lib/shopProducts";
import FactoryProductMedia from "@/components/shop/FactoryProductMedia";

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

function ProductCard({ product }) {
  const collection = COLLECTIONS.find((c) => c.id === product.collection);
  const buy = isPurchasable(product);

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -5 }}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white"
      style={{ boxShadow: "0 10px 34px rgba(11,33,73,.06)" }}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-[230px] overflow-hidden bg-white">
          <FactoryProductMedia product={product} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.025]" />
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-white" style={{ background: buy ? B.orange : "#64748b" }}>
              {product.badge}
            </span>
          )}
        </div>
      </Link>
      <div className="border-t border-slate-100 p-5">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[.14em]" style={{ color: B.orange }}>
          {product.flow === "asset_protection" ? "Asset Device" : "Profile Device"} · {collection?.label}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-black" style={{ color: B.navy }}>{product.name}</h3>
        </Link>
        <p className="mt-1 min-h-[40px] text-sm leading-relaxed text-slate-500">{product.tagline}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{product.bestFor}</p>
            <p className="text-2xl font-black text-slate-950">{buy ? `$${product.price.toFixed(2)}` : "Coming Soon"}</p>
          </div>
          <Link
            to={`/product/${product.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black text-white"
            style={{ background: B.navy }}
          >
            View Device <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function LandingShop() {
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
            <ShoppingCart className="h-4 w-4" /> Bingoo NFC Store
          </div>
          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight md:text-5xl" style={{ color: B.navy }}>
            Real Bingoo hardware for the way you connect.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
            The device you see here is the same SKU you see in the Shop, on its product page, in your cart and through checkout.
          </p>
        </ScrollReveal>

        {metalCard && (
          <ScrollReveal delay={0.08} className="mb-10">
            <div className="overflow-hidden rounded-[32px] border border-white/10" style={{ background: "linear-gradient(145deg,#05070c,#071A3D 55%,#0b2149)" }}>
              <div className="grid items-center gap-8 p-6 md:grid-cols-[.95fr_1.05fr] md:p-10 lg:p-12">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-orange-300">
                    <Sparkles className="h-3.5 w-3.5" /> Flagship hardware
                  </div>
                  <h3 className="text-3xl font-black text-white md:text-4xl">{metalCard.name}</h3>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-white/60">{metalCard.description}</p>
                  <div className="mt-5 grid gap-2 text-sm text-white/70 sm:grid-cols-2">
                    {metalCard.features.slice(0, 4).map((feature) => (
                      <span key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: B.gold }} /> {feature}
                      </span>
                    ))}
                  </div>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button onClick={() => navigate(`/product/${metalCard.id}`)} className="h-12 rounded-xl bg-orange-500 px-6 font-black text-white hover:bg-orange-600">
                      View {metalCard.name} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <span className="text-xl font-black text-white">${metalCard.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white">
                  <FactoryProductMedia product={metalCard} className="h-[300px] w-full md:h-[360px]" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-orange-500">Featured collection</p>
            <h3 className="mt-1 text-2xl font-black" style={{ color: B.navy }}>Choose by real-world use.</h3>
            <p className="mt-1 text-sm text-slate-500">Professional sharing, business touchpoints and asset recovery — one Bingoo ecosystem.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/shop")} className="rounded-xl border-slate-300 bg-white font-black" style={{ color: B.navy }}>
            Explore Full Store <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </ScrollReveal>

        <motion.div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
          {flagshipProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </motion.div>

        <ScrollReveal delay={0.08} className="mt-10">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Secure payment", text: "Existing Stripe Checkout remains the payment authority." },
              { icon: PackageCheck, title: "One product identity", text: "The same SKU and product media follow the customer through the buying journey." },
              { icon: Truck, title: "Retail-ready flow", text: "Customers can buy individual devices; shipping remains server-authoritative." },
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
          <h3 className="text-2xl font-black" style={{ color: B.navy }}>Explore the full Bingoo hardware catalog.</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500">Compare device categories, product details and availability in the full Store.</p>
          <Button size="lg" onClick={() => navigate("/shop")} className="mt-5 h-13 rounded-2xl px-8 font-black text-white" style={{ background: B.navy }}>
            Shop Bingoo NFC Devices <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}
