import Blueprint from './pages/Blueprint';
import Contact from './pages/Contact';
import Features from './pages/Features';
import Home from './pages/Home';
import Technology from './pages/Technology';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Blueprint": Blueprint,
    "Contact": Contact,
    "Features": Features,
    "Home": Home,
    "Technology": Technology,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};