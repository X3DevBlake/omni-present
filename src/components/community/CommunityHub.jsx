import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, TrendingUp, Award, BookOpen, Calendar, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState('forum');
  const [forumPosts, setForumPosts] = useState([
    {
      id: 1,
      author: 'Sarah Chen',
      avatar: '👩‍💼',
      title: 'Best strategies for tax-loss harvesting in 2026',
      category: 'Strategy',
      replies: 24,
      views: 1200,
      upvotes: 150,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 2,
      author: 'Mike Johnson',
      avatar: '👨‍💻',
      title: 'How to set up automated portfolio rebalancing?',
      category: 'Technical',
      replies: 18,
      views: 890,
      upvotes: 120,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Alexandra Park', points: 4850, level: 'Master', badges: 12 },
    { rank: 2, name: 'David Williams', points: 4620, level: 'Expert', badges: 10 },
    { rank: 3, name: 'Emma Thompson', points: 4410, level: 'Expert', badges: 9 },
    { rank: 4, name: 'James Robert', points: 4200, level: 'Scholar', badges: 8 },
    { rank: 5, name: 'Lisa Anderson', points: 3950, level: 'Scholar', badges: 7 },
  ]);

  const [experts] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Mitchell',
      title: 'CFP®, Tax Strategist',
      rating: 4.9,
      reviews: 142,
      hourlyRate: 200,
      availability: 'Available Today',
      specialties: ['Tax Planning', 'Portfolio Optimization'],
      image: '👩‍🏫',
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'Investment Advisor',
      rating: 4.8,
      reviews: 98,
      hourlyRate: 180,
      availability: 'Available in 2 hours',
      specialties: ['Asset Allocation', 'Risk Management'],
      image: '👨‍💼',
    },
  ]);

  const [expertContent] = useState([
    {
      id: 1,
      type: 'article',
      title: 'The Ultimate Guide to Index Fund Investing',
      author: 'Prof. Jack Bogle Foundation',
      reads: 3400,
      rating: 4.7,
    },
    {
      id: 2,
      type: 'video',
      title: 'Behavioral Finance: Emotions & Money',
      author: 'Dr. Daniel Kahneman',
      views: 5200,
      rating: 4.9,
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: 'forum', label: 'Forum', icon: MessageSquare },
          { id: 'leaderboard', label: 'Leaderboard', icon: Award },
          { id: 'experts', label: 'Expert Advisors', icon: Users },
          { id: 'content', label: 'Curated Content', icon: BookOpen },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Forum */}
      <AnimatePresence>
        {activeTab === 'forum' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Community Forum</h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30"
              >
                + New Discussion
              </motion.button>
            </div>

            <div className="space-y-3">
              {forumPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{post.avatar}</span>
                      <div>
                        <p className="text-white font-semibold text-sm">{post.author}</p>
                        <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-white/60 text-xs">
                      {post.timestamp.toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-white font-bold mb-3">{post.title}</h4>

                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {post.replies} replies
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {post.upvotes} upvotes
                    </div>
                    <div>{post.views} views</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Global Leaderboard</h3>

            <div className="space-y-2">
              {leaderboard.map((user, idx) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                      idx === 1 ? 'bg-gray-500/20 text-gray-300' :
                      idx === 2 ? 'bg-orange-500/20 text-orange-300' :
                      'bg-white/10 text-white/80'
                    }`}>
                      {user.rank}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{user.name}</p>
                      <p className="text-white/60 text-sm">{user.level}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-cyan-400 font-bold">{user.points.toLocaleString()}</p>
                      <p className="text-white/60 text-xs">points</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(user.badges)].map((_, i) => (
                        <span key={i} className="text-lg">⭐</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Expert Advisors */}
        {activeTab === 'experts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Certified Financial Advisors</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {experts.map((expert, idx) => (
                <motion.div
                  key={expert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">{expert.image}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold">{expert.name}</p>
                      <p className="text-white/60 text-sm">{expert.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-semibold">{expert.rating}</span>
                        <span className="text-white/60 text-sm">({expert.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-cyan-400 font-bold">${expert.hourlyRate}/hour</p>
                    <p className="text-white/60 text-sm">{expert.availability}</p>
                    <div className="flex flex-wrap gap-1">
                      {expert.specialties.map((specialty, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="w-full px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all"
                  >
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Schedule Consultation
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Curated Content */}
        {activeTab === 'content' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-bold text-white">Curated Expert Content</h3>

            <div className="space-y-3">
              {expertContent.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded uppercase">
                          {item.type}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400 text-sm">
                          <Star className="w-4 h-4" />
                          {item.rating}
                        </span>
                      </div>
                      <h4 className="text-white font-bold mb-1">{item.title}</h4>
                      <p className="text-white/60 text-sm">by {item.author}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}