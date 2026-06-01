import './App.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { NavigationStackProvider } from '@/components/mobile/NavigationStack'
import RouteTransition from '@/components/mobile/RouteTransition'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Landing from './pages/Landing';
import AppHub from './pages/AppHub';
import PublicProfile from './pages/PublicProfile';
import BingooDashboard from './pages/BingooDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Pricing from './pages/Pricing';
import NFCRedirect from './pages/NFCRedirect';
import ActivateDevice from './pages/ActivateDevice';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout } = pagesConfig;
const LayoutWrapper = ({ children, currentPageName }) => Layout
  ? <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;



const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Public routes that don't require authentication
  const publicPaths = ['/', '/bingoo-home', '/pricing'];
  const isPublicPath = publicPaths.includes(window.location.pathname) ||
    window.location.pathname.startsWith('/p/') ||
    window.location.pathname.startsWith('/n/');

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Only redirect to login for protected routes
      if (!isPublicPath) {
        navigateToLogin();
        return null;
      }
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* ── HUB ── */}
      <Route path="/" element={<Landing />} />

      {/* ── BINGOO CONNECT ── */}
      <Route path="/bingoo-home" element={<Landing />} />
      <Route path="/bingoo" element={<BingooDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/p/:username" element={<PublicProfile />} />
      <Route path="/n/:deviceCode" element={<NFCRedirect />} />
      <Route path="/activate-device" element={<ActivateDevice />} />

      {/* ── FOODHUB (original project) ── */}
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <NavigationStackProvider>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <VisualEditAgent />
        </NavigationStackProvider>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App