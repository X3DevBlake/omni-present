import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Workflow, Play, Loader2, CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';

export default function ComplexTaskOrchestrator({ agents = [], devices = [] }) {
  const queryClient = useQueryClient();
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [executionPlan, setExecutionPlan] = useState(null);

  const { data: orchestrationJobs = [] } = useQuery({
    queryKey: ['orchestration-jobs'],
    queryFn: () => base44.entities.OrchestrationJob.list('-created_date', 10),
    initialData: []
  });

  const orchestrateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('orchestrate-complex-task', {
        task_description: taskDescription,
        agent_ids: selectedAgents,
        available_devices: devices,
        context: {
          time_of_day: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
          user_present: true
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      setExecutionPlan(data.execution_plan);
      toast.success(data.verbal_response || 'Task orchestration complete!');
      queryClient.invalidateQueries(['orchestration-jobs']);
    }
  });

  const toggleAgent = (agentId) => {
    setSelectedAgents(prev =>
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  };

  const quickTasks = [
    "Prepare the living room for a movie night - dim lights, set temperature to 70°F, and close the blinds",
    "Wake up routine - gradually brighten bedroom lights, set thermostat to 72°F, and unlock the front door",
    "Security check - verify all doors are locked, turn on outdoor lights, and arm motion sensors",
    "Energy saving mode - turn off all non-essential lights and reduce thermostat by 3 degrees",
    "Guest arrival - unlock front door, turn on entry lights, and set living room to comfortable temperature"
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Workflow className="w-5 h-5 text-indigo-400" />
            Complex Task Orchestrator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-slate-400 text-sm mb-2">Select Agents ({selectedAgents.length} selected)</p>
            <div className="flex flex-wrap gap-2">
              {agents.map(agent => (
                <Button
                  key={agent.id}
                  size="sm"
                  variant={selectedAgents.includes(agent.agent_id || agent.id) ? 'default' : 'outline'}
                  onClick={() => toggleAgent(agent.agent_id || agent.id)}
                  className={selectedAgents.includes(agent.agent_id || agent.id) ? 'bg-indigo-600' : ''}
                >
                  {agent.agent_id?.slice(0, 8) || `Agent ${agent.id?.slice(0, 6)}`}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-slate-400 text-sm mb-2">Task Description</p>
            <Textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe the complex task you want agents to perform..."
              className="bg-slate-800 border-slate-600 text-white min-h-[80px]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {quickTasks.map((task, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => setTaskDescription(task)}
                className="text-xs bg-slate-800/50"
              >
                {task.slice(0, 40)}...
              </Button>
            ))}
          </div>

          <Button
            onClick={() => orchestrateMutation.mutate()}
            disabled={orchestrateMutation.isPending || !taskDescription || selectedAgents.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {orchestrateMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Planning Execution</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Orchestrate Task</>
            )}
          </Button>
        </CardContent>
      </Card>

      {executionPlan && (
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Execution Plan: {executionPlan.task_name}
              <Badge className="bg-indigo-500/20 text-indigo-400">
                ~{((executionPlan.total_estimated_time_ms || 0) / 1000).toFixed(0)}s
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Agent coordination */}
            {executionPlan.agent_coordination && (
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">Agent Coordination</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Lead: {executionPlan.agent_coordination.lead_agent?.slice(0, 8)} • 
                  Protocol: {executionPlan.agent_coordination.communication_protocol}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {executionPlan.agent_coordination.role_assignments?.map((ra, idx) => (
                    <Badge key={idx} className="bg-slate-700">
                      {ra.agent_id?.slice(0, 6)}: {ra.role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Execution phases */}
            <div className="space-y-3">
              {executionPlan.execution_phases?.map((phase, phaseIdx) => (
                <div key={phase.phase_id || phaseIdx} className="bg-slate-800/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{phase.phase_name}</span>
                    <Badge className={phase.execution_type === 'parallel' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}>
                      {phase.execution_type}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {phase.steps?.map((step, stepIdx) => (
                      <div key={step.step_id || stepIdx} className="bg-slate-800/50 rounded p-2 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white text-sm">{step.step_name}</p>
                          <p className="text-slate-400 text-xs">
                            Device: {step.target_device_id?.slice(0, 8)} • Command: {step.device_command}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {step.requires_human_approval && (
                            <Badge className="bg-yellow-500/20 text-yellow-400">
                              <AlertTriangle className="w-3 h-3 mr-1" /> Approval
                            </Badge>
                          )}
                          <Badge className="bg-slate-700">
                            <Clock className="w-3 h-3 mr-1" /> {step.timeout_ms}ms
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Expected outcome */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-400 text-sm">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                {executionPlan.expected_outcome}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent orchestration jobs */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Recent Orchestrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orchestrationJobs.slice(0, 5).map((job, idx) => (
              <div key={job.id || idx} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-white">{job.job_name}</p>
                  <p className="text-slate-400 text-xs">
                    {job.total_steps} steps • {job.job_type}
                  </p>
                </div>
                <Badge className={
                  job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  job.status === 'running' ? 'bg-cyan-500/20 text-cyan-400' :
                  job.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-700 text-slate-400'
                }>
                  {job.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}