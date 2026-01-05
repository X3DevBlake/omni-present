import Blueprint from './pages/Blueprint';
import Contact from './pages/Contact';
import Features from './pages/Features';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Technology from './pages/Technology';
import Marketplace from './pages/Marketplace';
import About from './pages/About';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Blueprint": Blueprint,
    "Contact": Contact,
    "Features": Features,
    "Home": Home,
    "Settings": Settings,
    "Technology": Technology,
    "Marketplace": Marketplace,
    "About": About,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};