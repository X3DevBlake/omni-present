import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, Clock, AlertCircle, Play, Pause } from 'lucide-react';

export default function AutonomousGeminiDashboard({ userEmail }) {
  const queryClient = useQueryClient();

  const { data: decisions } = useQuery({
    queryKey: ['geminiDecisions', userEmail],
    queryFn: () => base44.entities.GeminiDecision.filter({ user_email: userEmail }),
    initialData: []
  });

  const { data: tasks } = useQuery({
    queryKey: ['geminiTasks', userEmail],
    queryFn: () => base44.entities.GeminiTask.filter({ user_email: userEmail }),
    initialData: []
  });

  const { data: interactions } = useQuery({
    queryKey: ['autonomousInteractions', userEmail],
    queryFn: () => base44.entities.GeminiInteraction.filter({ user_email: userEmail, autonomous: true }),
    initialData: []
  });

  const triggerAutonomous = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/autonomous-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze_and_decide', parameters: {} })
      });

      if (!response.ok) throw new Error('Failed to trigger autonomous mode');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geminiDecisions'] });
      queryClient.invalidateQueries({ queryKey: ['autonomousInteractions'] });
    }
  });

  const executeTask = useMutation({
    mutationFn: async (taskId) => {
      const response = await fetch('/api/functions/task-executor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });

      if (!response.ok) throw new Error('Failed to execute task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geminiTasks'] });
    }
  });

  const pendingTasks = tasks.filter(t => t.status === 'queued' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const recentDecisions = decisions.slice(0, 5);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">Autonomous Gemini Agent</h3>
              <p className="text-white/60 text-sm">AI-driven decision making & task execution</p>
            </div>
          </div>
          <Button
            onClick={() => triggerAutonomous.mutate()}
            disabled={triggerAutonomous.isPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {triggerAutonomous.isPending ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Trigger Autonomous Mode
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-white/60 text-xs mb-1">Total Decisions</p>
            <p className="text-white text-2xl font-bold">{decisions.length}</p>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-white/60 text-xs mb-1">Pending Tasks</p>
            <p className="text-white text-2xl font-bold">{pendingTasks.length}</p>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-white/60 text-xs mb-1">Completed</p>
            <p className="text-white text-2xl font-bold">{completedTasks.length}</p>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-white/60 text-xs mb-1">Autonomous Actions</p>
            <p className="text-white text-2xl font-bold">{interactions.length}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
          <h4 className="text-white font-bold mb-4">Recent Decisions</h4>
          <div className="space-y-3">
            {recentDecisions.map((decision) => (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 rounded-lg p-3"
              >
                <p className="text-white font-bold text-sm">{decision.decision_context}</p>
                <p className="text-white/60 text-xs mt-1 line-clamp-2">{decision.decision_made}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${decision.executed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {decision.executed ? 'Executed' : 'Pending'}
                  </span>
                  <span className="text-white/40 text-xs">{decision.confidence_score}% confidence</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
          <h4 className="text-white font-bold mb-4">Active Tasks</h4>
          <div className="space-y-3">
            {pendingTasks.slice(0, 5).map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/5 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white font-bold text-sm">{task.task_name}</p>
                  {task.status === 'queued' && (
                    <Button
                      size="sm"
                      onClick={() => executeTask.mutate(task.id)}
                      className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                    >
                      Execute
                    </Button>
                  )}
                </div>
                <p className="text-white/60 text-xs mb-2">{task.task_description}</p>
                <div className="flex items-center gap-2">
                  {task.status === 'queued' && <Clock className="w-3 h-3 text-yellow-400" />}
                  {task.status === 'in_progress' && <AlertCircle className="w-3 h-3 text-blue-400 animate-spin" />}
                  {task.status === 'completed' && <CheckCircle className="w-3 h-3 text-green-400" />}
                  <span className="text-white/40 text-xs capitalize">{task.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}