import React from 'react';
import { motion } from 'framer-motion';
import { usePageTransition } from '@/components/hooks/usePageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuroraBackground from '@/components/omni/AuroraBackground';
import SharedWorkspace from '@/components/collaboration/SharedWorkspace';
import AgentMarketplaceEnhanced from '@/components/marketplace/AgentMarketplaceEnhanced';
import AdaptiveChallenges from '@/components/gamification/AdaptiveChallenges';

export default function CommunityHub() {
  usePageTransition();

  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Community Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Collaborate, share, and grow with your community
          </p>
        </motion.div>

        <Tabs defaultValue="workspaces" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="workspaces">Shared Workspaces</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="workspaces">
            <SharedWorkspace />
          </TabsContent>

          <TabsContent value="marketplace">
            <AgentMarketplaceEnhanced />
          </TabsContent>

          <TabsContent value="challenges">
            <AdaptiveChallenges />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}