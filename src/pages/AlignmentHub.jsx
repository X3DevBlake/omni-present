import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Shield, Users, GitBranch } from 'lucide-react';
import RLAIF3D from '../components/rlaif/RLAIF3D';
import Constitutional3D from '../components/constitutional/Constitutional3D';
import MultiAgent3D from '../components/multiagent/MultiAgent3D';
import CausalRL3D from '../components/causalrl/CausalRL3D';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AlignmentHub() {
  const queryClient = useQueryClient();

  const { data: rlaifSessions } = useQuery({
    queryKey: ['rlaif-sessions'],
    queryFn: () => base44.entities.RLAIFSession.list('-created_date', 5)
  });

  const { data: constitutionalSystems } = useQuery({
    queryKey: ['constitutional-systems'],
    queryFn: () => base44.entities.ConstitutionalAI.list('-created_date', 5)
  });

  const { data: multiAgentSystems } = useQuery({
    queryKey: ['multiagent-systems'],
    queryFn: () => base44.entities.MultiAgentSystem.list('-created_date', 5)
  });

  const { data: causalRLAgents } = useQuery({
    queryKey: ['causalrl-agents'],
    queryFn: () => base44.entities.CausalRL.list('-created_date', 5)
  });

  const trainRLAIF = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainRLAIF', {
        session_name: 'AI_Feedback_v1',
        base_model: 'GPT-4',
        ai_labeler: 'GPT-4'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rlaif-sessions'] })
  });

  const buildConstitutional = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('buildConstitutional', {
        system_name: 'Ethical_AI',
        num_principles: 5
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['constitutional-systems'] })
  });

  const buildMultiAgent = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('buildMultiAgent', {
        system_name: 'Collaborative_Swarm',
        num_agents: 5,
        protocol: 'decentralized'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['multiagent-systems'] })
  });

  const trainCausalRL = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainCausalRL', {
        agent_name: 'Causal_Agent_v1',
        intervention_strategy: 'do_calculus'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['causalrl-agents'] })
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Alignment Hub</h1>
          <p className="text-white/70">RLAIF, constitutional AI, multi-agent & causal RL</p>
        </div>

        <Tabs defaultValue="rlaif" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="rlaif">RLAIF</TabsTrigger>
            <TabsTrigger value="constitutional">Constitutional</TabsTrigger>
            <TabsTrigger value="multiagent">Multi-Agent</TabsTrigger>
            <TabsTrigger value="causal">Causal RL</TabsTrigger>
          </TabsList>

          <TabsContent value="rlaif" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Scalable Alignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => trainRLAIF.mutate()}
                  disabled={trainRLAIF.isPending}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Train with AI Feedback
                </Button>
              </CardContent>
            </Card>

            {rlaifSessions?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <RLAIF3D session={rlaifSessions[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="constitutional" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Value Alignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => buildConstitutional.mutate()}
                  disabled={buildConstitutional.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Build Constitutional AI
                </Button>
              </CardContent>
            </Card>

            {constitutionalSystems?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <Constitutional3D system={constitutionalSystems[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="multiagent" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Collective Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => buildMultiAgent.mutate()}
                  disabled={buildMultiAgent.isPending}
                  className="bg-gradient-to-r from-orange-600 to-amber-600"
                >
                  Deploy Multi-Agent System
                </Button>
              </CardContent>
            </Card>

            {multiAgentSystems?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <MultiAgent3D system={multiAgentSystems[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="causal" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Causal Reasoning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => trainCausalRL.mutate()}
                  disabled={trainCausalRL.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Train Causal RL Agent
                </Button>
              </CardContent>
            </Card>

            {causalRLAgents?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <CausalRL3D agent={causalRLAgents[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}