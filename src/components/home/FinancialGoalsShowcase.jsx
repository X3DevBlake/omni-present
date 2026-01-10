import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { useGoalProgress } from '../hooks/useGoalProgress';
import { base44 } from '@/api/base44Client';

export default function FinancialGoalsShowcase({ userEmail }) {
  const { data: goalData } = useGoalProgress(userEmail);
  const goals = (goalData?.goals || []).filter(g => g).slice(0, 4);

  if (!userEmail) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Target className="w-10 h-10 text-purple-400" />
            Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Financial Goals</span>
          </h2>
          <p className="text-white/60">Track progress toward your dreams</p>
        </motion.div>

        {goals.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            No active financial goals. Start by creating one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal, idx) => (
              <motion.div
                key={goal.goalId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 hover:border-purple-400/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{goal?.goalName || 'Unnamed Goal'}</h3>
                    <p className="text-white/60 text-sm capitalize">{goal?.category || 'uncategorized'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  (goal?.status || 'inactive') === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                  {goal?.status || 'inactive'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">Progress</span>
                    <span className="text-sm font-bold text-white">{(goal?.progressPercentage || 0).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${goal.progressPercentage}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  </div>
                </div>

                {/* Goal Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/60 mb-1">Saved</p>
                    <p className="text-white font-bold">${goal.currentAmount?.toFixed(0) || 0}</p>
                  </div>
                  <div>
                    <p className="text-white/60 mb-1">Target</p>
                    <p className="text-white font-bold">${goal.targetAmount?.toFixed(0) || 0}</p>
                  </div>
                  {goal.daysRemaining && (
                    <div className="col-span-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-white/60">{goal.daysRemaining} days remaining</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}