import AILab from './pages/AILab';
import About from './pages/About';
import Agent from './pages/Agent';
import Analytics from './pages/Analytics';
import Blueprint from './pages/Blueprint';
import Community from './pages/Community';
import Contact from './pages/Contact';
import DeviceShop from './pages/DeviceShop';
import Features from './pages/Features';
import Home from './pages/Home';
import Integrations from './pages/Integrations';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SimulationWorld from './pages/SimulationWorld';
import Technology from './pages/Technology';
import DeviceInteraction from './pages/DeviceInteraction';
import FleetManagement from './pages/FleetManagement';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AILab": AILab,
    "About": About,
    "Agent": Agent,
    "Analytics": Analytics,
    "Blueprint": Blueprint,
    "Community": Community,
    "Contact": Contact,
    "DeviceShop": DeviceShop,
    "Features": Features,
    "Home": Home,
    "Integrations": Integrations,
    "Marketplace": Marketplace,
    "Profile": Profile,
    "Settings": Settings,
    "SimulationWorld": SimulationWorld,
    "Technology": Technology,
    "DeviceInteraction": DeviceInteraction,
    "FleetManagement": FleetManagement,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};