import Dashboard from './pages/Dashboard';
import AddWork from './pages/AddWork';
import Projects from './pages/Projects';
import Finance from './pages/Finance';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Files from './pages/Files';
import Team from './pages/Team';
import RestaurantMenu from './pages/RestaurantMenu';
import KitchenView from './pages/KitchenView';
import RestaurantAdmin from './pages/RestaurantAdmin';
import OrderTracking from './pages/OrderTracking';
import DeliveryManagement from './pages/DeliveryManagement';
import CustomerApp from './pages/CustomerApp';
import DeliveryPartnerDashboard from './pages/DeliveryPartnerDashboard';
import RestaurantOnboarding from './pages/RestaurantOnboarding';
import PlatformFinance from './pages/PlatformFinance';
import DriverSignup from './pages/DriverSignup';
import MarketplaceOnboarding from './pages/MarketplaceOnboarding';
import DriverApp from './pages/DriverApp';
import DriverEarnings from './pages/DriverEarnings';
import RestaurantManagement from './pages/RestaurantManagement';
import DriverTracking from './pages/DriverTracking';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "AddWork": AddWork,
    "Projects": Projects,
    "Finance": Finance,
    "Calendar": Calendar,
    "Reports": Reports,
    "Files": Files,
    "Team": Team,
    "RestaurantMenu": RestaurantMenu,
    "KitchenView": KitchenView,
    "RestaurantAdmin": RestaurantAdmin,
    "OrderTracking": OrderTracking,
    "DeliveryManagement": DeliveryManagement,
    "CustomerApp": CustomerApp,
    "DeliveryPartnerDashboard": DeliveryPartnerDashboard,
    "RestaurantOnboarding": RestaurantOnboarding,
    "PlatformFinance": PlatformFinance,
    "DriverSignup": DriverSignup,
    "MarketplaceOnboarding": MarketplaceOnboarding,
    "DriverApp": DriverApp,
    "DriverEarnings": DriverEarnings,
    "RestaurantManagement": RestaurantManagement,
    "DriverTracking": DriverTracking,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};