import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigationStack } from '@/components/mobile/NavigationStack';

const NAVY = '#0b2149', ORANGE = '#f97316';

export default function BottomNav({ tabs = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pushRoute, resetStack } = useNavigationStack();

  const handleTabPress = (tab) => {
    const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
    if (isActive) {
      resetStack(tab.id || tab.path, tab.path);
    } else {
      pushRoute(tab.path);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 md:hidden safe-bottom overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a1d3f 0%, #071A3D 100%)',
        borderTop: '1px solid rgba(249,115,22,0.35)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <button
              key={tab.path}
              onClick={() => handleTabPress(tab)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[60px] transition-colors active:opacity-60"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: isActive ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.08)' }}>
                <tab.icon className="w-5 h-5" style={{ color: isActive ? ORANGE : 'rgba(255,255,255,0.4)' }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: isActive ? ORANGE : 'rgba(255,255,255,0.4)' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}