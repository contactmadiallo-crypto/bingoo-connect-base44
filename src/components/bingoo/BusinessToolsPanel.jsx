import React from "react";
import BusinessHoursTab from "./BusinessHoursTab";
import SalonServicesPanel from "./SalonServicesPanel";
import TeamMembersPanel from "./TeamMembersPanel";
import { canAccess } from "@/lib/planPermissions";
import { TYPE_BUSINESS, TYPE_SALON, TYPE_LAWFIRM, TYPE_CORPORATE } from "@/lib/sidebarConfig";
import { Clock, Scissors, Users } from "lucide-react";
import BingooEmptyState from "@/components/bingoo/ui/BingooEmptyState";

const PLAN_TO_TYPE = {
  salon: TYPE_SALON,
  lawfirm: TYPE_LAWFIRM,
  corporate: TYPE_CORPORATE,
  business: TYPE_BUSINESS,
  professional: TYPE_BUSINESS,
  pro: TYPE_BUSINESS,
  free: TYPE_BUSINESS,
};

export default function BusinessToolsPanel({ profileId, isDark, userPlan, profile, onSaved }) {
  const effectivePlan = userPlan || "free";
  const profileType = PLAN_TO_TYPE[effectivePlan] || TYPE_BUSINESS;

  const headText = isDark ? "text-white" : "text-slate-900";
  const mutedText = isDark ? "text-white/40" : "text-slate-400";

  const sections = [
    {
      id: "hours",
      icon: Clock,
      title: "Business Hours",
      show: canAccess(userPlan, "business_hours"),
      render: () => <BusinessHoursTab profileId={profileId} isDark={isDark} onSaved={onSaved} />,
    },
    {
      id: "services",
      icon: Scissors,
      title: "Services",
      show: canAccess(userPlan, "services"),
      render: () => <SalonServicesPanel profileId={profileId} isDark={isDark} onSaved={onSaved} />,
    },
    {
      id: "team",
      icon: Users,
      title: "Team Members",
      show: canAccess(userPlan, "team_members"),
      render: () => <TeamMembersPanel profileId={profileId} profileType={profileType} isDark={isDark} onSaved={onSaved} />,
    },
  ];

  const visible = sections.filter((s) => s.show);

  if (visible.length === 0) {
    return (
      <BingooEmptyState icon={Clock} title="Business tools require a paid plan" message="Upgrade to Professional or higher to access business hours, services, and team management." isDark={isDark} />
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