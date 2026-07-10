import React, { createContext, useState, useContext, useEffect } from 'react';

import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Only block protected routes if we have a token to verify.
  // Public routes render immediately without waiting for auth.
  const [isLoadingAuth, setIsLoadingAuth] = useState(() => !!appParams.token);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    // Load public settings in background — non-blocking for all routes.
    loadPublicSettings();
    // Check auth only if a token exists. Non-blocking for public routes.
    if (appParams.token) {
      checkUserAuth();
    }
  }, []);

  const loadPublicSettings = async () => {
    try {
      const appClient = createAxiosClient({
        baseURL: `${appParams.serverUrl}/api/apps/public`,
        headers: { 'X-App-Id': appParams.appId },
        token: appParams.token,
        interceptResponses: true
      });
      const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
      setAppPublicSettings(publicSettings);
    } catch (appError) {
      // Only set authError for user_not_registered — ProtectedRoute shows it.
      // Public routes ignore this and render normally.
      if (appError.status === 403 && appError.data?.extra_data?.reason === 'user_not_registered') {
        setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
      }
    }
  };

  const checkUserAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Re-check auth state (e.g., after login/register)
  const checkAppState = () => {
    loadPublicSettings();
    if (appParams.token) checkUserAuth();
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    // Always use the SDK logout for token cleanup, then redirect to our own login
    base44.auth.logout();
    if (shouldRedirect) {
      window.location.href = "/login";
    }
  };

  const navigateToLogin = () => {
    // Redirect to Bingoo's own login page with ?next= so user returns to current page
    window.location.href = `/login?next=${encodeURIComponent(window.location.href)}`;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};