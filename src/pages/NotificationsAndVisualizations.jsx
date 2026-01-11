import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import IntelligentNotificationCenter from '../components/notifications/IntelligentNotificationCenter';
import NotificationPreferencesPanel from '../components/notifications/NotificationPreferencesPanel';
import CryptoMarketTrends3D from '../components/3d/CryptoMarketTrends3D';
import DeFiLiquidityPool3D from '../components/3d/DeFiLiquidityPool3D';
import OmniTokenEcosystem3D from '../components/3d/OmniTokenEcosystem3D';

export default function NotificationsAndVisualizations() {
  const [selectedTab, setSelectedTab] = useState('notifications');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Notifications & 3D Visualizations</h1>
          <p className="text-white/60">
            Intelligent routing • Custom preferences • Interactive 3D dashboards • Voice explanations
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20 p-1 rounded-lg w-full justify-start flex-wrap">
            <TabsTrigger value="notifications">Notification Center</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="crypto">Crypto Trends</TabsTrigger>
            <TabsTrigger value="defi">DeFi Pools</TabsTrigger>
            <TabsTrigger value="omni">Omni Ecosystem</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <IntelligentNotificationCenter />
            </motion.div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <NotificationPreferencesPanel />
            </motion.div>
          </TabsContent>

          <TabsContent value="crypto" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <CryptoMarketTrends3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="defi" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <DeFiLiquidityPool3D />
            </motion.div>
          </TabsContent>

          <TabsContent value="omni" className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-6"
            >
              <OmniTokenEcosystem3D />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}