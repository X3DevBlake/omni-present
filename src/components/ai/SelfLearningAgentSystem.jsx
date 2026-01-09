import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SelfLearningAgentSystem() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'Portfolio Agent', successRate: 65, adapts: 8, learningCurve: [] },
    { id: 2, name: 'Market Agent', successRate: 72, adapts: 12, learningCurve: [] }
  ]);
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);

  const generateLearningCurve = (baseRate) => {
    return Array.from({ length: 20 }, (_, i) => ({
      iteration: i + 1,
      successRate: Math.min(95, baseRate + (i * 1.5) + Math.random() * 3)
    }));
  };

  const triggerAdaptation = (agentId) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const newSuccessRate = Math.min(95, a.successRate + 3);
        return {
          ...a,
          successRate: newSuccessRate,
          adapts: a.adapts + 1,
          learningCurve: generateLearningCurve(newSuccessRate)
        };
      }
      return a;
    }));

    setSelectedAgent(prev => ({
      ...prev,
      learningCurve: generateLearningCurve(prev.successRate + 3)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-4">
        {agents.map(agent => (
          <motion.button
            key={agent.id}
            onClick={() => {
              const updated = agents.find(a => a.id === agent.id);
              setSelectedAgent({ ...updated, learningCurve: generateLearningCurve(updated.successRate) });
            }}
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedAgent.id === agent.id
                ? 'bg-purple-500/20 border-purple-500/60'
                : 'bg-black/40 border-white/10'
            }`}
          >
            <p className="text-white font-bold">{agent.name}</p>
            <div className="mt-3 space-y-1 text-xs">
              <p className="text-green-400">Success Rate: {agent.successRate.toFixed(1)}%</p>
              <p className="text-cyan-400">Adaptations: {agent.adapts}</p>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerAdaptation(agent.id);
                }}
                whileHover={{ scale: 1.05 }}
                className="mt-2 px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded text-xs font-medium w-full"
              >
                Trigger Adaptation
              </motion.button>
            </div>
          </motion.button>
        ))}
      </div>

      {selectedAgent.successRate > 0 && (
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Learning Curve
          </h3>
          {generateLearningCurve(selectedAgent.successRate).length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={generateLearningCurve(selectedAgent.successRate)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="iteration" stroke="rgba(255,255,255,0.4)" />
                <YAxis stroke="rgba(255,255,255,0.4)" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(0,245,255,0.3)' }} />
                <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      <div className="bg-black/40 border border-yellow-500/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-yellow-400" />
          Learning Strategies
        </h3>
        <div className="grid lg:grid-cols-2 gap-3 text-sm">
          {[
            { name: 'Reinforcement Learning', status: 'active', type: 'Reward-based' },
            { name: 'Experience Replay', status: 'active', type: 'Memory-based' },
            { name: 'Meta-Learning', status: 'active', type: 'Adaptive' },
            { name: 'Transfer Learning', status: 'inactive', type: 'Knowledge-based' }
          ].map((strategy, i) => (
            <div key={i} className={`p-3 rounded border ${
              strategy.status === 'active'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-white/5 border-white/10'
            }`}>
              <p className="text-white font-bold text-xs">{strategy.name}</p>
              <p className={`text-xs mt-1 ${strategy.status === 'active' ? 'text-green-400' : 'text-white/60'}`}>
                {strategy.type}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}