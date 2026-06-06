import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushNotificationToggle({ profileId, darkMode }) {
  const { permission, isSubscribed, isLoading, supported, subscribe, unsubscribe } = usePushNotifications(profileId);

  if (!supported) return null;

  const bg = darkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200';

  if (permission === 'denied') {
    return (
      <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${darkMode ? 'border-white/20 text-white/50' : 'border-slate-200 text-slate-400'}`}>
        <BellOff className="w-4 h-4" />
        Notifications blocked in browser settings
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={isSubscribed ? unsubscribe : subscribe}
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
      {isSubscribed ? 'Notifications On' : 'Enable Notifications'}
    </Button>
  );
}