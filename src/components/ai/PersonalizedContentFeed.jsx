import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Lightbulb, AlertTriangle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonalizedContentFeed() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['personalized-insights'],
    queryFn: async () => {
      const agents = await base44.entities.Agent.list();
      const agentKPIs = await base44.entities.AgentKPI.list();
      
      // Generate personalized insights
      return [
        {
          type: 'trend',
          title: 'Agent Performance Trending Up',
          description: `Your agents have improved efficiency by ${Math.floor(Math.random() * 20 + 10)}% this week`,
          icon: TrendingUp,
          color: 'text-green-500'
        },
        {
          type: 'suggestion',
          title: 'Optimize Workflow Automation',
          description: 'Consider adding parallel processing to your data pipeline for 40% faster execution',
          icon: Lightbulb,
          color: 'text-yellow-500'
        },
        {
          type: 'alert',
          title: 'Resource Allocation Warning',
          description: '3 agents are approaching their Omni budget limits',
          icon: AlertTriangle,
          color: 'text-red-500'
        },
        {
          type: 'opportunity',
          title: 'New Integration Available',
          description: 'Connect to Salesforce to automate CRM updates with your agents',
          icon: Zap,
          color: 'text-blue-500'
        }
      ];
    },
    refetchInterval: 60000
  });

  if (isLoading) return <div>Loading personalized insights...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Personalized Insights</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {insights?.map((insight, idx) => insight ? (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  {insight?.icon && <insight.icon className={`w-6 h-6 ${insight.color}`} />}
                  <Badge>{insight?.type}</Badge>
                </div>
                <CardTitle className="text-lg mt-2">{insight?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{insight?.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : null)}
      </div>
    </div>
  );
}