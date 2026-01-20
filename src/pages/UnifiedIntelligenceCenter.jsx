import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import BiDirectionalHubFlow3D from '@/components/intelligence/BiDirectionalHubFlow3D';
import CrossHubNetwork3D from '@/components/intelligence/CrossHubNetwork3D';
import { Network, Brain, Zap, TrendingUp } from 'lucide-react';

export default function UnifiedIntelligenceCenter() {
  const queryClient = useQueryClient();

  const { data: links = [] } = useQuery({
    queryKey: ['cross-hub-links-unified'],
    queryFn: () => base44.entities.CrossHubLink.list()
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['unified-insights'],
    queryFn: () => base44.entities.InsightAggregator.list()
  });

  const syncDeFiMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('syncDeFiToSimulation', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cross-hub-links-unified']);
    }
  });

  const syncSentimentMutation = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('syncSentimentToReputation', {
        agent_id: agentId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cross-hub-links-unified']);
    }
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateCrossHubInsights', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['unified-insights']);
    }
  });

  const activeLinks = links.filter(l => l.is_active).length;
  const highImpactInsights = insights.filter(i => i.confidence_score > 80).length;

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Brain className="w-12 h-12 text-cyan-400" />
            Unified Intelligence Center
          </h1>
          <p className="text-xl text-gray-300">
            Cross-hub correlation, predictive analytics & autonomous insights
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
                  <p className="text-sm text-gray-400">Total Insights</p>
                  <p className="text-3xl font-bold text-white">{insights.length}</p>
                </div>
                <Brain className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">High Impact</p>
                  <p className="text-3xl font-bold text-white">{highImpactInsights}</p>
                </div>
                <Zap className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Confidence</p>
                  <p className="text-3xl font-bold text-white">
                    {insights.length > 0 ? (insights.reduce((s, i) => s + (i.confidence_score || 0), 0) / insights.length).toFixed(0) : 0}%
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => syncDeFiMutation.mutate()}
            disabled={syncDeFiMutation.isPending}
            className="bg-gradient-to-r from-green-600 to-blue-600"
          >
            {syncDeFiMutation.isPending ? 'Syncing...' : 'Sync DeFi → Simulation'}
          </Button>
          
          <Button
            onClick={() => syncSentimentMutation.mutate('agent_1')}
            disabled={syncSentimentMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {syncSentimentMutation.isPending ? 'Syncing...' : 'Sync Sentiment → Reputation'}
          </Button>
          
          <Button
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            className="bg-gradient-to-r from-yellow-600 to-orange-600"
          >
            {generateInsightsMutation.isPending ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>

        <Tabs defaultValue="flow" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
            <TabsTrigger value="flow">3D Data Flow</TabsTrigger>
            <TabsTrigger value="insights">Actionable Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="flow">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <BiDirectionalHubFlow3D links={links} />
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
                          <Badge className="bg-blue-600">{insight.confidence_score?.toFixed(0)}%</Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{insight.ai_analysis}</p>
                        <div className="flex gap-2 flex-wrap mb-3">
                          {insight.source_hubs?.map((hub, idx) => (
                            <Badge key={idx} variant="outline" className="text-cyan-400 border-cyan-400">
                              {hub}
                            </Badge>
                          ))}
                        </div>
                        {insight.recommended_actions?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500">Recommended Actions:</p>
                            {insight.recommended_actions.map((action, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <Badge className="bg-green-600">{action.hub}</Badge>
                                <span className="text-gray-300">{action.action}</span>
                              </div>
                            ))}
                          </div>
                        )}
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