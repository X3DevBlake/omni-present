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
import SimulationWorld from './pages/SimulationWorld';
import Community from './pages/Community';
import Integrations from './pages/Integrations';
import Analytics from './pages/Analytics';
import AILab from './pages/AILab';
import DeviceShop from './pages/DeviceShop';
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
    "SimulationWorld": SimulationWorld,
    "Community": Community,
    "Integrations": Integrations,
    "Analytics": Analytics,
    "AILab": AILab,
    "DeviceShop": DeviceShop,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};