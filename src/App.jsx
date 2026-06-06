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
import MyOrders from './pages/MyOrders';
import ShopAdmin from './pages/ShopAdmin';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

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

      {/* ── PUBLIC PROFILE / NFC ROUTES ── */}
      <Route path="/p/:username" element={<PublicProfile />} />
      <Route path="/n/:deviceCode" element={<NFCRedirect />} />

      {/* ── ALL PROTECTED ROUTES ── */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/" element={<Landing />} />
        <Route path="/bingoo-home" element={<Landing />} />
        <Route path="/bingoo" element={<BingooDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/activate-device" element={<ActivateDevice />} />
        <Route path="/my-nfc-devices" element={<MyNFCDevices />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/plans" element={<SubscriptionPricing />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/shop-admin" element={<ShopAdmin />} />
        <Route path="/billing" element={<Billing />} />

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
        <Router>
          <NavigationStackProvider>
            <NavigationTracker />
            <AuthenticatedApp />
          </NavigationStackProvider>
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App