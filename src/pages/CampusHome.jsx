import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Award, Users, TrendingUp, Video, MessageCircle, Calendar, Star, Target, Zap, Trophy } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import DailyChallenges from '../components/challenges/DailyChallenges';
import Leaderboard from '../components/gamification/Leaderboard';
import Interactive3DBanner from '../components/3d/Interactive3DBanner';

export default function CampusHome() {
  const [userStats] = useState({
    level: 7,
    xp: 3450,
    nextLevelXp: 5000,
    coursesCompleted: 12,
    certificationsEarned: 3,
    studyStreak: 14,
    rank: 'Advanced Learner'
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* 3D Hero Banner */}
        <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Interactive3DBanner
            title="Learning Campus"
            subtitle="Master the future of AI technology"
            color="#3b82f6"
            height="400px"
          />
        </motion.div>

        {/* User Progress Card */}
        <motion.div
          className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-xl">Level {userStats.level} - {userStats.rank}</h3>
              <p className="text-blue-400">🔥 {userStats.studyStreak} day streak</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{userStats.xp} XP</div>
              <div className="text-white/60 text-sm">{userStats.nextLevelXp - userStats.xp} to next level</div>
            </div>
          </div>
          <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{userStats.coursesCompleted}</div>
              <div className="text-white/60 text-xs">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{userStats.certificationsEarned}</div>
              <div className="text-white/60 text-xs">Certifications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">A+</div>
              <div className="text-white/60 text-xs">Avg Grade</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Students', value: '15.2K', icon: Users, color: 'blue' },
            { label: 'Live Sessions', value: '42', icon: Video, color: 'purple' },
            { label: 'Study Groups', value: '156', icon: MessageCircle, color: 'pink' },
            { label: 'Achievements', value: '89', icon: Trophy, color: 'yellow' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <stat.icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Daily Challenges */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <DailyChallenges />
          </div>
          <div className="space-y-4">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-bold mb-2">Your Rank</h3>
              <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
                #{Math.floor(Math.random() * 100) + 1}
              </div>
              <div className="text-white/60 text-sm">Global Leaderboard</div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mb-8">
          <Leaderboard category="xp" timeframe="all-time" />
        </div>

        {/* Main Navigation Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Curriculum & Courses',
              description: 'Browse comprehensive AI and robotics courses',
              icon: BookOpen,
              page: 'CurriculumCourses',
              gradient: 'from-blue-500/20 to-cyan-500/20',
              border: 'border-blue-500/30'
            },
            {
              title: 'Certifications',
              description: 'Earn industry-recognized credentials',
              icon: Award,
              page: 'Certifications',
              gradient: 'from-purple-500/20 to-pink-500/20',
              border: 'border-purple-500/30'
            },
            {
              title: 'Achievements & Awards',
              description: 'Track your progress and unlock badges',
              icon: Trophy,
              page: 'AchievementsAwards',
              gradient: 'from-yellow-500/20 to-orange-500/20',
              border: 'border-yellow-500/30'
            },
            {
              title: 'Student Lounge',
              description: 'Connect with peers in chat rooms',
              icon: MessageCircle,
              page: 'StudentLounge',
              gradient: 'from-green-500/20 to-emerald-500/20',
              border: 'border-green-500/30'
            },
            {
              title: 'Resource Library',
              description: 'Access textbooks, videos, and tutorials',
              icon: BookOpen,
              page: 'ResourceLibrary',
              gradient: 'from-indigo-500/20 to-blue-500/20',
              border: 'border-indigo-500/30'
            },
            {
              title: 'Mentorship Programs',
              description: 'Learn from industry experts',
              icon: Users,
              page: 'MentorshipPrograms',
              gradient: 'from-pink-500/20 to-red-500/20',
              border: 'border-pink-500/30'
            },
            {
              title: 'Discounts & Rebates',
              description: 'Student pricing on devices and services',
              icon: Star,
              page: 'DiscountsRebates',
              gradient: 'from-orange-500/20 to-yellow-500/20',
              border: 'border-orange-500/30'
            },
            {
              title: 'Study Groups',
              description: 'Collaborate with fellow learners',
              icon: Users,
              page: 'StudyGroups',
              gradient: 'from-teal-500/20 to-cyan-500/20',
              border: 'border-teal-500/30'
            },
            {
              title: 'Virtual Classrooms',
              description: 'Join live interactive sessions',
              icon: Video,
              page: 'VirtualClassrooms',
              gradient: 'from-red-500/20 to-pink-500/20',
              border: 'border-red-500/30'
            }
          ].map((item, i) => (
            <Link key={i} to={createPageUrl(item.page)}>
              <motion.div
                className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Subscription Offer */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white mb-2">Campus Premium Subscription</h3>
          <p className="text-white/60 mb-4">Unlock unlimited courses, priority mentorship, and exclusive device discounts</p>
          <div className="text-4xl font-bold text-white mb-4">
            $29.99<span className="text-lg text-white/60">/month</span>
          </div>
          <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90">
            Start Free Trial
          </button>
          <p className="text-white/40 text-sm mt-3">7-day free trial • Cancel anytime</p>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}