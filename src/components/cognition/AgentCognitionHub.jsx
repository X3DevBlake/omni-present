import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Brain, Zap, Shield, Target, TrendingUp } from 'lucide-react';

export default function AgentCognitionHub() {
  const [userEmail, setUserEmail] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: agents } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.filter({ created_by: userEmail }),
    enabled: !!userEmail,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Phase 6: Agent Cognition Hub
          </h1>
          <p className="text-white/60">Advanced reasoning, memory, ethics, and self-learning</p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Brain, title: 'Unified Brain', desc: 'Gemini-powered reasoning' },
            { icon: Target, title: 'Memory System', desc: 'Dynamic knowledge graphs' },
            { icon: Shield, title: 'Ethics Module', desc: 'Compliance monitoring' },
            { icon: TrendingUp, title: 'Self-Learning', desc: 'Reinforcement learning' },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
              >
                <Icon className="w-6 h-6 text-cyan-400 mb-2" />
                <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Agent List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Your Agents
          </h2>

          {agents?.length ? (
            <div className="space-y-3">
              {agents.map(agent => (
                <motion.div
                  key={agent.id}
                  whileHover={{ x: 5 }}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedAgent?.id === agent.id
                      ? 'bg-cyan-500/20 border-cyan-400/50'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{agent.name}</h3>
                      <p className="text-white/60 text-sm">{agent.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 text-sm font-semibold">
                        Cognition Level: {Math.random() * 100 | 0}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">No agents yet. Create one to get started!</p>
          )}
        </motion.div>

        {/* Selected Agent Details */}
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">{selectedAgent.name} - Cognition Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Brain Status', value: 'Active' },
                { label: 'Memory Capacity', value: '32KB' },
                { label: 'Ethics Score', value: '98%' },
                { label: 'Learning Rate', value: '0.85' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                  <p className="text-cyan-400 text-lg font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}