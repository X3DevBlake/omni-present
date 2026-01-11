import React from 'react';
import { motion } from 'framer-motion';
import ComprehensiveAnalyticsDashboard from '../components/analytics/ComprehensiveAnalyticsDashboard';

export default function Phase10AdvancedAutonomy() {
  const improvements = [
    { category: 'Proactive Task Management', count: 5, color: 'from-cyan-500 to-blue-500' },
    { category: 'Self-Healing Agents', count: 5, color: 'from-green-500 to-emerald-500' },
    { category: 'Advanced Financial Ops', count: 5, color: 'from-yellow-500 to-orange-500' },
    { category: 'Zoom Integration', count: 6, color: 'from-purple-500 to-pink-500' },
    { category: 'Analytics Dashboard', count: 14, color: 'from-indigo-500 to-purple-500' },
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
            Phase 10: Advanced Agent Autonomy
          </h1>
          <p className="text-white/60">Proactive task mgmt, self-healing, advanced finance, Zoom sync, analytics (35+ improvements)</p>
        </div>

        {/* Improvement Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {improvements.map((imp, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${imp.color} bg-opacity-10 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all`}
            >
              <p className="text-white/80 text-sm mb-2">{imp.category}</p>
              <p className="text-3xl font-bold text-white">{imp.count}</p>
              <p className="text-white/60 text-xs mt-1">improvements</p>
            </motion.div>
          ))}
        </div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Key Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Proactive Tasks', desc: 'Agents autonomously identify and initiate tasks' },
              { title: 'Self-Healing', desc: 'Automatic error detection and autonomous recovery' },
              { title: 'Smart Rebalancing', desc: 'Dynamic portfolio optimization with predictive hedging' },
              { title: 'Meeting Automation', desc: 'Zoom scheduling, transcription, follow-up' },
              { title: 'Real-time Analytics', desc: 'Comprehensive dashboard with custom reports' },
              { title: 'Anomaly Detection', desc: 'AI-powered detection with actionable alerts' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Analytics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <ComprehensiveAnalyticsDashboard />
        </motion.div>
      </motion.div>
    </div>
  );
}