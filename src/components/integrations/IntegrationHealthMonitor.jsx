import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function IntegrationHealthMonitor() {
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integration-health'],
    queryFn: async () => {
      // Simulate integration health checks
      const mockIntegrations = [
        { name: 'Salesforce', status: 'healthy', uptime: 99.9, latency: 45 },
        { name: 'Google Workspace', status: 'healthy', uptime: 99.7, latency: 32 },
        { name: 'Slack', status: 'warning', uptime: 98.5, latency: 120 },
        { name: 'Snowflake', status: 'healthy', uptime: 99.8, latency: 55 },
        { name: 'Stripe', status: 'healthy', uptime: 99.9, latency: 28 },
        { name: 'Mistral AI', status: 'healthy', uptime: 99.6, latency: 89 }
      ];
      
      return mockIntegrations;
    },
    refetchInterval: 30000
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <div>Checking integration health...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-500" />
          Integration Health Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {integrations?.map((integration, idx) => integration ? (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(integration?.status)}
                <div>
                  <p className="font-semibold">{integration?.name}</p>
                  <p className="text-xs text-gray-500">
                    Uptime: {integration?.uptime}% | Latency: {integration?.latency}ms
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(integration?.status)}>
                {integration?.status}
              </Badge>
            </motion.div>
          ) : null)}
        </div>
      </CardContent>
    </Card>
  );
}