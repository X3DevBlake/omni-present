import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Target, ChevronRight, Check } from 'lucide-react';

export default function AgentGoalBuilder() {
  const [goals, setGoals] = useState([
    { id: 1, title: 'Analyze Market Trends', steps: 3, progress: 67, status: 'in-progress' },
    { id: 2, title: 'Execute Trades', steps: 5, progress: 40, status: 'in-progress' },
    { id: 3, title: 'Report Generation', steps: 2, progress: 100, status: 'completed' }
  ]);
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(prev => [...prev, {
      id: Date.now(),
      title: newGoal,
      steps: Math.floor(Math.random() * 5) + 2,
      progress: 0,
      status: 'pending'
    }]);
    setNewGoal('');
  };

  const updateGoalProgress = (id, newProgress) => {
    setGoals(prev => prev.map(g =>
      g.id === id ? {
        ...g,
        progress: newProgress,
        status: newProgress === 100 ? 'completed' : 'in-progress'
      } : g
    ));
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-6 flex items-center gap-2">
        <Target className="w-5 h-5 text-cyan-400" />
        Agent Goal Programming
      </h3>

      {/* Goal Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addGoal()}
          placeholder="Define new goal (e.g., 'Maximize ROI within budget')..."
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-sm placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
        />
        <button
          onClick={addGoal}
          className="px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {goals.map((goal, idx) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{goal.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span>{goal.steps} steps</span>
                    <span>•</span>
                    <span className={goal.status === 'completed' ? 'text-green-400' : 'text-cyan-400'}>
                      {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-full bg-black/50 rounded-full h-3 mr-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${
                        goal.status === 'completed'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                    />
                  </div>
                  <span className="text-sm font-bold text-white min-w-12">{goal.progress}%</span>
                </div>

                {/* Progress Controls */}
                {goal.status !== 'completed' && (
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map(p => (
                      <button
                        key={p}
                        onClick={() => updateGoalProgress(goal.id, p)}
                        className={`flex-1 text-xs py-1 rounded transition-all ${
                          goal.progress >= p
                            ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-400'
                            : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Step Visualization */}
              <div className="mt-3 flex items-center gap-1">
                {[...Array(goal.steps)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex-1 h-2 rounded-full ${
                      i < Math.ceil((goal.progress / 100) * goal.steps)
                        ? 'bg-cyan-500'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">{goals.length}</div>
          <div className="text-xs text-white/60">Total Goals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {goals.filter(g => g.status === 'completed').length}
          </div>
          <div className="text-xs text-white/60">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">
            {Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)}%
          </div>
          <div className="text-xs text-white/60">Avg Progress</div>
        </div>
      </div>
    </div>
  );
}