import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import IntegrationNetwork3D from '@/components/integration/IntegrationNetwork3D';
import { Link2, CheckCircle, AlertCircle, Activity } from 'lucide-react';

export default function EnhancedIntegrationHub() {
  const queryClient = useQueryClient();

  const { data: integrations = [] } = useQuery({
    queryKey: ['integration-health'],
    queryFn: () => base44.entities.IntegrationHealth.list()
  });

  const monitorHealthMutation = useMutation({
    mutationFn: async (integrationName) => {
      const response = await base44.functions.invoke('monitorIntegrationHealth', {
        integration_name: integrationName
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integration-health']);
    }
  });

  const healthyCount = integrations.filter(i => i.status === 'healthy').length;
  const downCount = integrations.filter(i => i.status === 'down').length;
  const avgUptime = integrations.length > 0
    ? integrations.reduce((sum, i) => sum + (i.uptime_percentage || 0), 0) / integrations.length
    : 0;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Link2 className="w-12 h-12 text-cyan-400" />
            Integration Hub
          </h1>
          <p className="text-xl text-gray-300">
            Monitor and manage all platform integrations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Healthy</p>
                  <p className="text-3xl font-bold text-white">{healthyCount}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Down</p>
                  <p className="text-3xl font-bold text-white">{downCount}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Uptime</p>
                  <p className="text-3xl font-bold text-white">{avgUptime.toFixed(1)}%</p>
                </div>
                <Activity className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="3d" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
            <TabsTrigger value="3d">3D Network View</TabsTrigger>
            <TabsTrigger value="list">Integration List</TabsTrigger>
          </TabsList>

          <TabsContent value="3d">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <IntegrationNetwork3D integrations={integrations} onNodeClick={(i) => {}} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-3">
              {integrations.map((integration) => (
                <Card key={integration.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{integration.integration_name}</h3>
                          <Badge className={
                            integration.status === 'healthy' ? 'bg-green-600' :
                            integration.status === 'degraded' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }>
                            {integration.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Uptime: {integration.uptime_percentage?.toFixed(2)}%</p>
                          <p>Avg Latency: {integration.avg_latency_ms?.toFixed(0)}ms</p>
                          <p>24h Success Rate: {integration.success_rate_24h?.toFixed(1)}%</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => monitorHealthMutation.mutate(integration.integration_name)}
                        disabled={monitorHealthMutation.isPending}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Check Health
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}