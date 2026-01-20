import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Database, Network, Workflow } from 'lucide-react';
import SyntheticData3D from '../components/synthesis/SyntheticData3D';
import AgentDebate3D from '../components/debate/AgentDebate3D';
import CausalGraph3D from '../components/causality/CausalGraph3D';
import CognitiveArchitecture3D from '../components/cognition/CognitiveArchitecture3D';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AdvancedIntelligenceHub() {
  const queryClient = useQueryClient();
  const [debateTopic, setDebateTopic] = useState('');
  const [graphName, setGraphName] = useState('');

  const { data: datasets } = useQuery({
    queryKey: ['synthetic-datasets'],
    queryFn: () => base44.entities.SyntheticDataset.list('-created_date', 5)
  });

  const { data: debates } = useQuery({
    queryKey: ['agent-debates'],
    queryFn: () => base44.entities.AgentDebate.list('-created_date', 5)
  });

  const { data: graphs } = useQuery({
    queryKey: ['causal-graphs'],
    queryFn: () => base44.entities.CausalGraph.list('-created_date', 5)
  });

  const { data: cognition } = useQuery({
    queryKey: ['cognitive-architectures'],
    queryFn: () => base44.entities.CognitiveArchitecture.list('-created_date', 5)
  });

  const generateData = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateSyntheticData', {
        dataset_name: 'AI_Training_Data',
        generation_method: 'diffusion',
        target_schema: { features: ['feature1', 'feature2'], labels: ['class'] },
        sample_count: 1000
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['synthetic-datasets'] })
  });

  const startDebate = useMutation({
    mutationFn: async () => {
      const agents = await base44.entities.AgentProfile.list('', 3);
      const response = await base44.functions.invoke('orchestrateAgentDebate', {
        debate_topic: debateTopic,
        agent_ids: agents.map(a => a.agent_id),
        max_rounds: 3
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-debates'] });
      setDebateTopic('');
    }
  });

  const buildGraph = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('buildCausalGraph', {
        graph_name: graphName,
        observed_variables: ['market_volatility', 'agent_performance', 'user_engagement'],
        time_series_data: {}
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['causal-graphs'] });
      setGraphName('');
    }
  });

  const initCognition = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('initializeCognitiveArchitecture', {
        architecture_name: 'Advanced_AI_Mind',
        agent_id: 'system_agent'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cognitive-architectures'] })
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Advanced Intelligence Hub</h1>
          <p className="text-white/70">Cutting-edge AI systems and reasoning</p>
        </div>

        <Tabs defaultValue="synthesis" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="synthesis">Synthetic Data</TabsTrigger>
            <TabsTrigger value="debate">Multi-Agent Debate</TabsTrigger>
            <TabsTrigger value="causality">Causal Inference</TabsTrigger>
            <TabsTrigger value="cognition">Cognitive Architecture</TabsTrigger>
          </TabsList>

          <TabsContent value="synthesis" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  AI Data Synthesis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => generateData.mutate()}
                  disabled={generateData.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Generate Synthetic Dataset
                </Button>
              </CardContent>
            </Card>

            {datasets?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <SyntheticData3D dataset={datasets[0]} />
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {datasets?.map(dataset => (
                <Card key={dataset.id} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{dataset.dataset_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-500">{dataset.generation_method}</Badge>
                      <Badge className="bg-blue-500">{dataset.sample_count} samples</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Fidelity</div>
                        <div className="text-white">{(dataset.quality_metrics?.fidelity_score * 100).toFixed(0)}%</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Privacy</div>
                        <div className="text-green-400">{(dataset.quality_metrics?.privacy_score * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="debate" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Orchestrate Agent Debate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter debate topic (e.g., 'Should we prioritize short-term gains or long-term sustainability?')"
                  value={debateTopic}
                  onChange={(e) => setDebateTopic(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  rows={3}
                />
                <Button
                  onClick={() => startDebate.mutate()}
                  disabled={!debateTopic || startDebate.isPending}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Start Multi-Agent Debate
                </Button>
              </CardContent>
            </Card>

            {debates?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <AgentDebate3D debate={debates[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="causality" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Workflow className="w-5 h-5" />
                  Causal Discovery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Graph name (e.g., 'Market_Causality')"
                  value={graphName}
                  onChange={(e) => setGraphName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
                <Button
                  onClick={() => buildGraph.mutate()}
                  disabled={!graphName || buildGraph.isPending}
                  className="bg-gradient-to-r from-orange-600 to-amber-600"
                >
                  Build Causal Graph
                </Button>
              </CardContent>
            </Card>

            {graphs?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <CausalGraph3D graph={graphs[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cognition" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Cognitive Systems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => initCognition.mutate()}
                  disabled={initCognition.isPending}
                  className="bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  Initialize Cognitive Architecture
                </Button>
              </CardContent>
            </Card>

            {cognition?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <CognitiveArchitecture3D architecture={cognition[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}