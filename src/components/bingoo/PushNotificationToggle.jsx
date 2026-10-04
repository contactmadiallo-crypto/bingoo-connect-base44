import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useI18n } from '@/lib/I18nContext';

export default function PushNotificationToggle({ profileId, darkMode }) {
  const { language } = useI18n();
  const tr = (en, fr) => (language === 'fr' ? fr : en);
  const { permission, isSubscribed, isLoading, supported, subscribe, unsubscribe } = usePushNotifications(profileId);

  // Not available in the installed app WebView (no Web Push there) or unsupported browsers.
  if (!supported) return null;

  const bg = darkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200';

  if (permission === 'denied') {
    return (
      <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${darkMode ? 'border-white/20 text-white/50' : 'border-slate-200 text-slate-400'}`}>
        <BellOff className="w-4 h-4" />
        {tr('Notifications are blocked in your browser settings', 'Les notifications sont bloquées dans les paramètres de votre navigateur')}
      </div>
    );
  }

  const handleClick = async () => {
    if (isSubscribed) {
      await unsubscribe();
      return;
    }
    const ok = await subscribe();
    if (ok) toast.success(tr('Notifications enabled on this device.', 'Notifications activées sur cet appareil.'));
    else if (typeof Notification !== 'undefined' && Notification.permission !== 'denied') {
      toast.error(tr('Could not enable notifications. Please try again.', 'Impossible d’activer les notifications. Veuillez réessayer.'));
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center gap-2 border ${bg}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-4 h-4 text-green-500" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      {isSubscribed ? tr('Notifications on', 'Notifications activées') : tr('Enable notifications', 'Activer les notifications')}
    </Button>
  );
}
