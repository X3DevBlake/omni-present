import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentTrainingInterface from '../components/training/AgentTrainingInterface';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function AgentTraining() {
  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold text-white">Agent Training</h1>
          </div>
          <p className="text-white/60 text-lg">
            Fine-tune your AI agents with custom datasets and advanced parameters
          </p>
        </motion.div>

        <AgentTrainingInterface />
      </div>
    </AuroraBackground>
  );
}