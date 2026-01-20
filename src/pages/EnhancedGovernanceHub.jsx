import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { motion } from 'framer-motion';
import EnhancedGovernanceHub from '../components/governance/EnhancedGovernanceHub';

export default function EnhancedGovernanceHubPage() {
  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Enhanced DAO Governance
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Agent proposals, reputation-based voting, dynamic treasury, and on-chain verification
          </p>
        </motion.div>

        <EnhancedGovernanceHub />
      </div>
    </AuroraBackground>
  );
}