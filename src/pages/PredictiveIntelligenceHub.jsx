import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Network, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import ForecastTimeline3D from '../components/intelligence/ForecastTimeline3D';
import CorrelationNetwork3D from '../components/intelligence/CorrelationNetwork3D';
import InsightClusters3D from '../components/intelligence/InsightClusters3D';
import PredictiveMetricsDashboard from '../components/intelligence/PredictiveMetricsDashboard';
import { toast } from 'sonner';

export default function PredictiveIntelligenceHub() {
  const queryClient = useQueryClient();

  const { data: forecasts = [] } = useQuery({
    queryKey: ['predictive-forecasts'],
    queryFn: () => base44.entities.PredictiveForecast.filter({}).limit(100),
    initialData: []
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['insight-engine'],
    queryFn: () => base44.entities.InsightEngine.filter({}).limit(100),
    initialData: []
  });

  const { data: correlations = [] } = useQuery({
    queryKey: ['data-correlations'],
    queryFn: () => base44.entities.DataCorrelation.filter({}).limit(200),
    initialData: []
  });

  const generateForecastMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generate-predictive-forecast', {
        forecast_type: 'operational',
        time_horizon: 'medium_term'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['predictive-forecasts']);
      toast.success('Forecast generated');
    }
  });

  const analyzePatternsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('analyze-data-patterns', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['data-correlations']);
      toast.success(`Found ${data.correlations.length} correlations`);
    }
  });

  const synthesizeIntelligenceMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('synthesize-cross-hub-intelligence', {});
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['insight-engine']);
      toast.success(`Generated ${data.insights.length} insights`);
    }
  });

  const activeForecasts = forecasts.filter(f => f.status === 'active');
  const strongCorrelations = correlations.filter(c => Math.abs(c.correlation_strength) > 0.7);
  const highImpactInsights = insights.filter(i => i.business_impact?.impact_score > 70);

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10 text-purple-400" />
            Predictive Intelligence Hub
          </h1>
          <p className="text-slate-400">AI-powered forecasting and cross-system intelligence synthesis</p>
        </motion.div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => generateForecastMutation.mutate()}
            disabled={generateForecastMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <TrendingUp className={`w-4 h-4 mr-2 ${generateForecastMutation.isPending ? 'animate-spin' : ''}`} />
            Generate Forecast
          </Button>
          <Button
            onClick={() => analyzePatternsMutation.mutate()}
            disabled={analyzePatternsMutation.isPending}
            variant="outline"
          >
            <Network className="w-4 h-4 mr-2" />
            Analyze Patterns
          </Button>
          <Button
            onClick={() => synthesizeIntelligenceMutation.mutate()}
            disabled={synthesizeIntelligenceMutation.isPending}
            variant="outline"
          >
            <Zap className="w-4 h-4 mr-2" />
            Synthesize Intelligence
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-xs">Active Forecasts</p>
                  <p className="text-white text-2xl font-bold">{activeForecasts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Network className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-xs">Strong Correlations</p>
                  <p className="text-white text-2xl font-bold">{strongCorrelations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-pink-400" />
                <div>
                  <p className="text-slate-400 text-xs">High Impact Insights</p>
                  <p className="text-white text-2xl font-bold">{highImpactInsights.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-slate-400 text-xs">Avg Confidence</p>
                  <p className="text-white text-2xl font-bold">
                    {Math.round(insights.reduce((acc, i) => acc + (i.confidence_level || 0), 0) / Math.max(insights.length, 1) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="forecasts" className="space-y-6">
          <TabsList className="bg-slate-900/60">
            <TabsTrigger value="forecasts">
              <TrendingUp className="w-4 h-4 mr-2" />
              Forecasts
            </TabsTrigger>
            <TabsTrigger value="correlations">
              <Network className="w-4 h-4 mr-2" />
              Correlations
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Brain className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <Zap className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forecasts">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Predictive Forecast Timeline</CardTitle>
                <p className="text-slate-400 text-sm">
                  Visualize future predictions with confidence intervals
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <ForecastTimeline3D forecasts={forecasts} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlations">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Correlation Network</CardTitle>
                <p className="text-slate-400 text-sm">
                  Cross-system data relationships and patterns
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <CorrelationNetwork3D correlations={correlations} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Insight Clusters</CardTitle>
                <p className="text-slate-400 text-sm">
                  AI-generated insights organized by category and impact
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <InsightClusters3D insights={insights} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <PredictiveMetricsDashboard
              forecasts={forecasts}
              insights={insights}
              correlations={correlations}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}