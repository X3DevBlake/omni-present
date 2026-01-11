import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, LayoutDashboard, Users, Cpu, Video, TrendingUp, Zap, Target, Box } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Hub3DIcon from './Hub3DIcon';
import Rotating3DIcon from '../3d/Rotating3DIcon';

const hubs = [
  { id: 1, label: 'Home', page: 'Home', icon: '🏠', color: '#00f5ff' },
  { id: 2, label: 'Dashboard', page: 'EnhancedDashboard', icon: '📊', color: '#06b6d4' },
  { id: 3, label: 'Collaboration', page: 'EnhancedCollaborationHub', icon: '🤝', color: '#a855f7' },
  { id: 4, label: 'Agent Mgmt', page: 'AgentManagementHub', icon: '🤖', color: '#10b981' },
  { id: 5, label: 'Video Call', page: 'AgentVideoInterface', icon: '📹', color: '#ec4899' },
  { id: 6, label: 'Auto Finance', page: 'AutomatedFinanceHub', icon: '💰', color: '#f59e0b' },
  { id: 7, label: 'Real-time', page: 'RealtimeDashboard', icon: '⚡', color: '#06b6d4' },
  { id: 8, label: 'Predictions', page: 'AdvancedPredictionCenter', icon: '🎯', color: '#8b5cf6' },
  { id: 9, label: 'Sim Studio', page: 'AdvancedSimulationStudio', icon: '🔬', color: '#ec4899' },
  { id: 10, label: 'Blueprint', page: 'Blueprint', icon: '📐', color: '#a855f7' },
];

export default function EnhancedMainNav() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const navRef = useRef(null);
  const location = useLocation();

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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, position]);

  return (
    <>
      {/* Collapsed Navigation */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            ref={navRef}
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

      {/* Expanded Navigation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={navRef}
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
            className="w-[90vw] max-w-2xl select-none"
          >
            <div className="bg-black/80 backdrop-blur-xl border-2 border-cyan-500/50 rounded-3xl p-8 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-2xl">Omni-Present Hubs</h2>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                      className={`h-32 rounded-2xl bg-gradient-to-br from-${getColorClass(hub.color)}-500/20 to-${getColorClass(hub.color)}-500/5 border border-${getColorClass(hub.color)}-500/30 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-lg transition-all`}
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

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-white/60 text-xs text-center">
                  Drag by the title bar • Click any hub to navigate • Up to 15 hubs supported
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getColorClass(color) {
  const colorMap = {
    '#00f5ff': 'cyan',
    '#a855f7': 'purple',
    '#10b981': 'green',
    '#f59e0b': 'amber',
    '#ec4899': 'pink',
    '#06b6d4': 'cyan'
  };
  return colorMap[color] || 'cyan';
}