import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';

const hubRoutes = {
  OmniHub: [
    { label: 'Hub', page: 'OmniHub' },
    { label: 'Cards', page: 'OmniCardStore' },
    { label: 'Staking', page: 'OmniStaking' },
    { label: 'Achievements', page: 'OmniAchievements' },
    { label: 'Wallet', page: 'Wallet' },
    { label: 'Transactions', page: 'OmniDashboard' }
  ],
  DeFiHub: [
    { label: 'Hub', page: 'DeFiHub' },
    { label: 'DEX Aggregator', page: 'DEXAggregator' },
    { label: 'Portfolio', page: 'PortfolioRebalancer' },
    { label: 'Liquidity', page: 'LiquidityPools' },
    { label: 'Yield Farming', page: 'AdvancedYieldFarming' },
    { label: 'Risk Tools', page: 'RiskAssessment' }
  ],
  LabsHome: [
    { label: 'Hub', page: 'LabsHome' },
    { label: 'Blueprint', page: 'Blueprint' },
    { label: 'Simulation', page: 'AdvancedSimulation' },
    { label: 'Agents', page: 'AgentManagement' },
    { label: 'Analytics', page: 'Analytics' },
    { label: 'Gallery', page: 'BlueprintGallery' }
  ],
  DeviceHome: [
    { label: 'Hub', page: 'DeviceHome' },
    { label: 'Shop', page: 'DeviceShop' },
    { label: 'Marketplace', page: 'DeviceMarketplace' },
    { label: 'IoT Control', page: 'IoTDeviceControl' },
    { label: 'Fleet', page: 'FleetManagement' },
    { label: 'Health', page: 'DeviceHealth' }
  ],
  AdvancedSimulation: [
    { label: 'Simulation', page: 'AdvancedSimulation' },
    { label: 'Knowledge', page: 'AgentKnowledge' },
    { label: 'Environment', page: 'SimulationEnvironment' },
    { label: 'World', page: 'SimulationWorld' },
    { label: 'Recording', page: 'AdvancedSimulation' }
  ]
};

export default function HubNav({ currentHub }) {
  const location = useLocation();
  
  // Map page names to hub names
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
  
  // Detect hub from pathname
  let detectedHub = currentHub;
  const pathParts = location.pathname.split('/').filter(Boolean);
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
      className="bg-black/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {routes.map((route, i) => {
            const isActive = location.pathname === createPageUrl(route.page);
            return (
              <React.Fragment key={route.page}>
                {i > 0 && <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />}
                <Link to={createPageUrl(route.page)}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-cyan-500/30 text-white border border-cyan-500/50'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {route.label}
                  </motion.div>
                </Link>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}