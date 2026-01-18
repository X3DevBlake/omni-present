import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Mic, Store, Users } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import RealtimeChat from '../components/communications/RealtimeChat';
import VoiceIntegration from '../components/communications/VoiceIntegration';
import AgentMarketplaceHub from '../components/marketplace/AgentMarketplaceHub';
import ProactiveAgentSystem from '../components/communications/ProactiveAgentSystem';
import SuggestedActionsPanel from '../components/communications/SuggestedActionsPanel';

export default function CommunicationsHub() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Communications Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">Real-time chat, voice commands, and agent marketplace</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Agents', value: '8', icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: 'Messages Today', value: '245', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
            { label: 'Marketplace Agents', value: '150+', icon: Store, color: 'from-orange-500 to-red-500' },
            { label: 'Voice Commands', value: '42', icon: Mic, color: 'from-green-500 to-emerald-500' },
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

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="proactive">Proactive Agents</TabsTrigger>
            <TabsTrigger value="chat">Real-time Chat</TabsTrigger>
            <TabsTrigger value="voice">Voice Commands</TabsTrigger>
            <TabsTrigger value="marketplace">Agent Marketplace</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Recent Communications
                </CardTitle>
                <div className="space-y-3">
                  {[
                    { from: 'Agent-1', msg: 'Market analysis updated', time: '2 min ago' },
                    { from: 'Agent-2', msg: 'Risk alert: Unusual volatility detected', time: '5 min ago' },
                    { from: 'You', msg: 'Proceed with strategy adjustment', time: '8 min ago' },
                    { from: 'Agent-3', msg: 'Strategy adjustment completed', time: '10 min ago' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-white/5 rounded">
                      <div>
                        <p className="text-white font-semibold text-sm">{item.from}</p>
                        <p className="text-white/60 text-xs">{item.msg}</p>
                      </div>
                      <span className="text-white/40 text-xs">{item.time}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5" /> Voice Activity
                </CardTitle>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <div>
                      <p className="text-white font-semibold text-sm">Voice Commands Processed</p>
                      <p className="text-white/60 text-xs">Last hour</p>
                    </div>
                    <span className="text-green-400 font-bold">12</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                    <div>
                      <p className="text-white font-semibold text-sm">Total Duration</p>
                      <p className="text-white/60 text-xs">24 hours</p>
                    </div>
                    <span className="text-blue-400 font-bold">8h 42m</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-500/10 border border-purple-500/20 rounded">
                    <div>
                      <p className="text-white font-semibold text-sm">Recognition Accuracy</p>
                      <p className="text-white/60 text-xs">Average</p>
                    </div>
                    <span className="text-purple-400 font-bold">94.2%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Proactive Tab */}
          <TabsContent value="proactive" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ProactiveAgentSystem />
              <SuggestedActionsPanel />
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <RealtimeChat />
          </TabsContent>

          {/* Voice Tab */}
          <TabsContent value="voice">
            <VoiceIntegration />
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <div className="space-y-6">
              <Card className="bg-black/40 border-white/10 p-6 mb-6">
                <CardTitle className="text-white mb-2">Featured Agents</CardTitle>
                <p className="text-white/60 text-sm">
                  Discover and install specialized agents from the marketplace to extend your capabilities.
                </p>
              </Card>
              <AgentMarketplaceHub />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}