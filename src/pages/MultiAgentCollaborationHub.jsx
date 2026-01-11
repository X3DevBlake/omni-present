import React from 'react';
import { motion } from 'framer-motion';
import MultiAgentTeamPanel from '../components/agents/MultiAgentTeamPanel';

export default function MultiAgentCollaborationHub() {
  const capabilities = [
    { title: 'Dynamic Team Formation', desc: 'Auto-form optimal teams based on task requirements' },
    { title: 'Task Delegation', desc: 'Decompose tasks into subtasks for specialized agents' },
    { title: 'Distributed Coordination', desc: 'Coordinate parallel analysis across multiple agents' },
    { title: 'Emergent Strategies', desc: 'Synthesize collective intelligence into novel strategies' },
    { title: 'Conflict Resolution', desc: 'Fair resolution mechanisms for agent disagreements' },
    { title: 'Consensus Building', desc: 'Multi-agent consensus-based decision making' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Multi-Agent Collaboration Hub
          </h1>
          <p className="text-white/60">
            Sophisticated agent teams working together with emergent strategies and intelligent conflict resolution
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {capabilities.map((cap, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
            >
              <p className="text-white font-bold text-sm mb-1">{cap.title}</p>
              <p className="text-white/60 text-xs">{cap.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Team Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MultiAgentTeamPanel />
        </motion.div>
      </motion.div>
    </div>
  );
}