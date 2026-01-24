import React from 'react';
import { motion } from 'framer-motion';
import RedCommNetworkTopology3D from '../components/redcomm/RedCommNetworkTopology3D';
import RedCommSignalFlow3D from '../components/redcomm/RedCommSignalFlow3D';
import RedCommControlPanel from '../components/redcomm/RedCommControlPanel';
import RedCommMessageStream3D from '../components/redcomm/RedCommMessageStream3D';
import RedCommAnalyticsDashboard from '../components/redcomm/RedCommAnalyticsDashboard';
import EnhancedRedCommVisualizer3D from '../components/network/EnhancedRedCommVisualizer3D';
import { Radio, Satellite, Network } from 'lucide-react';

export default function RedCommHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 pb-16">
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Radio className="w-12 h-12 text-indigo-400" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              RedComm-XG Hub
            </h1>
            <Satellite className="w-12 h-12 text-purple-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Advanced Ultra-High Frequency Communication Network with AI-Driven Adaptive Control,
            Real-Time Anomaly Detection, and Omega Sentient Optimization
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <Network className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-semibold">
              Next-Generation Communication Infrastructure
            </span>
          </div>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="mb-8"
        >
          <RedCommControlPanel />
        </motion.div>

        {/* Network Topology */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8"
        >
          <RedCommNetworkTopology3D />
        </motion.div>

        {/* Signal Flow Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-8"
        >
          <RedCommSignalFlow3D />
        </motion.div>

        {/* Message Stream Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-8"
        >
          <RedCommMessageStream3D />
        </motion.div>

        {/* Analytics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-8"
        >
          <RedCommAnalyticsDashboard />
        </motion.div>

        {/* Enhanced RedComm Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <EnhancedRedCommVisualizer3D />
        </motion.div>
      </section>
    </div>
  );
}