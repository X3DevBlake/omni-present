import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Users, AlertTriangle, Clock, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AITaskManager({ blueprint, changes, issues }) {
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const queryClient = useQueryClient();

  const { data: tasks } = useQuery({
    queryKey: ['ai-tasks', blueprint?.id],
    queryFn: async () => {
      const allAnnotations = await base44.entities.Annotation.list('-created_date');
      return allAnnotations.filter(a => a.blueprint_id === blueprint?.id && a.type === 'task');
    },
    enabled: !!blueprint?.id
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData) => base44.entities.Annotation.create(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-tasks'] });
      toast.success('Task created');
    }
  });

  useEffect(() => {
    if (changes || issues) generateTaskSuggestions();
  }, [changes, issues]);

  const generateTaskSuggestions = async () => {
    try {
      const prompt = `
        Analyze changes and issues to suggest tasks:
        
        Changes: ${JSON.stringify(changes)}
        Issues: ${JSON.stringify(issues)}
        
        Suggest:
        1. Task assignments based on component expertise
        2. Priority levels (critical, high, medium, low)
        3. Estimated effort and dependencies
      `;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            tasks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  priority: { type: 'string' },
                  suggestedAssignee: { type: 'string' },
                  estimatedHours: { type: 'number' },
                  linkedComponent: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setSuggestedTasks(result.tasks || []);
    } catch (error) {
      console.error('Task generation failed:', error);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'critical') return 'text-red-400 bg-red-500/20 border-red-500/40';
    if (priority === 'high') return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
    if (priority === 'medium') return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
    return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">AI Task Manager</h3>
        </div>
      </div>

      {suggestedTasks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-white/80 text-sm font-semibold mb-2">Suggested Tasks</h4>
          <div className="space-y-2">
            {suggestedTasks.map((task, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-medium">{task.title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-white/60 text-xs mb-2">{task.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-white/50 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {task.suggestedAssignee}
                      </span>
                      <span className="text-white/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedHours}h
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    createTaskMutation.mutate({
                      blueprint_id: blueprint.id,
                      content: task.description,
                      type: 'task',
                      assigned_to: task.suggestedAssignee,
                      component_index: task.linkedComponent
                    });
                  }}
                  className="w-full py-1.5 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs"
                >
                  Create Task
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-white/80 text-sm font-semibold">Active Tasks ({tasks?.length || 0})</h4>
        {tasks?.map((task) => (
          <div key={task.id} className="p-2 rounded bg-white/5 text-xs">
            <div className="text-white font-medium mb-1">{task.content}</div>
            {task.assigned_to && (
              <div className="text-white/60">Assigned to: {task.assigned_to}</div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}