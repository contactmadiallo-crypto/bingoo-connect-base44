import Dashboard from './pages/Dashboard';
import AddWork from './pages/AddWork';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "AddWork": AddWork,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};