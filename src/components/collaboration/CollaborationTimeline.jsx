import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CollaborationTimeline({ tasks, dependencies }) {
  const getTaskStatus = (task) => {
    if (task.status === 'completed') return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' };
    if (task.status === 'in_progress') return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (task.status === 'blocked') return { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20' };
    return { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-500/20' };
  };

  const sortedTasks = [...(tasks || [])].sort((a, b) => {
    const order = { completed: 0, in_progress: 1, pending: 2, blocked: 3 };
    return (order[a.status] || 2) - (order[b.status] || 2);
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-cyan-500" />

        {/* Tasks */}
        {sortedTasks.map((task, index) => {
          const status = getTaskStatus(task);
          const Icon = status.icon;

          return (
            <motion.div
              key={task.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-16 pb-8"
            >
              {/* Timeline node */}
              <div className={`absolute left-3 top-3 w-6 h-6 rounded-full ${status.bg} border-2 border-white/20 flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${status.color}`} />
              </div>

              <Card className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{task.task_name || task.name}</h4>
                      <p className="text-white/60 text-sm">{task.description}</p>
                    </div>
                    <Badge className={
                      task.priority === 'critical' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }>
                      {task.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    {task.assigned_agent_id && (
                      <div className="flex items-center gap-1">
                        <span className="text-white/60">Assigned:</span>
                        <span className="text-cyan-400">Agent {task.assigned_agent_id.slice(-6)}</span>
                      </div>
                    )}
                    
                    {task.dependencies?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-white/60">Dependencies:</span>
                        <Badge className="bg-purple-500/30 text-purple-200">{task.dependencies.length}</Badge>
                      </div>
                    )}

                    {task.estimated_duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/60" />
                        <span className="text-white/60">{task.estimated_duration}h</span>
                      </div>
                    )}
                  </div>

                  {task.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/60 text-xs">Progress</span>
                        <span className="text-purple-400 text-xs font-bold">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-pink-400 h-1.5 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}