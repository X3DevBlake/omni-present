import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { createPageUrl } from '../utils';

const navItems = [
  { label: 'Home', page: 'Home' },
  { label: 'Technology', page: 'Technology' },
  { label: 'Features', page: 'Features' },
  { label: 'Blueprint', page: 'Blueprint' },
  { label: 'Contact', page: 'Contact' },
];

export default function FloatingNav() {
  const [isScrolled, setIsScrolled] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <motion.nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-2 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      >
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <div className="px-4 py-2">
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Omni-Present
            </span>
          </div>
          
          {navItems.map((item) => {
            const isActive = location.pathname === createPageUrl(item.page);
            return (
              <Link
                key={item.label}
                to={createPageUrl(item.page)}
                className={`px-4 py-2 text-sm transition-colors rounded-full ${
                  isActive 
                    ? 'text-white bg-white/10' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          
          <motion.button
            className="ml-2 px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden items-center justify-between px-4 py-1 min-w-[280px]">
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Omni-Present
          </span>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-white/70 hover:text-white"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
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
          >
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              className="absolute top-20 left-4 right-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === createPageUrl(item.page);
                  return (
                    <Link
                      key={item.label}
                      to={createPageUrl(item.page)}
                      onClick={() => setIsMobileOpen(false)}
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
                <button className="mt-4 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium">
                  Get Started
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}