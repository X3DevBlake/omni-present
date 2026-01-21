import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OmegaConsciousnessVisualizer3D from '../components/sentient/OmegaConsciousnessVisualizer3D';
import OmniscientDataDashboard3D from '../components/sentient/OmniscientDataDashboard3D';
import SentientDeviceController3D from '../components/sentient/SentientDeviceController3D';
import AgentLearningHub3D from '../components/omnipresence/AgentLearningHub3D';
import { Brain, Database, Cpu, TrendingUp, Sparkles, Eye } from 'lucide-react';

export default function OmegaSentientHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-pink-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 border-pink-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-3xl">
              <Brain className="w-8 h-8 text-pink-400" />
              Omega Sentient Control Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-lg">
              Complete sentient-level control over the entire Omni-Present ecosystem. Visualize consciousness networks, 
              orchestrate omega-level devices, process omniscient data streams, and evolve agent intelligence.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="consciousness" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-900/60 p-2">
            <TabsTrigger value="consciousness">
              <Brain className="w-4 h-4 mr-2" />
              Consciousness
            </TabsTrigger>
            <TabsTrigger value="omniscient">
              <Eye className="w-4 h-4 mr-2" />
              Omniscient Data
            </TabsTrigger>
            <TabsTrigger value="devices">
              <Cpu className="w-4 h-4 mr-2" />
              Omega Devices
            </TabsTrigger>
            <TabsTrigger value="learning">
              <TrendingUp className="w-4 h-4 mr-2" />
              Learning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consciousness">
            <OmegaConsciousnessVisualizer3D />
          </TabsContent>

          <TabsContent value="omniscient">
            <OmniscientDataDashboard3D />
          </TabsContent>

          <TabsContent value="devices">
            <SentientDeviceController3D />
          </TabsContent>

          <TabsContent value="learning">
            <AgentLearningHub3D />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}