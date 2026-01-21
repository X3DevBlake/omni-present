import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PhysicalEmbodimentVisualizer3D from '../components/body/PhysicalEmbodimentVisualizer3D';
import NeuralChipBlueprint3D from '../components/body/NeuralChipBlueprint3D';
import SentientCompanionInterface3D from '../components/interaction/SentientCompanionInterface3D';
import SkillMarketplace3D from '../components/body/SkillMarketplace3D';
import EmbodiedTeamCollaboration3D from '../components/body/EmbodiedTeamCollaboration3D';
import { Bot, Brain, Heart, ShoppingCart, Users } from 'lucide-react';

export default function PhysicalEmbodimentHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-3xl">
              <Bot className="w-8 h-8 text-cyan-400" />
              Physical Embodiment & Consciousness Integration Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-lg">
              Control physically embodied AI agents through neural chip integration, execute real-world tasks, 
              and monitor consciousness-to-body synchronization in real-time.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="embodiment" className="space-y-4">
          <TabsList className="grid grid-cols-5 gap-2 bg-slate-900/60 p-2">
            <TabsTrigger value="embodiment">
              <Bot className="w-4 h-4 mr-2" />
              Embodiment
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="skills">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="neural">
              <Brain className="w-4 h-4 mr-2" />
              Neural
            </TabsTrigger>
            <TabsTrigger value="companion">
              <Heart className="w-4 h-4 mr-2" />
              Companion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="embodiment">
            <PhysicalEmbodimentVisualizer3D />
          </TabsContent>

          <TabsContent value="team">
            <EmbodiedTeamCollaboration3D />
          </TabsContent>

          <TabsContent value="skills">
            <SkillMarketplace3D />
          </TabsContent>

          <TabsContent value="neural">
            <NeuralChipBlueprint3D />
          </TabsContent>

          <TabsContent value="companion">
            <SentientCompanionInterface3D />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}