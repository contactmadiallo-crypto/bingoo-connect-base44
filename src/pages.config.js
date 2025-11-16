import Dashboard from './pages/Dashboard';
import AddWork from './pages/AddWork';
import Projects from './pages/Projects';
import Finance from './pages/Finance';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import Files from './pages/Files';
import Team from './pages/Team';
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
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};