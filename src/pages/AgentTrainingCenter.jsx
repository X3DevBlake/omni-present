import React from 'react';
import { motion } from 'framer-motion';
import AgentTrainingStudio from '../components/training/AgentTrainingStudio';

export default function AgentTrainingCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent mb-2">
          Agent Training Center
        </h1>
        <p className="text-white/60 mb-8">
          AI-driven training with custom datasets, reinforcement learning, and adaptive curricula
        </p>

        <AgentTrainingStudio />

        {/* Training Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { title: 'Custom Datasets', desc: 'Upload domain-specific training data' },
            { title: 'Reinforcement Learning', desc: 'Learn from user feedback and outcomes' },
            { title: 'Adaptive Curricula', desc: 'Personalized training paths for each agent' },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
            >
              <p className="text-white font-bold mb-1">{feature.title}</p>
              <p className="text-white/60 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}