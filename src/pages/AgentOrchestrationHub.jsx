import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Network, Target, Sparkles } from 'lucide-react';
import VisualWorkflowBuilder from '../components/orchestration/VisualWorkflowBuilder';
import AgentRoleAssignment from '../components/orchestration/AgentRoleAssignment';
import EmergentGoalSystem from '../components/orchestration/EmergentGoalSystem';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AgentOrchestrationHub() {
  const [activeTab, setActiveTab] = useState('workflow');

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">
            AI Agent Orchestration
          </h1>
          <p className="text-xl text-white/70">
            Define complex multi-agent workflows and emergent goal systems
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/30 p-1">
            <TabsTrigger value="workflow" className="data-[state=active]:bg-cyan-600">
              <Network className="w-4 h-4 mr-2" />
              Workflow Builder
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Role Assignment
            </TabsTrigger>
            <TabsTrigger value="emergent" className="data-[state=active]:bg-orange-600">
              <Target className="w-4 h-4 mr-2" />
              Emergent Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflow">
            <VisualWorkflowBuilder />
          </TabsContent>

          <TabsContent value="roles">
            <AgentRoleAssignment />
          </TabsContent>

          <TabsContent value="emergent">
            <EmergentGoalSystem />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}