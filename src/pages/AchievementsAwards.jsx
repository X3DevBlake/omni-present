import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Zap, Target, Medal } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AchievementsAwards() {
  const achievements = [
    { id: 1, title: 'First Agent Created', description: 'Created your first AI agent', icon: Star, unlocked: true, rarity: 'common' },
    { id: 2, title: 'Blueprint Master', description: 'Designed 10 blueprints', icon: Trophy, unlocked: true, rarity: 'rare' },
    { id: 3, title: 'Community Leader', description: 'Helped 50 students', icon: Award, unlocked: false, rarity: 'epic', progress: 32 },
    { id: 4, title: 'Speed Learner', description: 'Completed 5 courses in 1 month', icon: Zap, unlocked: true, rarity: 'rare' },
    { id: 5, title: 'Perfect Score', description: 'Achieved 100% in any exam', icon: Target, unlocked: false, rarity: 'legendary', progress: 0 },
    { id: 6, title: 'Marathon Learner', description: '100 hours of learning', icon: Medal, unlocked: false, rarity: 'epic', progress: 67 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Achievements & Awards</h1>
          <p className="text-white/60">Track your progress and unlock badges</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Achievements', value: '24', icon: Trophy },
            { label: 'Unlocked', value: '18', icon: Award },
            { label: 'In Progress', value: '6', icon: Zap },
            { label: 'Completion', value: '75%', icon: Target }
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <stat.icon className="w-6 h-6 text-yellow-400 mb-2" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-6 ${
                achievement.unlocked ? 'border-yellow-500/30' : 'border-white/10 opacity-60'
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  achievement.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20' :
                  achievement.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' :
                  achievement.rarity === 'rare' ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' :
                  'bg-gray-500/20'
                }`}>
                  <achievement.icon className={`w-8 h-8 ${
                    achievement.rarity === 'legendary' ? 'text-yellow-400' :
                    achievement.rarity === 'epic' ? 'text-purple-400' :
                    achievement.rarity === 'rare' ? 'text-blue-400' :
                    'text-gray-400'
                  }`} />
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                  achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                  achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {achievement.rarity}
                </div>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{achievement.title}</h3>
              <p className="text-white/60 text-sm mb-4">{achievement.description}</p>
              {!achievement.unlocked && achievement.progress !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">Progress</span>
                    <span className="text-white">{achievement.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              )}
              {achievement.unlocked && (
                <div className="text-green-400 text-sm font-semibold flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Unlocked!
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}