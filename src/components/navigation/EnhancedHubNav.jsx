import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight, ChevronDown } from 'lucide-react';

const hubRoutes = {
  OmniHub: [
    { label: 'Hub', page: 'OmniHub', icon: '🏦' },
    { label: 'Cards', page: 'OmniCardStore', icon: '💳' },
    { label: 'Staking', page: 'OmniStaking', icon: '📍' },
    { label: 'Achievements', page: 'OmniAchievements', icon: '🏆' },
    { label: 'Wallet', page: 'Wallet', icon: '👛' },
    { label: 'Transactions', page: 'OmniDashboard', icon: '📊' }
  ],
  DeFiHub: [
    { label: 'Hub', page: 'DeFiHub', icon: '🎯' },
    { label: 'DEX Aggregator', page: 'DEXAggregator', icon: '🔄' },
    { label: 'Portfolio', page: 'PortfolioRebalancer', icon: '📈' },
    { label: 'Liquidity', page: 'LiquidityPools', icon: '💧' },
    { label: 'Yield Farming', page: 'AdvancedYieldFarming', icon: '🌾' },
    { label: 'Risk Tools', page: 'RiskAssessment', icon: '⚠️' }
  ],
  LabsHome: [
    { label: 'Hub', page: 'LabsHome', icon: '🔬' },
    { label: 'Blueprint', page: 'Blueprint', icon: '📐' },
    { label: 'Simulation', page: 'AdvancedSimulation', icon: '🎮' },
    { label: 'Agents', page: 'AgentManagement', icon: '🤖' },
    { label: 'Analytics', page: 'Analytics', icon: '📊' },
    { label: 'Gallery', page: 'BlueprintGallery', icon: '🖼️' }
  ],
  DeviceHome: [
    { label: 'Hub', page: 'DeviceHome', icon: '⚙️' },
    { label: 'Shop', page: 'DeviceShop', icon: '🛒' },
    { label: 'Marketplace', page: 'DeviceMarketplace', icon: '🏬' },
    { label: 'IoT Control', page: 'IoTDeviceControl', icon: '🔌' },
    { label: 'Fleet', page: 'FleetManagement', icon: '🚗' },
    { label: 'Health', page: 'DeviceHealth', icon: '❤️' }
  ],
  AdvancedSimulation: [
    { label: 'Simulation', page: 'AdvancedSimulation', icon: '🎮' },
    { label: 'Knowledge', page: 'AgentKnowledge', icon: '🧠' },
    { label: 'Environment', page: 'SimulationEnvironment', icon: '🌍' },
    { label: 'World', page: 'SimulationWorld', icon: '🗺️' },
    { label: 'Agents', page: 'AgentManagement', icon: '🤖' }
  ]
};

export default function EnhancedHubNav({ currentHub }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  
  const pageToHub = {
    'OmniHub': 'OmniHub',
    'OmniCardStore': 'OmniHub',
    'OmniStaking': 'OmniHub',
    'OmniAchievements': 'OmniHub',
    'Wallet': 'OmniHub',
    'OmniDashboard': 'OmniHub',
    'DeFiHub': 'DeFiHub',
    'DEXAggregator': 'DeFiHub',
    'PortfolioRebalancer': 'DeFiHub',
    'LiquidityPools': 'DeFiHub',
    'AdvancedYieldFarming': 'DeFiHub',
    'RiskAssessment': 'DeFiHub',
    'LabsHome': 'LabsHome',
    'Blueprint': 'LabsHome',
    'AdvancedSimulation': 'AdvancedSimulation',
    'AgentManagement': 'LabsHome',
    'Analytics': 'LabsHome',
    'BlueprintGallery': 'LabsHome',
    'DeviceHome': 'DeviceHome',
    'DeviceShop': 'DeviceHome',
    'DeviceMarketplace': 'DeviceHome',
    'IoTDeviceControl': 'DeviceHome',
    'FleetManagement': 'DeviceHome',
    'DeviceHealth': 'DeviceHome',
    'AgentKnowledge': 'AdvancedSimulation',
    'SimulationEnvironment': 'AdvancedSimulation',
    'SimulationWorld': 'AdvancedSimulation'
  };
  
  const pathParts = location.pathname.split('/').filter(Boolean);
  let detectedHub = currentHub;
  if (pathParts.length > 0) {
    const pageFromPath = pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1);
    detectedHub = pageToHub[pageFromPath] || currentHub;
  }
  
  const routes = hubRoutes[detectedHub] || [];
  if (routes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-black/80 via-black/70 to-black/80 backdrop-blur-xl border-b-2 border-cyan-500/30 sticky top-0 z-40 shadow-2xl"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header with Expand/Collapse */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-4 flex items-center justify-between group"
          whileHover={{ x: 5 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">📍</div>
            <div className="text-left">
              <div className="text-white font-bold text-lg">Hub Navigation</div>
              <div className="text-cyan-400 text-xs">{routes.length} pages available</div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
          </motion.div>
        </motion.button>

        {/* Expanded Pages */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/10 overflow-hidden"
            >
              <div className="py-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {routes.map((route, i) => {
                  const isActive = location.pathname === createPageUrl(route.page);
                  return (
                    <Link key={route.page} to={createPageUrl(route.page)}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ x: 5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-4 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                          isActive
                            ? 'bg-cyan-500/30 border border-cyan-500/50 text-white'
                            : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-cyan-500/30'
                        }`}
                      >
                        <span className="text-lg">{route.icon}</span>
                        <span className="font-semibold text-sm">{route.label}</span>
                        {isActive && (
                          <motion.div
                            layoutId="navIndicator"
                            className="ml-auto w-2 h-2 rounded-full bg-cyan-400"
                            transition={{ type: 'spring', bounce: 0.2 }}
                          />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}