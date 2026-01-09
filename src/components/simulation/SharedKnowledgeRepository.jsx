import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Library, Plus, Eye, Star, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SharedKnowledgeRepository() {
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    knowledge_type: 'discovery',
    category: ''
  });

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const data = await base44.entities.SharedKnowledge.list('-impact_score', 100);
      setKnowledge(data);
    } catch (err) {
      console.error('Failed to load knowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  const publishKnowledge = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content required');
      return;
    }

    try {
      const newEntry = {
        title: formData.title,
        content: formData.content,
        publisher_agent_id: 'lab-assistant-01',
        knowledge_type: formData.knowledge_type,
        category: formData.category,
        impact_score: 50,
        times_accessed: 0,
        agents_incorporating: [],
        quality_rating: 3
      };

      await base44.entities.SharedKnowledge.create(newEntry);
      setKnowledge(prev => [newEntry, ...prev]);
      setFormData({ title: '', content: '', knowledge_type: 'discovery', category: '' });
      setShowPublishForm(false);
      toast.success('Knowledge published!');
    } catch (err) {
      toast.error('Failed to publish knowledge');
    }
  };

  const adoptKnowledge = async (knowledgeId) => {
    try {
      const item = knowledge.find(k => k.id === knowledgeId);
      if (item) {
        const adopters = item.agents_incorporating || [];
        const newAdopters = adopters.includes('lab-assistant-01')
          ? adopters
          : [...adopters, 'lab-assistant-01'];

        await base44.entities.SharedKnowledge.update(knowledgeId, {
          agents_incorporating: newAdopters,
          times_accessed: (item.times_accessed || 0) + 1
        });

        setKnowledge(prev => prev.map(k =>
          k.id === knowledgeId
            ? { ...k, agents_incorporating: newAdopters, times_accessed: (k.times_accessed || 0) + 1 }
            : k
        ));
        toast.success('Knowledge adopted!');
      }
    } catch (err) {
      toast.error('Failed to adopt knowledge');
    }
  };

  if (loading) {
    return <div className="text-white/40">Loading repository...</div>;
  }

  const typeIcons = {
    discovery: '🔍',
    technique: '🔧',
    insight: '💡',
    warning: '⚠️',
    opportunity: '🎯',
    synthesis: '🧬'
  };

  const filteredKnowledge = knowledge.filter(k =>
    filterType === 'all' || k.knowledge_type === filterType
  );

  return (
    <div className="bg-black/40 border border-green-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Library className="w-5 h-5 text-green-400" />
          Shared Knowledge Repository
        </h3>
        <span className="text-xs text-white/50">{knowledge.length} entries</span>
      </div>

      {/* Publish Form */}
      {showPublishForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 border border-green-500/30 rounded-lg p-4 space-y-3"
        >
          <input
            type="text"
            placeholder="Knowledge title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
          />

          <textarea
            placeholder="Detailed knowledge content..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40 h-20"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={formData.knowledge_type}
              onChange={(e) => setFormData({ ...formData, knowledge_type: e.target.value })}
              className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
            >
              {Object.keys(typeIcons).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Category..."
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={publishKnowledge}
              className="flex-1 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded font-medium text-xs"
            >
              Publish
            </button>
            <button
              onClick={() => setShowPublishForm(false)}
              className="flex-1 py-2 bg-white/10 border border-white/20 text-white/60 rounded font-medium text-xs"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter */}
      <div className="flex gap-1 flex-wrap">
        {['all', ...Object.keys(typeIcons)].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              filterType === type
                ? 'bg-green-500/30 border border-green-500/50 text-green-100'
                : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Knowledge List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredKnowledge.length === 0 ? (
          <div className="text-center py-4 text-white/40 text-xs">No knowledge entries</div>
        ) : (
          filteredKnowledge.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => setSelectedKnowledge(item)}
            >
              <div className="flex items-start gap-2 mb-1">
                <span className="text-lg">{typeIcons[item.knowledge_type]}</span>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{item.title}</p>
                  {item.category && (
                    <p className="text-white/60 text-xs">{item.category}</p>
                  )}
                </div>
              </div>

              <p className="text-white/70 text-xs mb-2 line-clamp-2">{item.content}</p>

              <div className="flex gap-2 items-center text-xs text-white/60">
                <Eye className="w-3 h-3" />
                <span>{item.times_accessed || 0} views</span>
                <Star className="w-3 h-3 ml-2" />
                <span>{item.quality_rating || 0}/5</span>
                <Share2 className="w-3 h-3 ml-2" />
                <span>{(item.agents_incorporating || []).length} using</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Selected Knowledge Details */}
      {selectedKnowledge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-green-500/30 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-green-400 font-bold text-sm">{selectedKnowledge.title}</p>
              <p className="text-white/60 text-xs">{selectedKnowledge.knowledge_type}</p>
            </div>
            <motion.button
              onClick={() => adoptKnowledge(selectedKnowledge.id)}
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 text-xs bg-green-500/20 border border-green-500/40 text-green-300 rounded hover:bg-green-500/30"
            >
              Adopt
            </motion.button>
          </div>

          <p className="text-white/80 text-sm">{selectedKnowledge.content}</p>

          {selectedKnowledge.agents_incorporating?.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-cyan-400 text-xs font-bold mb-1">Agents Using This:</p>
              <div className="flex gap-1 flex-wrap">
                {selectedKnowledge.agents_incorporating.map(agent => (
                  <span key={agent} className="text-xs bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300">
                    {agent}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {!showPublishForm && (
        <motion.button
          onClick={() => setShowPublishForm(true)}
          whileHover={{ scale: 1.05 }}
          className="w-full py-2 border border-dashed border-green-500/40 text-green-400 rounded font-medium text-xs hover:bg-green-500/10 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Publish Knowledge
        </motion.button>
      )}
    </div>
  );
}