import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentCollaborationSpace3D from '../components/collaboration/AgentCollaborationSpace3D';
import RealTimeDocEditor from '../components/collaboration/RealTimeDocEditor';
import AgentMoodSystem from '../components/collaboration/AgentMoodSystem';
import DynamicTeamFormation from '../components/collaboration/DynamicTeamFormation';
import RealTimeCommunicationVisualizer from '../components/collaboration/RealTimeCommunicationVisualizer';
import AITaskDelegationEngine from '../components/collaboration/AITaskDelegationEngine';
import CollaborationTemplateManager from '../components/collaboration/CollaborationTemplateManager';
import SimulationConfigurator from '../components/simulation/SimulationConfigurator';
import AgentDataFlowVisualizer3D from '../components/collaboration/AgentDataFlowVisualizer3D';
import DocumentWorkspace from '../components/collaboration/DocumentWorkspace';
import PredictiveInsights from '../components/collaboration/PredictiveInsights';
import DocumentAutomation from '../components/collaboration/DocumentAutomation';
import Enhanced3DAgentCollaboration from '../components/3d/Enhanced3DAgentCollaboration';
import ComprehensiveDocsGenerator from '../components/documentation/ComprehensiveDocsGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Share2, FileText, Eye } from 'lucide-react';

export default function EnhancedCollaborationHub() {
  const [userEmail, setUserEmail] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: collaborations = [] } = useQuery({
    queryKey: ['collaborations', userEmail],
    queryFn: () => userEmail ? base44.entities.AgentCollaboration.filter({ user_email: userEmail }).catch(() => []) : []
  });

  const activeWorkspace = collaborations[0];

  const { data: communications = [] } = useQuery({
    queryKey: ['communications', activeWorkspace?.workspace_id],
    queryFn: () => activeWorkspace ? base44.entities.AgentCommunication.filter({ collaboration_id: activeWorkspace.workspace_id }).catch(() => []) : [],
    refetchInterval: 2000
  });

  const agents = [
    { id: 'agent-1', name: 'Trader', status: 'active' },
    { id: 'agent-2', name: 'Analyst', status: 'active' },
    { id: 'agent-3', name: 'Facilitator', status: 'active' },
    { id: 'agent-4', name: 'Researcher', status: 'active' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-3 md:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2 md:gap-3">
            <Users className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
            <span className="hidden sm:inline">Enhanced Collaboration Hub</span>
            <span className="sm:hidden">Collaboration</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base">Multi-agent workspace with autonomous coordination</p>
        </motion.div>

        <Tabs defaultValue="agents" className="w-full space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white/5 border border-white/10 text-xs md:text-sm">
            <TabsTrigger value="agents">
              <Users className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Agents</span>
            </TabsTrigger>
            <TabsTrigger value="communication">
              <Share2 className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Communication</span>
            </TabsTrigger>
            <TabsTrigger value="delegation">
              <FileText className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Delegation</span>
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Eye className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="3d" className="col-span-2 md:col-span-1">
              <Eye className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">3D View</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-4 md:p-6">
                <AgentCollaborationSpace3D agents={agents} communications={communications} />
              </div>
              {activeWorkspace && (
                <div>
                  <PredictiveInsights collaborationId={activeWorkspace.workspace_id} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
              <RealTimeDocEditor agents={['Agent-Alpha', 'Agent-Beta']} userEmail={userEmail} />
              <AgentMoodSystem agentId="agent-1" userEmail={userEmail} />
            </div>

            <DynamicTeamFormation userEmail={userEmail} />

            <SimulationConfigurator userEmail={userEmail} />
          </TabsContent>

          <TabsContent value="communication">
            <RealTimeCommunicationVisualizer communications={communications} agents={agents} />
          </TabsContent>

          <TabsContent value="delegation">
            <AITaskDelegationEngine collaborationId={activeWorkspace?.workspace_id} agents={agents} />
          </TabsContent>

          <TabsContent value="templates">
            <CollaborationTemplateManager userEmail={userEmail} />
          </TabsContent>

          <TabsContent value="documents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
                {activeWorkspace && userEmail ? (
                  <DocumentWorkspace workspaceId={activeWorkspace.workspace_id} userEmail={userEmail} />
                ) : (
                  <div className="text-center py-12 text-white/40">No active workspace</div>
                )}
              </div>
              {activeWorkspace && userEmail && (
                <div className="space-y-4">
                  <DocumentAutomation collaborationId={activeWorkspace.workspace_id} userEmail={userEmail} />
                  <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
                    <ComprehensiveDocsGenerator userEmail={userEmail} />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="3d">
            <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
              {activeWorkspace ? (
                <Enhanced3DAgentCollaboration 
                  agents={activeWorkspace.participating_agents?.map((agentId, idx) => ({
                    id: agentId,
                    name: `Agent ${idx + 1}`,
                    position: [
                      Math.cos((idx / (activeWorkspace.participating_agents?.length || 1)) * Math.PI * 2) * 5,
                      0,
                      Math.sin((idx / (activeWorkspace.participating_agents?.length || 1)) * Math.PI * 2) * 5
                    ],
                    isActive: true,
                    recentDecisions: [{}, {}]
                  })) || []}
                  communications={[
                    { from_position: [0, 0, 0], to_position: [5, 0, 0], active: true }
                  ]}
                  pathfinding={[]}
                />
              ) : (
                <div className="text-center py-12 text-white/40">Select a workspace to view 3D visualization</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}