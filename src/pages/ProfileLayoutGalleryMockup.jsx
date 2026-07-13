import React from "react";
import GalleryOverviewSection from "@/components/mockups/gallery/GalleryOverviewSection";
import ProfessionalTemplatesSection from "@/components/mockups/gallery/ProfessionalTemplatesSection";
import BusinessTemplatesSection from "@/components/mockups/gallery/BusinessTemplatesSection";
import OnboardingMockupSection from "@/components/mockups/gallery/OnboardingMockupSection";
import PublicProfileMockupSection from "@/components/mockups/gallery/PublicProfileMockupSection";
import TemplateDetailSection from "@/components/mockups/gallery/TemplateDetailSection";

export default function ProfileLayoutGalleryMockup() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#0b2149] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black px-2 py-1 rounded-full bg-orange-500">MOCKUP ONLY</span>
            <span className="text-[10px] font-bold text-white/40">Not production code · No backend changes</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Bingoo Profile Layout Template Gallery</h1>
          <p className="text-sm text-white/50 mt-1">Visual prototype · 20+ states · Categorized Professional & Business layout system</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Gallery Overview", "8 Professional Templates", "10 Business Templates", "4 Onboarding States", "6 Public Profile Previews", "Template Detail"].map(tag => (
              <span key={tag} className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/8 text-white/70">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <GalleryOverviewSection />
        <ProfessionalTemplatesSection />
        <BusinessTemplatesSection />
        <OnboardingMockupSection />
        <PublicProfileMockupSection />
        <TemplateDetailSection />
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
          <p className="text-xs font-bold text-slate-400">End of Mockup · Bingoo Connect Profile Layout Gallery</p>
          <p className="text-[10px] text-slate-300 mt-1">All states are visual prototypes only — no functionality is wired</p>
        </div>
      </div>
    </div>
  );
}