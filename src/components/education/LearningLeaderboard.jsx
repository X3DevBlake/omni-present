import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Medal } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LearningLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me()
      .then(user => {
        setUserEmail(user?.email);
        loadLeaderboard(user?.email);
      })
      .catch(() => setUserEmail(null));
  }, []);

  const loadLeaderboard = async (email) => {
    try {
      const board = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate learning leaderboard:
        
Current user: ${email}

Create top 10 learners with:
1. Rank
2. Name/Email
3. Total XP
4. Modules Completed
5. Badges Earned
6. Current Streak
7. Level

Also calculate current user's rank.`,
        response_json_schema: {
          type: 'object',
          properties: {
            topLearners: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  rank: { type: 'number' },
                  name: { type: 'string' },
                  xp: { type: 'number' },
                  badges: { type: 'number' },
                  streak: { type: 'number' },
                  level: { type: 'number' },
                },
              },
            },
            userRank: { type: 'number' },
            userXP: { type: 'number' },
          },
        },
      });

      setLeaderboard(board.topLearners || []);
      setUserRank(board.userRank);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-400';
      case 3: return 'text-orange-400';
      default: return 'text-white/40';
    }
  };

  const getMedalIcon = (rank) => {
    if (rank <= 3) return '🥇🥈🥉'[rank - 1];
    return '⭐';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <p className="text-white font-bold">Learning Leaderboard</p>
      </div>

      {userRank && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyan-500/20 border border-cyan-400/30 rounded-lg p-4"
        >
          <p className="text-cyan-300 font-bold text-sm mb-1">Your Rank: #{userRank}</p>
          <p className="text-cyan-200/80 text-xs">Keep learning to climb the ranks!</p>
        </motion.div>
      )}

      <div className="space-y-2">
        {leaderboard.map((learner, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`border rounded-lg p-3 transition-all ${
              learner.rank <= 3
                ? 'bg-yellow-500/10 border-yellow-400/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className={`text-lg font-bold ${getMedalColor(learner.rank)}`}>
                  {getMedalIcon(learner.rank)}
                </span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{learner.name}</p>
                  <div className="flex gap-2 text-xs text-white/60 mt-0.5">
                    <span>Lv{learner.level}</span>
                    <span>•</span>
                    <span>{learner.streak} day streak</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-yellow-400 font-bold text-sm">{learner.xp} XP</p>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: Math.min(learner.badges, 3) }).map((_, i) => (
                    <span key={i} className="text-lg">🏆</span>
                  ))}
                  {learner.badges > 3 && (
                    <span className="text-xs text-white/60">+{learner.badges - 3}</span>
                  )}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: idx * 0.05 + 0.2, duration: 0.5 }}
              className="h-1 bg-cyan-500/30 rounded mt-2 origin-left"
              style={{ width: `${(learner.xp / 10000) * 100}%` }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}