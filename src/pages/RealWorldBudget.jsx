import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import RealWorldBudgetTracker from '../components/omni/RealWorldBudgetTracker';
import AgentAutonomyDashboard from '../components/omni/AgentAutonomyDashboard';

export default function RealWorldBudget() {
  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Real-World <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Budget Manager</span>
          </h1>
          <p className="text-white/60 text-lg">AI-powered budgeting with autonomous agent optimization</p>
        </motion.div>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Wallet className="w-6 h-6 text-green-400" />
            <h2 className="text-white font-bold text-2xl">Personal Budget Tracking</h2>
          </div>
          <RealWorldBudgetTracker />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <h2 className="text-white font-bold text-2xl">AI Agent Autonomy</h2>
          </div>
          <AgentAutonomyDashboard />
        </div>
      </div>
    </AuroraBackground>
  );
}