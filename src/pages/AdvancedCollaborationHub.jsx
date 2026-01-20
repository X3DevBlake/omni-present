import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Users, Network, Share2, Target, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import CollaborationNetwork3D from '../components/collaboration/CollaborationNetwork3D';
import KnowledgeTransferFlow3D from '../components/collaboration/KnowledgeTransferFlow3D';
import TaskCoordinationVisualizer3D from '../components/collaboration/TaskCoordinationVisualizer3D';
import CollaborationHealthDashboard from '../components/collaboration/CollaborationHealthDashboard';
import { toast } from 'sonner';

export default function AdvancedCollaborationHub() {
  const queryClient = useQueryClient();

  const { data: networks = [] } = useQuery({
    queryKey: ['collaboration-networks'],
    queryFn: () => base44.entities.CollaborationNetwork.filter({}).limit(100),
    initialData: []
  });

  const { data: transfers = [] } = useQuery({
    queryKey: ['knowledge-transfers'],
    queryFn: () => base44.entities.KnowledgeTransfer.filter({}).limit(100),
    initialData: []
  });

  const { data: coordinations = [] } = useQuery({
    queryKey: ['task-coordinations'],
    queryFn: () => base44.entities.TaskCoordination.filter({}).limit(50),
    initialData: []
  });

  const orchestrateTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await base44.functions.invoke('orchestrate-multi-agent-task', taskData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['task-coordinations']);
      toast.success('Task coordination initiated');
    }
  });

  const executeTransferMutation = useMutation({
    mutationFn: async (transferData) => {
      const response = await base44.functions.invoke('execute-knowledge-transfer', transferData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge-transfers']);
      toast.success('Knowledge transfer completed');
    }
  });

  const analyzeHealthMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('analyze-collaboration-health', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['collaboration-networks']);
      toast.success(`Health Score: ${Math.round(data.overall_health)}/100`);
    }
  });

  const activeNetworks = networks.filter(n => n.network_health > 70);
  const completedTransfers = transfers.filter(t => t.transfer_status === 'completed');
  const activeCoordinations = coordinations.filter(c => c.status === 'active');

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-cyan-400" />
            Advanced Collaboration Hub
          </h1>
          <p className="text-slate-400">Multi-agent coordination and intelligent knowledge sharing</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => analyzeHealthMutation.mutate()}
            disabled={analyzeHealthMutation.isPending}
            className="bg-gradient-to-r from-cyan-600 to-blue-600"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${analyzeHealthMutation.isPending ? 'animate-spin' : ''}`} />
            Analyze Health
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Network className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-xs">Active Networks</p>
                  <p className="text-white text-2xl font-bold">{activeNetworks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Share2 className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-slate-400 text-xs">Knowledge Transfers</p>
                  <p className="text-white text-2xl font-bold">{completedTransfers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-xs">Active Coordinations</p>
                  <p className="text-white text-2xl font-bold">{activeCoordinations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-slate-400 text-xs">Avg Synergy</p>
                  <p className="text-white text-2xl font-bold">
                    {Math.round(networks.reduce((acc, n) => acc + (n.collaboration_metrics?.synergy_score || 0), 0) / Math.max(networks.length, 1))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="networks" className="space-y-6">
          <TabsList className="bg-slate-900/60">
            <TabsTrigger value="networks">
              <Network className="w-4 h-4 mr-2" />
              Networks
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <Share2 className="w-4 h-4 mr-2" />
              Knowledge Transfer
            </TabsTrigger>
            <TabsTrigger value="coordination">
              <Target className="w-4 h-4 mr-2" />
              Task Coordination
            </TabsTrigger>
            <TabsTrigger value="health">
              <Users className="w-4 h-4 mr-2" />
              Health Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="networks">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Collaboration Network Topology</CardTitle>
                <p className="text-slate-400 text-sm">
                  Real-time visualization of agent collaboration networks
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <CollaborationNetwork3D networks={networks} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Knowledge Transfer Flow</CardTitle>
                <p className="text-slate-400 text-sm">
                  Visualize knowledge sharing and skill propagation
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <KnowledgeTransferFlow3D transfers={transfers} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coordination">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Task Coordination Visualizer</CardTitle>
                <p className="text-slate-400 text-sm">
                  Monitor multi-agent task execution and dependencies
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <TaskCoordinationVisualizer3D coordinations={coordinations} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <CollaborationHealthDashboard
              networks={networks}
              transfers={transfers}
              coordinations={coordinations}
              onAnalyze={() => analyzeHealthMutation.mutate()}
              isAnalyzing={analyzeHealthMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}