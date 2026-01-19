import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Rocket, CheckCircle, AlertCircle, Server, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function ModelDeploymentHub() {
  const queryClient = useQueryClient();
  const [selectedModel, setSelectedModel] = useState('');
  const [deploymentName, setDeploymentName] = useState('');
  const [agentRole, setAgentRole] = useState('assistant');

  const { data: trainedModels } = useQuery({
    queryKey: ['trained-models'],
    queryFn: async () => {
      const models = await base44.entities.TrainingProgress.filter({ status: 'completed' });
      return models;
    },
  });

  const { data: deployments } = useQuery({
    queryKey: ['model-deployments'],
    queryFn: async () => {
      const deps = await base44.entities.AgentDeployment.list('-created_date');
      return deps;
    },
  });

  const deployModel = useMutation({
    mutationFn: async (config) => {
      // Create agent from trained model
      const agent = await base44.entities.Agent.create({
        name: config.deploymentName,
        role: config.agentRole,
        model_id: config.modelId,
        status: 'active',
        capabilities: ['custom_model_inference'],
      });

      // Create deployment record
      const deployment = await base44.entities.AgentDeployment.create({
        agent_id: agent.id,
        model_id: config.modelId,
        deployment_name: config.deploymentName,
        status: 'deployed',
        endpoint_url: `/api/agents/${agent.id}/inference`,
      });

      return { agent, deployment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-deployments'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setSelectedModel('');
      setDeploymentName('');
    },
  });

  const handleDeploy = () => {
    if (!selectedModel || !deploymentName) {
      alert('Please select a model and provide deployment name');
      return;
    }

    deployModel.mutate({
      modelId: selectedModel,
      deploymentName,
      agentRole,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Deployment Configuration */}
      <Card className="lg:col-span-2 bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-blue-400" />
            Deploy Trained Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-white">Select Trained Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Choose model to deploy" />
              </SelectTrigger>
              <SelectContent>
                {trainedModels?.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.model_name} - Accuracy: {(model.metrics?.accuracy * 100).toFixed(2)}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Deployment Name</Label>
            <Input
              value={deploymentName}
              onChange={(e) => setDeploymentName(e.target.value)}
              placeholder="production-classifier-v1"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-white">Agent Role</Label>
            <Select value={agentRole} onValueChange={setAgentRole}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="advisor">Advisor</SelectItem>
                <SelectItem value="specialist">Specialist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleDeploy}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={deployModel.isPending}
          >
            {deployModel.isPending ? (
              <>
                <Server className="w-4 h-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Deploy as AI Agent
              </>
            )}
          </Button>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              <strong>Note:</strong> Deployed models become AI agents that can be used throughout the system for inference, decision-making, and automation tasks.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Deployments */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Active Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deployments?.map((deployment) => (
              <motion.div
                key={deployment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium text-sm">
                      {deployment.deployment_name}
                    </span>
                  </div>
                  {deployment.status === 'deployed' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="text-xs text-white/60">
                  <div>Endpoint: {deployment.endpoint_url}</div>
                  <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-0">
                    {deployment.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}