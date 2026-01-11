import React from 'react';
import { motion } from 'framer-motion';
import AdvancedIntegrationHub from '../components/integrations/AdvancedIntegrationHub';

export default function IntegrationDevelopmentHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-2">
          Integration Development Hub
        </h1>
        <p className="text-white/60 mb-8">
          Advanced API integration with webhooks, two-way sync, and intelligent service discovery
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Connected Services', value: '12' },
            { label: 'Active Webhooks', value: '10' },
            { label: 'Two-Way Syncs', value: '8' },
            { label: 'API Health', value: '99.8%' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
            >
              <p className="text-white/60 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-cyan-400">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <AdvancedIntegrationHub />
      </motion.div>
    </div>
  );
}