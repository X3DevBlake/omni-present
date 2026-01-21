import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AugmentationDesignStudio3D from '../components/body/AugmentationDesignStudio3D';
import SentientCompanionInterface3D from '../components/interaction/SentientCompanionInterface3D';
import BodyAugmentationBlueprint3D from '../components/body/BodyAugmentationBlueprint3D';
import UnifiedHealthTrajectoryVisualizer3D from '../components/body/UnifiedHealthTrajectoryVisualizer3D';
import CompanionPersonalityEvolution3D from '../components/interaction/CompanionPersonalityEvolution3D';
import HealthScenarioSimulator3D from '../components/body/HealthScenarioSimulator3D';
import { Cpu, Heart, User, Activity, Sparkle, Play } from 'lucide-react';

export default function AugmentationDesignHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-3xl">
              <Cpu className="w-8 h-8 text-purple-400" />
              Augmentation Design & AI Companion Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-lg">
              Design custom body augmentations with AI optimization, engage with sentient companions, 
              and monitor augmentation health in real-time.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="studio" className="space-y-4">
          <TabsList className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2">
            <TabsTrigger value="studio">
              <Cpu className="w-4 h-4 mr-2" />
              Design Studio
            </TabsTrigger>
            <TabsTrigger value="companion">
              <Heart className="w-4 h-4 mr-2" />
              Companion
            </TabsTrigger>
            <TabsTrigger value="health">
              <Activity className="w-4 h-4 mr-2" />
              Health AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="studio">
            <div className="space-y-4">
              <AugmentationDesignStudio3D />
              <BodyAugmentationBlueprint3D />
            </div>
          </TabsContent>

          <TabsContent value="companion">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SentientCompanionInterface3D />
              <CompanionPersonalityEvolution3D />
            </div>
          </TabsContent>

          <TabsContent value="health">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <UnifiedHealthTrajectoryVisualizer3D />
              <HealthScenarioSimulator3D />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}