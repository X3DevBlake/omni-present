import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Workflow, Play, Users, Activity, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import WorkflowVisualizer3D from '../components/workflow/WorkflowVisualizer3D';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WorkflowOrchestrationHub() {
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const { data: workflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list(),
  });

  const { data: executions } = useQuery({
    queryKey: ['workflow-executions'],
    queryFn: () => base44.entities.WorkflowExecution.list('-created_date', 20),
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const executeWorkflow = useMutation({
    mutationFn: async (workflowId) => {
      const response = await base44.functions.invoke('executeAgentWorkflow', {
        workflow_id: workflowId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions', 'workflows'] });
    },
  });

  const assignTask = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('assignTaskToAgent', params);
      return response.data;
    },
  });

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Workflow Orchestration Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Manage complex agent workflows with dynamic task delegation
          </p>
        </motion.div>

        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/30 p-1">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="visualizer">3D Visualizer</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflows?.map((workflow, i) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card 
                    className={`bg-white/5 border cursor-pointer transition-all ${
                      selectedWorkflow?.id === workflow.id 
                        ? 'border-cyan-500 bg-cyan-500/10' 
                        : 'border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-bold text-xl mb-1">{workflow.workflow_name}</h3>
                          <p className="text-white/60 text-sm">{workflow.description}</p>
                        </div>
                        <Badge className={`${
                          workflow.status === 'active' ? 'bg-green-500' :
                          workflow.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                        } text-white border-0`}>
                          {workflow.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60 text-xs">Type</div>
                          <div className="text-white font-medium text-sm capitalize">{workflow.workflow_type}</div>
                        </div>
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60 text-xs">Tasks</div>
                          <div className="text-white font-medium text-sm">{workflow.tasks?.length || 0}</div>
                        </div>
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60 text-xs">Progress</div>
                          <div className="text-cyan-400 font-medium text-sm">{workflow.progress_percentage || 0}%</div>
                        </div>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          executeWorkflow.mutate(workflow.id);
                        }}
                        disabled={workflow.status === 'active' || executeWorkflow.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Execute Workflow
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="visualizer">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Workflow Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkflowVisualizer3D workflow={selectedWorkflow} agents={agents} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="executions">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Recent Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {executions?.map((exec, i) => (
                    <motion.div
                      key={exec.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge>{exec.workflow_id?.slice(0, 8)}</Badge>
                        <Badge className={`${
                          exec.execution_status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          exec.execution_status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-red-500/20 text-red-400'
                        } border-0`}>
                          {exec.execution_status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60 text-xs">Completed</div>
                          <div className="text-green-400 font-bold">{exec.completed_tasks?.length || 0}</div>
                        </div>
                        <div className="bg-black/30 rounded p-2">
                          <div className="text-white/60 text-xs">Failed</div>
                          <div className="text-red-400 font-bold">{exec.failed_tasks?.length || 0}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}