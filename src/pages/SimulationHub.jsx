import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCcw, Zap, Users, AlertTriangle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import WorldState3DSimulator from '../components/simulation/WorldState3DSimulator';
import MultiAgentInteractionGraph from '../components/simulation/MultiAgentInteractionGraph';
import AnomalyReplayVisualizer from '../components/simulation/AnomalyReplayVisualizer';

export default function SimulationHub() {
  const [simulationRunning, setSimulationRunning] = useState(false);
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
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              Simulation Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">Multi-agent world simulation with real-time visualization and anomaly detection</p>
        </motion.div>

        {/* Simulation Controls */}
        <Card className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 border-pink-500/30 p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-white font-bold mb-1">Current Simulation</h3>
              <p className="text-white/60 text-sm">Market Scenario - 8 Agents - Running for 2:34</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setSimulationRunning(!simulationRunning)}
                className={simulationRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {simulationRunning ? (
                  <>
                    <Square className="w-4 h-4 mr-2" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" /> Start
                  </>
                )}
              </Button>
              <Button variant="outline" size="icon">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Agents', value: '8/8', icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: 'Total Events', value: '4,234', icon: Zap, color: 'from-purple-500 to-pink-500' },
            { label: 'Anomalies', value: '3', icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
            { label: 'System Health', value: 'Excellent', icon: Zap, color: 'from-green-500 to-emerald-500' },
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
            <TabsTrigger value="world">World State</TabsTrigger>
            <TabsTrigger value="interactions">Agent Graph</TabsTrigger>
            <TabsTrigger value="anomalies">Anomaly Replay</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4">Scenario Info</CardTitle>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/60 text-xs">Type</p>
                    <p className="text-white font-semibold">Market Trading Scenario</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Agents</p>
                    <p className="text-white font-semibold">8 Trading Agents</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Duration</p>
                    <p className="text-white font-semibold">300 seconds</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">Status</p>
                    <Badge className="bg-green-500/30 text-green-300 mt-1">Running</Badge>
                  </div>
                </div>
              </Card>

              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4">Key Metrics</CardTitle>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Cooperation Score</span>
                    <span className="text-white font-bold">87%</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-[87%]" />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white/60">Avg Agent Utilization</span>
                    <span className="text-white font-bold">76%</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full w-[76%]" />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-white/60">System Efficiency</span>
                    <span className="text-white font-bold">94%</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full w-[94%]" />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* World State Tab */}
          <TabsContent value="world">
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <WorldState3DSimulator />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10 p-6 mt-6">
              <CardTitle className="text-white mb-4">Simulation State</CardTitle>
              <p className="text-white/60 text-sm mb-4">
                Visualization shows 8 agents (colored spheres) moving autonomously within the simulation world. Agents make decisions based on local observations and inter-agent communications.
              </p>
              <div className="space-y-2 text-white/60 text-sm">
                <p>🎯 Agents navigating to targets using learned policies</p>
                <p>📊 Real-time position tracking and state management</p>
                <p>🔄 Collision avoidance and obstacle navigation active</p>
              </div>
            </Card>
          </TabsContent>

          {/* Agent Interactions Tab */}
          <TabsContent value="interactions">
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <MultiAgentInteractionGraph />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-white/10 p-6 mt-6">
              <CardTitle className="text-white mb-4">Collaboration Network</CardTitle>
              <p className="text-white/60 text-sm mb-4">
                Graph shows real-time agent interactions and collaborations. Edge thickness and color intensity indicate interaction strength.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Active Connections</p>
                  <p className="text-white font-bold text-lg">18</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Avg Interaction Rate</p>
                  <p className="text-white font-bold text-lg">2.3/s</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60 text-xs">Network Cohesion</p>
                  <p className="text-white font-bold text-lg">0.85</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Anomaly Replay Tab */}
          <TabsContent value="anomalies">
            <AnomalyReplayVisualizer />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}