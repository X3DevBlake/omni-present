import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Activity, TrendingUp, Award, Settings, Edit2, Save, X, Bot, Zap, Database } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [stats, setStats] = useState({
    agents: 24,
    blueprints: 12,
    simulations: 156,
    collaborations: 8
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setEditedUser(userData);
    } catch (error) {
      toast.error('Failed to load user data');
    }
  };

  const saveProfile = async () => {
    try {
      await base44.auth.updateMe({
        full_name: editedUser.full_name,
        bio: editedUser.bio,
        company: editedUser.company,
        location: editedUser.location
      });
      setUser(editedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (!user) {
    return (
      <AuroraBackground className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        
        {/* Profile Header */}
        <motion.div 
          className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              {user.full_name?.[0] || user.email[0].toUpperCase()}
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser.full_name || ''}
                  onChange={(e) => setEditedUser({...editedUser, full_name: e.target.value})}
                  className="text-3xl font-bold text-white bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-2 w-full"
                  placeholder="Your Name"
                />
              ) : (
                <h1 className="text-3xl font-bold text-white mb-2">{user.full_name || 'User'}</h1>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded text-xs capitalize">
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user.created_date).toLocaleDateString()}
                </div>
              </div>

              {isEditing && (
                <textarea
                  value={editedUser.bio || ''}
                  onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
              )}
              {!isEditing && editedUser.bio && (
                <p className="text-white/70">{editedUser.bio}</p>
              )}
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button onClick={saveProfile} className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-300 rounded-xl hover:bg-green-500/30">
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditedUser(user); }} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl hover:bg-red-500/30">
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-xl hover:bg-cyan-500/30">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-cyan-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.agents}</div>
            <div className="text-white/60 text-sm">AI Agents Created</div>
          </motion.div>

          <motion.div 
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.blueprints}</div>
            <div className="text-white/60 text-sm">Blueprints Built</div>
          </motion.div>

          <motion.div 
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.simulations}</div>
            <div className="text-white/60 text-sm">Simulations Run</div>
          </motion.div>

          <motion.div 
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-green-400" />
              </div>
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.collaborations}</div>
            <div className="text-white/60 text-sm">Collaborations</div>
          </motion.div>
        </div>

        {/* Activity & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Activity */}
          <motion.div 
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {[
                { action: 'Created agent "Explorer Bot"', time: '2 hours ago', icon: Bot, color: 'cyan' },
                { action: 'Ran simulation "Park Walk"', time: '5 hours ago', icon: Zap, color: 'orange' },
                { action: 'Shared blueprint "ML Training"', time: '1 day ago', icon: Database, color: 'purple' },
                { action: 'Collaborated on "AI Society"', time: '2 days ago', icon: Award, color: 'green' }
              ].map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                    <div className={`w-10 h-10 rounded-lg bg-${activity.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 text-${activity.color}-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm">{activity.action}</div>
                      <div className="text-white/50 text-xs">{activity.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div 
            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Achievements
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: '🏆', title: 'First Agent', unlocked: true },
                { icon: '🎯', title: '10 Agents', unlocked: true },
                { icon: '🚀', title: '25 Agents', unlocked: false },
                { icon: '💡', title: 'First Blueprint', unlocked: true },
                { icon: '⚡', title: '100 Simulations', unlocked: true },
                { icon: '🌟', title: 'Collaborator', unlocked: true }
              ].map((achievement, i) => (
                <div key={i} className={`aspect-square rounded-xl p-4 flex flex-col items-center justify-center text-center ${achievement.unlocked ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/40' : 'bg-white/5 border border-white/10 opacity-50'}`}>
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <div className="text-white text-xs font-medium">{achievement.title}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  );
}