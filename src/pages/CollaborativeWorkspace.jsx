import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CollaborativeVisualizationSharing from '../components/collaboration/CollaborativeVisualizationSharing';
import VirtualConsultationRoom from '../components/collaboration/VirtualConsultationRoom';

export default function CollaborativeWorkspace() {
  const [selectedTab, setSelectedTab] = useState('sharing');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Collaborative Workspace</h1>
          <p className="text-white/60">
            Share visualizations • Virtual consultation rooms • Real-time Gemini analysis • Expert collaboration
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start">
            <TabsTrigger value="sharing">Share Visualizations</TabsTrigger>
            <TabsTrigger value="consultation">Virtual Consultation Room</TabsTrigger>
          </TabsList>

          <TabsContent value="sharing" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <CollaborativeVisualizationSharing />
            </motion.div>
          </TabsContent>

          <TabsContent value="consultation" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6 h-[calc(100vh-200px)]"
            >
              <VirtualConsultationRoom />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}