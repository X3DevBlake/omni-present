import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RedCommNetworkTopology3D from '../components/redcomm/RedCommNetworkTopology3D';
import RedCommSignalFlow3D from '../components/redcomm/RedCommSignalFlow3D';
import RedCommControlPanel from '../components/redcomm/RedCommControlPanel';
import RedCommMessageStream3D from '../components/redcomm/RedCommMessageStream3D';
import RedCommAnalyticsDashboard from '../components/redcomm/RedCommAnalyticsDashboard';
import OmegaSentientDashboard3D from '../components/redcomm/OmegaSentientDashboard3D';
import ProtocolEvolutionVisualizer3D from '../components/redcomm/ProtocolEvolutionVisualizer3D';
import RedCommSimulationStudio3D from '../components/redcomm/RedCommSimulationStudio3D';
import DeviceManagementInterface3D from '../components/redcomm/DeviceManagementInterface3D';
import EnhancedRedCommVisualizer3D from '../components/network/EnhancedRedCommVisualizer3D';
import { Radio, Satellite, Network } from 'lucide-react';

export default function RedCommHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 pb-16">
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Radio className="w-12 h-12 text-indigo-400" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              RedComm-XG Hub
            </h1>
            <Satellite className="w-12 h-12 text-purple-400" />
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Advanced Ultra-High Frequency Communication Network with AI-Driven Adaptive Control,
            Real-Time Anomaly Detection, and Omega Sentient Optimization
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <Network className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-semibold">
              Next-Generation Communication Infrastructure
            </span>
          </div>
        </motion.div>

        {/* Main Tabbed Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          <Tabs defaultValue="control" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-900/50 border border-indigo-500/30">
              <TabsTrigger value="control">Control</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="sentient">Sentient AI</TabsTrigger>
              <TabsTrigger value="evolution">Evolution</TabsTrigger>
            </TabsList>

            <TabsContent value="control" className="space-y-8 mt-6">
              <RedCommControlPanel />
              <RedCommAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="network" className="space-y-8 mt-6">
              <RedCommNetworkTopology3D />
              <RedCommSignalFlow3D />
              <RedCommMessageStream3D />
            </TabsContent>

            <TabsContent value="devices" className="space-y-8 mt-6">
              <DeviceManagementInterface3D />
              <EnhancedRedCommVisualizer3D />
            </TabsContent>

            <TabsContent value="simulation" className="mt-6">
              <RedCommSimulationStudio3D />
            </TabsContent>

            <TabsContent value="sentient" className="mt-6">
              <OmegaSentientDashboard3D />
            </TabsContent>

            <TabsContent value="evolution" className="mt-6">
              <ProtocolEvolutionVisualizer3D />
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>
    </div>
  );
}