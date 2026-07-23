import './App.css'
import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import ScrollRestoration from '@/components/ScrollRestoration'
import { NavigationStackProvider } from '@/components/mobile/NavigationStack'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
const Landing = lazy(() => import('./pages/Landing'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const BingooDashboard = lazy(() => import('./pages/BingooDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SubscriberMonitoring = lazy(() => import('./pages/SubscriberMonitoring'));
const Pricing = lazy(() => import('./pages/Pricing'));
const NFCRedirect = lazy(() => import('./pages/NFCRedirect'));
const ActivateDevice = lazy(() => import('./pages/ActivateDevice'));
const MyNFCDevices = lazy(() => import('./pages/MyNFCDevices'));
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const SubscriptionPricing = lazy(() => import('./pages/SubscriptionPricing'));
const Billing = lazy(() => import('./pages/Billing'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const ShopAdmin = lazy(() => import('./pages/ShopAdmin'));
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import BingooLayoutWrapper from '@/components/bingoo/BingooLayoutWrapper';
import { Navigate } from 'react-router-dom';
const PublicResume = lazy(() => import('@/pages/PublicResume'));
const PublicLawFirmProfile = lazy(() => import('@/pages/PublicLawFirmProfile'));
const LostDevicePage = lazy(() => import('@/pages/LostDevicePage'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const DataDeletion = lazy(() => import('@/pages/DataDeletion'));
const ContactSupport = lazy(() => import('@/pages/ContactSupport'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const AccountSettings = lazy(() => import('@/pages/AccountSettings'));
const PlaystoreMockups = lazy(() => import('@/pages/PlaystoreMockups'));
const Bingoo2Mockups = lazy(() => import('@/pages/Bingoo2Mockups'));
const AssetFinder = lazy(() => import('@/pages/AssetFinder'));
const PlaystoreCapture = lazy(() => import('@/pages/PlaystoreCapture'));

import PWASplashScreen from '@/components/pwa/PWASplashScreen';
import PWAInstallBanner from '@/components/pwa/PWAInstallBanner';
import RouteTransition from '@/components/mobile/RouteTransition';

// Redirect /sitemap.xml to the backend function (hard redirect, no React dependency)
function SitemapRedirect() {
  window.location.replace('/api/functions/sitemapXml');
  return null;
}

// Hard redirect legacy URLs BEFORE auth loading — prevents 404s on live site.
// These fire immediately on page load, no React Router or auth check needed.
// Updated 2026-07-10: ensures /activate and /signup never 404 on live deploy.
function LegacyRedirects() {
  const path = window.location.pathname.toLowerCase();
  if (path === '/activate') {
    // Preserve the activation code: /activate?code=BG-000007 → /n/BG-000007
    // The /n/:code flow handles device recognition, login return URL, and assignment.
    const params = new URLSearchParams(window.location.search);
    const code = (params.get('code') || '').toUpperCase().trim();
    window.location.replace(code ? `/n/${code}` : '/activate-device');
    return null;
  }
  if (path === '/signup') {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    window.location.replace('/register' + (next ? `?next=${encodeURIComponent(next)}` : ''));
    return null;
  }
  return null;
}


const AuthenticatedApp = () => {
  // Public routes render immediately — no auth/public-settings gate.
  // Protected routes handle their own loading state via ProtectedRoute.
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>}>
    <RouteTransition>
    <Routes>
      {/* ── AUTH ROUTES (public) ── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth" element={<AuthCallback />} />

      {/* ── PUBLIC ROUTES (no login needed) ── */}
      <Route path="/" element={<Landing />} />
      <Route path="/bingoo-home" element={<Landing />} />
      {/* Legacy page-name URL redirects → real routes (helps deep links & automation) */}
      <Route path="/LostDevicePage" element={<Navigate to="/my-nfc-devices" replace />} />
      <Route path="/Dashboard" element={<Navigate to="/bingoo" replace />} />
      <Route path="/DeviceActivationPage" element={<Navigate to="/activate-device" replace />} />
      <Route path="/activate" element={<Navigate to="/activate-device" replace />} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />
      <Route path="/p/:username" element={<PublicProfile />} />
      <Route path="/n/:deviceCode" element={<NFCRedirect />} />
      <Route path="/resume/:resumeId" element={<PublicResume />} />
      <Route path="/r/:resumeId" element={<PublicResume />} />
      <Route path="/firm/:username" element={<PublicLawFirmProfile />} />
      <Route path="/lost/:deviceCode" element={<LostDevicePage />} />
      <Route path="/sitemap.xml" element={<SitemapRedirect />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/data-deletion" element={<DataDeletion />} />
      <Route element={<BingooLayoutWrapper />}>
        <Route path="/contact-support" element={<ContactSupport />} />
      </Route>
      <Route path="/about" element={<About />} />
      <Route path="/playstore-mockups" element={<PlaystoreMockups />} />
      <Route path="/bingoo-2-mockups" element={<Bingoo2Mockups />} />
      <Route path="/asset/:nfcDeviceCode" element={<AssetFinder />} />
      <Route path="/a/:assetId" element={<AssetFinder />} />
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
        <Route element={<BingooLayoutWrapper />}>
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/advanced-admin" element={<Navigate to="/admin" replace />} />
        </Route>
        <Route path="/shop-admin" element={<ShopAdmin />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/playstore-capture" element={<AdminAuthGuard><PlaystoreCapture /></AdminAuthGuard>} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </RouteTransition>
    </Suspense>
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
            <ScrollRestoration />
            <LegacyRedirects />
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