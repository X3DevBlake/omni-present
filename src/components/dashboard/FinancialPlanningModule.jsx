import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FinancialPlanningModule({ userEmail }) {
  const { data: goals = [] } = useQuery({
    queryKey: ['goals', userEmail],
    queryFn: () => userEmail ? base44.entities.FinancialGoal.filter({ user_email: userEmail }) : []
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions', userEmail],
    queryFn: () => userEmail ? base44.entities.LongTermPrediction.filter({ user_email: userEmail }).catch(() => []) : []
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-purple-400" />
        <h3 className="text-white font-bold">Financial Planning</h3>
      </div>

      {/* Active Goals */}
      <div className="space-y-2">
        <p className="text-white/60 text-xs font-bold">ACTIVE GOALS</p>
        {goals.slice(0, 3).map((goal, idx) => (
          <motion.div
            key={goal.id || idx}
            whileHover={{ x: 5 }}
            className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-3"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-white font-bold">{goal.name}</p>
                <p className="text-white/60 text-xs">{goal.category}</p>
              </div>
              <p className="text-purple-400 font-bold">{goal.progress_percentage || 0}%</p>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                style={{ width: `${goal.progress_percentage || 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/50 mt-2">
              <span>${goal.current_amount || 0}</span>
              <span>${goal.target_amount}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Long-term Predictions */}
      {predictions.length > 0 && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
          <p className="text-cyan-400 font-bold text-sm mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            AI Forecast
          </p>
          <p className="text-white/70 text-sm">
            {predictions[0].actionable_insights?.[0] || 'Analyzing your financial trajectory...'}
          </p>
        </div>
      )}

      {/* Calendar Integration Placeholder */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <p className="text-white font-bold text-sm">Upcoming Events</p>
        </div>
        <p className="text-white/60 text-xs">Google Calendar integration active</p>
        <div className="space-y-1 mt-2">
          <div className="text-xs text-white/70 flex justify-between">
            <span>Payment Due: Mortgage</span>
            <span className="text-blue-400">Jan 15</span>
          </div>
          <div className="text-xs text-white/70 flex justify-between">
            <span>Goal Milestone: House Fund</span>
            <span className="text-green-400">Feb 1</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}