import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentGoalSystem({ agentId, agentName = 'Agent', personality = {} }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [suggestedGoals, setSuggestedGoals] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'short_term',
    priority: 50
  });

  useEffect(() => {
    loadGoals();
    generateSuggestedGoals();
  }, [agentId]);

  const loadGoals = async () => {
    try {
      const data = await base44.entities.AgentGoal.filter({ agent_id: agentId }, '-priority');
      setGoals(data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestedGoals = async () => {
    try {
      const prompt = `Given an agent's personality and current state, suggest 2-3 goals that align with their traits.
      
Agent: ${agentName}
Personality: ${JSON.stringify(personality)}

Generate goals that:
1. Match the agent's personality traits
2. Are achievable in short-term (1-7 days)
3. Build toward long-term growth
4. Leverage the agent's skills

Format as JSON:
{
  "goals": [
    {
      "title": "Goal Title",
      "description": "What to achieve",
      "goal_type": "short_term|long_term",
      "reasoning": "Why this goal"
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            goals: { type: 'array' }
          }
        }
      });

      setSuggestedGoals(response.goals || []);
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
    }
  };

  const createGoal = async () => {
    if (!formData.title.trim()) {
      toast.error('Goal title required');
      return;
    }

    try {
      const newGoal = {
        agent_id: agentId,
        ...formData,
        progress: 0,
        status: 'active',
        sub_goals: []
      };

      await base44.entities.AgentGoal.create(newGoal);
      setGoals(prev => [newGoal, ...prev]);
      setFormData({ title: '', description: '', goal_type: 'short_term', priority: 50 });
      setShowForm(false);
      toast.success('Goal created!');
    } catch (err) {
      toast.error('Failed to create goal');
    }
  };

  const adoptSuggestedGoal = async (suggested) => {
    try {
      const newGoal = {
        agent_id: agentId,
        title: suggested.title,
        description: suggested.description,
        goal_type: suggested.goal_type,
        priority: 75,
        status: 'active',
        progress: 0,
        sub_goals: []
      };

      await base44.entities.AgentGoal.create(newGoal);
      setGoals(prev => [newGoal, ...prev]);
      setSuggestedGoals(prev => prev.filter(g => g.title !== suggested.title));
      toast.success('Goal adopted!');
    } catch (err) {
      toast.error('Failed to adopt goal');
    }
  };

  const updateProgress = async (goalId, newProgress) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        const newStatus = newProgress >= 100 ? 'completed' : 'active';
        await base44.entities.AgentGoal.update(goalId, {
          progress: Math.min(100, newProgress),
          status: newStatus
        });
        setGoals(prev => prev.map(g =>
          g.id === goalId ? { ...g, progress: Math.min(100, newProgress), status: newStatus } : g
        ));
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  if (loading) {
    return <div className="text-white/40">Loading goals...</div>;
  }

  return (
    <div className="bg-black/40 border border-blue-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          Goal-Driven System
        </h3>
        <span className="text-xs text-white/50">{goals.length} goals</span>
      </div>

      {/* Goal Creation Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white/5 border border-blue-500/30 rounded-lg p-4 space-y-3"
        >
          <input
            type="text"
            placeholder="Goal title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40"
          />

          <textarea
            placeholder="Goal description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-white/40 h-16"
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              value={formData.goal_type}
              onChange={(e) => setFormData({ ...formData, goal_type: e.target.value })}
              className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
            >
              <option value="immediate">Immediate</option>
              <option value="short_term">Short-term</option>
              <option value="long_term">Long-term</option>
            </select>

            <div>
              <label className="text-white/60 text-xs block mb-1">Priority: {formData.priority}</label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={createGoal}
              className="flex-1 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded font-medium text-xs"
            >
              Create Goal
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 bg-white/10 border border-white/20 text-white/60 rounded font-medium text-xs"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Active Goals */}
      <div className="space-y-3">
        {goals.filter(g => g.status === 'active').length === 0 ? (
          <div className="text-center py-3 text-white/40 text-xs">No active goals</div>
        ) : (
          goals
            .filter(g => g.status === 'active')
            .sort((a, b) => b.priority - a.priority)
            .map(goal => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">{goal.title}</p>
                    <p className="text-white/60 text-xs">{goal.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    goal.goal_type === 'immediate' ? 'bg-red-500/20 text-red-300' :
                    goal.goal_type === 'short_term' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {goal.goal_type}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/60">Progress</span>
                    <span className="text-blue-400 font-bold">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => updateProgress(goal.id, goal.progress + 10)}
                  className="mt-2 w-full py-1 text-xs bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded hover:bg-blue-500/30 transition-all"
                >
                  Progress (+10%)
                </button>
              </motion.div>
            ))
        )}
      </div>

      {/* Completed Goals */}
      {goals.filter(g => g.status === 'completed').length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <p className="text-green-400 text-xs font-bold mb-2">✓ Completed: {goals.filter(g => g.status === 'completed').length}</p>
        </div>
      )}

      {/* AI-Suggested Goals */}
      {suggestedGoals.length > 0 && (
        <div className="border-t border-white/10 pt-3 space-y-2">
          <p className="text-yellow-400 text-xs font-bold flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            AI-Suggested Goals:
          </p>
          {suggestedGoals.map((suggested, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2"
            >
              <p className="text-white text-xs font-bold mb-1">{suggested.title}</p>
              <p className="text-white/70 text-xs mb-2">{suggested.reasoning}</p>
              <motion.button
                onClick={() => adoptSuggestedGoal(suggested)}
                whileHover={{ scale: 1.05 }}
                className="w-full py-1 text-xs bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded"
              >
                Adopt
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {!showForm && goals.filter(g => g.status === 'active').length < 5 && (
        <motion.button
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          className="w-full py-2 border border-dashed border-blue-500/40 text-blue-400 rounded font-medium text-xs hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Set New Goal
        </motion.button>
      )}
    </div>
  );
}