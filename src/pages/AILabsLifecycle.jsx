import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitBranch, Activity, Database } from 'lucide-react';
import ModelVersionControl from '../components/ailab/ModelVersionControl';
import DeployedModelMonitor from '../components/ailab/DeployedModelMonitor';
import ModelRegistry from '../components/ailab/ModelRegistry';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AILabsLifecycle() {
  const [activeTab, setActiveTab] = useState('registry');

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            Model Lifecycle Management
          </h1>
          <p className="text-xl text-white/70">
            Track, monitor, and manage all AI models throughout their lifecycle
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/30 p-1">
            <TabsTrigger value="registry" className="data-[state=active]:bg-purple-600">
              <Database className="w-4 h-4 mr-2" />
              Model Registry
            </TabsTrigger>
            <TabsTrigger value="versions" className="data-[state=active]:bg-cyan-600">
              <GitBranch className="w-4 h-4 mr-2" />
              Version Control
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-orange-600">
              <Activity className="w-4 h-4 mr-2" />
              Performance Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registry">
            <ModelRegistry />
          </TabsContent>

          <TabsContent value="versions">
            <ModelVersionControl />
          </TabsContent>

          <TabsContent value="monitoring">
            <DeployedModelMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}