import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNavigationStack } from '@/components/mobile/NavigationStack';

export default function BottomNav({ tabs = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pushRoute } = useNavigationStack();

  const handleTabPress = (path) => {
    pushRoute(path);
    navigate(path);
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-bottom md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <button
              key={tab.path}
              onClick={() => handleTabPress(tab.path)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 h-1 bg-blue-600"
                  style={{ width: `${100 / tabs.length}%` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}