import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Eye, Globe, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

export default function AgentKnowledgeViewer({ agentId }) {
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [latestItem, setLatestItem] = useState(null);

  useEffect(() => {
    loadKnowledge();
    const interval = setInterval(loadKnowledge, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [agentId]);

  const loadKnowledge = async () => {
    try {
      const items = await base44.entities.AgentKnowledge.filter(
        { agent_id: agentId },
        '-created_date',
        100
      );
      
      if (items.length > 0 && items[0].id !== latestItem?.id) {
        setLatestItem(items[0]);
      }
      
      setKnowledge(items);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load knowledge:', error);
      setLoading(false);
    }
  };

  const categories = ['all', 'object', 'location', 'concept', 'skill', 'person', 'event'];
  const filteredKnowledge = filter === 'all' 
    ? knowledge 
    : knowledge.filter(k => k.category === filter);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'object': return '📦';
      case 'location': return '📍';
      case 'concept': return '💡';
      case 'skill': return '⚡';
      case 'person': return '👤';
      case 'event': return '📅';
      default: return '🔍';
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <h3 className="text-white font-bold text-xl">Knowledge Database</h3>
        </div>
        <div className="text-cyan-400 font-bold">{knowledge.length} items</div>
      </div>

      {/* Latest Learning Animation */}
      <AnimatePresence>
        {latestItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span className="text-yellow-400 font-bold text-sm">Just Learned!</span>
            </div>
            <div className="text-white font-bold text-lg">{latestItem.object_name}</div>
            <div className="text-white/70 text-sm">{latestItem.description}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === cat
                ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            {cat === 'all' ? '🌐' : getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Knowledge Grid */}
      {loading ? (
        <div className="text-center text-white/60 py-8">Loading knowledge...</div>
      ) : filteredKnowledge.length === 0 ? (
        <div className="text-center text-white/60 py-8">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <div>Agent hasn't learned anything yet</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
          {filteredKnowledge.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all border border-white/5"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="text-2xl">{getCategoryIcon(item.category)}</div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">{item.object_name}</h4>
                  <div className="text-white/60 text-sm line-clamp-2 mb-2">{item.description}</div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <div className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">
                      {item.confidence_score}% confident
                    </div>
                    <div className="text-white/40">
                      {moment(item.created_date).fromNow()}
                    </div>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {item.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}