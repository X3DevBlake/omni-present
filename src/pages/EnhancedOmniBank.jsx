import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Shield, Brain, Target, Zap, Users } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import BackButton from '../components/navigation/BackButton';
import FinancialGalaxy3D from '../components/3d/FinancialGalaxy3D';
import AIBudgetingForecasting from '../components/banking/AIBudgetingForecasting';
import PersonalizedFinancialAdvisorAI from '../components/banking/PersonalizedFinancialAdvisorAI';
import GamifiedSavingsChallenge from '../components/banking/GamifiedSavingsChallenge';
import RealTimeSpendingInsights3D from '../components/3d/RealTimeSpendingInsights3D';
import MultiCurrencyWallet from '../components/banking/MultiCurrencyWallet';
import SubscriptionManagementAI from '../components/banking/SubscriptionManagementAI';
import FraudDetectionAlerting from '../components/banking/FraudDetectionAlerting';
import GoalBasedSavingsPortfolio from '../components/banking/GoalBasedSavingsPortfolio';
import EthicalSpendingTracker from '../components/banking/EthicalSpendingTracker';
import DebtRepaymentVisualizer3D from '../components/3d/DebtRepaymentVisualizer3D';
import AdvancedPortfolioManagerAI from '../components/ai/AdvancedPortfolioManagerAI';
import SocialFinanceFeed from '../components/social/SocialFinanceFeed';

export default function EnhancedOmniBank() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '🌌 Financial Galaxy', icon: Wallet },
    { id: 'ai-advisor', label: '🤖 AI Advisor', icon: Brain },
    { id: 'budgeting', label: '📊 Smart Budget', icon: TrendingUp },
    { id: 'savings', label: '🎯 Savings Goals', icon: Target },
    { id: 'security', label: '🛡️ Security', icon: Shield },
    { id: 'insights', label: '⚡ Insights', icon: Zap },
    { id: 'social', label: '👥 Social Finance', icon: Users },
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
            Enhanced Omni <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Banking Hub</span>
          </h1>
          <p className="text-white/60 text-lg">AI-powered financial management with immersive 3D visualizations</p>
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
              <FinancialGalaxy3D />
              <div className="grid lg:grid-cols-2 gap-6">
                <MultiCurrencyWallet />
                <RealTimeSpendingInsights3D />
              </div>
            </div>
          )}

          {activeTab === 'ai-advisor' && (
            <div className="space-y-6">
              <AdvancedPortfolioManagerAI />
              <PersonalizedFinancialAdvisorAI />
              <SubscriptionManagementAI />
            </div>
          )}

          {activeTab === 'budgeting' && (
            <div className="space-y-6">
              <AIBudgetingForecasting />
              <EthicalSpendingTracker />
            </div>
          )}

          {activeTab === 'savings' && (
            <div className="space-y-6">
              <GamifiedSavingsChallenge />
              <GoalBasedSavingsPortfolio />
              <DebtRepaymentVisualizer3D />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <FraudDetectionAlerting />
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-bold text-xl mb-4">🔐 Biometric Authentication</h3>
                <p className="text-white/60 mb-4">Enhanced security with fingerprint and facial recognition</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="text-green-400 font-bold mb-2">Fingerprint Auth</div>
                    <div className="text-white/60 text-sm">Status: Enabled</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="text-blue-400 font-bold mb-2">Face Recognition</div>
                    <div className="text-white/60 text-sm">Status: Enabled</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <RealTimeSpendingInsights3D />
              <EthicalSpendingTracker />
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <SocialFinanceFeed />
            </div>
          )}
        </div>
      </div>
    </AuroraBackground>
  );
}