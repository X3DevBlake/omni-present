import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Coins, TrendingUp, Users, Lock, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function Tokenomics() {
  const distributionData = [
    { name: 'Public Sale', value: 40, color: '#00f5ff' },
    { name: 'Team & Advisors', value: 15, color: '#a855f7' },
    { name: 'Development', value: 20, color: '#ec4899' },
    { name: 'Marketing', value: 10, color: '#10b981' },
    { name: 'Reserve', value: 15, color: '#f59e0b' },
  ];

  const features = [
    {
      icon: Coins,
      title: 'Total Supply',
      value: '10 Billion OMNI',
      description: 'Fixed supply with no additional minting',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: TrendingUp,
      title: 'Deflationary Model',
      value: '2% Burn Rate',
      description: 'Transaction fees contribute to token burns',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Users,
      title: 'Governance',
      value: 'DAO Voting',
      description: 'Token holders vote on platform decisions',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Lock,
      title: 'Staking Rewards',
      value: 'Up to 15% APY',
      description: 'Earn rewards by locking your tokens',
      color: 'from-green-500 to-emerald-500'
    },
  ];

  const utilities = [
    {
      title: 'Agent Currency',
      description: 'Primary currency for AI agent transactions and autonomous purchases',
      icon: '🤖'
    },
    {
      title: 'Card Payments',
      description: 'Use Omni Card for real-world purchases with cashback rewards',
      icon: '💳'
    },
    {
      title: 'Platform Fees',
      description: 'Discounted fees when paying with OMNI tokens',
      icon: '💰'
    },
    {
      title: 'Staking',
      description: 'Stake tokens to earn passive income and governance rights',
      icon: '🔒'
    },
    {
      title: 'Premium Features',
      description: 'Access exclusive features and higher tier benefits',
      icon: '⭐'
    },
    {
      title: 'Marketplace',
      description: 'Trade AI agents, blueprints, and digital assets',
      icon: '🛒'
    },
  ];

  const roadmap = [
    { phase: 'Q1 2026', title: 'Launch', items: ['Token Generation Event', 'Initial Exchange Listings', 'Omni Card Launch'] },
    { phase: 'Q2 2026', title: 'Expansion', items: ['Cross-chain Bridges', 'Staking Platform', 'Agent Marketplace'] },
    { phase: 'Q3 2026', title: 'Growth', items: ['DAO Governance', 'Mobile App', 'Strategic Partnerships'] },
    { phase: 'Q4 2026', title: 'Ecosystem', items: ['DeFi Integration', 'NFT Marketplace', 'Global Expansion'] },
  ];

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Omni <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Tokenomics</span>
          </h1>
          <p className="text-white/60 text-lg">Understanding the Omni token economy</p>
        </motion.div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
              <div className="text-cyan-400 text-xl font-bold mb-2">{feature.value}</div>
              <p className="text-white/60 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            <h2 className="text-white font-bold text-2xl mb-6">Token Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
          >
            <h2 className="text-white font-bold text-2xl mb-6">Token Utility</h2>
            <div className="space-y-4">
              {utilities.map((utility, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-2xl">{utility.icon}</div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{utility.title}</h4>
                    <p className="text-white/60 text-sm">{utility.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
        >
          <h2 className="text-white font-bold text-2xl mb-8">Development Roadmap</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmap.map((phase, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6">
                  <div className="text-cyan-400 font-bold mb-2">{phase.phase}</div>
                  <h4 className="text-white font-bold text-lg mb-4">{phase.title}</h4>
                  <ul className="space-y-2">
                    {phase.items.map((item, i) => (
                      <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                        <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}