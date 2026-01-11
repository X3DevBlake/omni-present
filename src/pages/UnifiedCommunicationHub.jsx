import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import UnifiedCommunicationBridge from '../components/integrations/UnifiedCommunicationBridge';
import SlackGeminiVoiceSync from '../components/integrations/SlackGeminiVoiceSync';
import TwilioGeminiVoiceCall from '../components/integrations/TwilioGeminiVoiceCall';
import ZapierOrchestrationHub from '../components/integrations/ZapierOrchestrationHub';

export default function UnifiedCommunicationHub() {
  const [selectedTab, setSelectedTab] = useState('bridge');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Unified Communication Hub</h1>
          <p className="text-white/60">
            Gemini • Slack • ElevenLabs • Twilio • Zapier • Copilot Integration
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
            <TabsTrigger value="bridge">Multi-Channel</TabsTrigger>
            <TabsTrigger value="slack">Slack Sync</TabsTrigger>
            <TabsTrigger value="twilio">Twilio Voice</TabsTrigger>
            <TabsTrigger value="zapier">Zapier Workflows</TabsTrigger>
          </TabsList>

          <TabsContent value="bridge" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <UnifiedCommunicationBridge />
            </motion.div>
          </TabsContent>

          <TabsContent value="slack" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <SlackGeminiVoiceSync />
            </motion.div>
          </TabsContent>

          <TabsContent value="twilio" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <TwilioGeminiVoiceCall />
            </motion.div>
          </TabsContent>

          <TabsContent value="zapier" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <ZapierOrchestrationHub />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}