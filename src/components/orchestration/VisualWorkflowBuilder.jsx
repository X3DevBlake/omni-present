import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Play, Save, Trash2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import WorkflowVisualizer3D from './WorkflowVisualizer3D';

export default function VisualWorkflowBuilder() {
  const queryClient = useQueryClient();
  const [workflowName, setWorkflowName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const { data: workflows } = useQuery({
    queryKey: ['agent-workflows'],
    queryFn: async () => {
      const workflows = await base44.entities.Workflow.list('-created_date');
      return workflows;
    },
  });

  const { data: agents } = useQuery({
    queryKey: ['available-agents-workflow'],
    queryFn: async () => {
      const agents = await base44.entities.Agent.list();
      return agents;
    },
  });

  const createWorkflow = useMutation({
    mutationFn: async (workflow) => {
      const result = await base44.entities.Workflow.create({
        name: workflow.name,
        tasks: workflow.tasks,
        status: 'draft',
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-workflows'] });
      setWorkflowName('');
      setTasks([]);
    },
  });

  const executeWorkflow = useMutation({
    mutationFn: async (workflowId) => {
      const response = await base44.functions.invoke('executeAgentWorkflow', {
        workflow_id: workflowId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
    },
  });

  const addTask = () => {
    setTasks([...tasks, {
      id: Date.now().toString(),
      name: '',
      agent_id: '',
      dependencies: [],
      priority: 'medium',
    }]);
  };

  const updateTask = (id, field, value) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleSave = () => {
    if (!workflowName || tasks.length === 0) {
      alert('Please provide a workflow name and at least one task');
      return;
    }
    createWorkflow.mutate({ name: workflowName, tasks });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Task Builder */}
      <div className="space-y-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Create Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow Name"
              className="bg-white/5 border-white/10 text-white"
            />

            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Task {index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTask(task.id)}
                    className="text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <Input
                    value={task.name}
                    onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                    placeholder="Task name"
                    className="bg-white/5 border-white/10 text-white text-sm"
                  />

                  <Select value={task.agent_id} onValueChange={(val) => updateTask(task.id, 'agent_id', val)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Assign Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents?.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name} - {agent.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {index > 0 && (
                    <Select value={task.dependencies?.[0]} onValueChange={(val) => updateTask(task.id, 'dependencies', [val])}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Depends on (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {tasks.slice(0, index).map(t => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name || `Task ${tasks.indexOf(t) + 1}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </motion.div>
            ))}

            <Button onClick={addTask} variant="outline" className="w-full border-white/10">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>

            <Button onClick={handleSave} className="w-full bg-cyan-600 hover:bg-cyan-700">
              <Save className="w-4 h-4 mr-2" />
              Save Workflow
            </Button>
          </CardContent>
        </Card>

        {/* Saved Workflows */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Saved Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workflows?.map(workflow => (
                <div key={workflow.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{workflow.name}</h4>
                      <p className="text-white/60 text-xs">{workflow.tasks?.length || 0} tasks</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => executeWorkflow.mutate(workflow.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Execute
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Visualizer */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Workflow Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowVisualizer3D tasks={tasks} />
        </CardContent>
      </Card>
    </div>
  );
}