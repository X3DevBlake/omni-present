import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rocket, Activity, GitBranch, Users } from 'lucide-react';
import DeploymentDashboard3D from '../components/deployment/DeploymentDashboard3D';
import ExperimentTracker3D from '../components/experiments/ExperimentTracker3D';
import MLOpsMonitor3D from '../components/mlops/MLOpsMonitor3D';
import AgentOrchestration3D from '../components/orchestration/AgentOrchestration3D';
import RealTimePresence from '../components/collaboration/RealTimePresence';
import EnhancedAgentOrchestration from '../components/orchestration/EnhancedAgentOrchestration';
import CICDPipeline3D from '../components/cicd/CICDPipeline3D';
import PipelineMonitor from '../components/cicd/PipelineMonitor';
import MLOpsWebhook from '../components/webhooks/MLOpsWebhook';
import AutomatedTriggers from '../components/cicd/AutomatedTriggers';
import VizCustomizer from '../components/visualization/VizCustomizer';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function MLOpsHub() {
  const queryClient = useQueryClient();
  const [collaborationSessionId, setCollaborationSessionId] = useState(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const [vizConfig, setVizConfig] = useState(null);

  const handleStageClick = (stage) => {
    toast.info(`${stage.stage_name}: ${stage.status} (${stage.duration_seconds}s)`);
  };

  const { data: deployments } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => base44.entities.ModelDeployment.list('-created_date', 10)
  });

  const { data: experiments } = useQuery({
    queryKey: ['experiments'],
    queryFn: () => base44.entities.ExperimentRun.list('-created_date', 20)
  });

  const { data: monitors } = useQuery({
    queryKey: ['mlops-monitors'],
    queryFn: () => base44.entities.MLOpsMonitor.list('-created_date', 5)
  });

  const { data: orchestrations } = useQuery({
    queryKey: ['orchestrations'],
    queryFn: () => base44.entities.AgentOrchestration.list('-created_date', 5)
  });

  const { data: pipelines } = useQuery({
    queryKey: ['cicd-pipelines'],
    queryFn: () => base44.entities.CICDPipeline.list('-created_date', 10)
  });

  const deployModel = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('deployModel', {
        deployment_name: data.name,
        model_id: data.modelId,
        platform: data.platform,
        instance_type: data.instanceType
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deployments'] })
  });

  const logExperiment = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('logExperiment', {
        experiment_name: data.name,
        model_type: data.modelType,
        hyperparameters: data.hyperparams,
        num_epochs: data.epochs
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['experiments'] })
  });

  const monitorHealth = useMutation({
    mutationFn: async (deploymentId) => {
      const response = await base44.functions.invoke('monitorModelHealth', {
        deployment_id: deploymentId
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mlops-monitors'] })
  });

  const orchestrateAgents = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('orchestrateAgents', {
        orchestration_name: data.name,
        num_agents: data.numAgents,
        task_complexity: data.complexity
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orchestrations'] })
  });

  const startCollaboration = useMutation({
    mutationFn: async () => {
      const session = await base44.entities.CollaborationSession.create({
        session_name: 'Model_Training_Collab',
        workspace_type: 'model_training',
        active_users: [],
        shared_state: {},
        change_history: []
      });
      setCollaborationSessionId(session.id);
      return session;
    }
  });

  const executePipeline = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('executePipeline', {
        pipeline_name: data.name,
        model_id: data.modelId,
        environment: data.environment,
        trigger_type: data.trigger
      });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cicd-pipelines'] })
  });

  const [deploymentForm, setDeploymentForm] = useState({
    name: '',
    modelId: 'gpt_model_v1',
    platform: 'AWS_SageMaker',
    instanceType: 'ml.m5.large'
  });

  const [experimentForm, setExperimentForm] = useState({
    name: '',
    modelType: 'transformer',
    hyperparams: { learning_rate: 0.001, batch_size: 32 },
    epochs: 10
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">MLOps & Deployment Hub</h1>
          <p className="text-white/70">Production deployment, monitoring & collaboration</p>
        </div>

        {collaborationSessionId && (
          <RealTimePresence sessionId={collaborationSessionId} />
        )}

        <Tabs defaultValue="deployment" className="space-y-6 mt-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
            <TabsTrigger value="cicd">CI/CD</TabsTrigger>
          </TabsList>

          <TabsContent value="deployment" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Deploy Model to Production
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Deployment name"
                  value={deploymentForm.name}
                  onChange={(e) => setDeploymentForm({...deploymentForm, name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Input
                  placeholder="Model ID"
                  value={deploymentForm.modelId}
                  onChange={(e) => setDeploymentForm({...deploymentForm, modelId: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={deploymentForm.platform} onValueChange={(v) => setDeploymentForm({...deploymentForm, platform: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AWS_SageMaker">AWS SageMaker</SelectItem>
                    <SelectItem value="Google_AI_Platform">Google AI Platform</SelectItem>
                    <SelectItem value="Azure_ML">Azure ML</SelectItem>
                    <SelectItem value="Docker">Docker Container</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => deployModel.mutate(deploymentForm)}
                  disabled={deployModel.isPending || !deploymentForm.name}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Deploy Model
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardContent className="p-6">
                <DeploymentDashboard3D deployments={deployments} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deployments?.slice(0, 4).map((dep) => (
                <Card key={dep.id} className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{dep.deployment_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Platform:</span>
                      <span className="text-white">{dep.target_platform}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Status:</span>
                      <span className={dep.deployment_status === 'active' ? 'text-green-400' : 'text-yellow-400'}>
                        {dep.deployment_status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Latency:</span>
                      <span className="text-white">{dep.performance_metrics?.avg_latency_ms}ms</span>
                    </div>
                    {dep.deployment_status === 'active' && (
                      <Button
                        size="sm"
                        onClick={() => monitorHealth.mutate(dep.id)}
                        disabled={monitorHealth.isPending}
                        className="w-full mt-2"
                        variant="outline"
                      >
                        Check Health
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="experiments" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Log Training Experiment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Experiment name"
                  value={experimentForm.name}
                  onChange={(e) => setExperimentForm({...experimentForm, name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Input
                  placeholder="Model type"
                  value={experimentForm.modelType}
                  onChange={(e) => setExperimentForm({...experimentForm, modelType: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Input
                  type="number"
                  placeholder="Epochs"
                  value={experimentForm.epochs}
                  onChange={(e) => setExperimentForm({...experimentForm, epochs: parseInt(e.target.value)})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Button
                  onClick={() => logExperiment.mutate(experimentForm)}
                  disabled={logExperiment.isPending || !experimentForm.name}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Log Experiment
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardContent className="p-6">
                <ExperimentTracker3D experiments={experiments} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              {experiments?.slice(0, 5).map((exp) => (
                <Card key={exp.id} className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{exp.experiment_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">Version:</span>
                        <p className="text-white font-medium">{exp.version}</p>
                      </div>
                      <div>
                        <span className="text-white/70">Accuracy:</span>
                        <p className="text-green-400 font-medium">
                          {((exp.final_metrics?.test_accuracy || 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <span className="text-white/70">Status:</span>
                        <p className="text-white font-medium">{exp.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Production Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 mb-4">Monitor deployed models for drift and degradation</p>
                {deployments?.filter(d => d.deployment_status === 'active').length > 0 ? (
                  <Button
                    onClick={() => monitorHealth.mutate(deployments.find(d => d.deployment_status === 'active').id)}
                    disabled={monitorHealth.isPending}
                    className="bg-gradient-to-r from-green-600 to-emerald-600"
                  >
                    Run Health Check
                  </Button>
                ) : (
                  <p className="text-white/60 text-sm">No active deployments to monitor</p>
                )}
              </CardContent>
            </Card>

            {monitors?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <MLOpsMonitor3D monitor={monitors[0]} />
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monitors?.map((mon) => (
                <Card key={mon.id} className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{mon.monitor_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Health Score:</span>
                      <span className={mon.health_score > 80 ? 'text-green-400' : 'text-yellow-400'}>
                        {mon.health_score}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Data Drift:</span>
                      <span className="text-white">{(mon.drift_detection?.data_drift_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Degradation:</span>
                      <span className="text-white">{mon.performance_degradation?.degradation_percentage?.toFixed(1)}%</span>
                    </div>
                    {mon.retraining_recommended && (
                      <div className="bg-yellow-500/20 border border-yellow-500/40 rounded p-2 text-yellow-300 text-sm">
                        ⚠️ Retraining recommended
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orchestration" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Agent Orchestration & Knowledge Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => orchestrateAgents.mutate({ 
                    name: 'Multi_Agent_Task', 
                    numAgents: 5, 
                    complexity: 'high' 
                  })}
                  disabled={orchestrateAgents.isPending}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600"
                >
                  Deploy Agent Team
                </Button>
                {!collaborationSessionId && (
                  <Button
                    onClick={() => startCollaboration.mutate()}
                    disabled={startCollaboration.isPending}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Start Collaboration Session
                  </Button>
                )}
              </CardContent>
            </Card>

            <EnhancedAgentOrchestration orchestrationId={orchestrations?.[0]?.id} />
          </TabsContent>

          <TabsContent value="cicd" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  CI/CD Pipeline Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70 text-sm mb-4">
                  Automated pipelines for model training, testing, and deployment
                </p>
                <Button
                  onClick={() => executePipeline.mutate({
                    name: 'AutoDeploy_Pipeline',
                    modelId: 'model_v1',
                    environment: 'staging',
                    trigger: 'drift_detected'
                  })}
                  disabled={executePipeline.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Execute Pipeline
                </Button>
              </CardContent>
            </Card>

            {pipelines?.[0] && (
              <>
                <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardContent className="p-6">
                    <CICDPipeline3D 
                      pipeline={pipelines[0]} 
                      onStageClick={handleStageClick}
                    />
                  </CardContent>
                </Card>
                <PipelineMonitor pipelineId={pipelines[0].id} />
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MLOpsWebhook />
              {monitors?.[0] && deployments?.[0] && (
                <AutomatedTriggers 
                  deploymentId={deployments[0].id} 
                  monitorId={monitors[0].id}
                />
              )}
            </div>

            <VizCustomizer onConfigChange={setVizConfig} />

            <div className="grid grid-cols-1 gap-4">
              {pipelines?.slice(0, 5).map((pipe) => (
                <Card key={pipe.id} className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{pipe.pipeline_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pipe.pipeline_stages?.map((stage, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded">
                          <span className="text-white text-sm">{stage.stage_name}</span>
                          <Badge className={
                            stage.status === 'success' ? 'bg-green-600' :
                            stage.status === 'running' ? 'bg-yellow-600' :
                            stage.status === 'failed' ? 'bg-red-600' : 'bg-gray-600'
                          }>
                            {stage.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm">
                      <div className="flex justify-between text-white/70">
                        <span>Environment:</span>
                        <span className="text-white">{pipe.environment}</span>
                      </div>
                      <div className="flex justify-between text-white/70 mt-2">
                        <span>Tests:</span>
                        <span className={pipe.automated_testing?.performance_tests_passed ? 'text-green-400' : 'text-yellow-400'}>
                          {Object.values(pipe.automated_testing || {}).filter(Boolean).length}/3 Passed
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