import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Users, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import UnifiedHubOrchestrator from '../components/orchestration/UnifiedHubOrchestrator';

export default function OmniDashboard() {
  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-6xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Omni Ecosystem
            </span>
          </h1>
          <p className="text-white/60 text-lg">Unified control panel for all hubs and cross-system integration</p>
        </motion.div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'System Health', value: '98.2%', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
            { label: 'Active Hubs', value: '6/6', icon: Activity, color: 'from-blue-500 to-cyan-500' },
            { label: 'Integration Events', value: '1,240', icon: Zap, color: 'from-purple-500 to-pink-500' },
            { label: 'Alerts', value: '0', icon: AlertTriangle, color: 'from-yellow-500 to-orange-500' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className={`bg-gradient-to-br ${stat.color} bg-opacity-20 border-white/10 p-4`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-white/80" />
                    <div>
                      <p className="text-white/60 text-xs">{stat.label}</p>
                      <p className="text-white font-bold text-lg">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orchestrator" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="orchestrator">Hub Orchestrator</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
          </TabsList>

          {/* Orchestrator */}
          <TabsContent value="orchestrator">
            <UnifiedHubOrchestrator />
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4">Hub Connections</CardTitle>
                <div className="space-y-3">
                  {[
                    { from: 'Home', to: 'Banking', strength: 95, events: 245 },
                    { from: 'AI Labs', to: 'Simulations', strength: 88, events: 180 },
                    { from: 'Banking', to: 'Devices', strength: 92, events: 210 },
                    { from: 'Communications', to: 'AI Labs', strength: 85, events: 156 },
                  ].map((conn, idx) => (
                    <div key={idx} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-semibold text-sm">
                          {conn.from} ↔ {conn.to}
                        </p>
                        <Badge className="bg-cyan-500/30 text-cyan-300 text-xs">{conn.events} events</Badge>
                      </div>
                      <div className="bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${conn.strength}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4">Webhook Subscriptions</CardTitle>
                <div className="space-y-3">
                  {[
                    { event: 'agent_trained', subscribers: 4, active: true },
                    { event: 'market_anomaly', subscribers: 3, active: true },
                    { event: 'simulation_complete', subscribers: 5, active: true },
                    { event: 'device_connected', subscribers: 2, active: true },
                  ].map((webhook, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-white font-semibold text-sm">{webhook.event}</p>
                        <p className="text-white/60 text-xs">{webhook.subscribers} subscribers</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Timeline */}
          <TabsContent value="timeline">
            <Card className="bg-black/40 border-white/10 p-6">
              <CardTitle className="text-white mb-4">System Activity Timeline</CardTitle>
              <div className="space-y-2">
                {[
                  { time: '14:32:15', event: 'Agent trained successfully in AI Labs', hub: 'AI Labs' },
                  { time: '14:31:42', event: 'Banking strategy updated based on market data', hub: 'Banking' },
                  { time: '14:30:10', event: 'Simulation scenario completed with emergent behaviors', hub: 'Simulations' },
                  { time: '14:28:33', event: 'Device telemetry synchronized across network', hub: 'Devices' },
                  { time: '14:27:05', event: 'Voice command processed and executed', hub: 'Communications' },
                  { time: '14:25:20', event: 'Home dashboard updated with real-time feeds', hub: 'Home' },
                ].map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-4 p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                        <Zap className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{log.event}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-purple-500/30 text-purple-300 text-xs">{log.hub}</Badge>
                        <p className="text-white/40 text-xs">{log.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}