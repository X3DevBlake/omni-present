import React, { useState } from 'react';
import { motion } from 'framer-motion';
import KnowledgeBaseManager from './KnowledgeBaseManager';
import KnowledgeBaseQuery from './KnowledgeBaseQuery';
import SourceCitations from './SourceCitations';

export default function KnowledgeBaseHub() {
  const [activeView, setActiveView] = useState('manage');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* View Tabs */}
      <div className="flex gap-3 border-b border-white/10 pb-4">
        {[
          { id: 'manage', label: '📚 Manage Knowledge', icon: '🗂️' },
          { id: 'query', label: '🔍 Query Knowledge', icon: '❓' },
          { id: 'citations', label: '📖 Citations', icon: '✓' }
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            whileHover={{ scale: 1.05 }}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeView === tab.id
                ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-400'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            {tab.icon} {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      {activeView === 'manage' && <KnowledgeBaseManager />}
      {activeView === 'query' && <KnowledgeBaseQuery />}
      {activeView === 'citations' && <SourceCitations />}
    </motion.div>
  );
}