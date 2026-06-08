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
import SubscriberMonitoring from './pages/SubscriberMonitoring';
import Pricing from './pages/Pricing';
// Shop/Commerce pages are imported below ActivateDevice
import NFCRedirect from './pages/NFCRedirect';
import ActivateDevice from './pages/ActivateDevice';
import MyNFCDevices from './pages/MyNFCDevices';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import SubscriptionPricing from './pages/SubscriptionPricing';
import Billing from './pages/Billing';
import About from './pages/About';
import Contact from './pages/Contact';
import MyOrders from './pages/MyOrders';
import ShopAdmin from './pages/ShopAdmin';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import PublicResume from '@/pages/PublicResume';
import PublicLawFirmProfile from '@/pages/PublicLawFirmProfile';
import LostDevicePage from '@/pages/LostDevicePage';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import DataDeletion from '@/pages/DataDeletion';
import ContactSupport from '@/pages/ContactSupport';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AccountSettings from '@/pages/AccountSettings';

import PWASplashScreen from '@/components/pwa/PWASplashScreen';
import PWAInstallBanner from '@/components/pwa/PWAInstallBanner';

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

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Render the main app
  return (
    <Routes>
      {/* ── AUTH ROUTES (public) ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ── PUBLIC ROUTES (no login needed) ── */}
      <Route path="/" element={<Landing />} />
      <Route path="/bingoo-home" element={<Landing />} />
      <Route path="/p/:username" element={<PublicProfile />} />
      <Route path="/n/:deviceCode" element={<NFCRedirect />} />
      <Route path="/resume/:resumeId" element={<PublicResume />} />
      <Route path="/r/:resumeId" element={<PublicResume />} />
      <Route path="/firm/:username" element={<PublicLawFirmProfile />} />
      <Route path="/lost/:deviceCode" element={<LostDevicePage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/data-deletion" element={<DataDeletion />} />
      <Route path="/contact-support" element={<ContactSupport />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:productId" element={<ProductDetail />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/plans" element={<SubscriptionPricing />} />

      {/* ── ALL PROTECTED ROUTES ── */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/bingoo" element={<BingooDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/monitor" element={<SubscriberMonitoring />} />
        <Route path="/activate-device" element={<ActivateDevice />} />
        <Route path="/my-nfc-devices" element={<MyNFCDevices />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/shop-admin" element={<ShopAdmin />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="/pricing" element={<Pricing />} />

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
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <PWASplashScreen />
        <Router>
          <NavigationStackProvider>
            <NavigationTracker />
            <AuthenticatedApp />
            <PWAInstallBanner />
          </NavigationStackProvider>
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App