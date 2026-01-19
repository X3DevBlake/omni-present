import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import CrossHubNetwork3D from '@/components/intelligence/CrossHubNetwork3D';
import { Network, Brain, Zap, TrendingUp } from 'lucide-react';

export default function UnifiedIntelligenceDashboard() {
  const queryClient = useQueryClient();

  const { data: links = [] } = useQuery({
    queryKey: ['cross-hub-links'],
    queryFn: () => base44.entities.CrossHubLink.list()
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['aggregated-insights'],
    queryFn: () => base44.entities.InsightAggregator.list()
  });

  const correlateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('correlateCrossHubData', {
        hub_pairs: [
          { source_hub: 'defi', target_hub: 'simulation' },
          { source_hub: 'communication', target_hub: 'marketplace' },
          { source_hub: 'analytics', target_hub: 'defi' }
        ]
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cross-hub-links']);
    }
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateCrossHubInsights', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['aggregated-insights']);
    }
  });

  const activeLinks = links.filter(l => l.is_active).length;
  const actionableInsights = insights.filter(i => i.is_actionable && !i.acted_upon).length;
  const avgCorrelation = links.length > 0
    ? links.reduce((sum, l) => sum + Math.abs(l.correlation_coefficient || 0), 0) / links.length
    : 0;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Network className="w-12 h-12 text-cyan-400" />
            Unified Intelligence Dashboard
          </h1>
          <p className="text-xl text-gray-300">
            Cross-hub data correlation and strategic insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Links</p>
                  <p className="text-3xl font-bold text-white">{activeLinks}</p>
                </div>
                <Network className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Actionable</p>
                  <p className="text-3xl font-bold text-white">{actionableInsights}</p>
                </div>
                <Zap className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Correlation</p>
                  <p className="text-3xl font-bold text-white">{(avgCorrelation * 100).toFixed(0)}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Insights</p>
                  <p className="text-3xl font-bold text-white">{insights.length}</p>
                </div>
                <Brain className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => correlateMutation.mutate()}
            disabled={correlateMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {correlateMutation.isPending ? 'Analyzing...' : 'Correlate Hub Data'}
          </Button>
          
          <Button
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {generateInsightsMutation.isPending ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>

        <Tabs defaultValue="network" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
            <TabsTrigger value="network">3D Network</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="network">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <CrossHubNetwork3D links={links} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="space-y-3">
              {insights.map((insight) => (
                <Card key={insight.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{insight.insight_title}</h3>
                          <Badge className="bg-purple-600">{insight.insight_type}</Badge>
                          <Badge className="bg-blue-600">
                            {insight.confidence_score?.toFixed(0)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{insight.ai_analysis}</p>
                        <div className="flex gap-2 flex-wrap">
                          {insight.source_hubs?.map((hub, idx) => (
                            <Badge key={idx} variant="outline" className="text-cyan-400 border-cyan-400">
                              {hub}
                            </Badge>
                          ))}
                        </div>
                      </div>
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