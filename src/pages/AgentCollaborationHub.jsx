import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Network, Users, Radio, Sparkles, TrendingUp, Brain } from 'lucide-react';
import SwarmIntelligenceOrchestrator3D from '../components/agents/SwarmIntelligenceOrchestrator3D';
import NegotiationFramework3D from '../components/agents/NegotiationFramework3D';
import AgentRoleManager from '../components/collaboration/AgentRoleManager';
import CommunicationProtocolConfig from '../components/collaboration/CommunicationProtocolConfig';
import EmergentBehaviorAnalyzer3D from '../components/collaboration/EmergentBehaviorAnalyzer3D';
import CollaborationEfficiencyDashboard from '../components/collaboration/CollaborationEfficiencyDashboard';
import AutonomousAgentCollaboration3D from '../components/collaboration/AutonomousAgentCollaboration3D';
import { toast } from 'sonner';

export default function AgentCollaborationHub() {
  const queryClient = useQueryClient();
  const [swarmData, setSwarmData] = useState(null);
  const [negotiationData, setNegotiationData] = useState(null);

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-collab-hub'],
    queryFn: () => base44.entities.Agent.list('-created_date', 30),
    initialData: []
  });

  const { data: collaborations = [] } = useQuery({
    queryKey: ['collab-sessions'],
    queryFn: () => base44.entities.AutonomousAgentCollaboration.list('-created_date', 20),
    initialData: [],
    refetchInterval: 5000
  });

  const { data: emergentBehaviors = [] } = useQuery({
    queryKey: ['emergent-behaviors'],
    queryFn: () => base44.entities.EmergentBehavior.list('-created_date', 15),
    initialData: []
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['agent-teams'],
    queryFn: () => base44.entities.EmbodiedAgentTeam.list('-created_date', 10),
    initialData: []
  });

  const initializeSwarmMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('swarmIntelligenceEngine', {
        action: 'initialize_swarm',
        problem_description: 'Multi-agent optimization challenge',
        swarm_size: 15
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSwarmData(data.swarm_data);
      toast.success('Swarm intelligence initialized!');
    }
  });

  const initiateNegotiationMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('negotiationProtocol', {
        action: 'initiate_negotiation',
        agent_ids: agents.slice(0, 6).map(a => a.id),
        resources: [
          { resource_type: 'CPU', quantity: 100 },
          { resource_type: 'Memory', quantity: 500 },
          { resource_type: 'Storage', quantity: 1000 }
        ]
      });
      return response.data;
    },
    onSuccess: (data) => {
      setNegotiationData(data.negotiation_data);
      toast.success('Negotiation initiated!');
    }
  });

  const assignRoleMutation = useMutation({
    mutationFn: async (roleData) => {
      await base44.entities.Agent.update(roleData.agent_id, {
        collaboration_role: roleData.role,
        skill_contribution: roleData.skills
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents-collab-hub'] });
      toast.success('Role assigned!');
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <Network className="w-12 h-12 text-indigo-400 animate-pulse" />
            Agent Collaboration Hub
          </h1>
          <p className="text-white/60 text-lg">
            Manage multi-agent systems, configure communication protocols, and analyze emergent behaviors
          </p>
        </motion.div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-indigo-400 mb-2" />
              <div className="text-3xl font-bold text-white">{agents.length}</div>
              <div className="text-white/60 text-sm">Total Agents</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <Network className="w-8 h-8 text-purple-400 mb-2" />
              <div className="text-3xl font-bold text-white">{collaborations.length}</div>
              <div className="text-white/60 text-sm">Active Collabs</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-500/50">
            <CardContent className="pt-6">
              <Sparkles className="w-8 h-8 text-pink-400 mb-2" />
              <div className="text-3xl font-bold text-white">{emergentBehaviors.length}</div>
              <div className="text-white/60 text-sm">Emergent</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50">
            <CardContent className="pt-6">
              <Radio className="w-8 h-8 text-cyan-400 mb-2" />
              <div className="text-3xl font-bold text-white">{teams.length}</div>
              <div className="text-white/60 text-sm">Teams</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-3xl font-bold text-white">
                {collaborations[0] ? (collaborations[0].synergy_metrics?.collective_performance * 100).toFixed(0) : 0}%
              </div>
              <div className="text-white/60 text-sm">Efficiency</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="swarm" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-black/60 border-indigo-500/30">
            <TabsTrigger value="swarm">Swarm</TabsTrigger>
            <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="protocols">Protocols</TabsTrigger>
            <TabsTrigger value="emergent">Emergent</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </TabsList>

          <TabsContent value="swarm" className="mt-6">
            <SwarmIntelligenceOrchestrator3D
              swarmData={swarmData}
              onOptimizeSwarm={() => {
                if (!swarmData) {
                  initializeSwarmMutation.mutate();
                } else {
                  toast.success('Swarm optimized!');
                }
              }}
            />
          </TabsContent>

          <TabsContent value="negotiation" className="mt-6">
            <NegotiationFramework3D
              negotiationData={negotiationData}
              onInitiateNegotiation={() => initiateNegotiationMutation.mutate()}
            />
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <AgentRoleManager
              agents={agents}
              onAssignRole={(data) => assignRoleMutation.mutate(data)}
              onUpdateRole={(agent) => toast.info(`Update role for ${agent.name}`)}
              onRemoveRole={(id) => toast.info('Role removed')}
            />
          </TabsContent>

          <TabsContent value="protocols" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CommunicationProtocolConfig
                onConfigureProtocol={(config) => {
                  toast.success(`Protocol configured: ${config.protocol_type}`);
                }}
              />

              <Card className="bg-black/40 border-cyan-500/50">
                <CardHeader>
                  <CardTitle className="text-white">Active Protocols</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {teams.slice(0, 5).map((team, idx) => (
                      <div key={team.id || idx} className="bg-black/60 p-3 rounded-lg border border-cyan-500/30">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-sm">{team.team_name}</span>
                          <Badge className="bg-cyan-500/30 text-cyan-300">
                            {team.communication_protocol?.protocol_type || 'standard'}
                          </Badge>
                        </div>
                        <div className="text-white/60 text-xs mt-1">
                          Frequency: {team.communication_protocol?.update_frequency_hz || 10} Hz
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="emergent" className="mt-6">
            <EmergentBehaviorAnalyzer3D 
              behaviors={emergentBehaviors.length > 0 ? emergentBehaviors : collaborations[0]?.emergent_behaviors || []}
            />
          </TabsContent>

          <TabsContent value="efficiency" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CollaborationEfficiencyDashboard collaborationData={collaborations[0]} />
              {collaborations[0] && (
                <AutonomousAgentCollaboration3D collaboration={collaborations[0]} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}