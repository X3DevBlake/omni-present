import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Cpu, Database, Zap, Network, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import ImmersiveNavigationHub from '@/components/3d/ImmersiveNavigationHub';
import { Scene3D, AnimatedNode, DataFlowLine } from '@/components/3d/Unified3DEngine';

export default function Phase1Dashboard() {
  const [activeView, setActiveView] = useState('overview');
  
  const phase1Features = [
    {
      category: 'Backend Infrastructure',
      features: [
        { name: 'Microservices Orchestrator', status: 'active', metric: '5 services' },
        { name: 'Real-time Event Bus', status: 'active', metric: '1.2k events/sec' },
        { name: 'Graph Database Integration', status: 'deployed', metric: '50k nodes' },
        { name: 'AI/ML Orchestration', status: 'active', metric: '12 models' }
      ]
    },
    {
      category: '3D Visualization Engine',
      features: [
        { name: 'Unified 3D Framework', status: 'active', metric: '60 FPS' },
        { name: 'Immersive Navigation', status: 'active', metric: '7 hubs' },
        { name: 'Performance Optimization', status: 'active', metric: 'LOD enabled' },
        { name: 'Interactive Components', status: 'active', metric: '25+ components' }
      ]
    },
    {
      category: 'Integration Layer',
      features: [
        { name: 'API Gateway', status: 'active', metric: '99.9% uptime' },
        { name: 'Webhook System', status: 'active', metric: '200+ endpoints' },
        { name: 'DeFi Connectors', status: 'active', metric: '8 protocols' },
        { name: 'Cross-chain Bridge', status: 'deployed', metric: '5 chains' }
      ]
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Phase 1: Foundation</h1>
            <p className="text-gray-300">Core infrastructure and immersive experience layer</p>
          </div>
          <Badge className="bg-green-500 text-white px-4 py-2 text-lg">
            <Activity className="w-4 h-4 mr-2" />
            Active
          </Badge>
        </div>
        
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="bg-black/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="3d">3D Navigation</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {phase1Features.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-black/30 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      {category.category === 'Backend Infrastructure' && <Cpu className="w-5 h-5 mr-2" />}
                      {category.category === '3D Visualization Engine' && <Zap className="w-5 h-5 mr-2" />}
                      {category.category === 'Integration Layer' && <Network className="w-5 h-5 mr-2" />}
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.features.map((feature, j) => (
                        <motion.div
                          key={j}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4 rounded-lg border border-purple-500/20"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{feature.name}</span>
                            <Badge className={
                              feature.status === 'active' ? 'bg-green-500' :
                              feature.status === 'deployed' ? 'bg-blue-500' : 'bg-yellow-500'
                            }>
                              {feature.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm">{feature.metric}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
          
          <TabsContent value="3d">
            <Card className="bg-black/30 border-purple-500/30 h-[600px]">
              <CardContent className="p-0 h-full">
                <ImmersiveNavigationHub />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="infrastructure">
            <Card className="bg-black/30 border-purple-500/30 h-[600px]">
              <CardHeader>
                <CardTitle className="text-white">3D Infrastructure Map</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <Scene3D cameraPosition={[0, 5, 15]}>
                  <AnimatedNode position={[0, 0, 0]} color="#6366f1" label="Core API" />
                  <AnimatedNode position={[4, 2, 0]} color="#8b5cf6" label="Agent Service" />
                  <AnimatedNode position={[4, -2, 0]} color="#10b981" label="DeFi Service" />
                  <AnimatedNode position={[-4, 2, 0]} color="#f59e0b" label="Simulation" />
                  <AnimatedNode position={[-4, -2, 0]} color="#06b6d4" label="Analytics" />
                  
                  <DataFlowLine start={[0, 0, 0]} end={[4, 2, 0]} color="#8b5cf6" />
                  <DataFlowLine start={[0, 0, 0]} end={[4, -2, 0]} color="#10b981" />
                  <DataFlowLine start={[0, 0, 0]} end={[-4, 2, 0]} color="#f59e0b" />
                  <DataFlowLine start={[0, 0, 0]} end={[-4, -2, 0]} color="#06b6d4" />
                </Scene3D>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'API Requests/min', value: '12,450', icon: Activity, color: 'text-green-400' },
                { label: 'Active Microservices', value: '5', icon: Cpu, color: 'text-blue-400' },
                { label: 'Event Bus Throughput', value: '1.2k/sec', icon: Zap, color: 'text-yellow-400' },
                { label: 'Database Queries', value: '8.3k/min', icon: Database, color: 'text-purple-400' },
                { label: 'Active Connections', value: '342', icon: Network, color: 'text-cyan-400' },
                { label: 'Security Events', value: '0', icon: Shield, color: 'text-red-400' }
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-black/30 border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">{metric.label}</p>
                          <p className={`text-3xl font-bold ${metric.color} mt-2`}>{metric.value}</p>
                        </div>
                        <metric.icon className={`w-12 h-12 ${metric.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}