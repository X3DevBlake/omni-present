import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Network, MessageSquare, Lightbulb, Brain, Scale } from 'lucide-react';
import CollaborativeWorkspace3D from '../components/collaboration/CollaborativeWorkspace3D';
import DynamicTeam3D from '../components/collaboration/DynamicTeam3D';
import AgentNegotiation3D from '../components/collaboration/AgentNegotiation3D';
import SharedKnowledgeGraph3D from '../components/collaboration/SharedKnowledgeGraph3D';
import AIFacilitator3D from '../components/collaboration/AIFacilitator3D';
import CommunicationProtocol3D from '../components/collaboration/CommunicationProtocol3D';
import ExplainableDecision3D from '../components/collaboration/ExplainableDecision3D';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function CollaborationOrchestrationHub() {
  const queryClient = useQueryClient();

  const { data: workspaces } = useQuery({
    queryKey: ['collaborative-workspaces'],
    queryFn: () => base44.entities.CollaborativeWorkspace.list('-created_date', 10),
    refetchInterval: 3000
  });

  const { data: teams } = useQuery({
    queryKey: ['dynamic-teams'],
    queryFn: () => base44.entities.DynamicTeamFormation.list('-created_date', 10)
  });

  const { data: negotiations } = useQuery({
    queryKey: ['negotiations'],
    queryFn: () => base44.entities.AgentNegotiation.list('-created_date', 10),
    refetchInterval: 2000
  });

  const { data: knowledgeGraphs } = useQuery({
    queryKey: ['knowledge-graphs'],
    queryFn: () => base44.entities.SharedKnowledgeGraph.list('-created_date', 10)
  });

  const { data: facilitators } = useQuery({
    queryKey: ['ai-facilitators'],
    queryFn: () => base44.entities.AIFacilitator.list('-created_date', 10)
  });

  const { data: protocols } = useQuery({
    queryKey: ['communication-protocols'],
    queryFn: () => base44.entities.AgentCommunicationProtocol.list('-created_date', 10)
  });

  const { data: decisions } = useQuery({
    queryKey: ['explainable-decisions'],
    queryFn: () => base44.entities.ExplainableDecision.list('-created_date', 10)
  });

  const createWorkspace = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('createCollaborativeWorkspace', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborative-workspaces'] });
      toast.success('Workspace created!');
    }
  });

  const formTeam = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('formDynamicTeam', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-teams'] });
      toast.success('Team formed!');
    }
  });

  const startNegotiation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('negotiateAgents', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negotiations'] });
      toast.success('Negotiation started!');
    }
  });

  const buildGraph = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('buildSharedKnowledgeGraph', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-graphs'] });
      toast.success('Knowledge graph created!');
    }
  });

  const deployFacilitator = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('deployAIFacilitator', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-facilitators'] });
      toast.success('AI Facilitator deployed!');
    }
  });

  const setupProtocol = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('setupAgentProtocol', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-protocols'] });
      toast.success('Protocol configured!');
    }
  });

  const explainDecision = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('explainAgentDecision', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explainable-decisions'] });
      toast.success('Decision explained!');
    }
  });

  const [workspaceForm, setWorkspaceForm] = useState({
    workspace_name: '',
    workspace_type: 'model_development',
    enable_ai_facilitator: true
  });

  const [teamForm, setTeamForm] = useState({
    team_name: '',
    required_skills: ['machine_learning', 'data_analysis'],
    complexity: 0.7,
    algorithm: 'ml_recommendation'
  });

  const [negotiationForm, setNegotiationForm] = useState({
    negotiation_type: 'task_allocation',
    agent_ids: ['agent_001', 'agent_002'],
    protocol: 'ai_mediated'
  });

  const [graphForm, setGraphForm] = useState({
    graph_name: '',
    domain: 'machine_learning',
    initial_concepts: ['neural_networks', 'optimization', 'training']
  });

  const [facilitatorForm, setFacilitatorForm] = useState({
    facilitator_name: '',
    specialization: 'meeting_management'
  });

  const [protocolForm, setProtocolForm] = useState({
    protocol_name: '',
    protocol_type: 'publish_subscribe',
    agent_ids: ['agent_001', 'agent_002', 'agent_003'],
    channels: ['updates', 'alerts']
  });

  const [decisionForm, setDecisionForm] = useState({
    agent_id: 'agent_001',
    task: 'resource_allocation',
    inputs: {},
    decision: {}
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-3">
            <Users className="w-12 h-12 text-cyan-400" />
            Collaboration & Orchestration Hub
          </h1>
          <p className="text-xl text-white/70">
            Shared Workspaces, Dynamic Teams, Agent Negotiation, Knowledge Graphs & AI Facilitators
          </p>
        </div>

        <Tabs defaultValue="workspace" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 bg-black/30 p-1">
            <TabsTrigger value="workspace" className="data-[state=active]:bg-cyan-600">
              <Users className="w-4 h-4 mr-2" />
              Workspace
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-purple-600">
              <Network className="w-4 h-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="negotiation" className="data-[state=active]:bg-pink-600">
              <Scale className="w-4 h-4 mr-2" />
              Negotiation
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="data-[state=active]:bg-blue-600">
              <Brain className="w-4 h-4 mr-2" />
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="facilitator" className="data-[state=active]:bg-green-600">
              <Lightbulb className="w-4 h-4 mr-2" />
              Facilitator
            </TabsTrigger>
            <TabsTrigger value="protocol" className="data-[state=active]:bg-orange-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              Protocol
            </TabsTrigger>
            <TabsTrigger value="decisions" className="data-[state=active]:bg-indigo-600">
              <Brain className="w-4 h-4 mr-2" />
              Decisions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workspace" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Create Collaborative Workspace</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Workspace name"
                  value={workspaceForm.workspace_name}
                  onChange={(e) => setWorkspaceForm({...workspaceForm, workspace_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={workspaceForm.workspace_type} onValueChange={(v) => setWorkspaceForm({...workspaceForm, workspace_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="model_development">Model Development</SelectItem>
                    <SelectItem value="agent_design">Agent Design</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="strategy_planning">Strategy Planning</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => createWorkspace.mutate(workspaceForm)}
                  disabled={createWorkspace.isPending || !workspaceForm.workspace_name}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                  Create Workspace
                </Button>
              </CardContent>
            </Card>

            {workspaces?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <CollaborativeWorkspace3D workspace={workspaces[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Form Dynamic Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Team name"
                  value={teamForm.team_name}
                  onChange={(e) => setTeamForm({...teamForm, team_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Button
                  onClick={() => formTeam.mutate(teamForm)}
                  disabled={formTeam.isPending || !teamForm.team_name}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Form Team (AI-Powered)
                </Button>
              </CardContent>
            </Card>

            {teams?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <DynamicTeam3D team={teams[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="negotiation" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Start Agent Negotiation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={negotiationForm.negotiation_type} onValueChange={(v) => setNegotiationForm({...negotiationForm, negotiation_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task_allocation">Task Allocation</SelectItem>
                    <SelectItem value="resource_sharing">Resource Sharing</SelectItem>
                    <SelectItem value="knowledge_exchange">Knowledge Exchange</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => startNegotiation.mutate(negotiationForm)}
                  disabled={startNegotiation.isPending}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  Start Negotiation
                </Button>
              </CardContent>
            </Card>

            {negotiations?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <AgentNegotiation3D negotiation={negotiations[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Build Shared Knowledge Graph</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Graph name"
                  value={graphForm.graph_name}
                  onChange={(e) => setGraphForm({...graphForm, graph_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={graphForm.domain} onValueChange={(v) => setGraphForm({...graphForm, domain: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="machine_learning">Machine Learning</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="multi_domain">Multi-Domain</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => buildGraph.mutate(graphForm)}
                  disabled={buildGraph.isPending || !graphForm.graph_name}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Build Knowledge Graph
                </Button>
              </CardContent>
            </Card>

            {knowledgeGraphs?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <SharedKnowledgeGraph3D graph={knowledgeGraphs[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="facilitator" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Deploy AI Facilitator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Facilitator name"
                  value={facilitatorForm.facilitator_name}
                  onChange={(e) => setFacilitatorForm({...facilitatorForm, facilitator_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={facilitatorForm.specialization} onValueChange={(v) => setFacilitatorForm({...facilitatorForm, specialization: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting_management">Meeting Management</SelectItem>
                    <SelectItem value="conflict_resolution">Conflict Resolution</SelectItem>
                    <SelectItem value="brainstorming">Brainstorming</SelectItem>
                    <SelectItem value="decision_making">Decision Making</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => deployFacilitator.mutate(facilitatorForm)}
                  disabled={deployFacilitator.isPending || !facilitatorForm.facilitator_name}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Deploy Facilitator
                </Button>
              </CardContent>
            </Card>

            {facilitators?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <AIFacilitator3D facilitator={facilitators[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="protocol" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Setup Communication Protocol</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Protocol name"
                  value={protocolForm.protocol_name}
                  onChange={(e) => setProtocolForm({...protocolForm, protocol_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={protocolForm.protocol_type} onValueChange={(v) => setProtocolForm({...protocolForm, protocol_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publish_subscribe">Publish-Subscribe</SelectItem>
                    <SelectItem value="broadcast">Broadcast</SelectItem>
                    <SelectItem value="request_response">Request-Response</SelectItem>
                    <SelectItem value="streaming">Streaming</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setupProtocol.mutate(protocolForm)}
                  disabled={setupProtocol.isPending || !protocolForm.protocol_name}
                  className="w-full bg-gradient-to-r from-orange-600 to-yellow-600"
                >
                  Setup Protocol
                </Button>
              </CardContent>
            </Card>

            {protocols?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <CommunicationProtocol3D protocol={protocols[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="decisions" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Explain Agent Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Agent ID"
                  value={decisionForm.agent_id}
                  onChange={(e) => setDecisionForm({...decisionForm, agent_id: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Button
                  onClick={() => explainDecision.mutate(decisionForm)}
                  disabled={explainDecision.isPending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  Generate Explanation
                </Button>
              </CardContent>
            </Card>

            {decisions?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <ExplainableDecision3D decision={decisions[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}