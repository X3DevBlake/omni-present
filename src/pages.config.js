import About from './pages/About';
import Blueprint from './pages/Blueprint';
import Contact from './pages/Contact';
import Features from './pages/Features';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Technology from './pages/Technology';
import Agent from './pages/Agent';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Blueprint": Blueprint,
    "Contact": Contact,
    "Features": Features,
    "Home": Home,
    "Marketplace": Marketplace,
    "Profile": Profile,
    "Settings": Settings,
    "Technology": Technology,
    "Agent": Agent,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};