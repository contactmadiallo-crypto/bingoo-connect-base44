import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BrandLockup from "@/components/auth/BrandLockup";

const ORANGE = "#f97316";

// Top navigation bar for auth pages — white background, brand lockup left,
// marketing links center (desktop), Log In + Get Started CTA right.
export default function AuthTopNav({ loginHref = "/login" }) {
  return (
    <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center flex-shrink-0" aria-label="Bingoo Connect home">
          <BrandLockup badgeSize={32} />
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          <Link to="/shop" className="hover:text-slate-900 transition-colors">Products</Link>
          <Link to="/" className="hover:text-slate-900 transition-colors">Templates</Link>
          <Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
          <Link to="/plans" className="hover:text-slate-900 transition-colors">For Business</Link>
          <Link to="/about" className="hover:text-slate-900 transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <Link
            to={loginHref}
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors hidden sm:inline"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 sm:px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: ORANGE }}
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}