import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Smartphone, BarChart3, Users, Star, Zap } from "lucide-react";

const features = [
  { icon: "📇", title: "Digital Business Card", desc: "Share your full profile with one tap — no paper, no printing." },
  { icon: "📊", title: "Real-Time Analytics", desc: "See every profile view, every click, every lead — in real time." },
  { icon: "💬", title: "Instant WhatsApp", desc: "One button. Customer lands in your WhatsApp chat immediately." },
  { icon: "📅", title: "Save Contact", desc: "Visitors download your contact card directly to their phone." },
  { icon: "💼", title: "Multi-Profile Teams", desc: "One dashboard for your entire team of 50 employees." },
  { icon: "🌍", title: "Built for Africa", desc: "Designed for Senegal, Mali, Côte d'Ivoire, Ghana, and beyond." },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    desc: "Get started today",
    features: ["1 profile", "Basic links", "Basic analytics", "Bingoo branding"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/month",
    desc: "For professionals",
    features: ["Unlimited links", "Full analytics", "Custom colors", "Contact collection", "No Bingoo branding"],
    highlight: true,
  },
  {
    name: "Business",
    price: "$9.99",
    period: "/month",
    desc: "For teams",
    features: ["Team accounts (up to 50)", "Lead capture CRM", "Booking system", "Priority support", "Custom domain"],
    highlight: false,
  },
];

const useCases = [
  { emoji: "🏠", role: "Real Estate Agent", value: "Share listings + book viewings" },
  { emoji: "⚖️", role: "Lawyer", value: "Professional profile + consultations" },
  { emoji: "🍽️", role: "Restaurant", value: "Digital menu + table orders" },
  { emoji: "💇", role: "Barber / Salon", value: "Booking + portfolio" },
  { emoji: "📱", role: "Influencer", value: "All links + audience tracking" },
  { emoji: "🏥", role: "Doctor / Clinic", value: "Appointments + patient info" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-lg">B</span>
            </div>
            <span className="text-xl font-black text-slate-900">Bingoo<span className="text-blue-600">Connect</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#use-cases" className="hover:text-blue-600 transition-colors">Use Cases</a>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:border-blue-300">Sign In</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-24 px-6">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="max-w-6xl mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur hover:bg-white/20">
              🌍 Africa's #1 NFC Digital Identity Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
              One Tap.<br />
              Your Entire<br />
              <span className="text-blue-200">Business World.</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto leading-relaxed">
              The smart NFC card that opens your digital profile — with analytics, leads, bookings, and everything you need to grow in Africa.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-lg px-8 py-6 rounded-2xl shadow-xl">
                  Create Free Profile <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/p/demo">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-2xl">
                  See Live Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="mt-20 flex justify-center">
            <div className="relative">
              <div className="w-72 bg-white rounded-[2.5rem] p-2 shadow-2xl shadow-blue-900/50">
                <div className="bg-slate-900 rounded-[2rem] overflow-hidden">
                  <div className="h-36 bg-gradient-to-br from-blue-500 to-blue-700 relative">
                    <div className="absolute inset-0 flex items-end justify-center pb-0">
                      <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl translate-y-10">
                        👤
                      </div>
                    </div>
                  </div>
                  <div className="bg-white pt-12 pb-6 px-5">
                    <h3 className="text-center font-black text-slate-900 text-lg">Amadou Diallo</h3>
                    <p className="text-center text-blue-600 text-sm font-medium">Real Estate Agent</p>
                    <p className="text-center text-slate-400 text-xs mb-5">Agence Immobilière Dakar</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {["💬 WhatsApp", "📞 Call", "📧 Email"].map(b => (
                        <div key={b} className="bg-blue-50 rounded-xl py-2 text-center text-xs font-semibold text-blue-700">{b}</div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {["🏠 View Listings", "📅 Book Meeting", "📍 Find Location"].map(b => (
                        <div key={b} className="bg-slate-50 rounded-xl py-2 px-3 text-sm text-slate-700 font-medium text-center">{b}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* NFC card below phone */}
              <div className="mt-4 mx-auto w-48 h-28 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl shadow-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 bg-white/10 rounded-full border-2 border-white/30 mx-auto mb-1 flex items-center justify-center">
                    <span className="text-white text-xl">📶</span>
                  </div>
                  <span className="text-white/70 text-xs font-medium">NFC Card · $20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-slate-900 text-white py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[["10,000+", "Profiles Created"], ["5 Countries", "Across Africa"], ["$20", "NFC Card (one-time)"], ["$4.99/mo", "Starting Plan"]].map(([val, label]) => (
            <div key={label}>
              <p className="text-3xl font-black text-blue-400">{val}</p>
              <p className="text-slate-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Everything your card opens</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">The NFC card is $20. The platform is what creates the recurring value.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100">Who uses Bingoo?</Badge>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Built for every professional</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {useCases.map(u => (
              <div key={u.role} className="flex items-center gap-4 bg-slate-50 rounded-2xl p-5 hover:bg-blue-50 transition-colors border border-slate-100 hover:border-blue-100">
                <span className="text-3xl">{u.emoji}</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{u.role}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{u.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100">Pricing</Badge>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500 text-lg">NFC card sold separately for $20 one-time payment.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(p => (
              <div key={p.name} className={`rounded-2xl p-8 border-2 transition-all ${p.highlight ? "border-blue-500 bg-blue-600 text-white shadow-2xl shadow-blue-200 scale-105" : "border-slate-200 bg-white hover:border-blue-200"}`}>
                {p.highlight && <Badge className="mb-3 bg-white text-blue-600 border-0">Most Popular</Badge>}
                <p className={`text-sm font-medium mb-1 ${p.highlight ? "text-blue-100" : "text-slate-500"}`}>{p.desc}</p>
                <h3 className={`font-black text-2xl mb-1 ${p.highlight ? "text-white" : "text-slate-900"}`}>{p.name}</h3>
                <div className="my-4">
                  <span className={`text-4xl font-black ${p.highlight ? "text-white" : "text-slate-900"}`}>{p.price}</span>
                  <span className={p.highlight ? "text-blue-200" : "text-slate-400"}>{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${p.highlight ? "text-blue-100" : "text-slate-600"}`}>
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${p.highlight ? "text-blue-200" : "text-blue-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/dashboard">
                  <Button className={`w-full font-bold ${p.highlight ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                    {p.name === "Free" ? "Get Started Free" : `Start ${p.name}`}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Ready to grow your business?</h2>
          <p className="text-blue-100 text-lg mb-10">Join thousands of professionals across Africa using Bingoo Connect.</p>
          <Link to="/dashboard">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-lg px-10 py-6 rounded-2xl shadow-xl">
              Create Your Profile Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">B</div>
            <span className="text-white font-bold">BingooConnect</span>
            <span>— Africa's Digital Identity Platform</span>
          </div>
          <p>© 2026 Bingoo Connect · bingoo.africa</p>
        </div>
      </footer>
    </div>
  );
}