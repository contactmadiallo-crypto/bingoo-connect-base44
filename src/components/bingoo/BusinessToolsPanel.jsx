import { Link } from "react-router-dom";
import SalonServicesPanel from "./SalonServicesPanel";
import TeamMembersPanel from "./TeamMembersPanel";
import { canAccess } from "@/lib/planPermissions";
import { TYPE_BUSINESS, TYPE_SALON, TYPE_LAWFIRM, normalizeProfileType } from "@/lib/sidebarConfig";
import { Scissors, Users, Clock, ChevronRight } from "lucide-react";
import BingooEmptyState from "@/components/bingoo/ui/BingooEmptyState";
import { useI18n } from "@/lib/I18nContext";
import { t } from "@/lib/i18n";

// Profile types that should see salon/service tools (NOT law firm)
const SERVICE_PROFILE_TYPES = new Set([TYPE_SALON, TYPE_BUSINESS]);
// Profile plans that show the Services section
const SERVICE_PROFILE_PLANS = new Set(["salon", "restaurant", "business"]);

export default function BusinessToolsPanel({ profileId, isDark, userPlan, profile, onSaved }) {
  const { language } = useI18n();
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
      title: profileType === TYPE_SALON ? t("biz_salon_menu",language) : t("biz_services_products",language),
      show: showServices,
      render: () => <SalonServicesPanel profileId={profileId} isDark={isDark} onSaved={onSaved} mode={profileType === TYPE_SALON ? "salon" : "business"} />,
    },
    {
      id: "team",
      icon: Users,
      title: profileType === TYPE_LAWFIRM ? t("biz_staff_attorneys",language) : t("biz_team_members",language),
      show: showTeam,
      render: () => <TeamMembersPanel profileId={profileId} profileType={profileType} isDark={isDark} onSaved={onSaved} />,
    },
  ];

  const visible = sections.filter((s) => s.show);

  if (visible.length === 0) {
    return (
      <BingooEmptyState
        icon={Scissors}
        title={t("biz_paid_required",language)}
        message={t("biz_upgrade_copy",language)}
        isDark={isDark}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Business Hours / Booking Setup shortcut — the editor lives in Appointments,
          not in Profile Edit. This card makes it discoverable from the Business tab. */}
      <Link to="/bingoo?view=appointments"
        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isDark ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10" : "border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50"}`}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(16,185,129,0.15)" }}>
          <Clock className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-black ${headText}`}>{t("biz_hours_booking",language)}</p>
          <p className={`text-xs mt-0.5 ${isDark ? "text-white/45" : "text-slate-500"}`}>
            {t("biz_hours_booking_copy",language)}
          </p>
        </div>
        <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isDark ? "text-white/30" : "text-slate-400"}`} />
      </Link>

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