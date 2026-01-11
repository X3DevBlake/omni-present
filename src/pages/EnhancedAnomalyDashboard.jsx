import React from 'react';
import { motion } from 'framer-motion';
import AnomalyDetectionPanel from '../components/analytics/AnomalyDetectionPanel';

export default function EnhancedAnomalyDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-red-400 bg-clip-text text-transparent mb-2">
          Advanced Anomaly Detection
        </h1>
        <p className="text-white/60 mb-8">
          Multi-variate anomaly detection with custom rules and granular sensitivity control
        </p>

        <AnomalyDetectionPanel />
      </motion.div>
    </div>
  );
}