import { Link } from "react-router-dom";
import { Wifi, UtensilsCrossed, ArrowRight, Zap, Star, TrendingUp } from "lucide-react";

const FloatingOrb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 animate-pulse ${className}`} />
);

export default function AppHub() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#080c18] flex flex-col items-center justify-center p-6">

      {/* Animated background orbs */}
      <FloatingOrb className="w-96 h-96 bg-blue-500 -top-20 -left-20" />
      <FloatingOrb className="w-80 h-80 bg-purple-600 top-1/3 -right-20" />
      <FloatingOrb className="w-64 h-64 bg-orange-500 bottom-10 left-1/4" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Header */}
      <div className="relative z-10 text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-xs font-semibold text-white/60 uppercase tracking-widest mb-6">
          <Zap className="w-3 h-3 text-yellow-400" />
          Workspace Hub
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-none tracking-tight">
          Your <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Digital</span>
          <br />Empire
        </h1>
        <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
          Two powerful platforms. One seamless workspace.
        </p>
      </div>

      {/* Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">

        {/* Bingoo Connect */}
        <Link to="/bingoo" className="group relative overflow-hidden rounded-3xl p-px transition-all duration-500 hover:scale-[1.03]"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #3b82f6)" }}>
          <div className="relative h-full bg-[#0d1528] rounded-3xl p-8 flex flex-col gap-5 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-600/10 to-transparent" />

            <div className="relative flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1">
                <Star className="w-3 h-3 text-blue-400 fill-blue-400" />
                <span className="text-blue-300 text-xs font-bold">NFC</span>
              </div>
            </div>

            <div className="relative">
              <h2 className="text-2xl font-black text-white mb-2">Bingoo Connect</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                NFC-powered digital business cards, lead capture, analytics and smart profiles.
              </p>
            </div>

            <div className="relative grid grid-cols-3 gap-2 py-4 border-t border-white/5">
              {[["Profiles","💳"],["Leads","⭐"],["Analytics","📊"]].map(([l, e]) => (
                <div key={l} className="text-center">
                  <div className="text-lg mb-0.5">{e}</div>
                  <div className="text-xs text-slate-500 font-medium">{l}</div>
                </div>
              ))}
            </div>

            <div className="relative flex items-center justify-between mt-auto">
              <span className="text-white font-bold text-sm group-hover:text-blue-300 transition-colors">Open Bingoo</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* FoodHub */}
        <Link to="/CustomerApp" className="group relative overflow-hidden rounded-3xl p-px transition-all duration-500 hover:scale-[1.03]"
          style={{ background: "linear-gradient(135deg, #f97316, #ef4444, #f97316)" }}>
          <div className="relative h-full bg-[#160c05] rounded-3xl p-8 flex flex-col gap-5 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-orange-600/10 to-transparent" />

            <div className="relative flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}>
                <UtensilsCrossed className="w-8 h-8 text-white" />
              </div>
              <div className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1">
                <TrendingUp className="w-3 h-3 text-orange-400" />
                <span className="text-orange-300 text-xs font-bold">Live</span>
              </div>
            </div>

            <div className="relative">
              <h2 className="text-2xl font-black text-white mb-2">FoodHub</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Food delivery marketplace with orders, restaurants, drivers and kitchen tools.
              </p>
            </div>

            <div className="relative grid grid-cols-3 gap-2 py-4 border-t border-white/5">
              {[["Orders","🛍️"],["Kitchen","🍳"],["Drivers","🚚"]].map(([l, e]) => (
                <div key={l} className="text-center">
                  <div className="text-lg mb-0.5">{e}</div>
                  <div className="text-xs text-slate-500 font-medium">{l}</div>
                </div>
              ))}
            </div>

            <div className="relative flex items-center justify-between mt-auto">
              <span className="text-white font-bold text-sm group-hover:text-orange-300 transition-colors">Open FoodHub</span>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Bottom tagline */}
      <p className="relative z-10 text-slate-600 text-xs mt-12 tracking-widest uppercase">
        Powered by Base44
      </p>
    </div>
  );
}