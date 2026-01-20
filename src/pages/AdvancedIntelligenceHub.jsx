import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Network, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import PredictiveIntelligence3D from '../components/intelligence/PredictiveIntelligence3D';
import CrossHubCorrelationMap3D from '../components/intelligence/CrossHubCorrelationMap3D';
import RealTimeAlertFlow3D from '../components/intelligence/RealTimeAlertFlow3D';
import IntelligentMetricsDashboard from '../components/intelligence/IntelligentMetricsDashboard';
import { toast } from 'sonner';

export default function AdvancedIntelligenceHub() {
  const queryClient = useQueryClient();

  const { data: alerts = [] } = useQuery({
    queryKey: ['intelligence-alerts'],
    queryFn: () => base44.entities.IntelligenceAlert.filter({}).limit(100),
    refetchInterval: 10000,
    initialData: []
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['cross-hub-insights'],
    queryFn: () => base44.entities.CrossHubInsight.filter({}).limit(50),
    initialData: []
  });

  const { data: models = [] } = useQuery({
    queryKey: ['predictive-models'],
    queryFn: () => base44.entities.PredictiveModel.filter({}).limit(50),
    initialData: []
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generate-predictive-insights', {
        target_domains: ['agents', 'simulations', 'finance', 'devices'],
        time_horizon: 24
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['predictive-models']);
      toast.success('Predictive insights generated');
    }
  });

  const detectCorrelationsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('detect-cross-hub-correlations', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cross-hub-insights']);
      toast.success('Cross-hub correlations detected');
    }
  });

  const generateAlertsMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generate-realtime-alerts', {
        monitoring_scope: 'all_hubs'
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['intelligence-alerts']);
      toast.success('Real-time alerts generated');
    }
  });

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');

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
            Advanced Intelligence Hub
          </h1>
          <p className="text-slate-400">AI-powered predictive analytics and cross-hub intelligence</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Sparkles className={`w-4 h-4 mr-2 ${generateInsightsMutation.isPending ? 'animate-spin' : ''}`} />
            Generate Insights
          </Button>
          <Button
            onClick={() => detectCorrelationsMutation.mutate()}
            disabled={detectCorrelationsMutation.isPending}
            variant="outline"
          >
            <Network className="w-4 h-4 mr-2" />
            Detect Correlations
          </Button>
          <Button
            onClick={() => generateAlertsMutation.mutate()}
            disabled={generateAlertsMutation.isPending}
            variant="outline"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Scan Alerts
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-slate-400 text-xs">Critical Alerts</p>
                  <p className="text-white text-2xl font-bold">{criticalAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Network className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-xs">Cross-Hub Insights</p>
                  <p className="text-white text-2xl font-bold">{insights.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-slate-400 text-xs">Predictive Models</p>
                  <p className="text-white text-2xl font-bold">{models.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-xs">Active Monitoring</p>
                  <p className="text-white text-2xl font-bold">{activeAlerts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="bg-slate-900/60">
            <TabsTrigger value="predictions">
              <TrendingUp className="w-4 h-4 mr-2" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="correlations">
              <Network className="w-4 h-4 mr-2" />
              Correlations
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Real-Time Alerts
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <Brain className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Predictive Intelligence Visualizer</CardTitle>
                <p className="text-slate-400 text-sm">
                  AI-powered predictions across multiple domains
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <PredictiveIntelligence3D models={models} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlations">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Cross-Hub Correlation Network</CardTitle>
                <p className="text-slate-400 text-sm">
                  Discover hidden patterns and relationships across hubs
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <CrossHubCorrelationMap3D insights={insights} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="bg-slate-900/60 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Real-Time Alert Flow</CardTitle>
                <p className="text-slate-400 text-sm">
                  Monitor system-wide alerts and anomalies
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[700px]">
                  <RealTimeAlertFlow3D alerts={alerts} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <IntelligentMetricsDashboard
              alerts={alerts}
              insights={insights}
              models={models}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}