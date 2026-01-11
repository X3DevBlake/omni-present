import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FinancialPlanningModule from '../components/planning/FinancialPlanningModule';
import NewsSentimentDashboard from '../components/analytics/NewsSentimentDashboard';
import PortfolioRebalancingAdvisor from '../components/portfolio/PortfolioRebalancingAdvisor';

export default function ComprehensiveFinancialHub() {
  const [activeTab, setActiveTab] = useState('planning');

  const tabs = [
    { id: 'planning', label: 'Financial Planning', icon: '📊' },
    { id: 'sentiment', label: 'News & Sentiment', icon: '📰' },
    { id: 'rebalancing', label: 'Portfolio Rebalancing', icon: '⚖️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Comprehensive Financial Hub
          </h1>
          <p className="text-white/60">
            Long-term planning, AI-powered market analysis, and automated portfolio management
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg border whitespace-nowrap flex-shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
              }`}
            >
              {tab.icon} {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'planning' && <FinancialPlanningModule />}
          {activeTab === 'sentiment' && <NewsSentimentDashboard />}
          {activeTab === 'rebalancing' && <PortfolioRebalancingAdvisor />}
        </motion.div>

        {/* Feature Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              title: 'Long-Term Planning',
              desc: 'Retirement, college, major purchases with gap analysis',
            },
            {
              title: 'Market Intelligence',
              desc: 'Real-time news analysis with portfolio impact scoring',
            },
            {
              title: 'Smart Rebalancing',
              desc: 'Automated suggestions based on volatility & goals',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
            >
              <p className="text-white font-bold mb-1">{feature.title}</p>
              <p className="text-white/60 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}