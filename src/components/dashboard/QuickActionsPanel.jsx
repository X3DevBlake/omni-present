import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Play, Settings, Zap, Users, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function QuickActionsPanel() {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: Plus, 
      label: 'Create Agent', 
      color: 'bg-blue-500 hover:bg-blue-600',
      page: 'AgentManagement'
    },
    { 
      icon: Play, 
      label: 'Run Workflow', 
      color: 'bg-purple-500 hover:bg-purple-600',
      page: 'WorkflowAutomationHub'
    },
    { 
      icon: Users, 
      label: 'Team Collab', 
      color: 'bg-green-500 hover:bg-green-600',
      page: 'EnhancedCollaborationHub'
    },
    { 
      icon: BarChart, 
      label: 'View Analytics', 
      color: 'bg-orange-500 hover:bg-orange-600',
      page: 'Analytics'
    },
    { 
      icon: Zap, 
      label: 'Optimize', 
      color: 'bg-yellow-500 hover:bg-yellow-600',
      page: 'AgentPerformanceDashboard'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      color: 'bg-gray-500 hover:bg-gray-600',
      page: 'Settings'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Button
                onClick={() => navigate(createPageUrl(action.page))}
                className={`w-full ${action.color} text-white flex flex-col items-center gap-2 h-auto py-4`}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-xs">{action.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}