import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, Flame, TrendingUp, Star, Lock } from 'lucide-react';

export default function GamificationDashboard() {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [timeframe, setTimeframe] = useState('month');

  const gamification = {
    totalPoints: 1250,
    level: 5,
    nextLevelPoints: 2200,
    currentLevelPoints: 1250,
    streak: 12,
    longestStreak: 45,
  };

  const badges = [
    { name: 'Budget Master', earned: true, earnedDate: '2025-12-15', icon: '💰', description: 'Stay within budget 3 months' },
    { name: 'Savings Champion', earned: true, earnedDate: '2025-11-20', icon: '🏆', description: 'Save 20%+ of income' },
    { name: 'Consistency Streak', earned: true, earnedDate: '2026-01-05', icon: '🔥', description: '30 daily check-ins' },
    { name: 'Investment Scholar', earned: false, progress: 2, total: 3, icon: '📚', description: 'Complete 3 investment courses' },
    { name: 'Tax Optimizer', earned: false, progress: 2, total: 5, icon: '📊', description: 'Find 5 tax-saving opportunities' },
    { name: 'Goal Achiever', earned: false, progress: 1, total: 2, icon: '🎯', description: 'Hit a major financial milestone' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Alex Chen', points: 5240, badges: 8, streak: 60 },
    { rank: 2, name: 'Jordan Smith', points: 4890, badges: 7, streak: 45 },
    { rank: 3, name: 'Morgan Lee', points: 4620, badges: 7, streak: 38 },
    { rank: 4, name: 'Casey Brown', points: 4150, badges: 6, streak: 28 },
    { rank: 127, name: 'You', points: 1250, badges: 3, streak: 12, isUser: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-lg p-6"
      >
        <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Financial Gamification
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/60 text-sm">Total Points</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">{gamification.totalPoints}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/60 text-sm">Level</p>
            <p className="text-3xl font-bold text-orange-400 mt-1">{gamification.level}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/60 text-sm">Current Streak</p>
            <p className="text-3xl font-bold text-red-400 mt-1 flex items-center gap-1">
              <Flame className="w-5 h-5" /> {gamification.streak}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/60 text-sm">Longest Streak</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{gamification.longestStreak}</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/80 text-sm font-semibold">Level {gamification.level} Progress</p>
            <p className="text-white/60 text-xs">
              {gamification.currentLevelPoints} / {gamification.nextLevelPoints} points
            </p>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(gamification.currentLevelPoints / gamification.nextLevelPoints) * 100}%` }}
              transition={{ duration: 1.5 }}
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <h4 className="text-white font-bold text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Badges ({badges.filter(b => b.earned).length}/{badges.length})
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map((badge, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedBadge(badge)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                badge.earned
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/40'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <p className="text-3xl text-center mb-2">{badge.icon}</p>
              <p className="text-white font-bold text-sm text-center">{badge.name}</p>
              {badge.earned ? (
                <p className="text-yellow-400 text-xs text-center mt-1">Earned {badge.earnedDate}</p>
              ) : (
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(badge.progress / badge.total) * 100}%` }}
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    />
                  </div>
                  <p className="text-white/60 text-xs text-center mt-1">
                    {badge.progress}/{badge.total}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-bold text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Leaderboard
          </h4>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white/80 text-sm focus:outline-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="space-y-2">
          {leaderboard.map((user, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                user.isUser
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/40'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
                {user.rank === 1 && '🥇'}
                {user.rank === 2 && '🥈'}
                {user.rank === 3 && '🥉'}
                {user.rank > 3 && user.rank}
              </div>

              <div className="flex-1">
                <p className="text-white font-semibold flex items-center gap-2">
                  {user.name}
                  {user.isUser && <span className="text-xs bg-cyan-500/30 px-2 py-0.5 rounded text-cyan-300">You</span>}
                </p>
                <p className="text-white/60 text-xs flex gap-3">
                  <span>{user.points} pts</span>
                  <span>{user.badges} badges</span>
                  <span>🔥 {user.streak}</span>
                </p>
              </div>

              {user.rank <= 3 && <Star className="w-4 h-4 text-yellow-400" />}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Badge Details */}
      {selectedBadge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/20 rounded-lg p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-5xl">{selectedBadge.icon}</p>
              <div>
                <h3 className="text-white font-bold text-lg">{selectedBadge.name}</h3>
                <p className="text-white/60 text-sm">{selectedBadge.description}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedBadge(null)}
              className="text-white/60 hover:text-white"
            >
              ✕
            </motion.button>
          </div>

          {selectedBadge.earned ? (
            <p className="text-yellow-300 text-sm">
              ✓ Earned on {selectedBadge.earnedDate}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-white/80 text-sm">
                Progress: {selectedBadge.progress} of {selectedBadge.total}
              </p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(selectedBadge.progress / selectedBadge.total) * 100}%` }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}