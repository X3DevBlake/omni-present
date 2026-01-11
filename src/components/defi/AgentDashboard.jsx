import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Activity, TrendingUp, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AgentDashboard({ userEmail }) {
  const agents = [
    { id: 1, name: 'Bull Bot', status: 'active', trades: 247, profit: 12450, roi: 24.5 },
    { id: 2, name: 'Yield Optimizer', status: 'active', trades: 152, profit: 8920, roi: 18.2 },
    { id: 3, name: 'Risk Guardian', status: 'active', trades: 89, profit: 5340, roi: 15.8 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4"
        >
          <p className="text-cyan-400 text-sm font-semibold mb-1">Active Agents</p>
          <p className="text-3xl font-bold text-white">3</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
        >
          <p className="text-green-400 text-sm font-semibold mb-1">Total Profit</p>
          <p className="text-3xl font-bold text-white">$26.7K</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4"
        >
          <p className="text-purple-400 text-sm font-semibold mb-1">Avg ROI</p>
          <p className="text-3xl font-bold text-white">19.5%</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4"
        >
          <p className="text-orange-400 text-sm font-semibold mb-1">Total Trades</p>
          <p className="text-3xl font-bold text-white">488</p>
        </motion.div>
      </div>

      <Card className="bg-black/40 border border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          Your Autonomous Agents
        </h3>
        <div className="space-y-3">
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-black/40 border border-white/10 rounded-lg hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{agent.name}</p>
                    <p className="text-white/50 text-xs">{agent.trades} trades executed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">${agent.profit.toLocaleString()}</p>
                  <p className="text-white/60 text-sm">{agent.roi}% ROI</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}