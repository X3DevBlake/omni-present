import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentPersonalityCustomizer({ agentId, onPersonalityChange }) {
  const [personality, setPersonality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    loadPersonality();
  }, [agentId]);

  const loadPersonality = async () => {
    try {
      const data = await base44.entities.AgentPersonality.filter({ agent_id: agentId });
      if (data.length > 0) {
        setPersonality(data[0]);
      } else {
        setPersonality({
          agent_id: agentId,
          name: 'Custom Agent',
          traits: {
            curiosity: 50,
            friendliness: 70,
            confidence: 60,
            caution: 50,
            creativity: 60
          },
          communication_style: 'casual',
          emotional_responses: {},
          knowledge_domains: [],
          decision_strategy: 'analytical',
          goals: [],
          constraints: []
        });
      }
    } catch (err) {
      console.error('Failed to load personality:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePersonality = async () => {
    setSaving(true);
    try {
      if (personality.id) {
        await base44.entities.AgentPersonality.update(personality.id, personality);
      } else {
        await base44.entities.AgentPersonality.create(personality);
      }
      onPersonalityChange?.(personality);
      toast.success('Personality saved!');
    } catch (err) {
      toast.error('Failed to save personality');
    } finally {
      setSaving(false);
    }
  };

  const updateTrait = (traitName, value) => {
    setPersonality(prev => ({
      ...prev,
      traits: { ...prev.traits, [traitName]: value }
    }));
  };

  const addKnowledgeDomain = () => {
    if (newDomain.trim()) {
      setPersonality(prev => ({
        ...prev,
        knowledge_domains: [...(prev.knowledge_domains || []), newDomain]
      }));
      setNewDomain('');
    }
  };

  const removeDomain = (domain) => {
    setPersonality(prev => ({
      ...prev,
      knowledge_domains: (prev.knowledge_domains || []).filter(d => d !== domain)
    }));
  };

  if (loading) {
    return <div className="text-white/40">Loading personality...</div>;
  }

  const traitNames = ['curiosity', 'friendliness', 'confidence', 'caution', 'creativity'];

  return (
    <div className="bg-black/40 border border-pink-500/30 rounded-2xl p-6 space-y-6">
      <h3 className="text-white font-bold">🎭 Agent Personality Customizer</h3>

      {/* Name */}
      <div>
        <label className="text-white/60 text-sm block mb-2">Agent Name</label>
        <input
          type="text"
          value={personality.name}
          onChange={(e) => setPersonality({ ...personality, name: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
        />
      </div>

      {/* Traits */}
      <div className="space-y-3">
        <p className="text-white/60 text-sm font-bold">Personality Traits</p>
        {traitNames.map(trait => (
          <div key={trait}>
            <div className="flex justify-between mb-1">
              <label className="text-white/70 text-sm capitalize">{trait}</label>
              <span className="text-cyan-400 font-bold">{personality.traits[trait]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={personality.traits[trait]}
              onChange={(e) => updateTrait(trait, parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Communication Style */}
      <div>
        <label className="text-white/60 text-sm block mb-2">Communication Style</label>
        <select
          value={personality.communication_style}
          onChange={(e) => setPersonality({ ...personality, communication_style: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
        >
          {['formal', 'casual', 'technical', 'poetic', 'humorous', 'direct'].map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>

      {/* Decision Strategy */}
      <div>
        <label className="text-white/60 text-sm block mb-2">Decision Strategy</label>
        <select
          value={personality.decision_strategy}
          onChange={(e) => setPersonality({ ...personality, decision_strategy: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
        >
          {['analytical', 'intuitive', 'collaborative', 'cautious', 'aggressive'].map(strategy => (
            <option key={strategy} value={strategy}>{strategy}</option>
          ))}
        </select>
      </div>

      {/* Knowledge Domains */}
      <div>
        <label className="text-white/60 text-sm block mb-2">Knowledge Domains</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Add domain..."
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addKnowledgeDomain()}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40"
          />
          <motion.button
            onClick={addKnowledgeDomain}
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-pink-500/20 border border-pink-500/40 text-pink-300 rounded-lg flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {personality.knowledge_domains?.map(domain => (
            <motion.div
              key={domain}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-pink-500/20 border border-pink-500/40 text-pink-300 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-2"
            >
              {domain}
              <button
                onClick={() => removeDomain(domain)}
                className="hover:text-pink-100 font-bold"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        onClick={savePersonality}
        disabled={saving}
        whileHover={{ scale: 1.05 }}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save className="w-5 h-5" />
        {saving ? 'Saving...' : 'Save Personality'}
      </motion.button>

      {/* Preview */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
        <p className="text-white/60 text-xs font-bold">Personality Preview:</p>
        <div className="space-y-1 text-xs text-white/70">
          <p><strong>Style:</strong> {personality.communication_style}</p>
          <p><strong>Approach:</strong> {personality.decision_strategy}</p>
          <p><strong>Expertise:</strong> {personality.knowledge_domains?.length || 0} domains</p>
          <p><strong>Primary Trait:</strong> {traitNames.reduce((a, b) => personality.traits[a] > personality.traits[b] ? a : b)}</p>
        </div>
      </div>
    </div>
  );
}