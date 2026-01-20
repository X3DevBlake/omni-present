import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Cpu, Database, Network, Workflow, Webhook, Sparkles, Eye } from 'lucide-react';
import RealTimeTrainingVisualizer3D from '../components/labs/RealTimeTrainingVisualizer3D';
import BehaviorTreeVisualizer3D from '../components/labs/BehaviorTreeVisualizer3D';
import HolographicWorkspace3D from '../components/labs/HolographicWorkspace3D';
import ActiveLearningVisualizer3D from '../components/labs/ActiveLearningVisualizer3D';
import SyntheticDataVisualizer3D from '../components/labs/SyntheticDataVisualizer3D';
import RealtimeDataStreamVisualizer3D from '../components/labs/RealtimeDataStreamVisualizer3D';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function EnhancedAILabsHub() {
  const queryClient = useQueryClient();
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedTree, setSelectedTree] = useState(null);

  // Queries
  const { data: trainingSessions } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: () => base44.entities.ModelTrainingSession.list('-created_date', 10),
    refetchInterval: 3000
  });

  const { data: behaviorTrees } = useQuery({
    queryKey: ['behavior-trees'],
    queryFn: () => base44.entities.AgentBehaviorTree.list('-created_date', 10)
  });

  const { data: workspaces } = useQuery({
    queryKey: ['holographic-workspaces'],
    queryFn: () => base44.entities.HolographicWorkspace.list('-created_date', 10)
  });

  const { data: annotationTasks } = useQuery({
    queryKey: ['annotation-tasks'],
    queryFn: () => base44.entities.DataAnnotationTask.list('-created_date', 10)
  });

  const { data: syntheticDatasets } = useQuery({
    queryKey: ['synthetic-datasets'],
    queryFn: () => base44.entities.SyntheticDataset.list('-created_date', 10),
    refetchInterval: 5000
  });

  const { data: dataStreams } = useQuery({
    queryKey: ['data-streams'],
    queryFn: () => base44.entities.RealtimeDataStream.list('-created_date', 10)
  });

  const { data: webhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.WebhookConfiguration.list('-created_date', 10)
  });

  // Mutations
  const startTraining = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('realTimeModelTraining', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      toast.success('Training session started!');
    }
  });

  const generateTree = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('generateBehaviorTree', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behavior-trees'] });
      toast.success('Behavior tree generated!');
    }
  });

  const createWorkspace = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('createHolographicWorkspace', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holographic-workspaces'] });
      toast.success('Holographic workspace created!');
    }
  });

  const startAnnotation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('activeLearningAnnotation', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotation-tasks'] });
      toast.success('Annotation task started!');
    }
  });

  const generateSynthetic = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('generateSyntheticData', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synthetic-datasets'] });
      toast.success('Synthetic data generation started!');
    }
  });

  const createStream = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('createRealtimeStream', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-streams'] });
      toast.success('Data stream created!');
    }
  });

  const setupWebhook = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('configureWebhook', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook configured!');
    }
  });

  // Form states
  const [trainingForm, setTrainingForm] = useState({
    session_name: '',
    model_type: 'diffusion',
    total_epochs: 10,
    hyperparameters: { learning_rate: 0.001, batch_size: 32 }
  });

  const [treeForm, setTreeForm] = useState({
    tree_name: '',
    agent_id: 'agent_001',
    complexity: 'medium'
  });

  const [workspaceForm, setWorkspaceForm] = useState({
    workspace_name: '',
    workspace_type: 'model_training'
  });

  const [annotationForm, setAnnotationForm] = useState({
    task_name: '',
    dataset_id: 'dataset_001',
    annotation_type: 'classification',
    enable_active_learning: true
  });

  const [syntheticForm, setSyntheticForm] = useState({
    dataset_name: '',
    generator_model: 'diffusion',
    data_type: 'image',
    num_samples: 1000
  });

  const [streamForm, setStreamForm] = useState({
    stream_name: '',
    stream_type: 'market_data',
    source_endpoint: 'wss://stream.example.com'
  });

  const [webhookForm, setWebhookForm] = useState({
    webhook_name: '',
    trigger_entity: 'ModelTrainingSession',
    trigger_events: ['create', 'update'],
    endpoint_url: ''
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-3">
            <Sparkles className="w-12 h-12 text-cyan-400" />
            Enhanced AI Labs Hub
          </h1>
          <p className="text-xl text-white/70">
            1000+ Features: Immersive 3D Training, Behavior Trees, Holographic Workspaces & Real-time Analytics
          </p>
        </div>

        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 bg-black/30 p-1">
            <TabsTrigger value="training" className="data-[state=active]:bg-purple-600">
              <Brain className="w-4 h-4 mr-2" />
              Training
            </TabsTrigger>
            <TabsTrigger value="trees" className="data-[state=active]:bg-blue-600">
              <Network className="w-4 h-4 mr-2" />
              Behavior Trees
            </TabsTrigger>
            <TabsTrigger value="workspace" className="data-[state=active]:bg-cyan-600">
              <Eye className="w-4 h-4 mr-2" />
              Holographic
            </TabsTrigger>
            <TabsTrigger value="annotation" className="data-[state=active]:bg-pink-600">
              <Database className="w-4 h-4 mr-2" />
              Annotation
            </TabsTrigger>
            <TabsTrigger value="synthetic" className="data-[state=active]:bg-green-600">
              <Cpu className="w-4 h-4 mr-2" />
              Synthetic
            </TabsTrigger>
            <TabsTrigger value="streams" className="data-[state=active]:bg-orange-600">
              <Workflow className="w-4 h-4 mr-2" />
              Streams
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="data-[state=active]:bg-red-600">
              <Webhook className="w-4 h-4 mr-2" />
              Webhooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Real-Time Model Training</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Session name"
                  value={trainingForm.session_name}
                  onChange={(e) => setTrainingForm({...trainingForm, session_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={trainingForm.model_type} onValueChange={(v) => setTrainingForm({...trainingForm, model_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diffusion">Diffusion Model</SelectItem>
                    <SelectItem value="neuro_symbolic">Neuro-Symbolic</SelectItem>
                    <SelectItem value="few_shot">Few-Shot Learning</SelectItem>
                    <SelectItem value="active_learning">Active Learning</SelectItem>
                    <SelectItem value="constitutional">Constitutional AI</SelectItem>
                    <SelectItem value="causal_rl">Causal RL</SelectItem>
                    <SelectItem value="moe">Mixture of Experts</SelectItem>
                    <SelectItem value="cot">Chain-of-Thought</SelectItem>
                    <SelectItem value="ebm">Energy-Based Model</SelectItem>
                    <SelectItem value="rlaif">RLAIF</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Epochs"
                  value={trainingForm.total_epochs}
                  onChange={(e) => setTrainingForm({...trainingForm, total_epochs: parseInt(e.target.value)})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Button
                  onClick={() => startTraining.mutate(trainingForm)}
                  disabled={startTraining.isPending || !trainingForm.session_name}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Start Training Session
                </Button>
              </CardContent>
            </Card>

            {trainingSessions?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <RealTimeTrainingVisualizer3D session={trainingSessions[0]} />
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingSessions?.map((session) => (
                <Card key={session.id} className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{session.session_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Model:</span>
                        <span className="text-white">{session.model_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Progress:</span>
                        <span className="text-white">{session.current_epoch}/{session.total_epochs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Loss:</span>
                        <span className="text-green-400">{session.metrics?.loss?.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Accuracy:</span>
                        <span className="text-cyan-400">{(session.metrics?.accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
                          style={{ width: `${(session.current_epoch / session.total_epochs) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trees" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Generate Agent Behavior Tree</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Tree name"
                  value={treeForm.tree_name}
                  onChange={(e) => setTreeForm({...treeForm, tree_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Input
                  placeholder="Agent ID"
                  value={treeForm.agent_id}
                  onChange={(e) => setTreeForm({...treeForm, agent_id: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={treeForm.complexity} onValueChange={(v) => setTreeForm({...treeForm, complexity: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple (5 nodes)</SelectItem>
                    <SelectItem value="medium">Medium (10 nodes)</SelectItem>
                    <SelectItem value="complex">Complex (20 nodes)</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => generateTree.mutate(treeForm)}
                  disabled={generateTree.isPending || !treeForm.tree_name}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Generate Behavior Tree
                </Button>
              </CardContent>
            </Card>

            {behaviorTrees?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <BehaviorTreeVisualizer3D
                    tree={behaviorTrees[0]}
                    onNodeClick={(node) => toast.info(`Node: ${node.label} (${node.node_type})`)}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workspace" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Create Holographic Workspace</CardTitle>
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
                    <SelectItem value="model_training">Model Training</SelectItem>
                    <SelectItem value="agent_design">Agent Design</SelectItem>
                    <SelectItem value="data_exploration">Data Exploration</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="simulation">Simulation</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => createWorkspace.mutate(workspaceForm)}
                  disabled={createWorkspace.isPending || !workspaceForm.workspace_name}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
                >
                  Create Workspace
                </Button>
              </CardContent>
            </Card>

            {workspaces?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <HolographicWorkspace3D
                    workspace={workspaces[0]}
                    onPanelSelect={(panel) => toast.info(`Panel: ${panel.panel_id}`)}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="annotation" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Active Learning Annotation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Task name"
                  value={annotationForm.task_name}
                  onChange={(e) => setAnnotationForm({...annotationForm, task_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={annotationForm.annotation_type} onValueChange={(v) => setAnnotationForm({...annotationForm, annotation_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="segmentation">Segmentation</SelectItem>
                    <SelectItem value="detection">Object Detection</SelectItem>
                    <SelectItem value="nlp_tagging">NLP Tagging</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => startAnnotation.mutate(annotationForm)}
                  disabled={startAnnotation.isPending || !annotationForm.task_name}
                  className="w-full bg-gradient-to-r from-pink-600 to-orange-600"
                >
                  Start Annotation Task
                </Button>
              </CardContent>
            </Card>

            {annotationTasks?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <ActiveLearningVisualizer3D
                    task={annotationTasks[0]}
                    samples={[
                      { sample_id: 's1', uncertainty_score: 0.9, confidence: 0.3 },
                      { sample_id: 's2', uncertainty_score: 0.7, confidence: 0.5 },
                      { sample_id: 's3', uncertainty_score: 0.5, confidence: 0.7 }
                    ]}
                    onSampleClick={(sample) => toast.info(`Sample: ${sample.sample_id}`)}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="synthetic" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Generate Synthetic Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Dataset name"
                  value={syntheticForm.dataset_name}
                  onChange={(e) => setSyntheticForm({...syntheticForm, dataset_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={syntheticForm.generator_model} onValueChange={(v) => setSyntheticForm({...syntheticForm, generator_model: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diffusion">Diffusion Model</SelectItem>
                    <SelectItem value="gan">GAN</SelectItem>
                    <SelectItem value="vae">VAE</SelectItem>
                    <SelectItem value="tabular_gan">Tabular GAN</SelectItem>
                    <SelectItem value="text_llm">Text LLM</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={syntheticForm.data_type} onValueChange={(v) => setSyntheticForm({...syntheticForm, data_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="tabular">Tabular</SelectItem>
                    <SelectItem value="time_series">Time Series</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => generateSynthetic.mutate(syntheticForm)}
                  disabled={generateSynthetic.isPending || !syntheticForm.dataset_name}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Generate Synthetic Dataset
                </Button>
              </CardContent>
            </Card>

            {syntheticDatasets?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <SyntheticDataVisualizer3D dataset={syntheticDatasets[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="streams" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Create Real-time Data Stream</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Stream name"
                  value={streamForm.stream_name}
                  onChange={(e) => setStreamForm({...streamForm, stream_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={streamForm.stream_type} onValueChange={(v) => setStreamForm({...streamForm, stream_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market_data">Market Data</SelectItem>
                    <SelectItem value="sensor_data">Sensor Data</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="logs">System Logs</SelectItem>
                    <SelectItem value="metrics">Metrics</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Source endpoint"
                  value={streamForm.source_endpoint}
                  onChange={(e) => setStreamForm({...streamForm, source_endpoint: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Button
                  onClick={() => createStream.mutate(streamForm)}
                  disabled={createStream.isPending || !streamForm.stream_name}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600"
                >
                  Create Data Stream
                </Button>
              </CardContent>
            </Card>

            {dataStreams?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <RealtimeDataStreamVisualizer3D stream={dataStreams[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Configure Webhook</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Webhook name"
                  value={webhookForm.webhook_name}
                  onChange={(e) => setWebhookForm({...webhookForm, webhook_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Input
                  placeholder="Endpoint URL"
                  value={webhookForm.endpoint_url}
                  onChange={(e) => setWebhookForm({...webhookForm, endpoint_url: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={webhookForm.trigger_entity} onValueChange={(v) => setWebhookForm({...webhookForm, trigger_entity: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ModelTrainingSession">Model Training</SelectItem>
                    <SelectItem value="SyntheticDataset">Synthetic Data</SelectItem>
                    <SelectItem value="DataAnnotationTask">Annotation Task</SelectItem>
                    <SelectItem value="RealtimeDataStream">Data Stream</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setupWebhook.mutate(webhookForm)}
                  disabled={setupWebhook.isPending || !webhookForm.webhook_name}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600"
                >
                  Configure Webhook
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {webhooks?.map((webhook) => (
                <Card key={webhook.id} className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{webhook.webhook_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Entity:</span>
                        <span className="text-white">{webhook.trigger_entity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Events:</span>
                        <span className="text-white">{webhook.trigger_events.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Status:</span>
                        <span className={webhook.status === 'active' ? 'text-green-400' : 'text-red-400'}>
                          {webhook.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Success Rate:</span>
                        <span className="text-cyan-400">
                          {webhook.delivery_stats?.total_deliveries > 0 
                            ? ((webhook.delivery_stats.successful_deliveries / webhook.delivery_stats.total_deliveries) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}