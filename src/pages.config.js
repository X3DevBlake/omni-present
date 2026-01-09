import About from './pages/About';
import Agent from './pages/Agent';
import Blueprint from './pages/Blueprint';
import Contact from './pages/Contact';
import Features from './pages/Features';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Technology from './pages/Technology';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Agent": Agent,
    "Blueprint": Blueprint,
    "Contact": Contact,
    "Features": Features,
    "Home": Home,
    "Marketplace": Marketplace,
    "Profile": Profile,
    "Settings": Settings,
    "Technology": Technology,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};