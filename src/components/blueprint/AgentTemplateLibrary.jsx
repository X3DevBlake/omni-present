import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, Brain, Users, Zap, Shield, Search, Star } from 'lucide-react';

const agentTemplates = [
  {
    id: 'explorer',
    name: 'Explorer Agent',
    icon: '🔍',
    color: '#00f5ff',
    description: 'Curious agent that explores environments and discovers new areas',
    personality: ['curious', 'adventurous', 'observant'],
    behaviors: ['explore', 'scan_area', 'discover'],
    complexity: 'beginner',
    rating: 4.8
  },
  {
    id: 'guardian',
    name: 'Guardian Agent',
    icon: '🛡️',
    color: '#10b981',
    description: 'Protective agent that monitors threats and ensures safety',
    personality: ['protective', 'vigilant', 'cautious'],
    behaviors: ['patrol', 'detect_threats', 'alert'],
    complexity: 'intermediate',
    rating: 4.9
  },
  {
    id: 'socializer',
    name: 'Social Agent',
    icon: '💬',
    color: '#a855f7',
    description: 'Highly social agent focused on communication and collaboration',
    personality: ['friendly', 'social', 'empathetic'],
    behaviors: ['communicate', 'collaborate', 'assist'],
    complexity: 'beginner',
    rating: 4.7
  },
  {
    id: 'builder',
    name: 'Builder Agent',
    icon: '🔨',
    color: '#f59e0b',
    description: 'Construction-focused agent that builds structures and modifies environments',
    personality: ['creative', 'methodical', 'patient'],
    behaviors: ['build', 'place_objects', 'modify_terrain'],
    complexity: 'advanced',
    rating: 4.6
  },
  {
    id: 'learner',
    name: 'Learning Agent',
    icon: '🧠',
    color: '#ec4899',
    description: 'AI agent optimized for learning from experiences and adapting behaviors',
    personality: ['analytical', 'adaptive', 'persistent'],
    behaviors: ['learn_pattern', 'adapt', 'reinforce'],
    complexity: 'advanced',
    rating: 4.9
  },
  {
    id: 'trader',
    name: 'Trader Agent',
    icon: '💼',
    color: '#3b82f6',
    description: 'Economic agent focused on resource trading and optimization',
    personality: ['strategic', 'analytical', 'fair'],
    behaviors: ['negotiate', 'trade', 'calculate_value'],
    complexity: 'intermediate',
    rating: 4.5
  }
];

export default function AgentTemplateLibrary({ show, onClose, onSelectTemplate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  const filteredTemplates = agentTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity;
    return matchesSearch && matchesComplexity;
  });

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Agent Templates</h3>
                <p className="text-white/60 text-sm">Choose from pre-built agent templates</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40"
                />
              </div>
              
              <select value={selectedComplexity} onChange={(e) => setSelectedComplexity(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-cyan-500/30 transition-all cursor-pointer group"
                  onClick={() => onSelectTemplate(template)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ backgroundColor: template.color + '20' }}>
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-semibold text-lg">{template.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 text-sm">{template.rating}</span>
                        </div>
                      </div>
                      <div className={`inline-block px-2 py-0.5 rounded text-xs capitalize mb-2 ${
                        template.complexity === 'beginner' ? 'bg-green-500/20 text-green-300' :
                        template.complexity === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {template.complexity}
                      </div>
                    </div>
                  </div>

                  <p className="text-white/60 text-sm mb-4">{template.description}</p>

                  <div className="space-y-3">
                    <div>
                      <div className="text-white/50 text-xs mb-2">Personality Traits</div>
                      <div className="flex gap-2 flex-wrap">
                        {template.personality.map((trait, i) => (
                          <div key={i} className="px-2 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded text-xs capitalize">
                            {trait}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-white/50 text-xs mb-2">Core Behaviors</div>
                      <div className="flex gap-2 flex-wrap">
                        {template.behaviors.map((behavior, i) => (
                          <div key={i} className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded text-xs">
                            {behavior}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                      Click to use this template →
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">No templates found matching your search</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}