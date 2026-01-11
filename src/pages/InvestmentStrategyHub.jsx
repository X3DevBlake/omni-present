import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Zap, BarChart3 } from 'lucide-react';

export default function InvestmentStrategyHub() {
  const strategies = [
    {
      name: 'Growth Portfolio',
      allocation: { stocks: 80, bonds: 15, alternatives: 5 },
      expectedReturn: '9.2%',
      riskLevel: 'Moderate-High',
      status: 'Active',
    },
    {
      name: 'Conservative Strategy',
      allocation: { stocks: 40, bonds: 55, cash: 5 },
      expectedReturn: '4.5%',
      riskLevel: 'Low',
      status: 'Recommended',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent mb-2">
          Investment Strategy Generator
        </h1>
        <p className="text-white/60 mb-8">AI-powered personalized strategies aligned with your goals and risk tolerance</p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Target, title: 'Goal Alignment', desc: 'Strategies matched to your objectives' },
            { icon: TrendingUp, title: 'Performance Forecast', desc: '1yr, 5yr, 10yr projections' },
            { icon: Zap, title: 'Opportunities', desc: 'Specific investments to buy' },
            { icon: BarChart3, title: 'Comparison', desc: 'Compare multiple strategies' },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
              >
                <Icon className="w-6 h-6 text-cyan-400 mb-2" />
                <p className="text-white font-bold text-sm mb-1">{feature.title}</p>
                <p className="text-white/60 text-xs">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Strategies */}
        <div className="space-y-4">
          {strategies.map((strategy, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{strategy.name}</h3>
                  <p className="text-white/60 text-sm">Risk: {strategy.riskLevel}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  strategy.status === 'Active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {strategy.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                {Object.entries(strategy.allocation).map(([asset, pct]) => (
                  <div key={asset}>
                    <p className="text-white/60 text-xs capitalize">{asset}</p>
                    <p className="text-cyan-400 font-bold">{pct}%</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-white/80 text-sm">Expected Return: <span className="text-green-400 font-bold">{strategy.expectedReturn}</span></p>
                <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 text-sm hover:bg-cyan-500/30 transition-all">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}