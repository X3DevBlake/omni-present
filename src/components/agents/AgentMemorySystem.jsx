import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Search, Plus, Trash2, Star, Clock, Tag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentMemorySystem({ agentId }) {
  const [memories, setMemories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    memory_type: 'interaction',
    content: '',
    importance_score: 50,
    tags: ''
  });

  const memoryTypes = ['interaction', 'learned_fact', 'user_preference', 'context', 'behavior_pattern'];

  useEffect(() => {
    loadMemories();
  }, [agentId]);

  const loadMemories = async () => {
    try {
      const data = await base44.entities.AgentMemory.filter(
        { agent_id: agentId },
        '-importance_score',
        50
      );
      setMemories(data);
    } catch (err) {
      console.error('Failed to load memories:', err);
    }
  };

  const saveMemory = async () => {
    if (!formData.content.trim()) {
      toast.error('Memory content required');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.AgentMemory.create({
        agent_id: agentId,
        memory_type: formData.memory_type,
        content: formData.content,
        importance_score: formData.importance_score,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        context: {},
        access_count: 0
      });
      setMemories([]);
      setFormData({ memory_type: 'interaction', content: '', importance_score: 50, tags: '' });
      setShowForm(false);
      loadMemories();
      toast.success('Memory saved!');
    } catch (err) {
      toast.error('Failed to save memory');
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (id) => {
    try {
      await base44.entities.AgentMemory.delete(id);
      loadMemories();
      toast.success('Memory deleted');
    } catch (err) {
      toast.error('Failed to delete memory');
    }
  };

  const accessMemory = async (id) => {
    try {
      const memory = memories.find(m => m.id === id);
      if (memory) {
        await base44.entities.AgentMemory.update(id, {
          access_count: (memory.access_count || 0) + 1,
          last_accessed: new Date().toISOString()
        });
        loadMemories();
      }
    } catch (err) {
      console.error('Failed to update memory access:', err);
    }
  };

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || m.memory_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-cyan-400" />
        <h3 className="text-white font-bold">Agent Memory System</h3>
        <span className="text-xs text-white/50 ml-auto">{memories.length} memories</span>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search memories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40"
        />

        <div className="flex gap-2 flex-wrap">
          {['all', ...memoryTypes].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                filterType === type
                  ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-100'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Add Memory Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 border border-cyan-500/30 rounded-lg p-4 space-y-3"
        >
          <select
            value={formData.memory_type}
            onChange={(e) => setFormData({ ...formData, memory_type: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
          >
            {memoryTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <textarea
            placeholder="Memory content..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-2 text-white text-xs h-20 placeholder-white/40"
          />

          <div>
            <label className="text-white/60 text-xs block mb-1">Importance: {formData.importance_score}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.importance_score}
              onChange={(e) => setFormData({ ...formData, importance_score: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <input
            type="text"
            placeholder="Tags (comma-separated)..."
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs placeholder-white/40"
          />

          <div className="flex gap-2">
            <motion.button
              onClick={saveMemory}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              className="flex-1 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded font-medium text-xs disabled:opacity-50"
            >
              Save Memory
            </motion.button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 bg-white/10 border border-white/20 text-white/60 rounded font-medium text-xs"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Memories List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-4 text-white/40 text-xs">
            {memories.length === 0 ? 'No memories yet' : 'No matching memories'}
          </div>
        ) : (
          filteredMemories.map(memory => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-cyan-400">{memory.memory_type}</span>
                    {memory.importance_score >= 75 && <Star className="w-3 h-3 text-yellow-400" />}
                  </div>
                  <p className="text-white/80 text-xs break-words">{memory.content}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {memory.tags?.map(tag => (
                      <span key={tag} className="text-xs bg-white/10 px-2 py-0.5 rounded text-white/60">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <motion.button
                  onClick={() => deleteMemory(memory.id)}
                  whileHover={{ scale: 1.2 }}
                  className="text-red-400/60 hover:text-red-400 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-white/40 text-xs">
                <Clock className="w-3 h-3" />
                <span>Accessed {memory.access_count || 0} times</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {!showForm && (
        <motion.button
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          className="w-full py-2 border border-dashed border-cyan-500/40 text-cyan-400 rounded font-medium text-xs hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Memory
        </motion.button>
      )}
    </div>
  );
}