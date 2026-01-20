import React from 'react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { motion } from 'framer-motion';
import UnifiedDashboard from '../components/intelligence/UnifiedDashboard';

export default function UnifiedIntelligenceDashboard() {
  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Unified Intelligence Dashboard
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Real-time cross-hub insights, predictive modeling, and AI-driven actionable recommendations
          </p>
        </motion.div>

        <UnifiedDashboard />
      </div>
    </AuroraBackground>
  );
}