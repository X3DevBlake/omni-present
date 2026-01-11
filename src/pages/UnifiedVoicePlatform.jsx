import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import UnifiedGeminiVoiceHub from '../components/ai/UnifiedGeminiVoiceHub';
import UnifiedPlatformBridge from '../components/integrations/UnifiedPlatformBridge';

export default function UnifiedVoicePlatform() {
  const [selectedTab, setSelectedTab] = useState('copilot');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Unified Voice Platform</h1>
          <p className="text-white/60">
            Gemini Copilot • Voice Consultations • Slack Integration • Google Drive • Expert Booking
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
            <TabsTrigger value="copilot">Voice Hub</TabsTrigger>
            <TabsTrigger value="integrations">Platform Bridge</TabsTrigger>
          </TabsList>

          <TabsContent value="copilot" className="space-y-6">
            <UnifiedGeminiVoiceHub />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <UnifiedPlatformBridge />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}