import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Bot, BarChart3, Shield, Activity } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import BackButton from '../components/navigation/BackButton';
import AgentDashboard from '../components/defi/AgentDashboard';
import AutonomousTrader from '../components/defi/AutonomousTrader';
import AIPortfolioManager from '../components/defi/AIPortfolioManager';
import RiskHedgeSystem from '../components/defi/RiskHedgeSystem';

export default function DeFiAutonomousPhase3() {
  const [activeTab, setActiveTab] = useState('agents');
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const tabs = [
    { id: 'agents', label: 'Agent Dashboard', icon: Bot },
    { id: 'trader', label: 'Autonomous Trader', icon: BarChart3 },
    { id: 'portfolio', label: 'AI Portfolio Manager', icon: Activity },
    { id: 'hedging', label: 'Risk Hedging', icon: Shield },
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <BackButton />
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Phase 3: Autonomous Agents</h1>
          <p className="text-white/60">AI-powered trading bots, portfolio management, and risk hedging</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 mb-8 bg-black/40 p-4 rounded-lg border border-white/10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'agents' && <AgentDashboard userEmail={userEmail} />}
          {activeTab === 'trader' && <AutonomousTrader userEmail={userEmail} />}
          {activeTab === 'portfolio' && <AIPortfolioManager userEmail={userEmail} />}
          {activeTab === 'hedging' && <RiskHedgeSystem userEmail={userEmail} />}
        </div>

        {/* Phase Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
            <h3 className="text-green-400 font-bold mb-3">✓ Implemented</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>• Autonomous agent creation & management</li>
              <li>• AI-powered trading strategies</li>
              <li>• Automated portfolio rebalancing</li>
              <li>• Risk hedging & stop-loss automation</li>
              <li>• Agent performance analytics</li>
            </ul>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
            <h3 className="text-purple-400 font-bold mb-3">→ Coming Next (Phase 4)</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>• Advanced market predictions</li>
              <li>• Sentiment analysis integration</li>
              <li>• Multi-agent collaboration</li>
              <li>• Real-time market monitoring</li>
              <li>• Custom alert & notification system</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}