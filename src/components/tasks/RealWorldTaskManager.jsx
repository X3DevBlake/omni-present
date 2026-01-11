import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RealWorldTaskManager({ agentId, userEmail }) {
  const [taskDesc, setTaskDesc] = useState('');
  const [taskType, setTaskType] = useState('booking');
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['realWorldTasks', agentId],
    queryFn: () => agentId ? base44.entities.RealWorldTask.filter({ agent_id: agentId }).catch(() => []) : []
  });

  const createTask = useMutation({
    mutationFn: async () => {
      return await base44.entities.RealWorldTask.create({
        user_email: userEmail,
        agent_id: agentId,
        task_type: taskType,
        task_details: { description: taskDesc },
        execution_plan: [{ step: 'Planning', status: 'pending' }],
        status: 'planning'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realWorldTasks', agentId] });
      setTaskDesc('');
    }
  });

  const approveTask = useMutation({
    mutationFn: async (taskId) => {
      return await base44.entities.RealWorldTask.update(taskId, {
        user_approval: true,
        status: 'approved'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realWorldTasks', agentId] });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-6 h-6 text-orange-400" />
        <h3 className="text-white font-bold text-xl">Real-World Task Manager</h3>
      </div>

      <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-4 space-y-3">
        <Select value={taskType} onValueChange={setTaskType}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="booking">Booking Services</SelectItem>
            <SelectItem value="iot_control">IoT Device Control</SelectItem>
            <SelectItem value="logistics">Logistics Operations</SelectItem>
            <SelectItem value="purchase">Purchase Management</SelectItem>
            <SelectItem value="scheduling">Scheduling</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Describe the task..."
          value={taskDesc}
          onChange={(e) => setTaskDesc(e.target.value)}
          className="bg-white/5 border-white/10"
        />

        <Button
          onClick={() => createTask.mutate()}
          disabled={!taskDesc || createTask.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          Create Task
        </Button>
      </div>

      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <motion.div
            key={task.id || idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 border border-white/10 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="text-white font-bold capitalize">{task.task_type.replace(/_/g, ' ')}</p>
                <p className="text-white/60 text-sm">{task.task_details?.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {task.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-400" />}
                {task.status === 'executing' && <Clock className="w-5 h-5 text-blue-400 animate-spin" />}
                {task.status === 'planning' && <AlertCircle className="w-5 h-5 text-yellow-400" />}
              </div>
            </div>

            {task.cost && (
              <p className="text-white/50 text-xs mb-2">Estimated cost: ${task.cost}</p>
            )}

            {!task.user_approval && task.status === 'planning' && (
              <Button
                onClick={() => approveTask.mutate(task.id)}
                size="sm"
                className="bg-green-500 hover:bg-green-600"
              >
                Approve & Execute
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}