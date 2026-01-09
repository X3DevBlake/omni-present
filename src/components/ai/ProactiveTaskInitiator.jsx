import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ProactiveTaskInitiator({ agentId = 'agent-1' }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedActions, setSuggestedActions] = useState([]);

  useEffect(() => {
    analyzePatternsAndSuggestTasks();
  }, [agentId]);

  const analyzePatternsAndSuggestTasks = async () => {
    try {
      const suggestions = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on typical user financial patterns, suggest 3 proactive tasks for agent ${agentId}. 
        Consider: frequent transactions, spending patterns, portfolio rebalancing needs, upcoming bills.
        Return JSON with tasks array containing {title, description, priority, estimatedTime}`,
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
                  estimatedTime: { type: 'string' }
                }
              }
            }
          }
        }
      });
      setSuggestedActions(suggestions.tasks || []);
    } catch (err) {
      console.error('Failed to analyze patterns:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeTask = async (task) => {
    try {
      toast.loading(`Executing: ${task.title}`);
      // Simulate task execution
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTasks(prev => [...prev, { ...task, status: 'completed', timestamp: new Date() }]);
      toast.success(`✓ ${task.title} completed`);
    } catch (err) {
      toast.error('Task failed');
    }
  };

  return (
    <div className="bg-black/40 border border-blue-500/30 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-bold flex items-center gap-2">
        <Zap className="w-5 h-5 text-blue-400" />
        Proactive Task Execution
      </h3>

      {loading ? (
        <div className="text-white/40 text-sm">Analyzing patterns...</div>
      ) : suggestedActions.length === 0 ? (
        <div className="text-white/40 text-sm">No suggested tasks</div>
      ) : (
        <div className="space-y-2">
          {suggestedActions.map((task, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-blue-500/20 rounded-lg p-3 flex items-start justify-between"
            >
              <div className="flex-1">
                <p className="text-white font-bold text-sm">{task.title}</p>
                <p className="text-white/60 text-xs">{task.description}</p>
                <div className="flex gap-2 mt-1 text-xs">
                  <span className={`px-2 py-0.5 rounded ${
                    task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                    task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-white/50 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {task.estimatedTime}
                  </span>
                </div>
              </div>
              <motion.button
                onClick={() => executeTask(task)}
                whileHover={{ scale: 1.05 }}
                className="ml-2 px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded text-xs font-medium"
              >
                Execute
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="border-t border-white/10 pt-3">
          <p className="text-white/70 text-xs font-bold mb-2">Completed Tasks: {tasks.length}</p>
          <div className="space-y-1">
            {tasks.slice(-3).map((task, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}