import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CollaborativeTaskFlowVisualizer from '../components/collaboration/CollaborativeTaskFlowVisualizer';
import { Zap, Network, TrendingUp } from 'lucide-react';

export default function CrossAgentPlanningHub() {
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [goalText, setGoalText] = useState('');

  const recentExecutions = [
    { name: 'Portfolio Rebalancing', progress: 87, agents: 4 },
    { name: 'Market Analysis Cycle', progress: 100, agents: 3 },
    { name: 'Risk Assessment Sprint', progress: 45, agents: 5 },
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
            Cross-Agent Planning & Execution
          </h1>
          <p className="text-white/60">
            Collaborative goal decomposition, multi-agent coordination, and dynamic plan adjustment
          </p>
        </div>

        {/* Goal Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8"
        >
          <p className="text-white font-bold mb-3">Define New Collaborative Goal</p>
          <textarea
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="Describe a complex goal for your agent team to collaborate on..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 resize-none h-24"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="mt-4 px-6 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all"
          >
            Decompose & Execute
          </motion.button>
        </motion.div>

        {/* Main Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CollaborativeTaskFlowVisualizer />
        </motion.div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              icon: Zap,
              title: 'Goal Decomposition',
              desc: 'Automatically break complex goals into collaborative sub-tasks',
            },
            {
              icon: Network,
              title: 'Coordination',
              desc: 'Coordinate multi-agent execution with dependency management',
            },
            {
              icon: TrendingUp,
              title: 'Dynamic Adjustment',
              desc: 'Adapt plans based on feedback and emergent strategies',
            },
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
                <p className="text-white font-bold mb-1">{feature.title}</p>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Executions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white/5 border border-white/10 rounded-lg p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">Recent Executions</h3>
          <div className="space-y-3">
            {recentExecutions.map((exec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-semibold">{exec.name}</p>
                  <span className="text-cyan-400 font-bold text-sm">{exec.progress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${exec.progress}%` }}
                    transition={{ duration: 2 }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  />
                </div>
                <p className="text-white/60 text-xs mt-1">{exec.agents} agents collaborating</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}