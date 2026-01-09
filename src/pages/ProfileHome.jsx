import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Image as ImageIcon, Camera, Settings, Bell, Activity, Key, Webhook, Shield, FileText, CreditCard, Award } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import XPProgressBar from '../components/gamification/XPProgressBar';
import StreakTracker from '../components/gamification/StreakTracker';
import { useGamification } from '../components/gamification/GamificationContext';
import RecommendationEngine from '../components/recommendations/RecommendationEngine';

export default function ProfileHome() {
  const [profileImage, setProfileImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const { userStats } = useGamification();
  
  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingProfile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProfileImage(file_url);
      await base44.auth.updateMe({ profile_image: file_url });
      toast.success('Profile image updated!');
    } catch (error) {
      toast.error('Failed to upload profile image');
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleBannerImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setBannerImage(file_url);
      await base44.auth.updateMe({ banner_image: file_url });
      toast.success('Banner image updated!');
    } catch (error) {
      toast.error('Failed to upload banner image');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Banner Section */}
        <motion.div
          className="relative h-64 rounded-2xl overflow-hidden mb-8 group cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => bannerInputRef.current?.click()}
        >
          {bannerImage ? (
            <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10" />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <div className="font-semibold">
                {isUploadingBanner ? 'Uploading...' : 'Change Banner'}
              </div>
            </div>
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerImageUpload}
            className="hidden"
          />
        </motion.div>

        {/* Profile Image & Info */}
        <motion.div
          className="relative -mt-32 mb-8 flex items-end gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="relative w-40 h-40 rounded-2xl border-4 border-black/40 backdrop-blur-xl overflow-hidden group cursor-pointer"
            onClick={() => profileInputRef.current?.click()}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <User className="w-16 h-16 text-white/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <Camera className="w-8 h-8 mx-auto mb-1" />
                <div className="text-sm font-semibold">
                  {isUploadingProfile ? 'Uploading...' : 'Change Photo'}
                </div>
              </div>
            </div>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
          </div>
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-white mb-2">Your Profile</h1>
            <p className="text-white/60">Manage your account settings and preferences</p>
          </div>
        </motion.div>

        {/* Gamification Stats */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <XPProgressBar currentXP={userStats.xp} level={userStats.level} />
          </div>
          <StreakTracker streak={userStats.streak} maxStreak={userStats.streak + 5} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Notifications', value: '12', icon: Bell, color: 'blue' },
            { label: 'Activity', value: '156', icon: Activity, color: 'purple' },
            { label: 'API Keys', value: '3', icon: Key, color: 'cyan' },
            { label: 'Achievements', value: userStats.achievements.length || '24', icon: Award, color: 'yellow' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <stat.icon className={`w-6 h-6 text-${stat.color}-400 mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* AI Recommendations */}
        <div className="mb-8">
          <RecommendationEngine userProfile={userStats} context="profile" />
        </div>

        {/* Main Navigation Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Account Settings',
              description: 'Update your personal information',
              icon: Settings,
              page: 'Settings',
              gradient: 'from-blue-500/20 to-cyan-500/20',
              border: 'border-blue-500/30'
            },
            {
              title: 'Billing & Subscription',
              description: 'Manage payments and plans',
              icon: CreditCard,
              page: 'Billing',
              gradient: 'from-green-500/20 to-emerald-500/20',
              border: 'border-green-500/30'
            },
            {
              title: 'Notifications',
              description: 'Configure alerts and updates',
              icon: Bell,
              page: 'Notifications',
              gradient: 'from-purple-500/20 to-pink-500/20',
              border: 'border-purple-500/30'
            },
            {
              title: 'Activity Log',
              description: 'View your recent actions',
              icon: Activity,
              page: 'ActivityLog',
              gradient: 'from-orange-500/20 to-red-500/20',
              border: 'border-orange-500/30'
            },
            {
              title: 'API Keys',
              description: 'Manage API access tokens',
              icon: Key,
              page: 'APIKeys',
              gradient: 'from-cyan-500/20 to-blue-500/20',
              border: 'border-cyan-500/30'
            },
            {
              title: 'Webhooks',
              description: 'Configure event notifications',
              icon: Webhook,
              page: 'Webhooks',
              gradient: 'from-indigo-500/20 to-purple-500/20',
              border: 'border-indigo-500/30'
            },
            {
              title: 'Security',
              description: 'Password and 2FA settings',
              icon: Shield,
              page: 'Security',
              gradient: 'from-red-500/20 to-pink-500/20',
              border: 'border-red-500/30'
            },
            {
              title: 'Privacy Policy',
              description: 'Review our privacy terms',
              icon: FileText,
              page: 'Privacy',
              gradient: 'from-gray-500/20 to-slate-500/20',
              border: 'border-gray-500/30'
            },
            {
              title: 'Terms & Compliance',
              description: 'Legal agreements and policies',
              icon: FileText,
              page: 'Terms',
              gradient: 'from-teal-500/20 to-cyan-500/20',
              border: 'border-teal-500/30'
            }
          ].map((item, i) => (
            <Link key={i} to={createPageUrl(item.page)}>
              <motion.div
                className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
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
      </div>
    </AuroraBackground>
  );
}