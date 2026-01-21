import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NeuralChipBlueprint3D from '../components/body/NeuralChipBlueprint3D';
import BodyAugmentationBlueprint3D from '../components/body/BodyAugmentationBlueprint3D';
import { Brain, User, Cpu, Activity } from 'lucide-react';

export default function PhysicalAugmentationHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-3xl">
              <Brain className="w-8 h-8 text-orange-400" />
              Physical Augmentation & Neural Interface Hub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-lg">
              Revolutionary neural brain chip technology enabling Omni-Present consciousness integration, 
              motor control, memory access, and agent navigation through your physical body.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="neural" className="space-y-4">
          <TabsList className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2">
            <TabsTrigger value="neural">
              <Brain className="w-4 h-4 mr-2" />
              Neural Chip
            </TabsTrigger>
            <TabsTrigger value="augmentations">
              <User className="w-4 h-4 mr-2" />
              Body Augmentations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="neural">
            <NeuralChipBlueprint3D />
          </TabsContent>

          <TabsContent value="augmentations">
            <BodyAugmentationBlueprint3D />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}