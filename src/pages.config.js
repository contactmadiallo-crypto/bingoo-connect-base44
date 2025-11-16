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
import Layout from './Layout.jsx';


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
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};