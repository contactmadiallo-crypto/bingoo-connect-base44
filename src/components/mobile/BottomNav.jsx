import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, User, Smartphone, Briefcase, Menu } from 'lucide-react';

const ORANGE = '#f97316';
const TAB_KEY = 'bingoo_bottom_tab_';

// Per-tab ownership matchers — determine which bottom tab "owns" the current
// location so we can store the last visited path and restore it on tab switch.
function ownsHome(loc) {
  if (loc.pathname !== '/bingoo') return false;
  const v = new URLSearchParams(loc.search).get('view');
  // Home owns all /bingoo views EXCEPT the Profiles (hub/workspace) and Business (leads) tabs.
  return !v || v === 'home' || !['hub', 'workspace', 'leads'].includes(v);
}
function ownsProfiles(loc) {
  if (loc.pathname !== '/bingoo') return false;
  const v = new URLSearchParams(loc.search).get('view');
  return v === 'hub' || v === 'workspace';
}
function ownsNfc(loc) {
  return loc.pathname === '/my-nfc-devices' || loc.pathname === '/activate-device';
}
function ownsBusiness(loc) {
  if (loc.pathname !== '/bingoo') return false;
  return new URLSearchParams(loc.search).get('view') === 'leads';
}

/**
 * BottomNav — accessible mobile bottom tab bar with per-tab stack preservation.
 *
 * Stack preservation uses sessionStorage (not an in-memory stack) to avoid the
 * stale-entry bugs that broke the old NavigationStack approach. Each tab stores
 * its last visited path; tapping a tab restores that path (or falls back to root).
 * Tapping the already-active tab scrolls to top without navigating, preserving
 * the current subpage state.
 */
export default function BottomNav({ lang = 'en', totalUnread = 0, onMore }) {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', label: lang === 'fr' ? 'Accueil' : 'Home', icon: Home, path: '/bingoo?view=home', owns: ownsHome },
    { id: 'profiles', label: lang === 'fr' ? 'Profils' : 'Profiles', icon: User, path: '/bingoo?view=workspace', owns: ownsProfiles },
    { id: 'nfc', label: 'NFC', icon: Smartphone, path: '/my-nfc-devices', owns: ownsNfc },
    { id: 'business', label: lang === 'fr' ? 'Business' : 'Business', icon: Briefcase, path: '/bingoo?view=leads', owns: ownsBusiness },
  ];

  // Track the last visited path per tab so we can restore it on switch.
  useEffect(() => {
    const owner = tabs.find(t => t.owns(location));
    if (owner) {
      try { sessionStorage.setItem(TAB_KEY + owner.id, location.pathname + location.search); } catch { /* ignore */ }
    }
  }, [location]);

  const handlePress = (tab) => {
    const active = tab.owns(location);
    if (active) {
      // Already on this tab — scroll to top, keep current state (no navigation).
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    let target = tab.path;
    try {
      const last = sessionStorage.getItem(TAB_KEY + tab.id);
      if (last) target = last;
    } catch { /* ignore */ }
    navigate(target);
  };

  const renderTab = (tab) => {
    const active = tab.owns(location);
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => handlePress(tab)}
        aria-label={tab.label}
        aria-current={active ? 'page' : undefined}
        className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[60px] transition-colors active:opacity-60"
        style={{ touchAction: 'manipulation' }}
      >
        <span className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: active ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.08)' }}>
          <tab.icon className="w-5 h-5" style={{ color: active ? ORANGE : 'rgba(255,255,255,0.4)' }} aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold" style={{ color: active ? ORANGE : 'rgba(255,255,255,0.4)' }}>
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a1d3f 0%, #071A3D 100%)',
        borderTop: '1px solid rgba(249,115,22,0.4)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 'calc(60px + env(safe-area-inset-bottom))',
      }}
    >
      {tabs.map(renderTab)}
      <button
        type="button"
        onClick={onMore}
        aria-label={lang === 'fr' ? "Plus d'options" : 'More options'}
        className="relative flex-1 flex flex-col items-center justify-center gap-1 min-h-[60px] transition-colors active:opacity-60"
        style={{ touchAction: 'manipulation' }}
      >
        <span className="relative w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <Menu className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }} aria-hidden="true" />
          {totalUnread > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-black text-white"
              style={{ background: '#F97316', border: '2px solid #0a1d3f' }}
              aria-label={`${totalUnread > 9 ? '9+' : totalUnread} unread`}
            >
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </span>
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {lang === 'fr' ? 'Plus' : 'More'}
        </span>
      </button>
    </nav>
  );
}