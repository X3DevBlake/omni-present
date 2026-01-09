import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function OmniAchievements() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const mockAchievements = [
      {
        achievement_id: 'first_stake',
        name: 'Stake Holder',
        description: 'Stake your first Omni tokens',
        icon: '🔒',
        category: 'staking',
        requirement: 1,
        reward_omni: 10,
        rarity: 'common',
        unlocked: true
      },
      {
        achievement_id: 'whale',
        name: 'Omni Whale',
        description: 'Hold 10,000+ Omni tokens',
        icon: '🐋',
        category: 'trading',
        requirement: 10000,
        reward_omni: 100,
        rarity: 'legendary',
        unlocked: false
      },
      {
        achievement_id: 'agent_master',
        name: 'Agent Master',
        description: 'Own 5+ AI agents',
        icon: '🤖',
        category: 'agent',
        requirement: 5,
        reward_omni: 50,
        rarity: 'epic',
        unlocked: false
      },
      {
        achievement_id: 'budget_pro',
        name: 'Budget Pro',
        description: 'Stay under budget for 30 days',
        icon: '💰',
        category: 'savings',
        requirement: 30,
        reward_omni: 25,
        rarity: 'rare',
        unlocked: true
      },
    ];
    setAchievements(mockAchievements);
  };

  const rarityColors = {
    common: 'from-gray-500 to-slate-500',
    rare: 'from-blue-500 to-cyan-500',
    epic: 'from-purple-500 to-pink-500',
    legendary: 'from-yellow-500 to-orange-500',
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Omni <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Achievements</span>
          </h1>
          <p className="text-white/60 text-lg">Unlock rewards as you use Omni</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, i) => (
            <motion.div
              key={achievement.achievement_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-6 ${
                achievement.unlocked
                  ? `border-transparent bg-gradient-to-br ${rarityColors[achievement.rarity]}`
                  : 'border-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{achievement.unlocked ? achievement.icon : '🔒'}</div>
                {achievement.unlocked && (
                  <Trophy className="w-6 h-6 text-yellow-400" />
                )}
              </div>

              <h3 className="text-white font-bold text-xl mb-2">{achievement.name}</h3>
              <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-white/90' : 'text-white/60'}`}>
                {achievement.description}
              </p>

              <div className="flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  achievement.unlocked
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-white/60'
                }`}>
                  {achievement.rarity.toUpperCase()}
                </div>
                <div className={`flex items-center gap-1 ${achievement.unlocked ? 'text-yellow-300' : 'text-white/60'}`}>
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-bold">+{achievement.reward_omni} OMNI</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}