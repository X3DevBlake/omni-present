import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import UnifiedDashboard3D from '../components/intelligence/UnifiedDashboard3D';
import GovernanceImpactVisualizer3D from '../components/governance/GovernanceImpactVisualizer3D';
import ActionableInsightsEngine from '../components/intelligence/ActionableInsightsEngine';
import { Brain, Zap, TrendingUp, Shield, AlertCircle } from 'lucide-react';

export default function UnifiedIntelligenceDashboard() {
  const queryClient = useQueryClient();

  const { data: insights } = useQuery({
    queryKey: ['actionable-insights'],
    queryFn: () => base44.entities.ActionableInsight.filter({ status: 'new' }, '-created_date', 20),
    refetchInterval: 10000 // Real-time updates
  });

  const { data: dataFlows } = useQuery({
    queryKey: ['cross-hub-flows'],
    queryFn: () => base44.entities.CrossHubDataFlow.filter({ is_active: true }, '', 50),
    refetchInterval: 5000
  });

  const { data: impactMetrics } = useQuery({
    queryKey: ['governance-impact'],
    queryFn: () => base44.entities.GovernanceImpactMetric.list('-decision_date', 20)
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

  const syncSecurityToSim = useMutation({
    mutationFn: async (volatilityData) => {
      const response = await base44.functions.invoke('syncSecurityToSimulation', {
        defi_volatility_data: volatilityData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cross-hub-flows'] });
    }
  });

  const hubs = [
    { id: '1', name: 'Security Hub', type: 'security', activity: 85, alerts: insights?.filter(i => i.insight_type === 'security_alert').length || 0 },
    { id: '2', name: 'DeFi Hub', type: 'defi', activity: 92, alerts: insights?.filter(i => i.insight_type === 'defi_strategy').length || 0 },
    { id: '3', name: 'Simulation Lab', type: 'simulation', activity: 78, alerts: insights?.filter(i => i.insight_type === 'simulation_adjustment').length || 0 },
    { id: '4', name: 'Marketplace', type: 'marketplace', activity: 88, alerts: 0 },
    { id: '5', name: 'Governance', type: 'governance', activity: 65, alerts: insights?.filter(i => i.insight_type === 'governance_action').length || 0 },
    { id: '6', name: 'Collaboration', type: 'collaboration', activity: 91, alerts: 0 }
  ];

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Unified Intelligence Dashboard
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Real-time cross-hub insights, predictive analytics & actionable recommendations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Brain className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{insights?.length || 0}</p>
            <p className="text-white/60 text-sm">Active Insights</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 p-4">
            <Zap className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-white text-2xl font-bold">{dataFlows?.length || 0}</p>
            <p className="text-white/60 text-sm">Data Flows</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <AlertCircle className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {insights?.filter(i => i.urgency_level === 'critical').length || 0}
            </p>
            <p className="text-white/60 text-sm">Critical</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <Shield className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {dataFlows?.filter(f => f.automation_enabled).length || 0}
            </p>
            <p className="text-white/60 text-sm">Automated</p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <TrendingUp className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">{impactMetrics?.length || 0}</p>
            <p className="text-white/60 text-sm">Impact Records</p>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30">
            <TabsTrigger value="overview">Hub Overview 3D</TabsTrigger>
            <TabsTrigger value="insights">Actionable Insights</TabsTrigger>
            <TabsTrigger value="flows">Data Flows</TabsTrigger>
            <TabsTrigger value="governance">Governance Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Cross-Hub Intelligence Network</CardTitle>
                  <Button
                    onClick={() => generateInsights.mutate()}
                    disabled={generateInsights.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Insights
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <UnifiedDashboard3D
                  hubs={hubs}
                  dataFlows={dataFlows}
                  insights={insights}
                  onHubClick={(hub) => console.log('Hub:', hub)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <ActionableInsightsEngine
              insights={insights}
              onExecuteAction={(insightId, action) => console.log('Execute:', insightId, action)}
              onDismiss={(insightId) => console.log('Dismiss:', insightId)}
            />
            <div className="space-y-4 mt-6">
              {insights?.slice(0, 0).map(insight => (
                <Card key={insight.id} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{insight.insight_title}</CardTitle>
                      <Badge className={
                        insight.urgency_level === 'critical' ? 'bg-red-500' :
                        insight.urgency_level === 'high' ? 'bg-orange-500' :
                        insight.urgency_level === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }>
                        {insight.urgency_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {insight.source_hubs?.map((hub, i) => (
                        <Badge key={i} className="bg-blue-500/20 text-blue-300">
                          From: {hub}
                        </Badge>
                      ))}
                      {insight.affected_hubs?.map((hub, i) => (
                        <Badge key={i} className="bg-purple-500/20 text-purple-300">
                          To: {hub}
                        </Badge>
                      ))}
                    </div>

                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-xs mb-1">AI Analysis</div>
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{insight.ai_analysis?.detected_pattern}</span>
                        <span className="text-purple-400 text-sm">
                          {insight.ai_analysis?.confidence_level?.toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>

                    {insight.concrete_actions?.length > 0 && (
                      <div>
                        <div className="text-white/60 text-xs mb-2">Recommended Actions</div>
                        <div className="space-y-2">
                          {insight.concrete_actions.map((action, i) => (
                            <div key={i} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white text-sm font-medium">{action.action_description}</span>
                                <Badge className={action.automated_execution ? 'bg-green-500' : 'bg-orange-500'}>
                                  {action.automated_execution ? 'Auto' : 'Manual'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-white/60">
                                <span>Target: {action.target_hub}</span>
                                <span>Priority: {action.priority}</span>
                                <span>Impact: +{action.estimated_impact}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {insight.predictive_data?.market_volatility_forecast && (
                      <div className="bg-orange-500/20 border border-orange-500/30 rounded p-3">
                        <div className="text-orange-300 text-sm font-medium mb-1">Market Volatility Forecast</div>
                        <div className="text-white text-xs">
                          Predicted Volatility: {insight.predictive_data.market_volatility_forecast.predicted_volatility?.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {!insights?.length && (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="text-center py-12">
                    <Brain className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">No actionable insights yet</p>
                    <Button
                      onClick={() => generateInsights.mutate()}
                      disabled={generateInsights.isPending}
                      className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Generate Insights
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="flows">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {dataFlows?.map(flow => (
                <Card key={flow.id} className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{flow.flow_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500">{flow.source_hub}</Badge>
                        <span className="text-white">→</span>
                        <Badge className="bg-purple-500">{flow.target_hub}</Badge>
                      </div>
                      <Badge className={flow.automation_enabled ? 'bg-green-500' : 'bg-gray-500'}>
                        {flow.automation_enabled ? 'Auto' : 'Manual'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60">Success Rate</div>
                        <div className="text-green-400 font-bold">
                          {flow.flow_metrics?.success_rate?.toFixed(0)}%
                        </div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60">Latency</div>
                        <div className="text-cyan-400 font-bold">
                          {flow.flow_metrics?.latency_ms}ms
                        </div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60">Data Volume</div>
                        <div className="text-purple-400 font-bold">
                          {(flow.flow_metrics?.data_volume / 1024).toFixed(1)}KB
                        </div>
                      </div>
                    </div>

                    {flow.defi_volatility_predictions && (
                      <div className="bg-orange-500/20 border border-orange-500/30 rounded p-2">
                        <div className="text-orange-300 text-xs mb-1">DeFi Volatility Prediction</div>
                        <div className="text-white text-xs">
                          Predicted: {flow.defi_volatility_predictions.predicted_volatility?.toFixed(2)}
                          • Confidence: {flow.defi_volatility_predictions.confidence_level?.toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="governance">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Governance Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <GovernanceImpactVisualizer3D
                  impactMetrics={impactMetrics}
                  proposals={[]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}