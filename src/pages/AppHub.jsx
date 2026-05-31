import { Link } from "react-router-dom";
import { Wifi, UtensilsCrossed, ArrowRight } from "lucide-react";

export default function AppHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">My Workspace</h1>
        <p className="text-slate-400 text-lg">Choose which app to open</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Bingoo Connect */}
        <Link
          to="/bingoo"
          className="group bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 shadow-xl shadow-blue-900/40 hover:scale-105"
        >
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Wifi className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Bingoo Connect</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              NFC digital business profiles, lead capture, analytics and smart cards.
            </p>
          </div>
          <div className="flex items-center gap-2 text-white font-semibold mt-auto">
            Open Bingoo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* FoodHub */}
        <Link
          to="/Dashboard"
          className="group bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 rounded-2xl p-8 flex flex-col gap-4 transition-all duration-300 shadow-xl shadow-orange-900/40 hover:scale-105"
        >
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">FoodHub</h2>
            <p className="text-orange-100 text-sm leading-relaxed">
              Food delivery marketplace with orders, restaurants, drivers and kitchen tools.
            </p>
          </div>
          <div className="flex items-center gap-2 text-white font-semibold mt-auto">
            Open FoodHub <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}