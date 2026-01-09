import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, ShoppingCart, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

export default function AgentAutonomyDashboard() {
  const [agents] = useState([
    {
      id: '1',
      name: 'Financial Advisor',
      autonomyLevel: 85,
      decisions: 142,
      savings: 450,
      activity: [
        { time: '00:00', decisions: 2 },
        { time: '04:00', decisions: 1 },
        { time: '08:00', decisions: 8 },
        { time: '12:00', decisions: 12 },
        { time: '16:00', decisions: 9 },
        { time: '20:00', decisions: 5 },
      ]
    },
    {
      id: '2',
      name: 'Shopping Optimizer',
      autonomyLevel: 70,
      decisions: 89,
      savings: 320,
      activity: [
        { time: '00:00', decisions: 1 },
        { time: '04:00', decisions: 0 },
        { time: '08:00', decisions: 3 },
        { time: '12:00', decisions: 7 },
        { time: '16:00', decisions: 11 },
        { time: '20:00', decisions: 4 },
      ]
    },
    {
      id: '3',
      name: 'Investment Manager',
      autonomyLevel: 95,
      decisions: 234,
      savings: 1250,
      activity: [
        { time: '00:00', decisions: 5 },
        { time: '04:00', decisions: 3 },
        { time: '08:00', decisions: 15 },
        { time: '12:00', decisions: 18 },
        { time: '16:00', decisions: 14 },
        { time: '20:00', decisions: 8 },
      ]
    },
  ]);

  const totalSavings = agents.reduce((sum, a) => sum + a.savings, 0);
  const totalDecisions = agents.reduce((sum, a) => sum + a.decisions, 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-white/60 text-sm">Active Agents</span>
          </div>
          <div className="text-white text-3xl font-bold">{agents.length}</div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white/60 text-sm">Total Decisions</span>
          </div>
          <div className="text-yellow-400 text-3xl font-bold">{totalDecisions}</div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-white/60 text-sm">Total Savings</span>
          </div>
          <div className="text-green-400 text-3xl font-bold">${totalSavings}</div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="text-white/60 text-sm">Avg Autonomy</span>
          </div>
          <div className="text-cyan-400 text-3xl font-bold">
            {Math.round(agents.reduce((sum, a) => sum + a.autonomyLevel, 0) / agents.length)}%
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="space-y-4">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">{agent.name}</h3>
                  <div className="text-white/60 text-sm">AI Financial Assistant</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-white/60 text-sm">Autonomy Level</div>
                <div className="text-cyan-400 text-2xl font-bold">{agent.autonomyLevel}%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <div className="text-white/60 text-sm mb-1">Decisions Made</div>
                <div className="text-white text-2xl font-bold">{agent.decisions}</div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-1">Money Saved</div>
                <div className="text-green-400 text-2xl font-bold">${agent.savings}</div>
              </div>
              <div>
                <div className="text-white/60 text-sm mb-1">Avg per Decision</div>
                <div className="text-purple-400 text-2xl font-bold">${(agent.savings / agent.decisions).toFixed(2)}</div>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-white/60 text-sm mb-3">24h Decision Activity</div>
              <ResponsiveContainer width="100%" height={80}>
                <LineChart data={agent.activity}>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid #ffffff20', borderRadius: '8px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="decisions" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Autonomy Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Autonomy Level</span>
                <span>{agent.autonomyLevel}%</span>
              </div>
              <div className="bg-black/40 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${agent.autonomyLevel}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}