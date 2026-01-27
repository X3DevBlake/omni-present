import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, X, GraduationCap, Sparkles } from 'lucide-react';
import ProfileIcon from './ProfileIcon';
import { Button } from '@/components/ui/button';
import GlobalSearch from './GlobalSearch';

export default function ConsolidatedNav({ onSidebarToggle, isSidebarOpen }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-2xl border-b border-purple-500/20">
      <div className="container-fluid px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onSidebarToggle}
              className="p-2 hover:bg-white/10 rounded-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </motion.button>

            <Link to={createPageUrl('Home')}>
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Sparkles className="w-7 h-7 text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,1)]" />
                </motion.div>
                
                <motion.h1 
                  className="text-xl font-black relative hidden md:block"
                  style={{ 
                    background: 'linear-gradient(90deg, #c084fc 0%, #ec4899 50%, #22d3ee 100%)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  OMNI-PRESENT
                </motion.h1>
              </motion.div>
            </Link>
          </div>

          <div className="flex-1 max-w-2xl mx-auto">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-4">
            <Link to={createPageUrl('OmniNavigationHub')}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block"
              >
                <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                  <Globe className="w-4 h-4 mr-2 animate-pulse" />
                  Omni-Nav Hub
                </Button>
              </motion.div>
            </Link>
            <ProfileIcon />
          </div>
        </div>
      </div>
    </div>
  );
}