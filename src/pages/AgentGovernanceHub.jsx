import React from 'react';
import { motion } from 'framer-motion';
import AgentGovernancePanel from '../components/governance/AgentGovernancePanel';

export default function AgentGovernanceHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Agent Governance System
        </h1>
        <p className="text-white/60 mb-8">
          Comprehensive governance with ethical guidelines, compliance monitoring, conflict resolution, and transparent audit trails
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Agents', value: '8' },
            { label: 'Compliance Rate', value: '97.5%' },
            { label: 'Violations', value: '0' },
            { label: 'Audit Entries', value: '256' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
            >
              <p className="text-white/60 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-cyan-400">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <AgentGovernancePanel />
      </motion.div>
    </div>
  );
}