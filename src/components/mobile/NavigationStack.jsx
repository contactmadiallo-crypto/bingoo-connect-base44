import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const StackContext = createContext();

/**
 * Manages navigation stack for each bottom tab
 * Preserves scroll position and component state per stack
 */
export function NavigationStackProvider({ children }) {
  const [stacks, setStacks] = useState({
    home: ['/'],
    profile: ['/profile'],
    settings: ['/settings'],
  });
  const navigate = useNavigate();
  const location = useLocation();

  const pushStack = useCallback((tabId, path) => {
    setStacks(prev => ({
      ...prev,
      [tabId]: [...(prev[tabId] || []), path],
    }));
    navigate(path);
  }, [navigate]);

  const popStack = useCallback((tabId) => {
    setStacks(prev => ({
      ...prev,
      [tabId]: prev[tabId]?.slice(0, -1) || ['/'],
    }));
    navigate(-1);
  }, [navigate]);

  const resetStack = useCallback((tabId, rootPath) => {
    setStacks(prev => ({
      ...prev,
      [tabId]: [rootPath],
    }));
    navigate(rootPath);
  }, [navigate]);

  const value = { stacks, pushStack, popStack, resetStack };

  return (
    <StackContext.Provider value={value}>
      {children}
    </StackContext.Provider>
  );
}

export function useNavigationStack(tabId) {
  const context = useContext(StackContext);
  if (!context) {
    throw new Error('useNavigationStack must be used within NavigationStackProvider');
  }
  return context;
}