import { Link } from "react-router-dom";

export default function PublicFooter({ dark = false }) {
  const textColor = dark ? "text-white/35" : "text-slate-400";
  const hoverColor = dark ? "hover:text-white/65" : "hover:text-slate-600";
  const borderColor = dark ? "border-white/8" : "border-slate-200";

  const links = [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Data Deletion", to: "/data-deletion" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <div className={`border-t ${borderColor} px-5 py-4 mt-2`}>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {links.map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            className={`text-[11px] font-semibold ${textColor} ${hoverColor} transition-colors no-underline`}
          >
            {label}
          </Link>
        ))}
      </div>
      <p className={`text-center text-[10px] ${textColor} mt-1.5 font-medium`}>
        © 2026 Bingoo Connect. All rights reserved.
      </p>
    </div>
  );
}