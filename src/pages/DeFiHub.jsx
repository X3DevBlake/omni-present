import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Repeat, PieChart, Shield, Zap, Target } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import HubNav from '../components/navigation/HubNav';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function DeFiHub() {
  return (
    <>
      <HubNav currentHub="DeFiHub" />
      <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
            <span className="text-green-400 text-sm font-semibold">💰 DeFi Hub</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Advanced
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> DeFi</span>
          </h1>
          <p className="text-white/60 text-lg max-w-3xl mx-auto">
            AI-powered decentralized finance with optimal swaps, automated rebalancing, and intelligent yield farming
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'DEX Aggregator', description: 'Optimal token swaps across multiple DEXs', icon: Repeat, page: 'DEXAggregator', gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
            { title: 'Portfolio Rebalancer', description: 'AI-driven automated portfolio optimization', icon: PieChart, page: 'PortfolioRebalancer', gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
            { title: 'Yield Farming', description: 'Advanced farming with risk assessment', icon: TrendingUp, page: 'AdvancedYieldFarming', gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
            { title: 'Liquidity Pools', description: 'High-yield staking up to 1000% APY', icon: TrendingUp, page: 'LiquidityPools', gradient: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30' },
            { title: 'Risk Assessment', description: 'Real-time DeFi protocol risk analysis', icon: Shield, page: 'RiskAssessment', gradient: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30' },
            { title: 'AI Trading Agents', description: 'Automated trading strategies', icon: Zap, page: 'AITradingAgents', gradient: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30' },
            { title: 'Strategy Optimizer', description: 'Optimize your DeFi strategies with AI', icon: Target, page: 'StrategyOptimizer', gradient: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/30' }
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