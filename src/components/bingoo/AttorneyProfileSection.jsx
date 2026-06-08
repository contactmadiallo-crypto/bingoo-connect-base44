import { useState } from "react";
import { Phone, Mail, MapPin, Star, BookOpen, Award, Languages, Scale } from "lucide-react";
import { LEGAL_SERVICES, CATEGORY_COLORS } from "@/lib/legalData";

function ContactBtn({ href, label, emoji, color }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
      style={{ background: color }}>
      {emoji} {label}
    </a>
  );
}

function Section({ title, children, icon: Icon, color = "#0B2E6B" }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: color }}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h4 className="font-black text-slate-900 text-sm">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export default function AttorneyProfileSection({ member, coverColor = "#0B2E6B" }) {
  const [activeTab, setActiveTab] = useState("about");
  if (!member) return null;

  const cats = member.practice_categories || [];
  const allServices = cats.flatMap(c => (member.practice_areas || "")
    .split(",").map(s => s.trim()).filter(Boolean));

  const tabs = [
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    ...(member.education || member.experience ? [{ id: "background", label: "Background" }] : []),
    ...(member.awards ? [{ id: "awards", label: "Awards" }] : []),
  ];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
      {/* Cover */}
      <div className="h-28 w-full" style={{ background: `linear-gradient(135deg, ${coverColor}, #1a4fa0)` }} />

      {/* Header */}
      <div className="px-5 pb-4 -mt-14">
        <div className="flex items-end gap-4 mb-3">
          {member.photo
            ? <img src={member.photo} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg flex-shrink-0" alt={member.name} />
            : <div className="w-24 h-24 rounded-2xl flex items-center justify-center font-black text-white text-3xl border-4 border-white shadow-lg flex-shrink-0" style={{ background: coverColor }}>{member.name?.charAt(0)}</div>
          }
          <div className="flex-1 min-w-0 mt-14">
            <h3 className="font-black text-slate-900 text-xl leading-tight">{member.name}</h3>
            {member.role && <p className="font-bold text-sm mt-0.5" style={{ color: coverColor }}>{member.role}</p>}
          </div>
        </div>

        {/* Category badges */}
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cats.map(c => (
              <span key={c} className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: CATEGORY_COLORS[c] || coverColor }}>
                {c === "Immigration" ? "🌎" : c === "Civil" ? "⚖️" : "🔒"} {c}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
          {member.bar_states && (
            <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-blue-500" /> Bar: {member.bar_states}</span>
          )}
          {member.languages && (
            <span className="flex items-center gap-1"><Languages className="w-3.5 h-3.5 text-blue-500" /> {member.languages}</span>
          )}
          {member.office_address && (
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-500" /> {member.office_address}</span>
          )}
          {member.consultation_fee && (
            <span className="flex items-center gap-1">💰 Consultation: {member.consultation_fee}</span>
          )}
          {member.availability && (
            <span className="flex items-center gap-1">🕐 {member.availability}</span>
          )}
        </div>

        {/* Contact buttons */}
        <div className="flex gap-2 flex-wrap mb-4">
          {member.phone && <ContactBtn href={`tel:${member.phone}`} label="Call" emoji="📞" color={coverColor} />}
          {member.whatsapp && <ContactBtn href={`https://wa.me/${member.whatsapp.replace(/\D/g,'')}`} label="WhatsApp" emoji="💬" color="#25D366" />}
          {member.email && <ContactBtn href={`mailto:${member.email}`} label="Email" emoji="📧" color="#6366f1" />}
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex gap-1 border-b border-slate-100 mb-4">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-2 text-xs font-bold border-b-2 -mb-px transition-colors ${activeTab === t.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab content */}
        {activeTab === "about" && member.bio && (
          <p className="text-sm text-slate-600 leading-relaxed">{member.bio}</p>
        )}

        {activeTab === "services" && (
          <div className="space-y-3">
            {cats.map(c => {
              const catServices = member.practice_areas
                ? member.practice_areas.split(",").map(s => s.trim()).filter(Boolean)
                : LEGAL_SERVICES[c]?.slice(0, 8) || [];
              return catServices.length > 0 ? (
                <div key={c}>
                  <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: CATEGORY_COLORS[c] }}>
                    {c === "Immigration" ? "🌎" : c === "Civil" ? "⚖️" : "🔒"} {c}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {catServices.map(s => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              ) : null;
            })}
            {cats.length === 0 && member.practice_areas && (
              <div className="flex flex-wrap gap-1.5">
                {member.practice_areas.split(",").map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "background" && (
          <div className="space-y-4">
            {member.education && (
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Education</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{member.education}</p>
              </div>
            )}
            {member.experience && (
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Experience</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{member.experience}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "awards" && member.awards && (
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Awards & Memberships</p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{member.awards}</p>
          </div>
        )}
      </div>
    </div>
  );
}