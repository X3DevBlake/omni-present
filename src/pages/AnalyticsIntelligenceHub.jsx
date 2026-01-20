import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Activity, Lightbulb, AlertTriangle, Database, BarChart3, Layout } from 'lucide-react';
import PredictiveAnalytics3D from '../components/analytics/PredictiveAnalytics3D';
import PerformanceMonitor3D from '../components/monitoring/PerformanceMonitor3D';
import InsightEngine3D from '../components/analytics/InsightEngine3D';
import AnomalyDetector3D from '../components/analytics/AnomalyDetector3D';
import DataPipeline3D from '../components/data/DataPipeline3D';
import MetricsAggregator3D from '../components/metrics/MetricsAggregator3D';
import IntelligenceDashboard3D from '../components/dashboards/IntelligenceDashboard3D';
import AuroraBackground from '../components/omni/AuroraBackground';
import { toast } from 'sonner';

export default function AnalyticsIntelligenceHub() {
  const queryClient = useQueryClient();

  const { data: predictiveAnalytics } = useQuery({
    queryKey: ['predictive-analytics'],
    queryFn: () => base44.entities.PredictiveAnalytics.list('-created_date', 10),
    refetchInterval: 5000
  });

  const { data: performanceMonitors } = useQuery({
    queryKey: ['performance-monitors'],
    queryFn: () => base44.entities.PerformanceMonitor.list('-created_date', 10),
    refetchInterval: 3000
  });

  const { data: insightEngines } = useQuery({
    queryKey: ['insight-engines'],
    queryFn: () => base44.entities.InsightEngine.list('-created_date', 10)
  });

  const { data: anomalyDetectors } = useQuery({
    queryKey: ['anomaly-detectors'],
    queryFn: () => base44.entities.AnomalyDetector.list('-created_date', 10),
    refetchInterval: 2000
  });

  const { data: dataPipelines } = useQuery({
    queryKey: ['data-pipelines'],
    queryFn: () => base44.entities.DataPipeline.list('-created_date', 10)
  });

  const { data: metricsAggregators } = useQuery({
    queryKey: ['metrics-aggregators'],
    queryFn: () => base44.entities.MetricsAggregator.list('-created_date', 10)
  });

  const { data: dashboards } = useQuery({
    queryKey: ['intelligence-dashboards'],
    queryFn: () => base44.entities.IntelligenceDashboard.list('-created_date', 10)
  });

  const generatePredictions = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('generatePredictions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictive-analytics'] });
      toast.success('Predictions generated!');
    }
  });

  const monitorPerformance = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('monitorPerformance', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-monitors'] });
      toast.success('Performance monitor created!');
    }
  });

  const generateInsights = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('generateInsights', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insight-engines'] });
      toast.success('Insights generated!');
    }
  });

  const detectAnomalies = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('detectAnomalies', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomaly-detectors'] });
      toast.success('Anomaly detector activated!');
    }
  });

  const createPipeline = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('createPipeline', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-pipelines'] });
      toast.success('Data pipeline created!');
    }
  });

  const aggregateMetrics = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('aggregateMetrics', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics-aggregators'] });
      toast.success('Metrics aggregator created!');
    }
  });

  const createDashboard = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('createIntelligenceDashboard', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intelligence-dashboards'] });
      toast.success('Dashboard created!');
    }
  });

  const [predictionsForm, setPredictionsForm] = useState({
    analytics_name: '',
    prediction_type: 'time_series',
    time_horizon: 24
  });

  const [monitorForm, setMonitorForm] = useState({
    monitor_name: '',
    target_system: 'agent',
    target_id: 'agent_001'
  });

  const [insightForm, setInsightForm] = useState({
    engine_name: '',
    analysis_domain: 'business_intelligence'
  });

  const [anomalyForm, setAnomalyForm] = useState({
    detector_name: '',
    detection_method: 'isolation_forest',
    sensitivity: 0.8
  });

  const [pipelineForm, setPipelineForm] = useState({
    pipeline_name: '',
    pipeline_type: 'streaming'
  });

  const [aggregatorForm, setAggregatorForm] = useState({
    aggregator_name: '',
    aggregation_strategy: 'average'
  });

  const [dashboardForm, setDashboardForm] = useState({
    dashboard_name: '',
    dashboard_type: 'executive'
  });

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-3">
            <TrendingUp className="w-12 h-12 text-cyan-400" />
            Analytics & Intelligence Hub
          </h1>
          <p className="text-xl text-white/70">
            Predictive Analytics, Performance Monitoring, Insights, Anomaly Detection & Intelligence Dashboards
          </p>
        </div>

        <Tabs defaultValue="predictions" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 bg-black/30 p-1">
            <TabsTrigger value="predictions" className="data-[state=active]:bg-cyan-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-green-600">
              <Activity className="w-4 h-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600">
              <Lightbulb className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="data-[state=active]:bg-orange-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Anomalies
            </TabsTrigger>
            <TabsTrigger value="pipelines" className="data-[state=active]:bg-blue-600">
              <Database className="w-4 h-4 mr-2" />
              Pipelines
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-pink-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="dashboards" className="data-[state=active]:bg-indigo-600">
              <Layout className="w-4 h-4 mr-2" />
              Dashboards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Generate Predictions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Analytics name"
                  value={predictionsForm.analytics_name}
                  onChange={(e) => setPredictionsForm({...predictionsForm, analytics_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={predictionsForm.prediction_type} onValueChange={(v) => setPredictionsForm({...predictionsForm, prediction_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time_series">Time Series</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="regression">Regression</SelectItem>
                    <SelectItem value="trend_forecasting">Trend Forecasting</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => generatePredictions.mutate(predictionsForm)}
                  disabled={generatePredictions.isPending || !predictionsForm.analytics_name}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
                >
                  Generate Predictions
                </Button>
              </CardContent>
            </Card>

            {predictiveAnalytics?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <PredictiveAnalytics3D analytics={predictiveAnalytics[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Create Performance Monitor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Monitor name"
                  value={monitorForm.monitor_name}
                  onChange={(e) => setMonitorForm({...monitorForm, monitor_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={monitorForm.target_system} onValueChange={(v) => setMonitorForm({...monitorForm, target_system: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="model">Model</SelectItem>
                    <SelectItem value="function">Function</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => monitorPerformance.mutate(monitorForm)}
                  disabled={monitorPerformance.isPending || !monitorForm.monitor_name}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Start Monitoring
                </Button>
              </CardContent>
            </Card>

            {performanceMonitors?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <PerformanceMonitor3D monitor={performanceMonitors[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Generate Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Engine name"
                  value={insightForm.engine_name}
                  onChange={(e) => setInsightForm({...insightForm, engine_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={insightForm.analysis_domain} onValueChange={(v) => setInsightForm({...insightForm, analysis_domain: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business_intelligence">Business Intelligence</SelectItem>
                    <SelectItem value="user_behavior">User Behavior</SelectItem>
                    <SelectItem value="system_performance">System Performance</SelectItem>
                    <SelectItem value="agent_collaboration">Agent Collaboration</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => generateInsights.mutate(insightForm)}
                  disabled={generateInsights.isPending || !insightForm.engine_name}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Generate Insights
                </Button>
              </CardContent>
            </Card>

            {insightEngines?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <InsightEngine3D engine={insightEngines[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Deploy Anomaly Detector</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Detector name"
                  value={anomalyForm.detector_name}
                  onChange={(e) => setAnomalyForm({...anomalyForm, detector_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={anomalyForm.detection_method} onValueChange={(v) => setAnomalyForm({...anomalyForm, detection_method: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="isolation_forest">Isolation Forest</SelectItem>
                    <SelectItem value="autoencoder">Autoencoder</SelectItem>
                    <SelectItem value="one_class_svm">One-Class SVM</SelectItem>
                    <SelectItem value="ensemble">Ensemble</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => detectAnomalies.mutate(anomalyForm)}
                  disabled={detectAnomalies.isPending || !anomalyForm.detector_name}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600"
                >
                  Deploy Detector
                </Button>
              </CardContent>
            </Card>

            {anomalyDetectors?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <AnomalyDetector3D detector={anomalyDetectors[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pipelines" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Create Data Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Pipeline name"
                  value={pipelineForm.pipeline_name}
                  onChange={(e) => setPipelineForm({...pipelineForm, pipeline_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={pipelineForm.pipeline_type} onValueChange={(v) => setPipelineForm({...pipelineForm, pipeline_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="batch">Batch</SelectItem>
                    <SelectItem value="streaming">Streaming</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                    <SelectItem value="real_time">Real-Time</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => createPipeline.mutate(pipelineForm)}
                  disabled={createPipeline.isPending || !pipelineForm.pipeline_name}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
                >
                  Create Pipeline
                </Button>
              </CardContent>
            </Card>

            {dataPipelines?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <DataPipeline3D pipeline={dataPipelines[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Create Metrics Aggregator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Aggregator name"
                  value={aggregatorForm.aggregator_name}
                  onChange={(e) => setAggregatorForm({...aggregatorForm, aggregator_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={aggregatorForm.aggregation_strategy} onValueChange={(v) => setAggregatorForm({...aggregatorForm, aggregation_strategy: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="percentile">Percentile</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => aggregateMetrics.mutate(aggregatorForm)}
                  disabled={aggregateMetrics.isPending || !aggregatorForm.aggregator_name}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
                >
                  Create Aggregator
                </Button>
              </CardContent>
            </Card>

            {metricsAggregators?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <MetricsAggregator3D aggregator={metricsAggregators[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dashboards" className="space-y-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Create Intelligence Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Dashboard name"
                  value={dashboardForm.dashboard_name}
                  onChange={(e) => setDashboardForm({...dashboardForm, dashboard_name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
                <Select value={dashboardForm.dashboard_type} onValueChange={(v) => setDashboardForm({...dashboardForm, dashboard_type: v})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="analytical">Analytical</SelectItem>
                    <SelectItem value="real_time">Real-Time</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => createDashboard.mutate(dashboardForm)}
                  disabled={createDashboard.isPending || !dashboardForm.dashboard_name}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  Create Dashboard
                </Button>
              </CardContent>
            </Card>

            {dashboards?.[0] && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardContent className="p-6">
                  <IntelligenceDashboard3D dashboard={dashboards[0]} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}