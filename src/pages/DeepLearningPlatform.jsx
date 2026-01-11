import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, BookOpen, Trophy, Zap } from 'lucide-react';

import GeminiVoiceConsultationPlatform from '../components/ai/GeminiVoiceConsultationPlatform';
import SlackVoiceIntegration from '../components/integrations/SlackVoiceIntegration';
import DynamicLearningPathWithAnomalies from '../components/education/DynamicLearningPathWithAnomalies';
import LearningLeaderboard from '../components/education/LearningLeaderboard';
import ZapierAssignmentWorkflow from '../components/education/ZapierAssignmentWorkflow';

export default function DeepLearningPlatform() {
  const [selectedTab, setSelectedTab] = useState('voice');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Deep Learning Platform</h1>
          <p className="text-white/60">Voice consultations • Dynamic learning • Gamified mastery</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Voice Consultant
            </TabsTrigger>
            <TabsTrigger value="slack" className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> Slack Voice
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Learning Path
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" /> Leaderboard
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              ✍️ Assignments
            </TabsTrigger>
          </TabsList>

          <AnimatePresence>
            {/* Voice Consultation */}
            {selectedTab === 'voice' && (
              <motion.div
                key="voice"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <GeminiVoiceConsultationPlatform />
              </motion.div>
            )}

            {/* Slack Voice */}
            {selectedTab === 'slack' && (
              <motion.div
                key="slack"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <SlackVoiceIntegration />
              </motion.div>
            )}

            {/* Learning Path */}
            {selectedTab === 'learning' && (
              <motion.div
                key="learning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <DynamicLearningPathWithAnomalies />
              </motion.div>
            )}

            {/* Leaderboard */}
            {selectedTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <LearningLeaderboard />
              </motion.div>
            )}

            {/* Assignments */}
            {selectedTab === 'assignments' && (
              <motion.div
                key="assignments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6"
              >
                <ZapierAssignmentWorkflow />
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}