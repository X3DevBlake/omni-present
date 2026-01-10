import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, TrendingUp, CheckCircle } from 'lucide-react';
import { useAgentKPIs } from '../hooks/useAgentKPIs';

export default function AIAgentActivityFeed({ userEmail }) {
  const { data: kpiData } = useAgentKPIs(userEmail, 4);
  const agents = kpiData?.kpis || [];

  if (!userEmail || agents.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Zap className="w-10 h-10 text-amber-400" />
            Active <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">AI Agents</span>
          </h2>
          <p className="text-white/60">Real-time agent performance and activity</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent, idx) => (
            <motion.div
              key={agent.agentId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-xl bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 hover:border-amber-400/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{agent.agentName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-xs text-white/60 capitalize">{agent.status}</span>
                  </div>
                </div>
                <span className="text-2xl">🤖</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-black/30 rounded-lg">
                  <p className="text-xs text-white/60 mb-1">Active Goals</p>
                  <p className="text-lg font-bold text-amber-400">{agent.activeGoals}</p>
                </div>
                <div className="p-3 bg-black/30 rounded-lg">
                  <p className="text-xs text-white/60 mb-1">Completed</p>
                  <p className="text-lg font-bold text-green-400">{agent.completedGoals}</p>
                </div>
                <div className="p-3 bg-black/30 rounded-lg">
                  <p className="text-xs text-white/60 mb-1">Success Rate</p>
                  <p className="text-lg font-bold text-cyan-400">{agent.successRate}%</p>
                </div>
              </div>

              {/* Memory & Skills */}
              <div className="flex items-center justify-between text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {agent.skillCount} skills
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {agent.memorySize} memories
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}