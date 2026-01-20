import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Layers, Network, Sparkles } from 'lucide-react';
import ContinualLearning3D from '../components/continual/ContinualLearning3D';
import MultiModal3D from '../components/multimodal/MultiModal3D';
import GraphNeuralNet3D from '../components/gnn/GraphNeuralNet3D';
import SelfSupervised3D from '../components/selfsupervised/SelfSupervised3D';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function AdvancedMLHub() {
  const queryClient = useQueryClient();

  const { data: continualLearners } = useQuery({
    queryKey: ['continual-learners'],
    queryFn: () => base44.entities.ContinualLearner.list('-created_date', 5)
  });

  const { data: multiModalModels } = useQuery({
    queryKey: ['multimodal-models'],
    queryFn: () => base44.entities.MultiModalModel.list('-created_date', 5)
  });

  const { data: gnns } = useQuery({
    queryKey: ['graph-networks'],
    queryFn: () => base44.entities.GraphNeuralNet.list('-created_date', 5)
  });

  const { data: sslTasks } = useQuery({
    queryKey: ['ssl-tasks'],
    queryFn: () => base44.entities.SelfSupervisedTask.list('-created_date', 5)
  });

  const trainContinual = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainContinualLearner', {
        learner_name: 'CL_System_v1',
        learning_strategy: 'EWC',
        num_tasks: 10
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['continual-learners'] })
  });

  const trainMultiModal = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainMultiModal', {
        model_name: 'Unified_AI',
        modalities: ['vision', 'text', 'audio'],
        fusion_strategy: 'attention_fusion'
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['multimodal-models'] })
  });

  const buildGNN = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('buildGraphNetwork', {
        network_name: 'Social_GNN',
        architecture_type: 'GAT',
        num_nodes: 100,
        num_edges: 300
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['graph-networks'] })
  });

  const trainSSL = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('trainSelfSupervised', {
        task_name: 'Vision_SSL',
        pretext_task: 'contrastive',
        data_size: 100000
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ssl-tasks'] })
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Advanced ML Systems</h1>
          <p className="text-white/70">Continual, multi-modal, graph & self-supervised learning</p>
        </div>

        <Tabs defaultValue="continual" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="continual">Continual Learning</TabsTrigger>
            <TabsTrigger value="multimodal">Multi-Modal</TabsTrigger>
            <TabsTrigger value="gnn">Graph Networks</TabsTrigger>
            <TabsTrigger value="ssl">Self-Supervised</TabsTrigger>
          </TabsList>

          <TabsContent value="continual" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Lifelong Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => trainContinual.mutate()}
                  disabled={trainContinual.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Train Continual Learner
                </Button>
              </CardContent>
            </Card>

            {continualLearners?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <ContinualLearning3D learner={continualLearners[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="multimodal" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Cross-Modal Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => trainMultiModal.mutate()}
                  disabled={trainMultiModal.isPending}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Train Multi-Modal Model
                </Button>
              </CardContent>
            </Card>

            {multiModalModels?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <MultiModal3D model={multiModalModels[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gnn" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  Relational Reasoning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => buildGNN.mutate()}
                  disabled={buildGNN.isPending}
                  className="bg-gradient-to-r from-orange-600 to-amber-600"
                >
                  Build Graph Neural Network
                </Button>
              </CardContent>
            </Card>

            {gnns?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <GraphNeuralNet3D network={gnns[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ssl" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Unsupervised Representation Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => trainSSL.mutate()}
                  disabled={trainSSL.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Train Self-Supervised
                </Button>
              </CardContent>
            </Card>

            {sslTasks?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <SelfSupervised3D task={sslTasks[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}