import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, Activity, Settings } from 'lucide-react';

export default function AgentGovernancePanel() {
  const [selectedAgent, setSelectedAgent] = useState('agent_1');

  const agents = [
    { id: 'agent_1', name: 'Portfolio Manager', autonomyLevel: 'semi-autonomous', compliance: 98 },
    { id: 'agent_2', name: 'Budget Coach', autonomyLevel: 'supervised', compliance: 100 },
    { id: 'agent_3', name: 'Market Analyst', autonomyLevel: 'autonomous', compliance: 95 },
  ];

  const currentAgent = agents.find(a => a.id === selectedAgent);

  const autonomyLevels = [
    { id: 'none', label: 'No Autonomy', desc: 'All actions require approval' },
    { id: 'supervised', label: 'Supervised', desc: 'Action limits with human oversight' },
    { id: 'semi-autonomous', label: 'Semi-Autonomous', desc: 'Independent within parameters' },
    { id: 'autonomous', label: 'Autonomous', desc: 'Full autonomy with audit trail' },
  ];

  const guidelines = [
    { rule: 'Max portfolio allocation', value: '30%' },
    { rule: 'Max transaction size', value: '$50,000' },
    { rule: 'Risk tolerance', value: 'Moderate' },
    { rule: 'Approval threshold', value: '>$100,000' },
  ];

  return (
    <div className="space-y-6">
      {/* Agent Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {agents.map(agent => (
          <motion.button
            key={agent.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedAgent(agent.id)}
            className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-all flex-shrink-0 ${
              selectedAgent === agent.id
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
            }`}
          >
            {agent.name}
          </motion.button>
        ))}
      </div>

      {currentAgent && (
        <div className="space-y-6">
          {/* Autonomy Level */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Autonomy Level
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {autonomyLevels.map(level => (
                <motion.button
                  key={level.id}
                  whileHover={{ y: -2 }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    currentAgent.autonomyLevel === level.id
                      ? 'bg-cyan-500/20 border-cyan-400'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <p className="text-white font-semibold text-sm">{level.label}</p>
                  <p className="text-white/60 text-xs mt-1">{level.desc}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Operating Guidelines
            </h3>
            <div className="space-y-2">
              {guidelines.map((guideline, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <p className="text-white/80 text-sm">{guideline.rule}</p>
                  <p className="text-cyan-400 font-semibold text-sm">{guideline.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Compliance */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Compliance Status
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-semibold">Overall Score</p>
                  <p className="text-green-400 font-bold">{currentAgent.compliance}%</p>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[98%] bg-green-500" />
                </div>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-400/20 rounded-lg">
                <p className="text-green-300 text-sm">✓ All ethical guidelines met</p>
              </div>
            </div>
          </motion.div>

          {/* Audit Trail */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-lg p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              Recent Actions
            </h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-white/5 rounded text-white/70">2h ago - Rebalanced portfolio allocation</div>
              <div className="p-2 bg-white/5 rounded text-white/70">5h ago - Generated investment recommendations</div>
              <div className="p-2 bg-white/5 rounded text-white/70">1d ago - Approved budget optimization plan</div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}