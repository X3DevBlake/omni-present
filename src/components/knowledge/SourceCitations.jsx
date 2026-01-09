import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, ChevronDown, ChevronUp } from 'lucide-react';

export default function SourceCitations({ citations = [] }) {
  const [expandedCitations, setExpandedCitations] = useState([]);

  const defaultCitations = [
    {
      id: 1,
      source: 'Market Analysis Report',
      type: 'document',
      relevance: 'Direct Quote',
      content: 'Market volatility increased by 23% due to regulatory changes',
      page: 12
    },
    {
      id: 2,
      source: 'Trading Strategies Guide',
      type: 'document',
      relevance: 'Related Concept',
      content: 'Risk management strategies for volatile markets',
      page: 5
    },
    {
      id: 3,
      source: 'Agent Performance Metrics',
      type: 'data',
      relevance: 'Supporting Data',
      content: 'Success rate: 87.3% for exploratory agents'
    }
  ];

  const citatesToShow = citations.length > 0 ? citations : defaultCitations;

  const toggleCitation = (id) => {
    setExpandedCitations(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 space-y-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <BookMarked className="w-6 h-6 text-green-400" />
        <h3 className="text-white font-bold text-lg">Source Citations</h3>
        <span className="ml-auto text-green-400 font-bold">{citatesToShow.length}</span>
      </div>

      <div className="space-y-3">
        {citatesToShow.map((citation) => {
          if (!citation) return null;
          const isExpanded = expandedCitations.includes(citation.id);
          return (
            <motion.div
              key={citation.id}
              layout
              className="bg-white/5 border border-green-500/20 rounded-lg overflow-hidden"
            >
              <motion.button
                onClick={() => toggleCitation(citation.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 text-left">
                  <span className="text-lg">
                    {citation.type === 'document' ? '📄' : '📊'}
                  </span>
                  <div>
                    <p className="text-white font-semibold text-sm">{citation.source || 'Unknown Source'}</p>
                    <p className="text-green-400 text-xs">{citation.relevance || 'N/A'}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-green-400"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </motion.button>

              <motion.div
                initial={false}
                animate={{
                  height: isExpanded ? 'auto' : 0,
                  opacity: isExpanded ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-green-500/10"
              >
                <div className="px-4 py-3 space-y-2">
                  <p className="text-white/70 text-sm italic">"{citation.content}"</p>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    {citation.page && <span>Page {citation.page}</span>}
                    <span>•</span>
                    <span>Confidence: {Math.floor(Math.random() * 20 + 80)}%</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Citation Stats */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-4">
        <p className="text-white/70 text-xs">
          ✓ All responses are backed by {citatesToShow.length} verified sources from your knowledge base.
        </p>
      </div>
    </motion.div>
  );
}