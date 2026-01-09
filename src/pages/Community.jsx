import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, MessageCircle, TrendingUp, Award, Star, ThumbsUp, Share2 } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Community() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    // Mock data - replace with real data
    setLeaderboard([
      { rank: 1, name: 'Dr. Neural', score: 9850, avatar: '🧠', specialty: 'Evolution Systems' },
      { rank: 2, name: 'Agent Master', score: 8920, avatar: '🤖', specialty: 'Multi-Agent Coordination' },
      { rank: 3, name: 'Sim Queen', score: 7650, avatar: '👑', specialty: 'Society Simulation' },
      { rank: 4, name: 'Code Sage', score: 6830, avatar: '🧙', specialty: 'Behavior Patterns' },
      { rank: 5, name: 'AI Architect', score: 5940, avatar: '🏗️', specialty: 'Blueprint Design' }
    ]);

    setDiscussions([
      { id: 1, title: 'Best practices for agent evolution?', author: 'Dr. Neural', replies: 24, likes: 48, category: 'Evolution' },
      { id: 2, title: 'How to handle faction conflicts efficiently', author: 'Agent Master', replies: 18, likes: 36, category: 'Society' },
      { id: 3, title: 'Optimizing resource economy algorithms', author: 'Code Sage', replies: 31, likes: 62, category: 'Economy' }
    ]);

    setAchievements([
      { id: 1, name: 'First Agent', description: 'Created your first AI agent', icon: '🤖', unlocked: true },
      { id: 2, name: 'Society Builder', description: 'Simulated a society of 50+ agents', icon: '🏛️', unlocked: true },
      { id: 3, name: 'Master Mentor', description: 'Established 10 mentorship relationships', icon: '🎓', unlocked: false },
      { id: 4, name: 'Economic Guru', description: 'Achieved stable economy for 100+ cycles', icon: '💰', unlocked: false }
    ]);
  };

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Community <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Hub</span>
          </h1>
          <p className="text-white/60 text-lg">Connect, compete, and collaborate with AI builders worldwide</p>
        </motion.div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {['leaderboard', 'discussions', 'achievements', 'showcase'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {leaderboard.map((user, i) => (
              <div
                key={user.rank}
                className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-6 ${
                  i < 3 ? 'border-yellow-500/50' : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                    i === 0 ? 'bg-yellow-500/20 border border-yellow-500/40' :
                    i === 1 ? 'bg-gray-400/20 border border-gray-400/40' :
                    i === 2 ? 'bg-orange-500/20 border border-orange-500/40' :
                    'bg-white/5 border border-white/10'
                  }`}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-bold text-xl">{user.name}</h3>
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-full text-xs">
                        {user.specialty}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-cyan-400 flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {user.score} pts
                      </span>
                      <span className="text-white/60">Rank #{user.rank}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'discussions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {discussions.map(discussion => (
              <div key={discussion.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-semibold text-lg">{discussion.title}</h3>
                  <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-full text-xs">
                    {discussion.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span>by {discussion.author}</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {discussion.replies}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {discussion.likes}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            {achievements.map(achievement => (
              <div
                key={achievement.id}
                className={`bg-black/40 backdrop-blur-xl border rounded-2xl p-6 ${
                  achievement.unlocked ? 'border-yellow-500/50' : 'border-white/10 opacity-60'
                }`}
              >
                <div className="text-5xl mb-3">{achievement.icon}</div>
                <h3 className="text-white font-bold mb-2">{achievement.name}</h3>
                <p className="text-white/60 text-sm">{achievement.description}</p>
                {achievement.unlocked && (
                  <div className="mt-3 px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded-full text-xs inline-block">
                    Unlocked
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </AuroraBackground>
  );
}