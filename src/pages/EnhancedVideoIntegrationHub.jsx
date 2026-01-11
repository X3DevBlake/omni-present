import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import LiveVideoFeedConsole from '../components/video/LiveVideoFeedConsole';
import GoogleCalendarIntegration from '../components/video/GoogleCalendarIntegration';
import VideoMemoryStorage from '../components/video/VideoMemoryStorage';

export default function EnhancedVideoIntegrationHub() {
  const [selectedTab, setSelectedTab] = useState('live');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Enhanced Video Integration</h1>
          <p className="text-white/60">
            Live feeds with Gemini analysis • Google Calendar scheduling • Video memory storage • Zapier automation
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
            <TabsTrigger value="live">Live Video Feed</TabsTrigger>
            <TabsTrigger value="calendar">Schedule Calls</TabsTrigger>
            <TabsTrigger value="storage">Video Memory</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <LiveVideoFeedConsole />
            </motion.div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <GoogleCalendarIntegration />
            </motion.div>
          </TabsContent>

          <TabsContent value="storage" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <VideoMemoryStorage />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}