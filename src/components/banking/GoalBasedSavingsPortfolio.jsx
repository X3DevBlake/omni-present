import React from 'react';
import { motion } from 'framer-motion';
import { Target, Home, Plane, GraduationCap } from 'lucide-react';

export default function GoalBasedSavingsPortfolio() {
  const goals = [
    { name: 'Emergency Fund', icon: Target, progress: 8500, target: 10000, color: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/40' },
    { name: 'House Down Payment', icon: Home, progress: 15000, target: 50000, color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/40' },
    { name: 'Vacation', icon: Plane, progress: 2800, target: 5000, color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/40' },
    { name: 'Education', icon: GraduationCap, progress: 12000, target: 25000, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/40' }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4">🎯 Savings Goals</h3>

      <div className="grid md:grid-cols-2 gap-4">
        {goals.map((goal, i) => {
          const Icon = goal.icon;
          const percentage = (goal.progress / goal.target) * 100;
          
          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${goal.color} border ${goal.border} rounded-xl p-4`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon className="w-6 h-6 text-white" />
                <div className="text-white font-bold">{goal.name}</div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">${goal.progress.toLocaleString()}</span>
                  <span className="text-white">${goal.target.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              
              <div className="text-cyan-400 font-bold text-sm">{percentage.toFixed(0)}% Complete</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}