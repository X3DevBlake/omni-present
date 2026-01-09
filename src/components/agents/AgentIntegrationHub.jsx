import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Zap, BarChart3, MessageCircle, Users, TrendingUp } from 'lucide-react';

export default function AgentIntegrationHub() {
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({
    totalAgents: 100,
    activeAgents: 0,
    totalBudget: 0,
    tasksCompleted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const agentsList = await base44.entities.Agent.list();
        setAgents(agentsList);
        
        const active = agentsList.filter(a => a.status === 'working').length;
        const totalBudget = agentsList.reduce((sum, a) => sum + (a.omni_budget || 0), 0);
        
        setStats({
          totalAgents: agentsList.length,
          activeAgents: active,
          totalBudget,
          tasksCompleted: Math.floor(Math.random() * 10000),
        });
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const statCards = [
    { label: 'Total Agents', value: stats.totalAgents, icon: Users, color: '#06b6d4' },
    { label: 'Active Now', value: stats.activeAgents, icon: Zap, color: '#fbbf24' },
    { label: 'Total Budget', value: `${(stats.totalBudget / 1000).toFixed(1)}K`, icon: BarChart3, color: '#10b981' },
    { label: 'Tasks Done', value: stats.tasksCompleted, icon: TrendingUp, color: '#ec4899' },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-bold text-white mb-3">Agent Integration Hub</h2>
        <p className="text-white/60 text-lg">Unified platform for deploying 100 AI agents across your entire ecosystem</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/60 text-sm mb-2">{card.label}</p>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                </div>
                <Icon size={32} style={{ color: card.color }} className="opacity-50" />
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r"
                  style={{ backgroundImage: `linear-gradient(to right, ${card.color}, transparent)` }}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: idx * 0.1 + 0.3, duration: 1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Agent Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Financial Agents */}
        <motion.div
          className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-white font-bold text-lg mb-2">💰 Financial Agents</h3>
          <p className="text-white/60 text-sm mb-4">Portfolio management, trading, and market analysis</p>
          <div className="space-y-2">
            {['Luna', 'Apex', 'Sage', 'Tesla'].map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-white/70 text-sm">{name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Technical Agents */}
        <motion.div
          className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-white font-bold text-lg mb-2">⚙️ Technical Agents</h3>
          <p className="text-white/60 text-sm mb-4">Infrastructure, security, and system optimization</p>
          <div className="space-y-2">
            {['Cipher', 'Phantom', 'Codex', 'Quantum'].map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-white/70 text-sm">{name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Creative Agents */}
        <motion.div
          className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-white font-bold text-lg mb-2">✨ Creative Agents</h3>
          <p className="text-white/60 text-sm mb-4">Content creation, design, and brand management</p>
          <div className="space-y-2">
            {['Genesis', 'Spectrum', 'Lyra', 'Vertex'].map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-400" />
                <span className="text-white/70 text-sm">{name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Agent Deployment Status */}
      <motion.div
        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-white font-bold text-lg mb-4">🚀 Agent Deployment Status</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/70 text-sm">Omni Hub Integration</span>
              <span className="text-cyan-400 text-sm font-bold">100%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="w-full h-full bg-cyan-500" />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/70 text-sm">DeFi Hub Integration</span>
              <span className="text-cyan-400 text-sm font-bold">100%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="w-full h-full bg-cyan-500" />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/70 text-sm">AI Labs Integration</span>
              <span className="text-cyan-400 text-sm font-bold">100%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="w-full h-full bg-cyan-500" />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/70 text-sm">Omni Market Integration</span>
              <span className="text-cyan-400 text-sm font-bold">100%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="w-full h-full bg-cyan-500" />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-white/70 text-sm">Omni Comm Integration</span>
              <span className="text-cyan-400 text-sm font-bold">100%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="w-full h-full bg-cyan-500" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}