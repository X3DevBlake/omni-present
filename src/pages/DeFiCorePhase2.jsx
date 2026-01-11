import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import LiquidityPoolManager from '../components/defi/LiquidityPoolManager';
import YieldFarmingOptimizer from '../components/defi/YieldFarmingOptimizer';
import CryptoPortfolioTracker from '../components/defi/CryptoPortfolioTracker';
import CrossChainBridgeManager from '../components/defi/CrossChainBridgeManager';
import BackButton from '../components/navigation/BackButton';
import { Droplets, Sprout, Wallet, GitBranch } from 'lucide-react';

export default function DeFiCorePhase2() {
  const [userEmail, setUserEmail] = React.useState(null);
  const [activeTab, setActiveTab] = useState('portfolio');

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const tabs = [
    { id: 'portfolio', label: '💎 Crypto Portfolio', icon: Wallet },
    { id: 'liquidity', label: '💧 Liquidity Pools', icon: Droplets },
    { id: 'yield', label: '🌾 Yield Farming', icon: Sprout },
    { id: 'bridge', label: '🔀 Cross-Chain Bridge', icon: GitBranch }
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <BackButton />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            DeFi Evolution <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Phase 2</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Decentralized finance features including liquidity pools, yield farming, and cross-chain asset management powered by AI
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 mb-8 border-b border-white/10 overflow-x-auto pb-3 flex-wrap">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-purple-500 text-purple-400'
                    : 'border-b-2 border-transparent text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {userEmail ? (
            <>
              {activeTab === 'portfolio' && <CryptoPortfolioTracker userEmail={userEmail} />}
              {activeTab === 'liquidity' && <LiquidityPoolManager userEmail={userEmail} />}
              {activeTab === 'yield' && <YieldFarmingOptimizer userEmail={userEmail} />}
              {activeTab === 'bridge' && <CrossChainBridgeManager userEmail={userEmail} />}
            </>
          ) : (
            <div className="text-center py-12 text-white/60">
              Please log in to access DeFi features
            </div>
          )}
        </motion.div>

        {/* Phase Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8"
        >
          <h3 className="text-white font-bold text-xl mb-4">Phase 2: DeFi Evolution Features</h3>
          <div className="grid md:grid-cols-2 gap-6 text-white/80 text-sm">
            <div>
              <h4 className="text-purple-400 font-semibold mb-2">✓ Implemented</h4>
              <ul className="space-y-1">
                <li>• Multi-chain crypto portfolio tracking</li>
                <li>• Liquidity pool management & monitoring</li>
                <li>• AI-powered yield farming optimizer</li>
                <li>• Cross-chain asset bridging</li>
                <li>• Real-time DeFi metrics & analytics</li>
                <li>• Risk assessment & impermanent loss tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="text-pink-400 font-semibold mb-2">📋 Coming Next</h4>
              <ul className="space-y-1">
                <li>• Autonomous trading agents</li>
                <li>• DAO governance integration</li>
                <li>• Smart contract auditing</li>
                <li>• DeFi insurance & hedging</li>
                <li>• Staking optimization</li>
                <li>• NFT portfolio management</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}