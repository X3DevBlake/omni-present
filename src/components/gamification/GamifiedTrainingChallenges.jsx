import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GamifiedTrainingChallenges() {
  const [challenges] = useState([
    { 
      id: 1, 
      title: 'Speed Learner', 
      description: 'Train an agent in under 5 minutes',
      difficulty: 'Easy',
      xp: 100,
      completed: false
    },
    { 
      id: 2, 
      title: 'Optimizer', 
      description: 'Achieve 95% accuracy on a task',
      difficulty: 'Medium',
      xp: 250,
      completed: false
    },
    { 
      id: 3, 
      title: 'Master Trainer', 
      description: 'Complete 10 training sessions',
      difficulty: 'Hard',
      xp: 500,
      completed: false
    },
  ]);
  const [leaderboard] = useState([
    { rank: 1, name: 'Agent Master', xp: 5420 },
    { rank: 2, name: 'AI Wizard', xp: 4890 },
    { rank: 3, name: 'Neural Knight', xp: 4250 },
    { rank: 4, name: 'You', xp: 3100 },
  ]);

  return (
    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" />
        Gamified Training Challenges
      </h3>

      <div className="mb-6">
        <h4 className="text-white font-semibold mb-3">Active Challenges</h4>
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              whileHover={{ scale: 1.02 }}
              className="bg-black/20 rounded-lg p-4 border border-white/10"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-white font-semibold">{challenge.title}</div>
                  <div className="text-white/60 text-sm">{challenge.description}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  challenge.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                  challenge.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {challenge.difficulty}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold">{challenge.xp} XP</span>
                </div>
                <Button size="sm" className="bg-yellow-500/20 hover:bg-yellow-500/30">
                  Accept
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          Leaderboard
        </h4>
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div 
              key={entry.rank}
              className={`flex items-center justify-between p-2 rounded ${
                entry.name === 'You' ? 'bg-cyan-500/20 border border-cyan-500/30' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  entry.rank === 1 ? 'bg-yellow-500/30 text-yellow-400' :
                  entry.rank === 2 ? 'bg-gray-400/30 text-gray-300' :
                  entry.rank === 3 ? 'bg-orange-500/30 text-orange-400' :
                  'bg-white/10 text-white/60'
                }`}>
                  {entry.rank}
                </div>
                <span className="text-white">{entry.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-semibold">{entry.xp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}