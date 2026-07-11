import { Link } from "react-router-dom";

const LEGAL_LINKS = [
  ["Privacy Policy", "/privacy"],
  ["Terms of Service", "/terms"],
  ["Data Deletion", "/data-deletion"],
  ["Contact", "/contact"],
];

/** A titled section with anchor for table-of-contents navigation */
export function LegalSection({ id, title, children }) {
  return (
    <section id={id} className="mb-8 scroll-mt-20">
      <h2 className="text-base md:text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-blue-50">
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-slate-600 space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-slate-800 [&_a]:text-blue-600 [&_a:hover]:text-blue-800">
        {children}
      </div>
    </section>
  );
}

/** Scrollable table of contents — items: [number, label, anchorId] */
export function LegalTOC({ items }) {
  return (
    <div className="mb-8 p-4 md:p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Table of Contents</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5">
        {items.map(([num, label, anchor]) => (
          <a key={anchor} href={`#${anchor}`} className="text-sm text-blue-600 hover:text-blue-800 hover:underline py-1 no-underline">
            {num}. {label}
          </a>
        ))}
      </div>
    </div>
  );
}

/** Shared layout for all legal/compliance pages */
export default function LegalPageLayout({ title, subtitle, lastUpdated, children, maxWidth = "max-w-3xl" }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0b2149] to-[#13284f] px-5 py-8 md:px-6 md:py-10 text-center">
        <Link to="/" className="inline-flex items-center mb-4 text-white/70 hover:text-white font-bold text-sm transition-colors no-underline">
          ← Bingoo Connect
        </Link>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">{title}</h1>
        {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
        {lastUpdated && <p className="text-xs text-white/50 mt-2">Last updated: {lastUpdated}</p>}
      </div>

      {/* Content */}
      <div className={`${maxWidth} mx-auto px-4 md:px-6 py-8 md:py-12`}>
        {children}
      </div>

      {/* Footer nav */}
      <div className="border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map(([label, to]) => (
              <Link key={to} to={to} className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors no-underline">
                {label}
              </Link>
            ))}
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-3">© 2026 Bingoo Connect. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}