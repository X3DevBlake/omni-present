import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import RealtimeFinancialGalaxy3D from '../components/realtime/RealtimeFinancialGalaxy3D';
import LiveMetricsDashboard from '../components/realtime/LiveMetricsDashboard';
import DynamicAgentActivityGlobe3D from '../components/realtime/DynamicAgentActivityGlobe3D';
import { Zap, TrendingUp, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RealtimeDashboard() {
  const [userEmail, setUserEmail] = React.useState(null);
  const [assets, setAssets] = React.useState([]);
  const [agents, setAgents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  React.useEffect(() => {
    if (!userEmail) return;

    // Simulate real-time updates
    const loadAssets = async () => {
      try {
        const feeds = await base44.entities.LiveDataFeed.filter({ user_email: userEmail }).catch(() => []);
        setAssets(feeds);
      } catch (error) {
        console.log('Loading sample assets');
        setAssets([
          { asset_symbol: 'BTC', current_value: 45000, change_percent: 2.5 },
          { asset_symbol: 'ETH', current_value: 2500, change_percent: -1.2 },
          { asset_symbol: 'AAPL', current_value: 150, change_percent: 1.8 },
          { asset_symbol: 'MSFT', current_value: 320, change_percent: 0.5 },
          { asset_symbol: 'TSLA', current_value: 180, change_percent: -2.1 }
        ]);
      }
      setLoading(false);
    };

    loadAssets();

    // Refresh every 5 seconds
    const interval = setInterval(loadAssets, 5000);
    return () => clearInterval(interval);
  }, [userEmail]);

  React.useEffect(() => {
    if (!userEmail) return;

    // Simulate agent activity
    setAgents([
      { id: 1, name: 'Agent-01', status: 'active', position: [10, 5, 10] },
      { id: 2, name: 'Agent-02', status: 'active', position: [-8, 3, 12] },
      { id: 3, name: 'Agent-03', status: 'idle', position: [5, -8, -10] },
      { id: 4, name: 'Agent-04', status: 'active', position: [-10, -5, 8] },
      { id: 5, name: 'Agent-05', status: 'idle', position: [8, 8, -5] }
    ]);
  }, [userEmail]);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="w-10 h-10 text-cyan-400" />
            Real-Time Intelligence Hub
          </h1>
          <p className="text-white/60">Live market data, alerts, and agent coordination</p>
        </motion.div>

        <Tabs defaultValue="markets" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="markets" className="data-[state=active]:bg-cyan-500/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              Markets
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-cyan-500/20">
              <Zap className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-cyan-500/20">
              <Globe className="w-4 h-4 mr-2" />
              Agents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="markets" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <RealtimeFinancialGalaxy3D assets={assets} loading={loading} />
            </motion.div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              {userEmail ? (
                <LiveMetricsDashboard userEmail={userEmail} />
              ) : (
                <div className="text-center py-12 text-white/40">Please log in</div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6"
            >
              <DynamicAgentActivityGlobe3D agents={agents} loading={loading} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}