import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Rocket, BarChart3, Store, Plus } from 'lucide-react';
import ModelTrainingModule from '../components/ailab/ModelTrainingModule';
import ModelDeploymentHub from '../components/ailab/ModelDeploymentHub';
import ModelVisualizationStudio from '../components/ailab/ModelVisualizationStudio';
import ModelMarketplace from '../components/ailab/ModelMarketplace';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AILabsAdvanced() {
  const [activeTab, setActiveTab] = useState('training');

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            AI Labs Advanced
          </h1>
          <p className="text-xl text-white/70">
            Train, deploy, visualize, and share AI models
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-black/30 p-1">
            <TabsTrigger value="training" className="data-[state=active]:bg-purple-600">
              <Brain className="w-4 h-4 mr-2" />
              Model Training
            </TabsTrigger>
            <TabsTrigger value="deployment" className="data-[state=active]:bg-blue-600">
              <Rocket className="w-4 h-4 mr-2" />
              Deployment
            </TabsTrigger>
            <TabsTrigger value="visualization" className="data-[state=active]:bg-cyan-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Visualization
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-pink-600">
              <Store className="w-4 h-4 mr-2" />
              Model Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="training">
            <ModelTrainingModule />
          </TabsContent>

          <TabsContent value="deployment">
            <ModelDeploymentHub />
          </TabsContent>

          <TabsContent value="visualization">
            <ModelVisualizationStudio />
          </TabsContent>

          <TabsContent value="marketplace">
            <ModelMarketplace />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}