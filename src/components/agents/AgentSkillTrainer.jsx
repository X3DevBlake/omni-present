import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Plus, Zap, Lightbulb, Trophy } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SKILL_CATEGORIES = ['analysis', 'negotiation', 'combat', 'exploration', 'management', 'creativity', 'technical', 'social'];

export default function AgentSkillTrainer({ agentId, agentName = 'Agent' }) {
  const [skills, setSkills] = useState([]);
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTeachForm, setShowTeachForm] = useState(false);
  const [formData, setFormData] = useState({
    skill_name: '',
    description: '',
    category: 'technical'
  });

  useEffect(() => {
    loadSkills();
    generateSuggestedSkills();
  }, [agentId]);

  const loadSkills = async () => {
    try {
      const data = await base44.entities.AgentSkill.filter(
        { agent_id: agentId },
        '-proficiency'
      );
      setSkills(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestedSkills = async () => {
    try {
      const prompt = `Based on an agent's experiences and goals, suggest 3 new skills they should learn.
      
Agent: ${agentName}
Current Context: Learning-oriented AI agent in simulation environment

Suggest skills that would:
1. Build on likely experiences
2. Fill capability gaps
3. Enable new types of interactions

Format as JSON:
{
  "suggestions": [
    {
      "skill_name": "Skill Name",
      "description": "What it does",
      "category": "category",
      "reasoning": "Why agent should learn this",
      "difficulty": "easy|medium|hard",
      "prerequisites": ["skill1"]
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: { type: 'object' }
            }
          }
        }
      });

      setSuggestedSkills(response.suggestions || []);
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
    }
  };

  const teachSkill = async () => {
    if (!formData.skill_name.trim() || !formData.description.trim()) {
      toast.error('Skill name and description required');
      return;
    }

    try {
      const newSkill = {
        agent_id: agentId,
        skill_name: formData.skill_name,
        description: formData.description,
        category: formData.category,
        proficiency: 20,
        source: 'taught',
        learned_from: 'user',
        usage_count: 0,
        applications: []
      };

      await base44.entities.AgentSkill.create(newSkill);
      setSkills(prev => [newSkill, ...prev]);
      setFormData({ skill_name: '', description: '', category: 'technical' });
      setShowTeachForm(false);
      toast.success('Skill taught successfully!');
    } catch (err) {
      toast.error('Failed to teach skill');
    }
  };

  const learnSuggestedSkill = async (suggested) => {
    try {
      const newSkill = {
        agent_id: agentId,
        skill_name: suggested.skill_name,
        description: suggested.description,
        category: suggested.category,
        proficiency: 15,
        source: 'learned',
        suggested_by_ai: true,
        usage_count: 0,
        applications: []
      };

      await base44.entities.AgentSkill.create(newSkill);
      setSkills(prev => [newSkill, ...prev]);
      setSuggestedSkills(prev => prev.filter(s => s.skill_name !== suggested.skill_name));
      toast.success('Agent learned new skill!');
    } catch (err) {
      toast.error('Failed to learn skill');
    }
  };

  const improveProficiency = async (skillId) => {
    try {
      const skill = skills.find(s => s.id === skillId);
      if (skill && skill.proficiency < 100) {
        const newProficiency = Math.min(100, skill.proficiency + 10);
        await base44.entities.AgentSkill.update(skillId, {
          proficiency: newProficiency
        });
        setSkills(prev => prev.map(s =>
          s.id === skillId ? { ...s, proficiency: newProficiency } : s
        ));
        toast.success('Skill improved!');
      }
    } catch (err) {
      toast.error('Failed to improve skill');
    }
  };

  if (loading) {
    return <div className="text-white/40">Loading skills...</div>;
  }

  return (
    <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Book className="w-5 h-5 text-purple-400" />
          Skill Training System
        </h3>
        <span className="text-xs text-white/50">{skills.length} skills</span>
      </div>

      {/* Teach New Skill Form */}
      {showTeachForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 border border-purple-500/30 rounded-lg p-4 space-y-3"
        >
          <input
            type="text"
            placeholder="Skill name..."
            value={formData.skill_name}
            onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
          />

          <textarea
            placeholder="Skill description and how to use it..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40 h-16"
          />

          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          >
            {SKILL_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={teachSkill}
              className="flex-1 py-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded font-medium text-xs"
            >
              Teach Skill
            </button>
            <button
              onClick={() => setShowTeachForm(false)}
              className="flex-1 py-2 bg-white/10 border border-white/20 text-white/60 rounded font-medium text-xs"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Current Skills */}
      <div className="space-y-3">
        <p className="text-white/60 text-xs font-bold">Learned Skills:</p>
        {skills.length === 0 ? (
          <div className="text-center py-3 text-white/40 text-xs">No skills yet</div>
        ) : (
          skills.map(skill => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{skill.skill_name}</p>
                  <p className="text-white/60 text-xs">{skill.description}</p>
                </div>
                <span className="text-xs bg-purple-500/20 px-2 py-1 rounded text-purple-300">
                  {skill.category}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white/60">Proficiency</span>
                  <span className="text-xs font-bold text-cyan-400">{skill.proficiency}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => improveProficiency(skill.id)}
                className="mt-2 w-full py-1 text-xs bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded hover:bg-cyan-500/30 transition-all"
              >
                Practice (+10%)
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* AI-Suggested Skills */}
      {suggestedSkills.length > 0 && (
        <div className="border-t border-white/10 pt-4 space-y-3">
          <p className="text-white/60 text-xs font-bold flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-yellow-400" />
            AI-Suggested Skills:
          </p>
          {suggestedSkills.map((suggested, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{suggested.skill_name}</p>
                  <p className="text-white/60 text-xs">{suggested.description}</p>
                  <p className="text-yellow-400/80 text-xs mt-1">💡 {suggested.reasoning}</p>
                </div>
                <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded text-yellow-300 whitespace-nowrap">
                  {suggested.difficulty}
                </span>
              </div>
              <motion.button
                onClick={() => learnSuggestedSkill(suggested)}
                whileHover={{ scale: 1.05 }}
                className="w-full py-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded font-medium text-xs"
              >
                <Trophy className="w-3 h-3 inline mr-1" />
                Learn Skill
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {!showTeachForm && (
        <motion.button
          onClick={() => setShowTeachForm(true)}
          whileHover={{ scale: 1.05 }}
          className="w-full py-2 border border-dashed border-purple-500/40 text-purple-400 rounded font-medium text-xs hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Teach New Skill
        </motion.button>
      )}
    </div>
  );
}