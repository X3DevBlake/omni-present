import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Zap, Target, Medal } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import Achievement3DCard from '../components/gamification/Achievement3DCard';
import BadgeShowcase3D from '../components/gamification/BadgeShowcase3D';
import Leaderboard from '../components/gamification/Leaderboard';
import { useGamification } from '../components/gamification/GamificationContext';

export default function AchievementsAwards() {
  const { userStats } = useGamification();
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  
  const achievements = [
    { id: 'first_agent', name: 'First Agent Created', description: 'Created your first AI agent', color: '#3b82f6', unlocked: true, rarity: 'common', xpReward: 100 },
    { id: 'blueprint_master', name: 'Blueprint Master', description: 'Designed 10 blueprints', color: '#a855f7', unlocked: true, rarity: 'rare', xpReward: 500 },
    { id: 'community_leader', name: 'Community Leader', description: 'Helped 50 students', color: '#ec4899', unlocked: false, rarity: 'epic', progress: 32, xpReward: 1000 },
    { id: 'speed_learner', name: 'Speed Learner', description: 'Completed 5 courses in 1 month', color: '#eab308', unlocked: true, rarity: 'rare', xpReward: 500 },
    { id: 'perfect_score', name: 'Perfect Score', description: 'Achieved 100% in any exam', color: '#f59e0b', unlocked: false, rarity: 'legendary', progress: 0, xpReward: 2000 },
    { id: 'marathon_learner', name: 'Marathon Learner', description: '100 hours of learning', color: '#10b981', unlocked: false, rarity: 'epic', progress: 67, xpReward: 1000 }
  ];

  const badges = userStats.badges.length > 0 ? userStats.badges : [
    { id: 'early_adopter', name: 'Early Adopter', description: 'Joined during beta', color: '#00f5ff', accentColor: '#a855f7', rarity: 'rare', unlockedAt: '2025-12-01' },
    { id: 'community_helper', name: 'Community Helper', description: 'Answered 10 questions', color: '#10b981', accentColor: '#3b82f6', rarity: 'common', unlockedAt: '2026-01-05' }
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

        {/* 3D Achievement Showcase */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">🏆 3D Achievement Gallery</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, i) => (
              <div key={achievement.id} onClick={() => setSelectedAchievement(achievement)}>
                <Achievement3DCard
                  achievement={achievement}
                  isUnlocked={achievement.unlocked}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3D Badge Collection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">🎖️ Badge Collection</h2>
          <BadgeShowcase3D badges={badges} />
        </div>

        {/* Leaderboard */}
        <Leaderboard category="xp" timeframe="all-time" />

        {/* Achievement Detail Modal */}
        {selectedAchievement && (
          <Achievement3DCard
            achievement={selectedAchievement}
            isUnlocked={selectedAchievement.unlocked}
            showModal={true}
            onClose={() => setSelectedAchievement(null)}
          />
        )}
      </div>
    </AuroraBackground>
  );
}