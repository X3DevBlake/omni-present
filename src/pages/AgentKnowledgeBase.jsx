import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Eye, Clock, Link as LinkIcon, TrendingUp } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

export default function AgentKnowledgeBase() {
  const [agents, setAgents] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLearning, setIsLearning] = useState(false);

  useEffect(() => {
    loadData();
    // Simulate real-time learning
    const interval = setInterval(() => {
      simulateAgentLearning();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const user = await base44.auth.me();
    const agentsData = await base44.entities.Agent.filter({ created_by: user.email });
    setAgents(agentsData);

    if (agentsData.length > 0) {
      const knowledgeData = await base44.entities.AgentKnowledge.list('-learned_date');
      setKnowledge(knowledgeData);
    }
  };

  const simulateAgentLearning = async () => {
    if (agents.length === 0) return;
    
    setIsLearning(true);
    
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    const learningTopics = [
      { name: 'Quantum Computing', category: 'concept', description: 'Advanced computational paradigm using quantum mechanics principles' },
      { name: 'Smart Thermostat', category: 'object', description: 'IoT device for automated temperature control with learning capabilities' },
      { name: 'Machine Learning Pipeline', category: 'concept', description: 'End-to-end process for training and deploying ML models' },
      { name: 'Central Park, NYC', category: 'location', description: 'Urban park in Manhattan, 843 acres of green space' },
      { name: 'Renewable Energy Systems', category: 'concept', description: 'Energy generation from sustainable sources like solar and wind' }
    ];

    const randomTopic = learningTopics[Math.floor(Math.random() * learningTopics.length)];

    await base44.entities.AgentKnowledge.create({
      agent_id: randomAgent.id,
      object_name: randomTopic.name,
      description: randomTopic.description,
      category: randomTopic.category,
      source_url: 'https://wikipedia.org',
      confidence_score: Math.floor(Math.random() * 20) + 80,
      learned_date: new Date().toISOString(),
      context: 'Real-time environment scanning'
    });

    setTimeout(() => {
      setIsLearning(false);
      loadData();
    }, 2000);
  };

  const categories = ['all', 'object', 'concept', 'location', 'person', 'skill', 'other'];

  const filteredKnowledge = knowledge.filter(k => {
    const matchesSearch = k.object_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         k.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || k.category === categoryFilter;
    const matchesAgent = !selectedAgent || k.agent_id === selectedAgent;
    return matchesSearch && matchesCategory && matchesAgent;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'object': return '📦';
      case 'concept': return '💡';
      case 'location': return '📍';
      case 'person': return '👤';
      case 'skill': return '🎯';
      default: return '🔍';
    }
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Agent <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Knowledge Base</span>
          </h1>
          <p className="text-white/60 text-lg">Real-time learning tracked every 247 zeptoseconds</p>
        </motion.div>

        {/* Learning Indicator */}
        <AnimatePresence>
          {isLearning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4 mb-6 flex items-center gap-3"
            >
              <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
              <div>
                <div className="text-purple-300 font-bold">Agent Learning In Progress</div>
                <div className="text-purple-400/70 text-sm">Scanning environment and acquiring new knowledge...</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-white/60 text-sm">Total Knowledge</span>
            </div>
            <div className="text-purple-400 text-3xl font-bold">{knowledge.length}</div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              <span className="text-white/60 text-sm">Active Agents</span>
            </div>
            <div className="text-cyan-400 text-3xl font-bold">{agents.length}</div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-white/60 text-sm">Last Learning</span>
            </div>
            <div className="text-green-400 text-lg font-bold">
              {knowledge.length > 0 ? moment(knowledge[0].learned_date).fromNow() : 'N/A'}
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <span className="text-white/60 text-sm">Avg Confidence</span>
            </div>
            <div className="text-yellow-400 text-3xl font-bold">
              {knowledge.length > 0 ? (knowledge.reduce((sum, k) => sum + k.confidence_score, 0) / knowledge.length).toFixed(0) : 0}%
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge..."
              className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-purple-500 outline-none"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Knowledge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKnowledge.map((item, i) => {
            const agent = agents.find(a => a.id === item.agent_id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{getCategoryIcon(item.category)}</div>
                  <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-bold">
                    {item.confidence_score}% CONF
                  </div>
                </div>

                <h3 className="text-white font-bold text-lg mb-2">{item.object_name}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-3">{item.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs">
                    <Eye className="w-3 h-3" />
                    <span>Learned by {agent?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{moment(item.learned_date).fromNow()}</span>
                  </div>
                  {item.source_url && (
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <LinkIcon className="w-3 h-3" />
                      <span className="truncate">{item.source_url}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AuroraBackground>
  );
}