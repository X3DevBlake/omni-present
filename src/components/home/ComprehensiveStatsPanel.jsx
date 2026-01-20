import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, Database, Zap, Shield, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComprehensiveStatsPanel() {
  const { data: stats } = useQuery({
    queryKey: ['comprehensive-stats'],
    queryFn: async () => {
      const [agents, models, threats, predictions, collaborations, pipelines] = await Promise.all([
        base44.entities.Agent.list(),
        base44.entities.ModelDeployment.list(),
        base44.entities.ThreatIntelligence.list(),
        base44.entities.PredictiveAnalytics.list(),
        base44.entities.CollaborativeWorkspace.list(),
        base44.entities.DataPipeline.list()
      ]);

      return {
        total_agents: agents.length,
        active_agents: agents.filter(a => a.status === 'active').length,
        total_models: models.length,
        active_threats: threats.filter(t => t.threat_status !== 'resolved').length,
        predictions_generated: predictions.length,
        active_collaborations: collaborations.length,
        pipelines_running: pipelines.filter(p => p.status === 'running').length
      };
    },
    refetchInterval: 10000
  });

  const statCards = [
    { label: 'Active Agents', value: stats?.active_agents || 0, total: stats?.total_agents || 0, icon: Activity, color: 'from-purple-600 to-pink-600' },
    { label: 'Models Deployed', value: stats?.total_models || 0, icon: Database, color: 'from-cyan-600 to-blue-600' },
    { label: 'Active Threats', value: stats?.active_threats || 0, icon: Shield, color: 'from-red-600 to-orange-600' },
    { label: 'Predictions', value: stats?.predictions_generated || 0, icon: TrendingUp, color: 'from-green-600 to-emerald-600' },
    { label: 'Collaborations', value: stats?.active_collaborations || 0, icon: Users, color: 'from-pink-600 to-purple-600' },
    { label: 'Pipelines', value: stats?.pipelines_running || 0, icon: Zap, color: 'from-orange-600 to-yellow-600' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={`bg-gradient-to-br ${stat.color} border-0`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className="w-5 h-5 text-white" />
                <span className="text-white/80 text-xs">{stat.label}</span>
              </div>
              <div className="text-white text-2xl font-bold">
                {stat.value}
                {stat.total && (
                  <span className="text-white/60 text-sm ml-1">/ {stat.total}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}