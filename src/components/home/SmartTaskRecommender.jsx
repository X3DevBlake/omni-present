import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SmartTaskRecommender({ tasks = [] }) {
  const defaultTasks = [
    {
      id: '1',
      title: 'Review critical security threats',
      priority: 'high',
      estimatedTime: '10 min',
      category: 'Security',
      aiGenerated: true
    },
    {
      id: '2',
      title: 'Analyze new predictive insights',
      priority: 'medium',
      estimatedTime: '5 min',
      category: 'Analytics',
      aiGenerated: true
    },
    {
      id: '3',
      title: 'Form collaboration team for Project X',
      priority: 'medium',
      estimatedTime: '15 min',
      category: 'Collaboration',
      aiGenerated: true
    }
  ];

  const displayTasks = tasks.length > 0 ? tasks : defaultTasks;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-orange-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-6 h-6 text-purple-400" />
        <h3 className="text-2xl font-bold text-white">Recommended Tasks</h3>
      </div>

      <div className="space-y-3">
        {displayTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/15 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-white border-white/20">
                        {task.category}
                      </Badge>
                      {task.aiGenerated && (
                        <Badge className="bg-purple-600 text-xs">AI</Badge>
                      )}
                    </div>
                    
                    <h4 className="text-white font-medium text-sm mb-2">
                      {task.title}
                    </h4>
                    
                    <div className="flex items-center gap-3 text-xs text-white/60">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedTime}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 shrink-0"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}