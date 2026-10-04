import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { House, UserRound, Radio, ShoppingBag, LayoutGrid } from 'lucide-react';
import { useNavigationStack } from '@/components/mobile/NavigationStack';

const ORANGE = '#f97316';
const TAB_KEY = 'bingoo_bottom_tab_';

// Per-tab ownership matchers — determine which bottom tab "owns" the current
// location so we can store the last visited path and restore it on tab switch.
function ownsDashboard(loc) {
  if (loc.pathname !== '/bingoo') return false;
  const v = new URLSearchParams(loc.search).get('view');
  return !v || v === 'home';
}
function ownsProfiles(loc) {
  if (loc.pathname !== '/bingoo') return false;
  const v = new URLSearchParams(loc.search).get('view');
  return v === 'hub' || v === 'workspace';
}
function ownsNfc(loc) {
  return loc.pathname === '/my-nfc-devices' || loc.pathname === '/activate-device';
}
function ownsShop(loc) {
  return loc.pathname === '/shop' || loc.pathname.startsWith('/product/') ||
    loc.pathname === '/cart' || loc.pathname === '/checkout' ||
    loc.pathname === '/order-confirmation' || loc.pathname === '/my-orders';
}

/**
 * BottomNav — accessible mobile bottom tab bar with per-tab stack preservation.
 *
 * Each tab maintains an independent history stack via NavigationStackProvider
 * (in-memory) plus a sessionStorage mirror that survives page reloads. The
 * provider stack is updated on every location change — including browser
 * back/forward — so the last entry always reflects the tab's current page.
 * Tapping a tab restores its last path; tapping the already-active tab scrolls
 * to top without navigating, preserving the current subpage state.
 */
export default function BottomNav({ lang = 'en', onMore }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { stacks, recordVisitForTab } = useNavigationStack();

  const tabs = [
    { id: 'dashboard', label: lang === 'fr' ? 'Accueil' : 'Home', icon: House, path: '/bingoo?view=home', owns: ownsDashboard },
    { id: 'profiles', label: lang === 'fr' ? 'Profil' : 'Profile', icon: UserRound, path: '/bingoo?view=hub', owns: ownsProfiles },
    { id: 'nfc', label: 'NFC', icon: Radio, path: '/my-nfc-devices', owns: ownsNfc, primary: true },
    { id: 'shop', label: lang === 'fr' ? 'Boutique' : 'Shop', icon: ShoppingBag, path: '/shop', owns: ownsShop },
  ];

  // Track the current path in the owning tab's stack so we can restore it on
  // switch. We keep BOTH the NavigationStackProvider (in-memory per-tab history)
  // and sessionStorage (survives page reloads) in sync.
  useEffect(() => {
    const owner = tabs.find(t => t.owns(location));
    if (owner) {
      const current = location.pathname + location.search;
      try { sessionStorage.setItem(TAB_KEY + owner.id, current); } catch { /* ignore */ }
      recordVisitForTab(owner.id, current);
    }
  }, [location]);

  const handlePress = (tab) => {
    // Dashboard and Profile are root destinations; one tap always opens their
    // canonical root instead of restoring a nested editor screen.
    if (tab.id === 'dashboard') {
      const currentView = location.pathname === '/bingoo' ? new URLSearchParams(location.search).get('view') : null;
      if (location.pathname === '/bingoo' && (currentView === 'home' || !currentView)) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Always escape billing/shop/subpages in one tap.
        navigate('/bingoo?view=home');
      }
      return;
    }
    if (tab.id === 'profiles') {
      const currentView = location.pathname === '/bingoo' ? new URLSearchParams(location.search).get('view') : null;
      if (currentView === 'hub') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/bingoo?view=hub');
      }
      return;
    }

    const active = tab.owns(location);
    if (active) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // All tabs restore their last visited page from the NavigationStackProvider's
    // per-tab history stack, falling back to the tab's root path. A sessionStorage
    // mirror handles page reloads where the in-memory stack is lost.
    const stack = stacks[tab.id];
    let target = (stack && stack.length > 0) ? stack[stack.length - 1] : tab.path;
    if (!stack || stack.length === 0) {
      try {
        const last = sessionStorage.getItem(TAB_KEY + tab.id);
        if (last) target = last;
      } catch { /* ignore */ }
    }
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
        className="relative flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 min-h-[68px] transition-all active:scale-95"
        style={{ touchAction: 'manipulation' }}
      >
        <span
          className={`relative flex items-center justify-center transition-all duration-200 ${tab.primary ? '-mt-5 w-12 h-12 rounded-[18px]' : 'w-9 h-9 rounded-[14px]'}`}
          style={{
            background: tab.primary
              ? (active ? 'linear-gradient(145deg,#ff8a1f,#f97316)' : 'linear-gradient(145deg,#17365f,#102a50)')
              : (active ? 'rgba(249,115,22,0.18)' : 'transparent'),
            border: tab.primary ? '1px solid rgba(255,255,255,.16)' : '1px solid transparent',
            boxShadow: tab.primary ? '0 8px 22px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.18)' : 'none'
          }}>
          <tab.icon className={tab.primary ? "w-6 h-6" : "w-[21px] h-[21px]"} style={{ color: active ? ORANGE : (tab.primary ? '#fff' : 'rgba(255,255,255,0.52)') }} aria-hidden="true" />
          {active && !tab.primary && <span className="absolute -bottom-1 w-1 h-1 rounded-full" style={{ background: ORANGE }} />}
        </span>
        <span className="text-[10px] font-bold tracking-tight" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.48)' }}>
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-[160] flex overflow-visible"
      style={{
        background: 'linear-gradient(180deg, rgba(10,29,63,.97) 0%, rgba(5,22,49,.99) 100%)',
        borderTop: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 -12px 34px rgba(3,22,47,.18), inset 0 1px 0 rgba(255,255,255,.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 'calc(68px + env(safe-area-inset-bottom))',
        pointerEvents: 'auto',
      }}
    >
      {tabs.map(renderTab)}
      <button
        type="button"
        onClick={onMore}
        aria-label="Menu"
        className="relative flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 min-h-[68px] transition-all active:scale-95"
        style={{ touchAction: 'manipulation' }}
      >
        <span className="relative w-9 h-9 rounded-[14px] flex items-center justify-center">
          <LayoutGrid className="w-[21px] h-[21px]" style={{ color: 'rgba(255,255,255,0.52)' }} aria-hidden="true" />
        </span>
        <span className="text-[10px] font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.48)' }}>
          Menu
        </span>
      </button>
    </nav>
  );
}