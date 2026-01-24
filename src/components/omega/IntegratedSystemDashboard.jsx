import React from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MissionSimulationViz3D from '../haas/MissionSimulationViz3D';
import TaskAssignmentOptimizer from '../haas/TaskAssignmentOptimizer';
import AdaptiveModulationViz3D from '../interstellar/AdaptiveModulationViz3D';
import RealTimeLinkHealthMonitor from '../interstellar/RealTimeLinkHealthMonitor';
import DynamicEthicalLandscapeViz3D from '../ethics/DynamicEthicalLandscapeViz3D';
import EthicalFeedbackLoopViz from '../ethics/EthicalFeedbackLoopViz';
import AIMissionCommanderViz3D from '../haas/AIMissionCommanderViz3D';
import InterstellarNetworkViz3D from '../interstellar/InterstellarNetworkViz3D';
import EthicalCouncilViz3D from '../ethics/EthicalCouncilViz3D';

export default function IntegratedSystemDashboard() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="mission" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/60 backdrop-blur-xl">
          <TabsTrigger value="mission">Mission Commander</TabsTrigger>
          <TabsTrigger value="interstellar">Interstellar Network</TabsTrigger>
          <TabsTrigger value="ethics">Ethical Landscape</TabsTrigger>
        </TabsList>

        <TabsContent value="mission" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            <div className="lg:col-span-2">
              <MissionSimulationViz3D />
            </div>
            <TaskAssignmentOptimizer missionId="mission_001" />
          </motion.div>
          <AIMissionCommanderViz3D />
        </TabsContent>

        <TabsContent value="interstellar" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            <div className="lg:col-span-2">
              <AdaptiveModulationViz3D />
            </div>
            <RealTimeLinkHealthMonitor linkId="link_sol_alpha" />
          </motion.div>
          <InterstellarNetworkViz3D />
        </TabsContent>

        <TabsContent value="ethics" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            <div className="lg:col-span-2">
              <DynamicEthicalLandscapeViz3D />
            </div>
            <EthicalFeedbackLoopViz />
          </motion.div>
          <EthicalCouncilViz3D />
        </TabsContent>
      </Tabs>
    </div>
  );
}