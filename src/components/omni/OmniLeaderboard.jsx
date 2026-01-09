import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

export default function OmniLeaderboard() {
  const leaderboard = [
    { rank: 1, name: 'CryptoWhale', omniEarned: 5234, avatar: '🐋', tier: 'Sovereign' },
    { rank: 2, name: 'TokenMaster', omniEarned: 4567, avatar: '👑', tier: 'Ascendant' },
    { rank: 3, name: 'SmartSaver', omniEarned: 3890, avatar: '💎', tier: 'Ascendant' },
    { rank: 4, name: 'AIEnthusiast', omniEarned: 3124, avatar: '🤖', tier: 'Voyager' },
    { rank: 5, name: 'BudgetPro', omniEarned: 2756, avatar: '📊', tier: 'Voyager' },
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-400" />;
      default: return <TrendingUp className="w-6 h-6 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-6">Top Omni Earners</h3>
      <div className="space-y-3">
        {leaderboard.map((user, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="flex items-center gap-3">
              {getRankIcon(user.rank)}
              <span className="text-white/60 text-sm">#{user.rank}</span>
            </div>

            <div className="text-3xl">{user.avatar}</div>

            <div className="flex-1">
              <div className="text-white font-bold">{user.name}</div>
              <div className="text-white/60 text-sm">{user.tier} Tier</div>
            </div>

            <div className="text-right">
              <div className="text-green-400 text-xl font-bold">{user.omniEarned}</div>
              <div className="text-white/60 text-xs">OMNI Earned</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}