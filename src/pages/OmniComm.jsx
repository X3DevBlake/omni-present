import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Video, Phone, Mail, Share2, Bell, Lock } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { usePersonalization } from '../components/personalization/PersonalizationContext';

export default function OmniComm() {
  const { trackPageVisit } = usePersonalization();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    trackPageVisit('OmniComm');
  }, []);

  return (
    <>
      <EnhancedHubNav currentHub="OmniComm" />
      <AuroraBackground className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center mb-12"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-full">
              <span className="text-pink-400 text-sm font-semibold">💬 Omni Communications</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Omni
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent"> Comm</span>
            </h1>
            <p className="text-white/60 text-lg">Unified communication hub for teams and agents</p>
          </motion.div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {['overview', 'messaging', 'collaboration', 'security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-pink-500/30 border border-pink-500/50 text-white'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Team Messaging', description: 'Real-time chat with teams and agents', icon: MessageSquare, gradient: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30' },
                { title: 'Video Conferencing', description: 'High-quality video calls and meetings', icon: Video, gradient: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
                { title: 'Voice Calls', description: 'Crystal clear audio communication', icon: Phone, gradient: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30' },
                { title: 'Email Integration', description: 'Unified email and messaging', icon: Mail, gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30' },
                { title: 'Content Sharing', description: 'Share files, documents, and media', icon: Share2, gradient: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30' },
                { title: 'Notifications', description: 'Smart alerts and updates', icon: Bell, gradient: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-6 group hover:scale-105 transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Messaging */}
          {activeTab === 'messaging' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6"
            >
              <h3 className="text-white font-bold text-xl mb-4">Team Messaging</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-semibold mb-3">Channels</h4>
                  {['#general', '#development', '#trading', '#research', '#devices'].map((ch, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                      <MessageSquare className="w-4 h-4 text-pink-400" />
                      <span className="text-white text-sm">{ch}</span>
                      <span className="ml-auto text-xs px-2 py-1 bg-pink-500/20 rounded text-pink-400">3</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-white font-semibold mb-3">Direct Messages</h4>
                  {['Alice Agent', 'Bob Trader', 'System Monitor', 'Analytics Bot'].map((name, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                      <div className="flex-1">
                        <div className="text-white text-sm font-semibold">{name}</div>
                        <div className="text-white/40 text-xs">Online</div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Collaboration */}
          {activeTab === 'collaboration' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6"
            >
              <h3 className="text-white font-bold text-xl mb-6">Collaboration Tools</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-semibold">Team Workspaces</h4>
                  </div>
                  <p className="text-white/60 text-sm mb-3">Shared spaces for team collaboration and project management</p>
                  <button className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-400 text-sm font-semibold transition-colors">
                    Create Workspace
                  </button>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Video className="w-5 h-5 text-cyan-400" />
                    <h4 className="text-white font-semibold">Virtual Meetings</h4>
                  </div>
                  <p className="text-white/60 text-sm mb-3">Schedule and host video meetings with screensharing</p>
                  <button className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm font-semibold transition-colors">
                    Schedule Meeting
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6"
            >
              <h3 className="text-white font-bold text-xl mb-6">Security & Privacy</h3>
              <div className="space-y-4">
                {[
                  { title: 'End-to-End Encryption', description: 'All messages encrypted with military-grade algorithms' },
                  { title: 'Two-Factor Authentication', description: 'Secure your account with 2FA' },
                  { title: 'Role-Based Access', description: 'Control who can access channels and conversations' },
                  { title: 'Message Retention', description: 'Customize data retention policies' },
                  { title: 'Audit Logs', description: 'Track all communication and system activities' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-white/60 text-xs">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </AuroraBackground>
    </>
  );
}