import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, Palette, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import Rotating3DIcon from '../3d/Rotating3DIcon';

export default function EnhancedMainNavWithIcons() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null));
  }, []);

  const hubs = [
    { id: 1, label: 'Home', page: 'Home', icon: '🏠', color: '#00f5ff' },
    { id: 2, label: 'OmniBank', page: 'EnhancedOmniBank', icon: '🏦', color: '#06b6d4' },
    { id: 3, label: 'DeFi Hub', page: 'EnhancedDeFiHub', icon: '💎', color: '#a855f7' },
    { id: 4, label: 'Marketplace', page: 'Marketplace', icon: '🛍️', color: '#ec4899' },
    { id: 5, label: 'Blueprint', page: 'Blueprint', icon: '📐', color: '#f59e0b' },
    { id: 6, label: 'Simulation', page: 'SimulationWorld', icon: '🎮', color: '#10b981' },
    { id: 7, label: 'AI Lab', page: 'AILab', icon: '🧪', color: '#8b5cf6' },
    { id: 8, label: 'Analytics', page: 'Analytics', icon: '📊', color: '#06b6d4' },
  ];

  const handleMouseDown = (e) => {
    if (e.target.closest('[data-no-drag]')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', () => setIsDragging(false));
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', () => {});
    };
  }, [isDragging, dragOffset, position]);

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl('Home'));
  };

  return (
    <>
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onMouseDown={handleMouseDown}
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: 50,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            className="select-none"
          >
            <motion.button
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-cyan-500/50 border-2 border-white/20 hover:border-white/50 transition-all"
              data-no-drag="true"
            >
              <Menu className="w-8 h-8 text-white" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onMouseDown={handleMouseDown}
              style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 50,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              className="w-[90vw] max-w-3xl select-none"
            >
              <div className="bg-black/80 backdrop-blur-xl border-2 border-cyan-500/50 rounded-3xl p-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-white font-bold text-2xl">Omni-Present Hubs</h2>
                    {user && <p className="text-white/60 text-sm mt-1">Welcome, {user.full_name}</p>}
                  </div>
                  <motion.button
                    onClick={() => setIsExpanded(false)}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    data-no-drag="true"
                  >
                    <X className="w-6 h-6 text-white" />
                  </motion.button>
                </div>

                {/* Hub Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {hubs.map((hub, i) => (
                    <Link
                      key={hub.id}
                      to={createPageUrl(hub.page)}
                      onClick={() => setIsExpanded(false)}
                      data-no-drag="true"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.05, y: -10 }}
                        whileTap={{ scale: 0.95 }}
                        className="h-32 rounded-2xl bg-gradient-to-br p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition-all border"
                        style={{
                          borderColor: hub.color + '50',
                          background: `linear-gradient(135deg, ${hub.color}20, ${hub.color}05)`
                        }}
                      >
                        <div className="w-16 h-16 flex items-center justify-center">
                          <Rotating3DIcon icon={hub.icon} color={hub.color} size={60} />
                        </div>
                        <div className="text-center">
                          <div className="text-white font-bold text-sm">{hub.label}</div>
                          {location.pathname === createPageUrl(hub.page) && (
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                              <span className="text-green-400 text-xs">Active</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>

                {/* Settings & Profile Section */}
                <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                  <motion.button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    whileHover={{ scale: 1.05 }}
                    className="flex-1 p-3 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 text-white transition-colors"
                    data-no-drag="true"
                  >
                    <Palette className="w-5 h-5" />
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </motion.button>

                  {user && (
                    <motion.button
                      onClick={handleLogout}
                      whileHover={{ scale: 1.05 }}
                      className="flex-1 p-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center gap-2 text-red-400 transition-colors"
                      data-no-drag="true"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </motion.button>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/60 text-xs text-center">
                    Drag by the title bar • {hubs.length} hubs available
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}