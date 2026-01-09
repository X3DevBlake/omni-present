import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CreditCard, TrendingUp, Repeat, DollarSign, PiggyBank, Award, ShoppingCart, Receipt, Target } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';
import PortfolioAdvisor from '../components/omni/PortfolioAdvisor';
import PersonalizedRecommendationWidget from '../components/personalization/PersonalizedRecommendationWidget';
import AIAgentManager from '../components/ai/AIAgentManager';
import { usePersonalization } from '../components/personalization/PersonalizationContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function OmniHub() {
  const { trackPageVisit } = usePersonalization();

  useEffect(() => {
    trackPageVisit('OmniHub');
  }, []);

  return (
    <>
      <EnhancedHubNav currentHub="OmniHub" />
      <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Personalized Recommendations */}
        <PersonalizedRecommendationWidget hubName="omni" maxItems={2} />

        {/* Portfolio Advisor */}
        <div className="mb-12">
          <PortfolioAdvisor />
        </div>

        {/* AI Agent Manager */}
        <div className="mb-12">
          <AIAgentManager />
        </div>
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 text-sm font-semibold">💎 Omni Banking Hub</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Omni
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Banking</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            Complete DeFi banking platform with cards, staking, liquidity pools, and AI-powered spending
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Omni Dashboard', description: 'View your balance, transactions & stats', icon: Wallet, page: 'OmniDashboard', gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
            { title: 'DEX Aggregator', description: 'Best rates across all exchanges', icon: Repeat, page: 'DEXAggregator', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
            { title: 'AI Portfolio Manager', description: 'Automated portfolio rebalancing', icon: Bot, page: 'AIPortfolioManager', gradient: 'from-purple-500/20 to-indigo-500/20', border: 'border-purple-500/30' },
            { title: 'Omni Card', description: 'Virtual & physical cards with cashback', icon: CreditCard, page: 'OmniCardStore', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
            { title: 'Card Management', description: 'Manage your Omni cards & settings', icon: CreditCard, page: 'OmniCardManagement', gradient: 'from-pink-500/20 to-purple-500/20', border: 'border-pink-500/30' },
            { title: 'Liquidity Pools', description: 'High-yield staking up to 1000% APY', icon: TrendingUp, page: 'LiquidityPools', gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
            { title: 'Staking', description: 'Stake Omni tokens for rewards', icon: PiggyBank, page: 'OmniStaking', gradient: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30' },
            { title: 'Buy Omni', description: 'Purchase Omni tokens with fiat or crypto', icon: DollarSign, page: 'BuyOmni', gradient: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30' },
            { title: 'Sell Omni', description: 'Sell Omni tokens to your bank', icon: DollarSign, page: 'SellOmni', gradient: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30' },
            { title: 'Bridge Tokens', description: 'Bridge Omni across blockchains', icon: Repeat, page: 'BridgeOmni', gradient: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/30' },
            { title: 'Deposit', description: 'Deposit ETH, USDT, or fiat', icon: Wallet, page: 'DepositETH', gradient: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-500/30' },
            { title: 'Withdraw', description: 'Withdraw Omni to your wallet', icon: Wallet, page: 'WithdrawOmni', gradient: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/30' },
            { title: 'Link Bank Account', description: 'Connect your bank via Plaid', icon: Wallet, page: 'LinkBankAccount', gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
            { title: 'Achievements', description: 'Unlock rewards & badges', icon: Award, page: 'OmniAchievements', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
            { title: 'Agent Spending', description: 'AI agents that shop for you', icon: ShoppingCart, page: 'AgentSpending', gradient: 'from-pink-500/20 to-red-500/20', border: 'border-pink-500/30' },
            { title: 'Agent Shopping Log', description: 'View agent purchase history', icon: Receipt, page: 'AgentShoppingLog', gradient: 'from-green-500/20 to-teal-500/20', border: 'border-green-500/30' },
            { title: 'Agent Budget', description: 'Set budgets for your AI agents', icon: Target, page: 'AgentBudget', gradient: 'from-yellow-500/20 to-green-500/20', border: 'border-yellow-500/30' },
            { title: 'Real-World Budget', description: 'Track real-world spending & savings', icon: Target, page: 'RealWorldBudget', gradient: 'from-orange-500/20 to-yellow-500/20', border: 'border-orange-500/30' },
            { title: 'Tokenomics', description: 'Omni token economics & distribution', icon: TrendingUp, page: 'Tokenomics', gradient: 'from-cyan-500/20 to-purple-500/20', border: 'border-cyan-500/30' },
            { title: 'Exchange Listings', description: 'Where to trade Omni tokens', icon: Repeat, page: 'ExchangeListings', gradient: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/30' },
            { title: 'DeFi Hub', description: 'Advanced DeFi with DEX aggregation & AI', icon: TrendingUp, page: 'DeFiHub', gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' }
          ].map((item, i) => (
            <Link key={i} to={createPageUrl(item.page)}>
              <motion.div 
                className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group`} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </AuroraBackground>
    </>
  );
}