import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const navItems = [
  { label: 'Home', page: 'Home' },
  { label: 'Labs', page: 'Labs' },
  { label: 'Devices', page: 'DeviceHome' },
  { label: 'Campus', page: 'CampusHome' },
  { label: 'Marketplace', page: 'Marketplace' },
  { label: 'Profile', page: 'ProfileHome' },
  { label: 'Admin', page: 'AdminHome' },
  { label: 'Developer', page: 'DeveloperHome' },
];

export default function FloatingNav() {
  const [isScrolled, setIsScrolled] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showDesktopMenu, setShowDesktopMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
      className={`fixed left-1/2 -translate-x-1/2 z-50 px-2 py-2 rounded-full backdrop-blur-xl border transition-all duration-300 ${
        isScrolled 
          ? 'top-4 bg-black/60 border-white/20 shadow-xl' 
          : 'top-6 bg-black/40 border-white/10'
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          <Link to={createPageUrl('Home')} className="px-4 py-2">
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Omni-Present
            </span>
          </Link>
          
          {navItems.map((item) => {
            const isActive = location.pathname === createPageUrl(item.page);
            return (
              <motion.div key={item.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={createPageUrl(item.page)}
                  className={`px-4 py-2 text-sm transition-all rounded-full relative ${
                    isActive 
                      ? 'text-white bg-white/10' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
          
          <motion.button
            className="ml-2 px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/20"
            whileHover={{ scale: 1.05, shadow: "0 0 20px rgba(6, 182, 212, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </div>

        {/* Tablet/Desktop Dropdown Navigation */}
        <div className="hidden md:flex lg:hidden items-center justify-between px-4 py-1 min-w-[280px]">
          <Link to={createPageUrl('Home')}>
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Omni-Present
            </span>
          </Link>
          <button
            onClick={() => setShowDesktopMenu(!showDesktopMenu)}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden items-center justify-between px-4 py-1 min-w-[240px]">
          <Link to={createPageUrl('Home')}>
            <span className="text-base font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Omni-Present
            </span>
          </Link>
          <motion.button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-white/70 hover:text-white transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setIsMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="absolute top-20 left-4 right-4 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === createPageUrl(item.page);
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={createPageUrl(item.page)}
                        onClick={() => setIsMobileOpen(false)}
                        className={`px-4 py-3 text-left transition-all rounded-xl flex items-center justify-between ${
                          isActive 
                            ? 'text-white bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30' 
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {item.label}
                        {isActive && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                      </Link>
                    </motion.div>
                  );
                })}
                <motion.button 
                  className="mt-3 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tablet Dropdown Menu */}
      <AnimatePresence>
        {showDesktopMenu && (
          <motion.div
            className="fixed inset-0 z-40 hidden md:block lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDesktopMenu(false)}
            />
            <motion.div
              className="absolute top-20 left-1/2 -translate-x-1/2 w-80 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === createPageUrl(item.page);
                  return (
                    <Link
                      key={item.label}
                      to={createPageUrl(item.page)}
                      onClick={() => setShowDesktopMenu(false)}
                      className={`px-4 py-3 text-left transition-colors rounded-xl ${
                        isActive 
                          ? 'text-white bg-white/10' 
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}