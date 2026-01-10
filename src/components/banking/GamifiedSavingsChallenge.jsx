import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, Zap } from 'lucide-react';

export default function GamifiedSavingsChallenge() {
  const challenges = [
    { id: 1, name: '30-Day No Spend', progress: 65, goal: 100, reward: 50, active: true },
    { id: 2, name: 'Save $1000', progress: 750, goal: 1000, reward: 100, active: true },
    { id: 3, name: 'Invest Weekly', progress: 3, goal: 4, reward: 75, active: true }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" />
        Savings Challenges
      </h3>

      <div className="space-y-3">
        {challenges.map((challenge) => (
          <motion.div
            key={challenge.id}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-bold">{challenge.name}</div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold">+{challenge.reward} Omni</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-white/60 text-sm">
                {challenge.progress}/{challenge.goal}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}