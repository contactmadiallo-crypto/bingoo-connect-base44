import React from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MessageCircle, MapPin, Award, Globe } from "lucide-react";
import LegalIntakeForm from "@/components/bingoo/LegalIntakeForm";

export default function PublicLawFirmProfile() {
  const { username } = useParams();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => base44.functions.invoke("getPublicProfile", { username }),
  });

  const { data: attorneys = [] } = useQuery({
    queryKey: ["attorneys", profile?.id],
    queryFn: () => base44.entities.TeamMember.filter({ profile_id: profile?.id, status: "active" }, "order"),
    enabled: !!profile?.id && profile?.plan === "lawfirm",
  });

  const { data: practiceAreas = [] } = useQuery({
    queryKey: ["practice-areas", profile?.id],
    queryFn: () => base44.entities.PracticeArea.filter({ profile_id: profile?.id }, "order"),
    enabled: !!profile?.id && profile?.plan === "lawfirm",
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["office-locations", profile?.id],
    queryFn: () => base44.entities.OfficeLocation.filter({ profile_id: profile?.id }, "order"),
    enabled: !!profile?.id && profile?.plan === "lawfirm",
  });

  const { data: legalServices = [] } = useQuery({
    queryKey: ["legal-services", profile?.id],
    queryFn: () => base44.entities.LegalService.filter({ profile_id: profile?.id }, "order"),
    enabled: !!profile?.id && profile?.plan === "lawfirm",
  });

  if (profileLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!profile || profile.plan !== "lawfirm") return <div className="min-h-screen flex items-center justify-center text-slate-500">Profile not found</div>;

  const coverColor = profile.cover_color || "#0b2149";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cover */}
      <div className="h-32 md:h-48" style={{ background: `linear-gradient(135deg, ${coverColor}, ${coverColor}99)` }} />

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 -mt-16 mb-8 relative z-10">
          <div className="flex-shrink-0">
            {profile.profile_photo ? (
              <img src={profile.profile_photo} alt={profile.display_name} className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white shadow-xl object-cover" />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-5xl font-black text-white" style={{ background: coverColor }}>
                {profile.display_name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 pt-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">{profile.display_name}</h1>
            {profile.company_name && <p className="text-lg text-slate-600 mt-1">{profile.company_name}</p>}
            {profile.bio && <p className="text-slate-500 mt-3 line-clamp-3">{profile.bio}</p>}
            
            {/* Contact buttons */}
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors">
                  <Phone className="w-4 h-4" /> Call
                </a>
              )}
              {profile.whatsapp_number && (
                <a href={`https://wa.me/${profile.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-green-300 text-green-700 text-sm font-bold hover:bg-green-50 transition-colors">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Practice Areas */}
         {practiceAreas.length > 0 && (
           <div className="mb-12">
             <h2 className="text-2xl font-black text-slate-900 mb-4">⚖️ Practice Areas</h2>
             <div className="grid md:grid-cols-2 gap-4">
               {practiceAreas.filter(a => a.is_active).map(area => (
                 <div key={area.id} className="bg-white rounded-2xl p-6 border border-slate-200">
                   <div className="flex items-start gap-3">
                     <span className="text-3xl">{area.icon || "⚖️"}</span>
                     <div>
                       <h3 className="font-bold text-slate-900">{area.name}</h3>
                       {area.description && <p className="text-sm text-slate-600 mt-1">{area.description}</p>}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* Legal Services */}
         {legalServices.length > 0 && (
           <div className="mb-12">
             <h2 className="text-2xl font-black text-slate-900 mb-4">⚖️ Legal Services</h2>
             <div className="space-y-3">
               {legalServices.filter(s => s.is_active).map(service => (
                 <div key={service.id} className="bg-white rounded-2xl p-4 border border-slate-200">
                   <h3 className="font-bold text-slate-900">{service.name}</h3>
                   {service.description && <p className="text-sm text-slate-600 mt-1">{service.description}</p>}
                   {service.legal_category && <p className="text-xs text-slate-500 mt-2">Category: {service.legal_category}</p>}
                 </div>
               ))}
             </div>
           </div>
         )}

        {/* Attorneys */}
        {attorneys.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-slate-900 mb-4">👨‍⚖️ Our Attorneys</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {attorneys.map(atty => (
                <div key={atty.id} className="bg-white rounded-2xl p-6 border border-slate-200">
                  <div className="flex gap-4">
                    {atty.photo ? (
                      <img src={atty.photo} alt={atty.name} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-700 flex-shrink-0">
                        {atty.name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900">{atty.name}</h3>
                      {atty.role && <p className="text-sm text-slate-600">{atty.role}</p>}
                      {atty.practice_categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {atty.practice_categories.map(cat => (
                            <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                      {atty.bar_states && <p className="text-xs text-slate-500 mt-1">Bar: {atty.bar_states}</p>}
                    </div>
                  </div>
                  {atty.bio && <p className="text-sm text-slate-600 mt-3">{atty.bio}</p>}
                  {atty.consultation_fee && <p className="text-sm font-semibold text-slate-900 mt-2">Consultation: {atty.consultation_fee}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Office Locations */}
        {locations.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-slate-900 mb-4">🏢 Office Locations</h2>
            <div className="grid gap-4">
              {locations.filter(l => l.is_active).map(loc => (
                <div key={loc.id} className="bg-white rounded-2xl p-6 border border-slate-200">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-slate-900">{loc.name}</h3>
                      <p className="text-sm text-slate-600 mt-0.5">{loc.address}</p>
                      {(loc.city || loc.state) && <p className="text-sm text-slate-600">{loc.city}, {loc.state} {loc.zip_code}</p>}
                      {loc.phone && <p className="text-sm text-slate-600 mt-1">📞 {loc.phone}</p>}
                      {loc.email && <p className="text-sm text-slate-600">✉️ {loc.email}</p>}
                      {loc.hours && <p className="text-sm text-slate-600 mt-1">⏰ {loc.hours}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Intake Form */}
        {profile.id && (
          <div className="mb-12">
            <LegalIntakeForm profileId={profile.id} color={coverColor} isLawFirm={true} />
          </div>
        )}
      </div>
    </div>
  );
}