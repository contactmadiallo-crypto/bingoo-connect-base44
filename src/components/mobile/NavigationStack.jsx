import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const StackContext = createContext();

/**
 * Manages navigation stack for each bottom tab.
 * Preserves per-tab history so switching tabs restores the correct stack.
 */
export function NavigationStackProvider({ children }) {
  const [stacks, setStacks] = useState({});
  const [activeTabId, setActiveTabId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve which tab a path belongs to (first path segment)
  const resolveTabId = useCallback((path) => {
    const seg = path.split('?')[0].split('/')[1];
    return seg || 'home';
  }, []);

  // pushRoute: navigates to path and pushes it onto the resolved tab's stack
  const pushRoute = useCallback((path) => {
    const tabId = resolveTabId(path);
    setActiveTabId(tabId);
    setStacks(prev => ({
      ...prev,
      [tabId]: [...(prev[tabId] || []), path],
    }));
    navigate(path);
  }, [navigate, resolveTabId]);

  // Switch to a tab — restores the last page in that tab's stack, or root
  const switchTab = useCallback((tabId, rootPath) => {
    setActiveTabId(tabId);
    const existing = stacks[tabId];
    navigate(existing && existing.length > 0 ? existing[existing.length - 1] : rootPath);
  }, [navigate, stacks]);

  const popStack = useCallback((tabId) => {
    setStacks(prev => ({
      ...prev,
      [tabId]: prev[tabId]?.slice(0, -1) || [],
    }));
    navigate(-1);
  }, [navigate]);

  // Reset a tab's stack to root and navigate there with replace
  const resetStack = useCallback((tabId, rootPath) => {
    setStacks(prev => ({
      ...prev,
      [tabId]: [rootPath],
    }));
    setActiveTabId(tabId);
    navigate(rootPath, { replace: true });
  }, [navigate]);

  const value = { stacks, activeTabId, pushRoute, switchTab, popStack, resetStack };

  return (
    <StackContext.Provider value={value}>
      {children}
    </StackContext.Provider>
  );
}

export function useNavigationStack() {
  const context = useContext(StackContext);
  if (!context) {
    throw new Error('useNavigationStack must be used within NavigationStackProvider');
  }
  return context;
}