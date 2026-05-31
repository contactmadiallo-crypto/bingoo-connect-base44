import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, BarChart3, Link as LinkIcon, Star, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: "📇", title: "Digital Business Card", desc: "One tap. Your full profile appears instantly." },
  { icon: "📊", title: "Real-Time Analytics", desc: "See every tap, every click, every lead." },
  { icon: "🔗", title: "All Your Links", desc: "WhatsApp, Instagram, website — all in one place." },
  { icon: "📅", title: "Appointment Booking", desc: "Clients book directly from your card." },
  { icon: "💼", title: "Team Accounts", desc: "Manage 50 employees from one dashboard." },
  { icon: "🍽️", title: "Digital Menus", desc: "Update prices and photos without reprinting." },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    features: ["1 profile", "5 links", "Basic analytics"],
    color: "border-slate-200",
    btn: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/month",
    features: ["Unlimited links", "Full analytics", "Custom colors & logo", "Contact collection"],
    color: "border-indigo-500",
    btn: "Start Pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "$9.99",
    period: "/month",
    features: ["Team accounts", "CRM integration", "Booking system", "Priority support"],
    color: "border-purple-500",
    btn: "Go Business",
    highlight: false,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
          <span className="text-xl font-bold text-slate-900">Bingoo</span>
          <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-200">Africa</Badge>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Get Your Card</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <Badge className="mb-6 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50">
          🌍 Africa's #1 NFC Digital Identity Platform
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
          One tap.<br />
          <span className="text-indigo-600">Your entire world.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          The NFC card that opens your digital profile — with analytics, links, bookings, and everything you need to grow.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/dashboard">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6 rounded-2xl">
              Start for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/p/demo">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-2xl">
              See a Live Profile
            </Button>
          </Link>
        </div>

        {/* Mock phone */}
        <div className="mt-20 flex justify-center">
          <div className="relative w-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-1 shadow-2xl shadow-indigo-300">
            <div className="bg-white rounded-[22px] overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600" />
              <div className="px-4 pb-6">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-white -mt-8 mx-auto overflow-hidden shadow-lg flex items-center justify-center text-2xl">
                  👤
                </div>
                <h3 className="text-center font-bold text-slate-900 mt-2">Amadou Diallo</h3>
                <p className="text-center text-xs text-slate-500 mb-4">Real Estate Agent · Dakar</p>
                <div className="space-y-2">
                  {["📞 Call", "💬 WhatsApp", "🏠 Listings", "📅 Book Meeting"].map(l => (
                    <div key={l} className="bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 text-center">{l}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-center text-slate-900 mb-4">Everything your card opens</h2>
          <p className="text-center text-slate-600 mb-12">The card is $20. The platform makes the difference.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center text-slate-900 mb-4">Simple pricing</h2>
          <p className="text-center text-slate-600 mb-12">NFC card sold separately for $20 one-time.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(p => (
              <div key={p.name} className={`rounded-2xl border-2 p-8 ${p.color} ${p.highlight ? "bg-indigo-50 shadow-lg shadow-indigo-100" : "bg-white"}`}>
                {p.highlight && <Badge className="mb-3 bg-indigo-600 text-white">Most Popular</Badge>}
                <h3 className="font-black text-2xl text-slate-900">{p.name}</h3>
                <div className="my-4">
                  <span className="text-4xl font-black text-slate-900">{p.price}</span>
                  <span className="text-slate-500">{p.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/dashboard">
                  <Button className={`w-full ${p.highlight ? "bg-indigo-600 hover:bg-indigo-700" : ""}`} variant={p.highlight ? "default" : "outline"}>
                    {p.btn}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-xs">B</div>
          <span className="font-bold text-slate-700">Bingoo Africa</span>
        </div>
        Africa's digital identity platform · bingoo.africa
      </footer>
    </div>
  );
}