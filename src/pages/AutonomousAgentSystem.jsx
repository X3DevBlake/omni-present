import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, AlertCircle, Users, Zap } from 'lucide-react';
import ProactiveAnomalyDetector from '../components/agents/ProactiveAnomalyDetector';
import AutonomousTrainingInitiator from '../components/agents/AutonomousTrainingInitiator';
import MultiAgentNegotiationHub from '../components/agents/MultiAgentNegotiationHub';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AutonomousAgentSystem() {
  const [activeTab, setActiveTab] = useState('anomalies');

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            Autonomous Agent System
          </h1>
          <p className="text-xl text-white/70">
            Advanced self-managing agents with proactive problem-solving
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/30 p-1">
            <TabsTrigger value="anomalies" className="data-[state=active]:bg-red-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              Anomaly Detection
            </TabsTrigger>
            <TabsTrigger value="training" className="data-[state=active]:bg-purple-600">
              <Brain className="w-4 h-4 mr-2" />
              Auto-Training
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="data-[state=active]:bg-blue-600">
              <Users className="w-4 h-4 mr-2" />
              Multi-Agent Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anomalies">
            <ProactiveAnomalyDetector />
          </TabsContent>

          <TabsContent value="training">
            <AutonomousTrainingInitiator />
          </TabsContent>

          <TabsContent value="collaboration">
            <MultiAgentNegotiationHub />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}