import React from "react";
import SalonServicesPanel from "./SalonServicesPanel";
import TeamMembersPanel from "./TeamMembersPanel";
import { canAccess, normalizePlan } from "@/lib/planPermissions";
import { TYPE_BUSINESS, TYPE_SALON, TYPE_LAWFIRM, TYPE_CORPORATE, normalizeProfileType } from "@/lib/sidebarConfig";
import { Scissors, Users, Scale } from "lucide-react";
import BingooEmptyState from "@/components/bingoo/ui/BingooEmptyState";

// Profile types that should see salon/service tools (NOT law firm)
const SERVICE_PROFILE_TYPES = new Set([TYPE_SALON, TYPE_BUSINESS]);
// Profile plans that show the Services section
const SERVICE_PROFILE_PLANS = new Set(["salon", "restaurant", "business"]);

export default function BusinessToolsPanel({ profileId, isDark, userPlan, profile, onSaved }) {
  const effectivePlan = userPlan || "free";
  const profileType = normalizeProfileType(profile);
  const headText = isDark ? "text-white" : "text-slate-900";

  // Determine which sections to show based on PROFILE TYPE (not subscription plan).
  // Subscription plan only gates entitlement (canAccess); profile type gates vertical.
  const showServices = SERVICE_PROFILE_TYPES.has(profileType) && canAccess(effectivePlan, "services");
  const showTeam = canAccess(effectivePlan, "team_members");

  const sections = [
    {
      id: "services",
      icon: Scissors,
      title: profileType === TYPE_SALON ? "Service Menu" : "Services",
      show: showServices,
      render: () => <SalonServicesPanel profileId={profileId} isDark={isDark} onSaved={onSaved} />,
    },
    {
      id: "team",
      icon: Users,
      title: profileType === TYPE_LAWFIRM ? "Staff & Attorneys" : "Team Members",
      show: showTeam,
      render: () => <TeamMembersPanel profileId={profileId} profileType={profileType} isDark={isDark} onSaved={onSaved} />,
    },
  ];

  const visible = sections.filter((s) => s.show);

  if (visible.length === 0) {
    return (
      <BingooEmptyState
        icon={Scissors}
        title="Business tools require a paid plan"
        message="Upgrade to Business or higher to access services, team management, and more."
        isDark={isDark}
      />
    );
  }

  return (
    <div className="space-y-6">
      {visible.map((section) => (
        <div key={section.id}>
          <div className="flex items-center gap-2 mb-3">
            <section.icon className="w-4 h-4" style={{ color: "#f97316" }} />
            <h3 className={`text-sm font-black uppercase tracking-wider ${headText}`}>{section.title}</h3>
          </div>
          {section.render()}
        </div>
      ))}
    </div>
  );
}