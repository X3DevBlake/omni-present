import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import WorkflowAutomation3D from '@/components/workflow/WorkflowAutomation3D';
import { Workflow, Play, CheckCircle, TrendingUp } from 'lucide-react';

export default function EnhancedWorkflowHub() {
  const queryClient = useQueryClient();

  const { data: workflows = [] } = useQuery({
    queryKey: ['automated-workflows'],
    queryFn: () => base44.entities.AutomatedWorkflow.list()
  });

  const executeWorkflowMutation = useMutation({
    mutationFn: async ({ workflow_id, input_data }) => {
      const response = await base44.functions.invoke('executeAutomatedWorkflow', {
        workflow_id,
        input_data
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['automated-workflows']);
    }
  });

  const activeWorkflows = workflows.filter(w => w.is_active).length;
  const totalExecutions = workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0);
  const avgSuccessRate = workflows.length > 0
    ? workflows.reduce((sum, w) => {
        const rate = w.execution_count > 0 ? (w.success_count / w.execution_count) * 100 : 0;
        return sum + rate;
      }, 0) / workflows.length
    : 0;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Workflow className="w-12 h-12 text-cyan-400" />
            Workflow Automation Hub
          </h1>
          <p className="text-xl text-gray-300">
            Orchestrate and automate complex multi-step processes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Workflows</p>
                  <p className="text-3xl font-bold text-white">{activeWorkflows}</p>
                </div>
                <Play className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Executions</p>
                  <p className="text-3xl font-bold text-white">{totalExecutions}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-3xl font-bold text-white">{avgSuccessRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="3d" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
            <TabsTrigger value="3d">3D Workflow View</TabsTrigger>
            <TabsTrigger value="list">Workflow List</TabsTrigger>
          </TabsList>

          <TabsContent value="3d">
            {workflows.length > 0 ? (
              <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
                <CardContent className="p-0 h-full">
                  <WorkflowAutomation3D workflow={workflows[0]} currentStep={0} />
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="pt-6 text-center text-gray-400">
                  No workflows created yet
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{workflow.workflow_name}</h3>
                          <Badge className={workflow.is_active ? 'bg-green-600' : 'bg-gray-600'}>
                            {workflow.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                            {workflow.trigger_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Steps: {workflow.steps?.length || 0}</p>
                          <p>Executions: {workflow.execution_count || 0}</p>
                          <p>Success Rate: {workflow.execution_count > 0 
                            ? ((workflow.success_count / workflow.execution_count) * 100).toFixed(1)
                            : 0}%</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => executeWorkflowMutation.mutate({
                          workflow_id: workflow.id,
                          input_data: {}
                        })}
                        disabled={!workflow.is_active || executeWorkflowMutation.isPending}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        Execute
                      </Button>
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