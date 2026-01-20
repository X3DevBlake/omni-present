import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, TrendingUp, Zap, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CrossHubInsights3D from './CrossHubInsights3D';

export default function UnifiedDashboard() {
  const queryClient = useQueryClient();
  const [realTimeData, setRealTimeData] = useState([]);

  const { data: insights } = useQuery({
    queryKey: ['actionable-insights'],
    queryFn: () => base44.entities.ActionableInsight.filter({ status: 'new' }, '-created_date', 20),
    refetchInterval: 5000 // Real-time updates every 5s
  });

  const { data: dataFlows } = useQuery({
    queryKey: ['cross-hub-flows'],
    queryFn: () => base44.entities.CrossHubDataFlow.filter({ is_active: true }, '', 50),
    refetchInterval: 5000
  });

  const generateInsights = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateActionableInsights', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionable-insights'] });
    }
  });

  const executeAction = useMutation({
    mutationFn: async (insightId) => {
      const insight = insights?.find(i => i.id === insightId);
      if (!insight) return;

      await base44.entities.ActionableInsight.update(insightId, {
        status: 'action_taken',
        execution_log: [
          ...(insight.execution_log || []),
          {
            action_taken: 'Executed all actions',
            timestamp: new Date().toISOString(),
            result: 'Success',
            success: true
          }
        ]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actionable-insights'] });
    }
  });

  // Real-time data subscription simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => [
        ...prev.slice(-20),
        {
          timestamp: new Date().toISOString(),
          value: Math.random() * 100
        }
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const criticalInsights = insights?.filter(i => i.urgency_level === 'critical') || [];
  const activeFlows = dataFlows?.filter(f => f.is_active) || [];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30">
          <CardContent className="p-4">
            <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
            <div className="text-white text-2xl font-bold">{criticalInsights.length}</div>
            <div className="text-white/60 text-sm">Critical Insights</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
          <CardContent className="p-4">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <div className="text-white text-2xl font-bold">{insights?.length || 0}</div>
            <div className="text-white/60 text-sm">Total Insights</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
          <CardContent className="p-4">
            <Zap className="w-6 h-6 text-cyan-400 mb-2" />
            <div className="text-white text-2xl font-bold">{activeFlows.length}</div>
            <div className="text-white/60 text-sm">Active Data Flows</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="p-4">
            <Activity className="w-6 h-6 text-purple-400 mb-2" />
            <div className="text-white text-2xl font-bold">{realTimeData.length}</div>
            <div className="text-white/60 text-sm">Real-Time Events</div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Cross-Hub Visualization */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Cross-Hub Intelligence Network</CardTitle>
            <Button
              onClick={() => generateInsights.mutate()}
              disabled={generateInsights.isPending}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Regenerate Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CrossHubInsights3D insights={insights || []} dataFlows={activeFlows} />
        </CardContent>
      </Card>

      {/* Actionable Insights */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Actionable Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {insights && insights.length > 0 ? (
            <div className="space-y-4">
              {insights.slice(0, 10).map((insight) => (
                <div key={insight.id} className={`bg-white/5 rounded-lg p-4 border ${
                  insight.urgency_level === 'critical' ? 'border-red-500/50' :
                  insight.urgency_level === 'high' ? 'border-orange-500/50' :
                  'border-white/10'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold">{insight.insight_title}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                          {insight.insight_type}
                        </Badge>
                        <Badge className={`text-xs ${
                          insight.urgency_level === 'critical' ? 'bg-red-500' :
                          insight.urgency_level === 'high' ? 'bg-orange-500' :
                          'bg-yellow-500'
                        }`}>
                          {insight.urgency_level}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/60 text-xs">Confidence</div>
                      <div className="text-cyan-400 font-bold">
                        {insight.ai_analysis?.confidence_level || 0}%
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-white/60 text-xs mb-1">Source Hubs:</div>
                    <div className="flex flex-wrap gap-1">
                      {insight.source_hubs?.map((hub, i) => (
                        <Badge key={i} className="bg-cyan-500/20 text-cyan-300 text-xs">
                          {hub}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {insight.concrete_actions && insight.concrete_actions.length > 0 && (
                    <div className="mb-3">
                      <div className="text-white/60 text-xs mb-2">Recommended Actions:</div>
                      <div className="space-y-2">
                        {insight.concrete_actions.slice(0, 3).map((action, i) => (
                          <div key={i} className="bg-black/30 rounded p-2 flex items-center justify-between">
                            <div>
                              <div className="text-white text-sm">{action.action_description}</div>
                              <div className="text-white/60 text-xs mt-1">
                                Target: {action.target_hub} | Impact: {action.estimated_impact}%
                              </div>
                            </div>
                            {action.automated_execution && (
                              <Badge className="bg-green-500/20 text-green-400 text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insight.status === 'new' && (
                    <Button
                      onClick={() => executeAction.mutate(insight.id)}
                      disabled={executeAction.isPending}
                      size="sm"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      Execute Actions
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/60 text-center py-8">
              No insights available. Generate new insights to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predictive Data */}
      {insights?.[0]?.predictive_data && (
        <Card className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Predictive Modeling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Market Volatility</div>
                <div className="text-orange-400 text-2xl font-bold">
                  {insights[0].predictive_data.market_volatility_forecast?.predicted_volatility || 0}%
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Security Risk</div>
                <div className="text-red-400 text-2xl font-bold">
                  {insights[0].predictive_data.security_risk_score || 0}
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-white/60 text-sm mb-1">Correlation Strength</div>
                <div className="text-cyan-400 text-2xl font-bold">
                  {insights[0].ai_analysis?.correlation_strength || 0}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}