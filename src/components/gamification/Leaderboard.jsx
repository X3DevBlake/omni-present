import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Leaderboard({ category = 'xp', timeframe = 'all-time' }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [category, timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from backend
      const mockLeaders = [
        { id: 1, name: 'Alex Chen', avatar: '🦸', xp: 45000, level: 21, badges: 45, achievements: 89 },
        { id: 2, name: 'Sarah Johnson', avatar: '🧙', xp: 42000, level: 20, badges: 42, achievements: 85 },
        { id: 3, name: 'Mike Rodriguez', avatar: '🤖', xp: 38000, level: 19, badges: 38, achievements: 78 },
        { id: 4, name: 'Emily Wang', avatar: '👩‍🚀', xp: 35000, level: 18, badges: 35, achievements: 72 },
        { id: 5, name: 'David Kim', avatar: '🧑‍💻', xp: 32000, level: 17, badges: 32, achievements: 68 }
      ];
      setLeaders(mockLeaders);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 0) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 1) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <Award className="w-5 h-5 text-white/40" />;
  };

  const getRankBg = (rank) => {
    if (rank === 0) return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/40';
    if (rank === 1) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/40';
    if (rank === 2) return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/40';
    return 'bg-black/40 border-white/10';
  };

  if (loading) {
    return (
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center">
        <div className="text-white/60">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-xl flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Top Contributors
        </h3>
        <div className="flex gap-2">
          <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm">
            <option>All Time</option>
            <option>This Month</option>
            <option>This Week</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {leaders.map((leader, index) => (
          <motion.div
            key={leader.id}
            className={`${getRankBg(index)} backdrop-blur-xl border rounded-xl p-4`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12">
                {getRankIcon(index)}
              </div>
              
              <div className="text-3xl">{leader.avatar}</div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-bold">{leader.name}</h4>
                  <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">
                    Level {leader.level}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {leader.xp.toLocaleString()} XP
                  </span>
                  <span>•</span>
                  <span>{leader.badges} badges</span>
                  <span>•</span>
                  <span>{leader.achievements} achievements</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-white">#{index + 1}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}