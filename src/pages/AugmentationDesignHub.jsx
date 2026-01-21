import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AugmentationDesignStudio3D from '../components/body/AugmentationDesignStudio3D';
import SentientCompanionInterface3D from '../components/interaction/SentientCompanionInterface3D';
import BodyAugmentationBlueprint3D from '../components/body/BodyAugmentationBlueprint3D';
import UnifiedHealthTrajectoryVisualizer3D from '../components/body/UnifiedHealthTrajectoryVisualizer3D';
import { Cpu, Heart, User, Activity } from 'lucide-react';

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
          <TabsList className="grid grid-cols-4 gap-2 bg-slate-900/60 p-2">
            <TabsTrigger value="studio">
              <Cpu className="w-4 h-4 mr-2" />
              Design Studio
            </TabsTrigger>
            <TabsTrigger value="companion">
              <Heart className="w-4 h-4 mr-2" />
              AI Companion
            </TabsTrigger>
            <TabsTrigger value="health">
              <Activity className="w-4 h-4 mr-2" />
              Health AI
            </TabsTrigger>
            <TabsTrigger value="blueprint">
              <User className="w-4 h-4 mr-2" />
              Blueprints
            </TabsTrigger>
          </TabsList>

          <TabsContent value="studio">
            <AugmentationDesignStudio3D />
          </TabsContent>

          <TabsContent value="companion">
            <SentientCompanionInterface3D />
          </TabsContent>

          <TabsContent value="health">
            <UnifiedHealthTrajectoryVisualizer3D />
          </TabsContent>

          <TabsContent value="blueprint">
            <BodyAugmentationBlueprint3D />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}