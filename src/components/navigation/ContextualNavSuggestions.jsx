import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, TrendingUp, AlertCircle, Target } from 'lucide-react';

export default function ContextualNavSuggestions() {
  const [suggestions, setSuggestions] = useState([]);

  const { data: alerts } = useQuery({
    queryKey: ['contextual-alerts'],
    queryFn: async () => {
      const alerts = await base44.entities.ProactiveAlert.filter({ status: 'active' });
      return alerts;
    },
    refetchInterval: 10000,
  });

  const { data: goals } = useQuery({
    queryKey: ['contextual-goals'],
    queryFn: async () => {
      const goals = await base44.entities.CollaborationTask.filter({ 
        status: 'in_progress',
        task_type: 'emergent_goal'
      });
      return goals;
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    const newSuggestions = [];
    const currentPath = window.location.pathname;

    // Check for alerts
    if (alerts && alerts.length > 0) {
      newSuggestions.push({
        id: 'alerts',
        icon: AlertCircle,
        title: `${alerts.length} Active Alerts`,
        description: 'Performance issues detected',
        path: '/AutonomousAgentSystem',
        color: 'red',
        priority: 10,
      });
    }

    // Check for active goals
    if (goals && goals.length > 0) {
      const lowProgress = goals.filter(g => (g.progress_percentage || 0) < 50);
      if (lowProgress.length > 0) {
        newSuggestions.push({
          id: 'goals',
          icon: Target,
          title: 'Goals Need Attention',
          description: `${lowProgress.length} goals below 50% progress`,
          path: '/AgentOrchestrationHub',
          color: 'orange',
          priority: 8,
        });
      }
    }

    // Context-based suggestions
    if (currentPath.includes('AI')) {
      newSuggestions.push({
        id: 'lifecycle',
        icon: TrendingUp,
        title: 'Model Lifecycle',
        description: 'Monitor deployed models',
        path: '/AILabsLifecycle',
        color: 'cyan',
        priority: 5,
      });
    }

    setSuggestions(newSuggestions.sort((a, b) => b.priority - a.priority).slice(0, 3));
  }, [alerts, goals]);

  if (suggestions.length === 0) return null;

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 space-y-2">
      <AnimatePresence>
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl(suggestion.path)}>
                <div className={`bg-${suggestion.color}-500/20 backdrop-blur-sm border border-${suggestion.color}-500/50 rounded-lg p-3 cursor-pointer hover:bg-${suggestion.color}-500/30 transition-all max-w-xs`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 text-${suggestion.color}-400 mt-0.5`} />
                    <div>
                      <h4 className="text-white font-medium text-sm mb-1">{suggestion.title}</h4>
                      <p className={`text-${suggestion.color}-200 text-xs`}>{suggestion.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}