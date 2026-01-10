import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Network, Shield, Zap, Globe, Users } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import BackButton from '../components/navigation/BackButton';
import MultiChainAssetManager3D from '../components/3d/MultiChainAssetManager3D';
import AIYieldFarmingOptimizer from '../components/defi/AIYieldFarmingOptimizer';
import AutomatedDeFiStrategyBuilder from '../components/defi/AutomatedDeFiStrategyBuilder';
import ImmersiveLPPoolVisualizer3D from '../components/3d/ImmersiveLPPoolVisualizer3D';
import DeFiRiskAssessmentAI from '../components/defi/DeFiRiskAssessmentAI';
import CrossChainBridgeAggregator from '../components/defi/CrossChainBridgeAggregator';
import NFTPortfolioTracker from '../components/defi/NFTPortfolioTracker';
import OnChainDataIntelligence from '../components/defi/OnChainDataIntelligence';
import DecentralizedIdentityHub from '../components/did/DecentralizedIdentityHub';
import DIDAvatar3D from '../components/3d/DIDAvatar3D';
import VerifiableCredentialManager from '../components/did/VerifiableCredentialManager';
import DIDReputationTree3D from '../components/3d/DIDReputationTree3D';

export default function EnhancedDeFiHub() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '🌐 Multi-Chain', icon: Globe },
    { id: 'yield', label: '🌾 Yield Farming', icon: Coins },
    { id: 'pools', label: '💧 Liquidity Pools', icon: Network },
    { id: 'nft', label: '🖼️ NFT Portfolio', icon: Zap },
    { id: 'did', label: '🆔 Decentralized ID', icon: Users },
    { id: 'security', label: '🛡️ Risk & Security', icon: Shield },
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Enhanced DeFi <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Hub</span>
          </h1>
          <p className="text-white/60 text-lg">Advanced decentralized finance with AI optimization and 3D immersion</p>
        </motion.div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 border-b border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <MultiChainAssetManager3D />
              <div className="grid lg:grid-cols-2 gap-6">
                <CrossChainBridgeAggregator />
                <OnChainDataIntelligence />
              </div>
            </div>
          )}

          {activeTab === 'yield' && (
            <div className="space-y-6">
              <AIYieldFarmingOptimizer />
              <AutomatedDeFiStrategyBuilder />
            </div>
          )}

          {activeTab === 'pools' && (
            <div className="space-y-6">
              <ImmersiveLPPoolVisualizer3D />
            </div>
          )}

          {activeTab === 'nft' && (
            <div className="space-y-6">
              <NFTPortfolioTracker />
            </div>
          )}

          {activeTab === 'did' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <DIDAvatar3D />
                <DIDReputationTree3D />
              </div>
              <DecentralizedIdentityHub />
              <VerifiableCredentialManager />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <DeFiRiskAssessmentAI />
            </div>
          )}
        </div>
      </div>
    </AuroraBackground>
  );
}