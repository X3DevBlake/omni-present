import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import QuantumOptimization3D from '@/components/optimization/QuantumOptimization3D';
import NeuralArchitectureExplorer3D from '@/components/ml/NeuralArchitectureExplorer3D';
import FederatedLearningNetwork3D from '@/components/ml/FederatedLearningNetwork3D';
import { Brain, Cpu, Network, Zap } from 'lucide-react';

export default function AdvancedMLHub() {
  const [searchTask, setSearchTask] = useState('');
  const queryClient = useQueryClient();

  const { data: quantumConfigs = [] } = useQuery({
    queryKey: ['quantum-optimizations'],
    queryFn: () => base44.entities.QuantumOptimizationConfig.list()
  });

  const { data: nasResults = [] } = useQuery({
    queryKey: ['neural-architecture-searches'],
    queryFn: () => base44.entities.NeuralArchitectureSearch.list()
  });

  const { data: federatedNodes = [] } = useQuery({
    queryKey: ['federated-nodes'],
    queryFn: () => base44.entities.FederatedLearningNode.list()
  });

  const runQuantumMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('runQuantumOptimization', {
        optimization_target: 'agent_task_allocation',
        quantum_algorithm: 'qaoa',
        parameter_space: {
          alpha: { min: 0, max: 1 },
          beta: { min: 0, max: 1 },
          gamma: { min: 0, max: Math.PI }
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['quantum-optimizations']);
    }
  });

  const runNASMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('neuralArchitectureSearch', {
        search_name: `NAS-${Date.now()}`,
        target_task: searchTask || 'general_classification',
        max_iterations: 30
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['neural-architecture-searches']);
    }
  });

  const runFederatedMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('runFederatedLearning', {
        model_version: 'v1.0',
        aggregation_rounds: 5
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['federated-nodes']);
    }
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Brain className="w-12 h-12 text-cyan-400" />
            Advanced ML Hub
          </h1>
          <p className="text-xl text-gray-300">
            Quantum optimization, neural architecture search & federated learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Quantum Optimizations</p>
                  <p className="text-3xl font-bold text-white">{quantumConfigs.length}</p>
                </div>
                <Zap className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">NAS Searches</p>
                  <p className="text-3xl font-bold text-white">{nasResults.length}</p>
                </div>
                <Cpu className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">FL Nodes</p>
                  <p className="text-3xl font-bold text-white">{federatedNodes.length}</p>
                </div>
                <Network className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="quantum" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            <TabsTrigger value="quantum">Quantum Optimization</TabsTrigger>
            <TabsTrigger value="nas">Neural Architecture</TabsTrigger>
            <TabsTrigger value="federated">Federated Learning</TabsTrigger>
          </TabsList>

          <TabsContent value="quantum">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Quantum Optimization Landscape</CardTitle>
                  <Button
                    onClick={() => runQuantumMutation.mutate()}
                    disabled={runQuantumMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {runQuantumMutation.isPending ? 'Optimizing...' : 'Run Optimization'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[500px]">
                <QuantumOptimization3D config={quantumConfigs[0]} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nas">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Neural Architecture Search</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      value={searchTask}
                      onChange={(e) => setSearchTask(e.target.value)}
                      placeholder="Task name..."
                      className="bg-slate-800 border-slate-600 text-white w-48"
                    />
                    <Button
                      onClick={() => runNASMutation.mutate()}
                      disabled={runNASMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {runNASMutation.isPending ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[500px]">
                <NeuralArchitectureExplorer3D
                  architecture={nasResults[0]?.best_architecture}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="federated">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Federated Learning Network</CardTitle>
                  <Button
                    onClick={() => runFederatedMutation.mutate()}
                    disabled={runFederatedMutation.isPending}
                    className="bg-gradient-to-r from-green-600 to-blue-600"
                  >
                    {runFederatedMutation.isPending ? 'Training...' : 'Start Training'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="h-[500px]">
                <FederatedLearningNetwork3D nodes={federatedNodes} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}