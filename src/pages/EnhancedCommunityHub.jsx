import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeminiCopilotAdvisor from '../components/ai/GeminiCopilotAdvisor';
import AdvancedAINotificationSystem from '../components/notifications/AdvancedAINotificationSystem';
import CommunityHub from '../components/community/CommunityHub';

export default function EnhancedCommunityHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Financial Community Hub</h1>
          <p className="text-white/60">
            Powered by Gemini AI • Connect with experts • Learn from community • Real-time notifications
          </p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="copilot" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            <TabsTrigger value="copilot">Gemini Copilot</TabsTrigger>
            <TabsTrigger value="notifications">Smart Notifications</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Gemini Copilot Tab */}
          <TabsContent value="copilot">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-screen"
            >
              <GeminiCopilotAdvisor />
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <AdvancedAINotificationSystem />
            </motion.div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <CommunityHub />
            </motion.div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Slack Integration */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Slack Integration</h3>
                <p className="text-white/60 mb-4">
                  Connect your Slack workspace to receive real-time notifications, sync forum discussions, and stay connected with the community.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-all"
                >
                  Connect Slack Workspace
                </motion.button>
              </div>

              {/* Voice Advisor */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Voice Advisor</h3>
                <p className="text-white/60 mb-4">
                  Have voice conversations with AI financial advisors and book real consultations with certified professionals. Powered by ElevenLabs & Twilio.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-2 bg-purple-500/20 border border-purple-400 rounded-lg text-purple-300 hover:bg-purple-500/30 transition-all"
                >
                  Start Voice Call
                </motion.button>
              </div>

              {/* Zapier Workflows */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Automated Workflows</h3>
                <p className="text-white/60 mb-4">
                  Automate tasks across your financial apps. Sync data, send notifications, and execute actions through Zapier integration.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="px-6 py-2 bg-orange-500/20 border border-orange-400 rounded-lg text-orange-300 hover:bg-orange-500/30 transition-all"
                >
                  Create Workflow
                </motion.button>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">2.5K+</p>
            <p className="text-white/60 text-sm mt-1">Active Community Members</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">150+</p>
            <p className="text-white/60 text-sm mt-1">Expert Advisors</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-400">5K+</p>
            <p className="text-white/60 text-sm mt-1">Forum Discussions</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}