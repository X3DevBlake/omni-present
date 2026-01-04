import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function TaskTracker({ blueprintId }) {
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery({
    queryKey: ['tasks', blueprintId],
    queryFn: () => base44.entities.Annotation.filter({ 
      blueprint_id: blueprintId,
      assigned_to: { $exists: true }
    }),
    enabled: !!blueprintId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, resolved }) => {
      return base44.entities.Annotation.update(taskId, { resolved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task status updated');
    },
  });

  const getStatusColor = (task) => {
    if (task.resolved) return 'text-green-400 border-green-500/30 bg-green-500/10';
    if (task.due_date && new Date(task.due_date) < new Date()) return 'text-red-400 border-red-500/30 bg-red-500/10';
    return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
  };

  const getStatusIcon = (task) => {
    if (task.resolved) return CheckCircle;
    if (task.due_date && new Date(task.due_date) < new Date()) return Clock;
    return Circle;
  };

  if (!tasks?.length) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span className="text-white text-sm font-medium">Task Tracker</span>
          <span className="ml-auto text-cyan-400 text-xs">
            {tasks.filter(t => t.resolved).length}/{tasks.length}
          </span>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {tasks.map((task) => {
            const StatusIcon = getStatusIcon(task);
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2 rounded-lg border ${getStatusColor(task)}`}
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => updateStatusMutation.mutate({ 
                      taskId: task.id, 
                      resolved: !task.resolved 
                    })}
                    className="mt-0.5"
                  >
                    <StatusIcon className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs ${task.resolved ? 'line-through opacity-60' : ''}`}>
                      {task.content}
                    </div>
                    {task.assigned_to && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] opacity-60">
                        <User className="w-3 h-3" />
                        {task.assigned_to}
                      </div>
                    )}
                    {task.due_date && (
                      <div className="text-[10px] opacity-60 mt-1">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}