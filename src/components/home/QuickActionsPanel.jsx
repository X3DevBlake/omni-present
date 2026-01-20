import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Zap, Users, Shield, BarChart3, Boxes } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function QuickActionsPanel() {
  const actions = [
    { icon: Plus, label: 'Create Agent', page: 'AgentCustomization', color: 'from-purple-600 to-pink-600' },
    { icon: Zap, label: 'Train Model', page: 'NextGenMLHub', color: 'from-cyan-600 to-blue-600' },
    { icon: Users, label: 'Start Collaboration', page: 'CollaborationOrchestrationHub', color: 'from-pink-600 to-purple-600' },
    { icon: Shield, label: 'Security Scan', page: 'SecurityComplianceHub', color: 'from-red-600 to-orange-600' },
    { icon: BarChart3, label: 'View Analytics', page: 'AnalyticsIntelligenceHub', color: 'from-green-600 to-emerald-600' },
    { icon: Boxes, label: 'Run Simulation', page: 'SimulationHub', color: 'from-blue-600 to-indigo-600' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white flex items-center gap-2">
        <Zap className="w-6 h-6 text-yellow-400" />
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to={createPageUrl(action.page)}>
              <Card className={`bg-gradient-to-br ${action.color} border-0 cursor-pointer hover:shadow-2xl transition-all h-full`}>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                  <action.icon className="w-8 h-8 text-white" />
                  <span className="text-white text-sm font-semibold">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}