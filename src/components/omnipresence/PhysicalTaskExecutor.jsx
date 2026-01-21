import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Zap, Package, Thermometer, Lightbulb, Navigation, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const taskTypes = [
  { value: 'fetch_object', label: 'Fetch Object', icon: Package, description: 'Use robotic arm to retrieve items' },
  { value: 'adjust_room_settings', label: 'Adjust Room', icon: Thermometer, description: 'Modify lights, temperature, locks' },
  { value: 'guide_user_physically', label: 'Guide User', icon: Navigation, description: 'Use lights/sounds to guide' },
  { value: 'set_mood_lighting', label: 'Mood Lighting', icon: Lightbulb, description: 'Adjust lights based on emotion' }
];

export default function PhysicalTaskExecutor({ agentId, userContext }) {
  const [selectedTask, setSelectedTask] = useState('');
  const [taskParams, setTaskParams] = useState({});

  const executeTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('execute-complex-physical-task', {
        agent_id: agentId,
        task_type: selectedTask,
        task_parameters: taskParams,
        user_context: userContext
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Task executed with ${data.commands_created} device commands`);
    },
    onError: (error) => {
      toast.error('Task execution failed');
    }
  });

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Physical Task Executor
          </CardTitle>
          <p className="text-slate-400 text-sm">
            Execute complex physical tasks through connected smart devices
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-slate-400 text-sm mb-2 block">Select Task Type</label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Choose a task..." />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((task) => (
                  <SelectItem key={task.value} value={task.value}>
                    <div className="flex items-center gap-2">
                      <task.icon className="w-4 h-4" />
                      {task.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTask && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <p className="text-slate-400 text-sm">
                {taskTypes.find(t => t.value === selectedTask)?.description}
              </p>

              {selectedTask === 'fetch_object' && (
                <Input
                  placeholder="Object to fetch (e.g., remote, book)"
                  className="bg-slate-800 border-slate-600 text-white"
                  onChange={(e) => setTaskParams({ ...taskParams, target_object: e.target.value })}
                />
              )}

              {selectedTask === 'adjust_room_settings' && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Temperature (°F)"
                    type="number"
                    className="bg-slate-800 border-slate-600 text-white"
                    onChange={(e) => setTaskParams({ ...taskParams, temperature: e.target.value })}
                  />
                  <Input
                    placeholder="Brightness (%)"
                    type="number"
                    className="bg-slate-800 border-slate-600 text-white"
                    onChange={(e) => setTaskParams({ ...taskParams, brightness: e.target.value })}
                  />
                </div>
              )}

              {selectedTask === 'guide_user_physically' && (
                <Input
                  placeholder="Destination (e.g., kitchen, bedroom)"
                  className="bg-slate-800 border-slate-600 text-white"
                  onChange={(e) => setTaskParams({ ...taskParams, destination: e.target.value })}
                />
              )}

              <Button
                onClick={() => executeTaskMutation.mutate()}
                disabled={executeTaskMutation.isPending || !selectedTask}
                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
              >
                {executeTaskMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing...</>
                ) : (
                  <><Zap className="w-4 h-4 mr-2" /> Execute Task</>
                )}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Execution Result */}
      {executeTaskMutation.data && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Task Executed Successfully
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Commands Created</p>
                  <p className="text-white font-bold">{executeTaskMutation.data.commands_created}</p>
                </div>
                <div>
                  <p className="text-slate-400">Est. Duration</p>
                  <p className="text-white font-bold">{executeTaskMutation.data.estimated_duration}s</p>
                </div>
              </div>

              {executeTaskMutation.data.execution_plan?.task_steps && (
                <div className="mt-4">
                  <p className="text-slate-400 text-sm mb-2">Execution Steps:</p>
                  <div className="space-y-2">
                    {executeTaskMutation.data.execution_plan.task_steps.slice(0, 4).map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <Badge className="bg-cyan-500/20 text-cyan-400">{idx + 1}</Badge>
                        <span className="text-white">{step.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}