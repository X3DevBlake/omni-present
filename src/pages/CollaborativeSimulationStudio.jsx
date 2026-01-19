import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Users, BarChart3 } from 'lucide-react';
import RealTimeSimulationController from '../components/simulation/RealTimeSimulationController';
import WhatIfAnalysisTool from '../components/simulation/WhatIfAnalysisTool';
import MultiplayerSimulationHub from '../components/simulation/MultiplayerSimulationHub';
import AuroraBackground from '../components/omni/AuroraBackground';
import MultiAgentSimulation3D from '../components/simulation/MultiAgentSimulation3D';
import AgentCommunicationHub from '../components/collaboration/AgentCommunicationHub';

export default function CollaborativeSimulationStudio() {
  const [activeTab, setActiveTab] = useState('realtime');

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            Collaborative Simulation Studio
          </h1>
          <p className="text-xl text-white/70">
            Real-time control, what-if analysis, and multiplayer simulations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-black/30 p-1">
            <TabsTrigger value="realtime" className="data-[state=active]:bg-green-600">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Real-Time Control
            </TabsTrigger>
            <TabsTrigger value="whatif" className="data-[state=active]:bg-cyan-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              What-If Analysis
            </TabsTrigger>
            <TabsTrigger value="multiplayer" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Multiplayer
            </TabsTrigger>
            <TabsTrigger value="3d" className="data-[state=active]:bg-blue-600">
              Multi-Agent 3D
            </TabsTrigger>
            <TabsTrigger value="communication" className="data-[state=active]:bg-pink-600">
              Agent Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="realtime">
            <RealTimeSimulationController />
          </TabsContent>

          <TabsContent value="whatif">
            <WhatIfAnalysisTool />
          </TabsContent>

          <TabsContent value="multiplayer">
            <MultiplayerSimulationHub />
          </TabsContent>

          <TabsContent value="3d">
            <MultiAgentSimulation3D simulationId="demo-sim" />
          </TabsContent>

          <TabsContent value="communication">
            <AgentCommunicationHub channelId="demo-channel" simulationId="demo-sim" />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}