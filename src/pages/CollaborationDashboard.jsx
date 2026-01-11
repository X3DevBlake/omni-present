import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MultiAgentCollaborationDashboard from '../components/collaboration/MultiAgentCollaborationDashboard';
import PredictiveAlertsPanel from '../components/alerts/PredictiveAlertsPanel';

export default function CollaborationDashboard() {
  const [activeTab, setActiveTab] = useState('collaboration');

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
            Agent Collaboration & Predictions
          </h1>
          <p className="text-white/60">
            Real-time visualization of multi-agent teams and AI-powered predictive alerts
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {[
            { id: 'collaboration', label: 'Team Collaboration' },
            { id: 'alerts', label: 'Predictive Alerts' },
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg border transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-white/80 hover:border-white/30'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {activeTab === 'collaboration' && <MultiAgentCollaborationDashboard />}
          {activeTab === 'alerts' && <PredictiveAlertsPanel />}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Active Teams', value: '8' },
            { label: 'Total Agents', value: '34' },
            { label: 'Alerts This Week', value: '12' },
            { label: 'Prediction Accuracy', value: '94%' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
            >
              <p className="text-white/60 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-cyan-400">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}