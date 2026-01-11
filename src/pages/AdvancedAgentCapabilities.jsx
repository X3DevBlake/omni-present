import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CustomizableDashboardBuilder from '../components/dashboard/CustomizableDashboardBuilder';
import AgentPersonaCustomizer from '../components/agents/AgentPersonaCustomizer';

export default function AdvancedAgentCapabilities() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Advanced Agent Capabilities
        </h1>
        <p className="text-white/60 mb-8">Personalized dashboards, adaptive personas, and intelligent self-management</p>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {[
            { id: 'dashboard', label: 'Customizable Dashboards' },
            { id: 'personas', label: 'Agent Personas' },
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
        >
          {activeTab === 'dashboard' && <CustomizableDashboardBuilder />}
          {activeTab === 'personas' && <AgentPersonaCustomizer />}
        </motion.div>

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              title: 'Sentiment Analysis',
              desc: 'Agents analyze user mood and tailor responses accordingly',
            },
            {
              title: 'Auto Content Generation',
              desc: 'Automated reports, summaries, and templates on demand',
            },
            {
              title: 'Self-Management',
              desc: 'Autonomous task delegation and resource optimization',
            },
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