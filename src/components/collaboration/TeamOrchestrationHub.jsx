import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Play, Pause, Trash2, GitBranch, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TeamOrchestrationHub() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const queryClient = useQueryClient();

  const { data: workflows } = useQuery({
    queryKey: ['team-orchestrations'],
    queryFn: () => base44.entities.TeamOrchestration.list()
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list()
  });

  const createWorkflow = useMutation({
    mutationFn: (data) => base44.entities.TeamOrchestration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-orchestrations'] });
      toast.success('Workflow created');
      setShowBuilder(false);
    }
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.TeamOrchestration.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-orchestrations'] });
      toast.success('Status updated');
    }
  });

  const deleteWorkflow = useMutation({
    mutationFn: (id) => base44.entities.TeamOrchestration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-orchestrations'] });
      toast.success('Workflow deleted');
    }
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-blue-500/30">
          <CardContent className="p-4">
            <Users className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{workflows?.length || 0}</p>
            <p className="text-sm text-gray-600">Active Workflows</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-green-500/30">
          <CardContent className="p-4">
            <GitBranch className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{agents?.length || 0}</p>
            <p className="text-sm text-gray-600">Team Agents</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-purple-500/30">
          <CardContent className="p-4">
            <Zap className="w-8 h-8 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">
              {workflows?.reduce((sum, w) => sum + (w.execution_count || 0), 0) || 0}
            </p>
            <p className="text-sm text-gray-600">Total Executions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-700/10 border-orange-500/30">
          <CardContent className="p-4">
            <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-2xl font-bold">94%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              Team Workflows
            </CardTitle>
            <Button onClick={() => setShowBuilder(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {workflows?.map((workflow) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{workflow.name}</h3>
                    <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{workflow.team_agents?.length || 0} agents</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4" />
                      <span>{workflow.workflow_nodes?.length || 0} nodes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span>{workflow.execution_count || 0} runs</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    Edit
                  </Button>
                  {workflow.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus.mutate({ id: workflow.id, status: 'paused' })}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus.mutate({ id: workflow.id, status: 'active' })}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteWorkflow.mutate(workflow.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {workflows?.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No workflows yet</p>
              <Button className="mt-3" onClick={() => setShowBuilder(true)}>
                Create your first workflow
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Builder */}
      {(showBuilder || selectedWorkflow) && (
        <WorkflowBuilder
          workflow={selectedWorkflow}
          agents={agents}
          onSave={(data) => {
            if (selectedWorkflow) {
              base44.entities.TeamOrchestration.update(selectedWorkflow.id, data)
                .then(() => {
                  queryClient.invalidateQueries({ queryKey: ['team-orchestrations'] });
                  setSelectedWorkflow(null);
                  toast.success('Workflow updated');
                });
            } else {
              createWorkflow.mutate(data);
            }
          }}
          onCancel={() => {
            setShowBuilder(false);
            setSelectedWorkflow(null);
          }}
        />
      )}
    </div>
  );
}

function WorkflowBuilder({ workflow, agents, onSave, onCancel }) {
  const [formData, setFormData] = useState(workflow || {
    name: '',
    description: '',
    team_agents: [],
    workflow_nodes: [],
    delegation_rules: [],
    communication_protocol: {}
  });

  const [selectedAgents, setSelectedAgents] = useState(workflow?.team_agents || []);

  const handleSubmit = () => {
    if (!formData.name || selectedAgents.length === 0) {
      toast.error('Name and at least one agent required');
      return;
    }
    onSave({ ...formData, team_agents: selectedAgents });
  };

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <CardTitle>
          {workflow ? 'Edit Workflow' : 'Create New Workflow'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Workflow name"
        />

        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description"
        />

        <div>
          <label className="text-sm font-semibold mb-2 block">Select Team Agents</label>
          <div className="grid grid-cols-2 gap-2">
            {agents?.map((agent) => {
              const isSelected = selectedAgents.includes(agent.id);
              return (
                <Button
                  key={agent.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedAgents(selectedAgents.filter(id => id !== agent.id));
                    } else {
                      setSelectedAgents([...selectedAgents, agent.id]);
                    }
                  }}
                >
                  {agent.name}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="flex-1">
            {workflow ? 'Update' : 'Create'} Workflow
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}