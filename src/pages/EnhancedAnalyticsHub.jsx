import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import PredictiveMetrics3D from '@/components/analytics/PredictiveMetrics3D';
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react';

export default function EnhancedAnalyticsHub() {
  const queryClient = useQueryClient();

  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['analytics-metrics'],
    queryFn: () => base44.entities.AnalyticsMetric.list()
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async (metricNames) => {
      const response = await base44.functions.invoke('generatePredictiveInsights', {
        metric_names: metricNames,
        forecast_days: 7
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['analytics-metrics']);
    }
  });

  const performanceMetrics = metrics.filter(m => m.metric_category === 'performance');
  const businessMetrics = metrics.filter(m => m.metric_category === 'business');
  const criticalMetrics = metrics.filter(m => m.is_critical);

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <BarChart3 className="w-12 h-12 text-cyan-400" />
            Enhanced Analytics Hub
          </h1>
          <p className="text-xl text-gray-300">
            AI-powered predictive analytics and insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Metrics</p>
                  <p className="text-3xl font-bold text-white">{metrics.length}</p>
                </div>
                <Target className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Critical Metrics</p>
                  <p className="text-3xl font-bold text-white">{criticalMetrics.length}</p>
                </div>
                <Zap className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Trending Up</p>
                  <p className="text-3xl font-bold text-white">
                    {metrics.filter(m => m.trend_direction === 'up').length}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="3d" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50">
            <TabsTrigger value="3d">3D Visualization</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
          </TabsList>

          <TabsContent value="3d">
            <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
              <CardContent className="p-0 h-full">
                <PredictiveMetrics3D metrics={metrics} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <div className="grid gap-4">
              {performanceMetrics.map((metric) => (
                <Card key={metric.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-2">{metric.metric_name}</h3>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-2xl font-bold text-white">{metric.current_value.toFixed(1)}</p>
                            <p className="text-xs text-gray-400">{metric.unit}</p>
                          </div>
                          {metric.change_percentage !== undefined && (
                            <Badge className={metric.change_percentage >= 0 ? 'bg-green-600' : 'bg-red-600'}>
                              {metric.change_percentage >= 0 ? '↑' : '↓'} {Math.abs(metric.change_percentage).toFixed(1)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="business">
            <div className="grid gap-4">
              {businessMetrics.map((metric) => (
                <Card key={metric.id} className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-2">{metric.metric_name}</h3>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-2xl font-bold text-white">{metric.current_value.toFixed(1)}</p>
                            <p className="text-xs text-gray-400">{metric.unit}</p>
                          </div>
                          {metric.prediction && (
                            <Badge className="bg-yellow-600">
                              Predicted: {metric.prediction.next_value.toFixed(1)}
                            </Badge>
                          )}
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