import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Play, Plus, Trash2, Zap, Settings, Eye, Bot, Webhook, Calendar, AlertTriangle, ArrowRightLeft, Layers, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import AIWorkflowAnalyzer from './AIWorkflowAnalyzer';

export default function AutomatedWorkflowBuilder() {
  const [workflowName, setWorkflowName] = useState('');
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const queryClient = useQueryClient();

  const { data: workflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => base44.entities.Workflow.list('-created_date', 50)
  });

  const { data: agents } = useQuery({
    queryKey: ['agents-for-workflow'],
    queryFn: () => base44.entities.Agent.list('-created_date', 100)
  });

  const { data: integrations } = useQuery({
    queryKey: ['integrations-for-workflow'],
    queryFn: () => base44.entities.OAuthConnection.list()
  });

  const generateSuggestions = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this workflow configuration and suggest 5 optimal improvements or automation opportunities:
        
Current nodes: ${JSON.stringify(nodes)}
User activity context: Active agents, integration usage patterns, recent tasks

Provide actionable suggestions for workflow optimization, error handling improvements, and new automation opportunities.`,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string' },
                  implementation: { type: 'string' }
                }
              }
            }
          }
        }
      });
      return result.suggestions;
    },
    onSuccess: (data) => {
      setAiSuggestions(data);
      toast.success('AI suggestions generated!');
    }
  });

  const saveWorkflow = useMutation({
    mutationFn: async () => {
      return await base44.entities.Workflow.create({
        workflow_name: workflowName || 'Untitled Workflow',
        workflow_definition: {
          nodes,
          connections,
          version: '1.0'
        },
        status: 'active',
        trigger_type: 'manual',
        execution_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow saved successfully!');
      setNodes([]);
      setConnections([]);
      setWorkflowName('');
    }
  });

  const executeWorkflow = useMutation({
    mutationFn: async (workflowId) => {
      return await base44.entities.WorkflowExecution.create({
        workflow_id: workflowId,
        status: 'running',
        execution_log: [],
        start_time: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Workflow execution started!');
    }
  });

  const addNode = (type) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      label: `${type} Node`,
      config: {},
      position: { x: Math.random() * 400, y: Math.random() * 300 }
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
  };

  const nodeTypes = [
    { type: 'agent', icon: Bot, label: 'AI Agent', color: 'bg-purple-500' },
    { type: 'webhook', icon: Webhook, label: 'Webhook', color: 'bg-blue-500' },
    { type: 'schedule', icon: Calendar, label: 'Schedule', color: 'bg-green-500' },
    { type: 'integration', icon: Zap, label: 'Integration', color: 'bg-yellow-500' },
    { type: 'condition', icon: AlertTriangle, label: 'Condition', color: 'bg-orange-500' },
    { type: 'loop', icon: ArrowRightLeft, label: 'Loop', color: 'bg-cyan-500' },
    { type: 'parallel', icon: Layers, label: 'Parallel', color: 'bg-indigo-500' },
    { type: 'error_handler', icon: ShieldAlert, label: 'Error Handler', color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600" />
              Automated Workflow Builder
            </span>
            <Button onClick={() => generateSuggestions.mutate()} variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              AI Suggestions
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="builder">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="builder">Visual Builder</TabsTrigger>
              <TabsTrigger value="analyzer">AI Analyzer</TabsTrigger>
              <TabsTrigger value="monitor">Execution Monitor</TabsTrigger>
              <TabsTrigger value="library">Workflow Library</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-4">
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Workflow Name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={() => saveWorkflow.mutate()} disabled={nodes.length === 0}>
                  Save Workflow
                </Button>
              </div>

              {/* Node Palette */}
              <div className="flex gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 mr-2">Add Node:</span>
                {nodeTypes.map(({ type, icon: Icon, label, color }) => (
                  <Button
                    key={type}
                    onClick={() => addNode(type)}
                    size="sm"
                    className={color}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Canvas */}
              <div className="border-2 border-dashed rounded-lg p-6 min-h-[400px] bg-white relative">
                {nodes.length === 0 ? (
                  <div className="text-center text-gray-400 absolute inset-0 flex items-center justify-center">
                    <div>
                      <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Add nodes to start building your workflow</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nodes.map((node, index) => {
                      const nodeType = nodeTypes.find(nt => nt.type === node.type);
                      const Icon = nodeType?.icon || Settings;
                      return (
                        <div
                          key={node.id}
                          className={`p-4 rounded-lg border-2 ${
                            selectedNode?.id === node.id ? 'border-purple-500' : 'border-gray-200'
                          } bg-white cursor-pointer hover:shadow-md transition-shadow`}
                          onClick={() => setSelectedNode(node)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${nodeType?.color} flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold">{node.label}</div>
                                <div className="text-sm text-gray-500">{node.type}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Step {index + 1}</Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNode(node.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AI Suggestions Panel */}
              {aiSuggestions.length > 0 && (
                <Card className="bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-sm">AI Optimization Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="p-3 bg-white rounded border">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-semibold text-sm">{suggestion.title}</span>
                            <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}>
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                          <p className="text-xs text-gray-500">{suggestion.implementation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analyzer">
              <AIWorkflowAnalyzer 
                onCreateWorkflow={(suggestion) => {
                  setWorkflowName(suggestion.workflow_name);
                  toast.success('Workflow template created from AI suggestion!');
                }}
              />
            </TabsContent>

            <TabsContent value="monitor">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Executions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workflows?.slice(0, 5).map(workflow => (
                      <div key={workflow.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-semibold">{workflow.workflow_name}</div>
                          <div className="text-sm text-gray-500">
                            Executed {workflow.execution_count || 0} times
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => executeWorkflow.mutate(workflow.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Execute
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflows?.map(workflow => (
                  <Card key={workflow.id}>
                    <CardHeader>
                      <CardTitle className="text-sm">{workflow.workflow_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Status</span>
                          <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                            {workflow.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Nodes</span>
                          <span className="text-sm font-medium">
                            {workflow.workflow_definition?.nodes?.length || 0}
                          </span>
                        </div>
                        <Button size="sm" className="w-full" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}