import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, BarChart2, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function CollaborationTasksPanel({ tasks, groups }) {
  const getStatusIcon = (status) => {
    const icons = {
      planning: <Clock className="w-4 h-4" />,
      in_progress: <BarChart2 className="w-4 h-4" />,
      blocked: <AlertCircle className="w-4 h-4" />,
      completed: <CheckCircle2 className="w-4 h-4" />,
      failed: <AlertCircle className="w-4 h-4" />
    };
    return icons[status] || null;
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-blue-600',
      in_progress: 'bg-yellow-600',
      blocked: 'bg-red-600',
      completed: 'bg-green-600',
      failed: 'bg-red-700'
    };
    return colors[status] || 'bg-slate-600';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-blue-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      critical: 'text-red-400'
    };
    return colors[priority] || 'text-slate-400';
  };

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <p className="text-slate-400">No collaborative tasks yet</p>
          </CardContent>
        </Card>
      ) : (
        tasks.map((task, idx) => (
          <motion.div key={task.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl hover:border-slate-600 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(task.status)}
                      <h3 className="text-lg font-semibold text-white">{task.task_name}</h3>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    <p className="text-slate-400 text-sm">{task.description}</p>
                  </div>
                  <span className={`text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-300 text-sm">Progress</p>
                    <p className="text-white font-semibold">{task.progress_percentage}%</p>
                  </div>
                  <Progress value={task.progress_percentage} className="h-2" />
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-slate-400">Agents</p>
                    <p className="text-white font-semibold">{task.participating_agents?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Insights Shared</p>
                    <p className="text-white font-semibold">{task.shared_insights?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due Date
                    </p>
                    <p className="text-white font-semibold text-xs">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  View Task Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}