import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Target, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function GamificationSection({ userEmail }) {
  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', userEmail],
    queryFn: () => base44.entities.OmniAchievement.filter({ created_by: userEmail }).catch(() => []),
    enabled: !!userEmail
  });

  const stats = [
    { label: 'Total XP', value: '2,450', icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { label: 'Achievements', value: achievements.length, icon: Trophy, color: 'from-purple-500 to-pink-500' },
    { label: 'Streak Days', value: '12', icon: Target, color: 'from-green-500 to-cyan-500' },
    { label: 'Rank', value: 'Gold III', icon: Award, color: 'from-amber-500 to-yellow-500' }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            Your <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Achievement</span> Hub
          </h2>
          <p className="text-white/60">Track progress and unlock exclusive rewards</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 border border-white/10 hover:border-white/20 transition-all`}
              >
                <Icon className={`w-8 h-8 mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Recent Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.slice(0, 3).map((achievement, idx) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-4 rounded-xl bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30"
                >
                  <div className="text-4xl mb-2">{achievement.badge || '🏆'}</div>
                  <h4 className="text-white font-bold">{achievement.title}</h4>
                  <p className="text-white/60 text-sm mt-1">{achievement.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}