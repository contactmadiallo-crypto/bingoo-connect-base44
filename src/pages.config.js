import React, { lazy, Suspense } from 'react';

const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

const withSuspense = (LazyComponent) => (props) => (
  <Suspense fallback={<SuspenseFallback />}>
    <LazyComponent {...props} />
  </Suspense>
);

const AddWork = lazy(() => import('./pages/AddWork'));
const Projects = lazy(() => import('./pages/Projects'));
const Finance = lazy(() => import('./pages/Finance'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Reports = lazy(() => import('./pages/Reports'));
const Files = lazy(() => import('./pages/Files'));
const Team = lazy(() => import('./pages/Team'));
const RestaurantMenu = lazy(() => import('./pages/RestaurantMenu'));
const KitchenView = lazy(() => import('./pages/KitchenView'));
const RestaurantAdmin = lazy(() => import('./pages/RestaurantAdmin'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const DeliveryManagement = lazy(() => import('./pages/DeliveryManagement'));
const CustomerApp = lazy(() => import('./pages/CustomerApp'));
const DeliveryPartnerDashboard = lazy(() => import('./pages/DeliveryPartnerDashboard'));
const RestaurantOnboarding = lazy(() => import('./pages/RestaurantOnboarding'));
const PlatformFinance = lazy(() => import('./pages/PlatformFinance'));
const DriverSignup = lazy(() => import('./pages/DriverSignup'));
const MarketplaceOnboarding = lazy(() => import('./pages/MarketplaceOnboarding'));
const DriverApp = lazy(() => import('./pages/DriverApp'));
const DriverEarnings = lazy(() => import('./pages/DriverEarnings'));
const RestaurantManagement = lazy(() => import('./pages/RestaurantManagement'));
const DriverTracking = lazy(() => import('./pages/DriverTracking'));
const OrderManagement = lazy(() => import('./pages/OrderManagement'));
const RestaurantAnalytics = lazy(() => import('./pages/RestaurantAnalytics'));
import __Layout from './Layout.jsx';


export const PAGES = {
    "AddWork": withSuspense(AddWork),
    "Projects": withSuspense(Projects),
    "Finance": withSuspense(Finance),
    "Calendar": withSuspense(Calendar),
    "Reports": withSuspense(Reports),
    "Files": withSuspense(Files),
    "Team": withSuspense(Team),
    "RestaurantMenu": withSuspense(RestaurantMenu),
    "KitchenView": withSuspense(KitchenView),
    "RestaurantAdmin": withSuspense(RestaurantAdmin),
    "OrderTracking": withSuspense(OrderTracking),
    "DeliveryManagement": withSuspense(DeliveryManagement),
    "CustomerApp": withSuspense(CustomerApp),
    "DeliveryPartnerDashboard": withSuspense(DeliveryPartnerDashboard),
    "RestaurantOnboarding": withSuspense(RestaurantOnboarding),
    "PlatformFinance": withSuspense(PlatformFinance),
    "DriverSignup": withSuspense(DriverSignup),
    "MarketplaceOnboarding": withSuspense(MarketplaceOnboarding),
    "DriverApp": withSuspense(DriverApp),
    "DriverEarnings": withSuspense(DriverEarnings),
    "RestaurantManagement": withSuspense(RestaurantManagement),
    "DriverTracking": withSuspense(DriverTracking),
    "OrderManagement": withSuspense(OrderManagement),
    "RestaurantAnalytics": withSuspense(RestaurantAnalytics),
}

export const pagesConfig = {
    mainPage: null,
    Pages: PAGES,
    Layout: __Layout,
};