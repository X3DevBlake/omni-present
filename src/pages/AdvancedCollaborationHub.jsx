import React from 'react';
import { motion } from 'framer-motion';
import { Network, Zap } from 'lucide-react';
import AITaskDelegator from '../components/collaboration/AITaskDelegator';
import CollaborativeOpportunityDetector from '../components/collaboration/CollaborativeOpportunityDetector';
import RealTimeProgressSync from '../components/collaboration/RealTimeProgressSync';

export default function AdvancedCollaborationHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Network className="w-10 h-10 text-cyan-400" />
            Advanced Collaboration Hub
          </h1>
          <p className="text-white/60">AI-driven task delegation and collaboration across simulations</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-6">
          <AITaskDelegator />
          <CollaborativeOpportunityDetector />
          <RealTimeProgressSync />
        </div>
      </div>
    </div>
  );
}