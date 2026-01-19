import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Save, Database, BarChart3 } from 'lucide-react';
import ScenarioDesigner from '../components/simulation/ScenarioDesigner';
import EnvironmentConfigurator from '../components/simulation/EnvironmentConfigurator';
import SimulationAnalyticsDashboard from '../components/simulation/SimulationAnalyticsDashboard';
import SimulationExporter from '../components/simulation/SimulationExporter';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function SimulationStudio() {
  const [activeTab, setActiveTab] = useState('scenarios');

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            Simulation Studio
          </h1>
          <p className="text-xl text-white/70">
            Design, run, analyze, and export advanced AI simulations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-black/30 p-1">
            <TabsTrigger value="scenarios" className="data-[state=active]:bg-orange-600">
              <Save className="w-4 h-4 mr-2" />
              Scenarios
            </TabsTrigger>
            <TabsTrigger value="environment" className="data-[state=active]:bg-green-600">
              <Play className="w-4 h-4 mr-2" />
              Environment
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-purple-600">
              <Database className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios">
            <ScenarioDesigner />
          </TabsContent>

          <TabsContent value="environment">
            <EnvironmentConfigurator />
          </TabsContent>

          <TabsContent value="analytics">
            <SimulationAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="export">
            <SimulationExporter />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}