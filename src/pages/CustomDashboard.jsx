import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout, Wallet, TrendingUp, Users, ShoppingCart, Activity } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import RealWorldBudgetTracker from '../components/omni/RealWorldBudgetTracker';
import AgentAutonomyDashboard from '../components/omni/AgentAutonomyDashboard';
import TransactionList from '../components/omni/TransactionList';
import { base44 } from '@/api/base44Client';

export default function CustomDashboard() {
  const [widgets, setWidgets] = useState([
    { id: 'balance', type: 'balance', enabled: true },
    { id: 'budget', type: 'budget', enabled: true },
    { id: 'agents', type: 'agents', enabled: true },
    { id: 'transactions', type: 'transactions', enabled: false },
    { id: 'staking', type: 'staking', enabled: false },
  ]);

  const toggleWidget = (id) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const widgetComponents = {
    balance: () => (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6 text-cyan-400" />
          <h3 className="text-white font-bold text-xl">Omni Balance</h3>
        </div>
        <div className="text-cyan-400 text-4xl font-bold mb-2">1,234.56 OMNI</div>
        <div className="text-green-400 text-sm">+12.5% this month</div>
      </div>
    ),
    budget: () => (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">Budget Overview</h3>
        <RealWorldBudgetTracker />
      </div>
    ),
    agents: () => (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">Agent Performance</h3>
        <AgentAutonomyDashboard />
      </div>
    ),
    transactions: () => (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-xl mb-4">Recent Transactions</h3>
        <TransactionList transactions={[]} />
      </div>
    ),
    staking: () => (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <h3 className="text-white font-bold text-xl">Staking Rewards</h3>
        </div>
        <div className="text-green-400 text-4xl font-bold mb-2">45.23 OMNI</div>
        <div className="text-white/60 text-sm">Total earned</div>
      </div>
    ),
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Custom</span> Dashboard
          </h1>
          <p className="text-white/60 text-lg">Personalize your Omni experience</p>
        </motion.div>

        {/* Widget Toggles */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Layout className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-bold">Customize Widgets</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {widgets.map(widget => (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  widget.enabled
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                    : 'bg-white/5 border border-white/10 text-white/60'
                }`}
              >
                {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgets.filter(w => w.enabled).map(widget => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {widgetComponents[widget.type]()}
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}