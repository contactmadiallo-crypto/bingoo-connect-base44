import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Circle, TrendingUp, Lightbulb, BarChart3 } from 'lucide-react';
import { useI18n } from '@/lib/I18nContext';
import { t } from '@/lib/i18n';

const CHECKLIST_ITEMS = [
  { key: 'profile_photo', labelKey: 'quality_profile_photo', weight: 15 },
  { key: 'display_name', labelKey: 'quality_display_name', weight: 10 },
  { key: 'job_title', labelKey: 'quality_job_title', weight: 10 },
  { key: 'company_name', labelKey: 'quality_company_name', weight: 10 },
  { key: 'bio', labelKey: 'quality_bio', weight: 15 },
  { key: 'phone', labelKey: 'quality_phone', weight: 5 },
  { key: 'email', labelKey: 'quality_email', weight: 5 },
  { key: 'website', labelKey: 'quality_website', weight: 5 },
  { key: 'social_links', labelKey: 'quality_social_links', weight: 10, check: (p) => {
    const count = ['facebook_url','instagram_url','tiktok_url','linkedin_url','youtube_url'].filter(k => p[k]).length;
    return count >= 3;
  }},
  { key: 'custom_links', labelKey: 'quality_custom_link', weight: 5, check: (p) => (p.custom_links || []).filter(l => l.enabled).length >= 1 },
  { key: 'layout', labelKey: 'quality_layout', weight: 10, check: (p) => p.layout && p.layout !== 'classic' },
];

function getSmartRecommendations(profile, completedItems, language) {
  const recs = [];
  if (!profile.profile_photo) recs.push({ icon: '📷', text: t('quality_rec_photo', language) });
  if (!profile.bio) recs.push({ icon: '✍️', text: t('quality_rec_bio', language) });
  if (!profile.job_title) recs.push({ icon: '💼', text: t('quality_rec_job', language) });
  if (!profile.website) recs.push({ icon: '🔗', text: t('quality_rec_website', language) });
  if (profile.layout === 'classic') recs.push({ icon: '🎨', text: t('quality_rec_layout', language) });
  const socialCount = ['facebook_url','instagram_url','tiktok_url','linkedin_url','youtube_url'].filter(k => profile[k]).length;
  if (socialCount < 3) recs.push({ icon: '📱', text: `${t('quality_rec_social_prefix', language)} ${3 - socialCount} ${t('quality_rec_social_suffix', language)}` });
  if (completedItems >= 11) recs.push({ icon: '⭐', text: t('quality_rec_complete', language) });
  return recs.slice(0, 4);
}

export default function ProfileQualityScore({ profile, isDark }) {
  const { language } = useI18n();
  const { data: analytics } = useQuery({
    queryKey: ['profile-analytics-quality', profile?.id],
    queryFn: () => base44.entities.Analytics.filter({ profile_id: profile.id }, '-created_date', 500),
    enabled: !!profile?.id,
  });

  if (!profile) return null;

  const completedItems = CHECKLIST_ITEMS.filter(item => {
    if (item.check) return item.check(profile);
    return profile[item.key];
  });

  const score = completedItems.reduce((sum, item) => sum + item.weight, 0);
  const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f97316' : '#ef4444';
  const scoreLabel = score >= 80 ? t('quality_excellent', language) : score >= 50 ? t('quality_good', language) : t('quality_needs_work', language);

  const recs = getSmartRecommendations(profile, completedItems.length, language);

  // ROI Analytics from existing data
  const totalViews = (analytics || []).filter(a => a.event_type === 'profile_view').length;
  const totalTaps = (analytics || []).filter(a => a.event_type === 'nfc_tap').length;
  const totalQrScans = (analytics || []).filter(a => a.event_type === 'qr_scan').length;
  const totalInteractions = (analytics || []).filter(a => a.event_type?.includes('click') || a.event_type === 'lead_submitted').length;

  const headText = isDark ? 'text-white' : 'text-slate-900';
  const mutedText = isDark ? 'text-white/60' : 'text-slate-500';
  const panelBg = isDark ? 'bg-white/5' : 'bg-white';
  const panelBorder = isDark ? 'border-white/10' : 'border-slate-200';

  return (
    <div className="space-y-4">
      {/* Quality Score */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className={`text-sm font-black ${headText}`}>{t('quality_title', language)}</h3>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black" style={{ color: scoreColor }}>{score}<span className="text-lg">/100</span></p>
            <p className="text-xs font-bold" style={{ color: scoreColor }}>{scoreLabel}</p>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: scoreColor }} />
        </div>

        {/* Checklist */}
        <div className="space-y-1.5">
          {CHECKLIST_ITEMS.map(item => {
            const isDone = item.check ? item.check(profile) : profile[item.key];
            return (
              <div key={item.key} className="flex items-center gap-2">
                {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <Circle className={`w-4 h-4 ${mutedText} flex-shrink-0`} />}
                <span className={`text-xs flex-1 ${isDone ? `font-semibold ${headText}` : mutedText}`}>{t(item.labelKey, language)}</span>
                <span className={`text-[10px] font-bold ${isDone ? 'text-emerald-500' : mutedText}`}>+{item.weight}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Recommendations */}
      {recs.length > 0 && (
        <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-orange-500" />
            <h3 className={`text-sm font-black ${headText}`}>{t('quality_smart_recs', language)}</h3>
          </div>
          <div className="space-y-2">
            {recs.map((rec, i) => (
              <div key={i} className={`flex items-start gap-2 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <span className="text-base">{rec.icon}</span>
                <p className={`text-xs ${headText} flex-1`}>{rec.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROI Analytics Cards */}
      <div className={`rounded-2xl border ${panelBorder} ${panelBg} p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          <h3 className={`text-sm font-black ${headText}`}>{t('quality_roi', language)}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className="text-2xl font-black text-orange-500">{totalViews}</p>
            <p className={`text-xs font-bold ${mutedText}`}>{t('analytics_profile_views', language)}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className="text-2xl font-black text-blue-500">{totalTaps}</p>
            <p className={`text-xs font-bold ${mutedText}`}>{t('analytics_nfc_taps', language)}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className="text-2xl font-black text-purple-500">{totalQrScans}</p>
            <p className={`text-xs font-bold ${mutedText}`}>{t('analytics_qr_scans', language)}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
            <p className="text-2xl font-black text-emerald-500">{totalInteractions}</p>
            <p className={`text-xs font-bold ${mutedText}`}>{t('analytics_link_clicks', language)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}