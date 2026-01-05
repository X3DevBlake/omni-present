import Blueprint from './pages/Blueprint';
import Contact from './pages/Contact';
import Features from './pages/Features';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Technology from './pages/Technology';
import Marketplace from './pages/Marketplace';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Blueprint": Blueprint,
    "Contact": Contact,
    "Features": Features,
    "Home": Home,
    "Settings": Settings,
    "Technology": Technology,
    "Marketplace": Marketplace,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};