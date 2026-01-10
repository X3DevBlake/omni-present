import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, TrendingUp, Users, Lock, Unlock } from 'lucide-react';

export default function DecentralizedReputationSystem() {
  const reputationScore = 847;
  const tier = 'Diamond';
  
  const achievements = [
    { name: 'Early Adopter', points: 100, unlocked: true },
    { name: 'Governance Guru', points: 150, unlocked: true },
    { name: 'DeFi Expert', points: 200, unlocked: true },
    { name: 'Community Leader', points: 250, unlocked: false }
  ];

  const unlockedFeatures = [
    { name: 'Premium Pools Access', tier: 'Gold', unlocked: true },
    { name: 'Governance Weight x2', tier: 'Diamond', unlocked: true },
    { name: 'Exclusive Airdrops', tier: 'Diamond', unlocked: true },
    { name: 'Private Alpha Group', tier: 'Platinum', unlocked: false }
  ];

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <Award className="w-6 h-6 text-yellow-400" />
        Decentralized Reputation System
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 mb-4 text-center">
            <div className="text-yellow-400 text-sm mb-2">Your Reputation Score</div>
            <div className="text-white font-bold text-5xl mb-2">{reputationScore}</div>
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-bold">{tier} Tier</span>
            </div>
          </div>

          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" />
            Achievements
          </h4>
          <div className="space-y-2">
            {achievements.map((achievement, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className={`rounded-lg p-3 border ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30'
                    : 'bg-black/40 border-white/10 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {achievement.unlocked ? (
                      <Unlock className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-white/40" />
                    )}
                    <span className="text-white font-medium text-sm">{achievement.name}</span>
                  </div>
                  <div className="text-purple-400 font-bold text-sm">+{achievement.points}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Unlocked Features
          </h4>
          <div className="space-y-3">
            {unlockedFeatures.map((feature, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 border ${
                  feature.unlocked
                    ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30'
                    : 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-bold text-sm">{feature.name}</div>
                  {feature.unlocked ? (
                    <Unlock className="w-5 h-5 text-green-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className={`text-xs px-2 py-1 rounded ${
                    feature.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                    feature.tier === 'Diamond' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {feature.tier} Required
                  </div>
                  <div className={`text-xs font-bold ${feature.unlocked ? 'text-green-400' : 'text-red-400'}`}>
                    {feature.unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <div className="text-white font-bold">Next Milestone</div>
            </div>
            <div className="text-white/60 text-sm mb-2">Platinum Tier at 1,000 points</div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                style={{ width: `${(reputationScore / 1000) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}