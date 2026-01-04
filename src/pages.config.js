import Home from './pages/Home';
import Technology from './pages/Technology';
import Features from './pages/Features';
import Blueprint from './pages/Blueprint';
import Contact from './pages/Contact';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Technology": Technology,
    "Features": Features,
    "Blueprint": Blueprint,
    "Contact": Contact,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};