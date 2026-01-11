import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentCollaborationSpace3D from '../components/collaboration/AgentCollaborationSpace3D';
import RealTimeDocEditor from '../components/collaboration/RealTimeDocEditor';
import AgentMoodSystem from '../components/collaboration/AgentMoodSystem';
import DynamicTeamFormation from '../components/collaboration/DynamicTeamFormation';
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
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-cyan-400" />
            Enhanced Collaboration Hub
          </h1>
          <p className="text-white/60">Multi-agent workspace with autonomous coordination</p>
        </motion.div>

        <Tabs defaultValue="agents" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
            <TabsTrigger value="agents">
              <Users className="w-4 h-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="dataflow">
              <Share2 className="w-4 h-4 mr-2" />
              Data Flow
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="3d">
              <Eye className="w-4 h-4 mr-2" />
              3D View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
                <AgentCollaborationSpace3D agents={agents} communications={communications} />
              </div>
              {activeWorkspace && (
                <div>
                  <PredictiveInsights collaborationId={activeWorkspace.workspace_id} />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="dataflow">
            <div className="bg-gradient-to-br from-black/20 to-black/40 border border-white/10 rounded-xl p-6">
              <AgentDataFlowVisualizer3D agents={agents} communications={communications} />
            </div>
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