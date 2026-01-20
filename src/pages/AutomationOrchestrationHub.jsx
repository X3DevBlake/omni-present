import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Zap, Workflow, Play, TrendingUp, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import AutomationNetwork3D from '../components/automation/AutomationNetwork3D';
import WorkflowVisualizer3D from '../components/automation/WorkflowVisualizer3D';
import OrchestrationMetrics3D from '../components/automation/OrchestrationMetrics3D';
import IntelligentAutomationBuilder from '../components/automation/IntelligentAutomationBuilder';
import { toast } from 'sonner';

export default function AutomationOrchestrationHub() {
  const queryClient = useQueryClient();

  const { data: automations = [] } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => base44.entities.AutomationRule.filter({}).limit(100),
    initialData: []
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: () => base44.entities.WorkflowTemplate.filter({}).limit(50),
    initialData: []
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['orchestration-jobs'],
    queryFn: () => base44.entities.OrchestrationJob.filter({}).limit(100),
    initialData: []
  });

  const createAutomationMutation = useMutation({
    mutationFn: async (config) => {
      const response = await base44.functions.invoke('create-intelligent-automation', config);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['automation-rules']);
      toast.success('Intelligent automation created');
    }
  });

  const executeWorkflowMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('execute-cross-hub-workflow', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orchestration-jobs']);
      toast.success('Workflow executed successfully');
    }
  });

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('optimize-automation-performance', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['automation-rules']);
      toast.success('Automation optimization complete');
    }
  });

  const activeAutomations = automations.filter(a => a.is_active);
  const runningJobs = jobs.filter(j => j.status === 'running');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const successRate = jobs.length > 0 
    ? (completedJobs.length / jobs.length * 100).toFixed(1)
    : 0;

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="w-10 h-10 text-yellow-400" />
            Automation Orchestration Hub
          </h1>
          <p className="text-slate-400">AI-powered workflow automation and intelligent orchestration</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => optimizeMutation.mutate()}
            disabled={optimizeMutation.isPending}
            className="bg-gradient-to-r from-yellow-600 to-orange-600"
          >
            <TrendingUp className={`w-4 h-4 mr-2 ${optimizeMutation.isPending ? 'animate-spin' : ''}`} />
            Optimize All
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-slate-400 text-xs">Active Automations</p>
                  <p className="text-white text-2xl font-bold">{activeAutomations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Workflow className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-xs">Workflow Templates</p>
                  <p className="text-white text-2xl font-bold">{workflows.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Play className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-slate-400 text-xs">Running Jobs</p>
                  <p className="text-white text-2xl font-bold">{runningJobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-xs">Success Rate</p>
                  <p className="text-white text-2xl font-bold">{successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="network" className="space-y-6">
          <TabsList className="bg-slate-900/60">
            <TabsTrigger value="network">Automation Network</TabsTrigger>
            <TabsTrigger value="workflows">Workflow Visualizer</TabsTrigger>
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="builder">AI Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="network">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Automation Network Topology</CardTitle>
                <p className="text-slate-400 text-sm">
                  Visualize automation dependencies and execution flows
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <AutomationNetwork3D automations={automations} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Interactive Workflow Designer</CardTitle>
                <p className="text-slate-400 text-sm">
                  Design and execute multi-step workflows across hubs
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <WorkflowVisualizer3D 
                    workflows={workflows}
                    onExecute={(workflow) => executeWorkflowMutation.mutate({
                      workflow_id: workflow.id,
                      input_data: {}
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Orchestration Performance Metrics</CardTitle>
                <p className="text-slate-400 text-sm">
                  Real-time monitoring of automation efficiency
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <OrchestrationMetrics3D jobs={jobs} automations={automations} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder">
            <IntelligentAutomationBuilder
              onCreateAutomation={(config) => createAutomationMutation.mutate(config)}
              isCreating={createAutomationMutation.isPending}
              existingAutomations={automations}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}