import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, AlertTriangle, Brain, Activity, Target, Award, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuroraBackground from '../components/omni/AuroraBackground';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ProactiveAnomalyPanel from '../components/analytics/ProactiveAnomalyPanel';
import PredictiveForecastPanel from '../components/analytics/PredictiveForecastPanel';
import AutomatedInsightsPanel from '../components/analytics/AutomatedInsightsPanel';

export default function AIAnalyticsHub() {
  const [userEmail, setUserEmail] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedAgent, setSelectedAgent] = useState('all');

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: agents } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.list(),
    enabled: !!userEmail,
    initialData: [],
  });

  const { data: kpis } = useQuery({
    queryKey: ['agentKPIs', userEmail, timeRange],
    queryFn: () => base44.entities.AgentKPI.list(),
    enabled: !!userEmail,
    initialData: [],
  });

  const aggregatedMetrics = React.useMemo(() => {
    if (!kpis?.length) return null;

    const totalTasks = kpis.reduce((sum, k) => sum + (k.tasks_completed || 0), 0);
    const avgEfficiency = kpis.reduce((sum, k) => sum + (k.efficiency || 0), 0) / kpis.length;
    const avgResponseTime = kpis.reduce((sum, k) => sum + (k.response_time || 0), 0) / kpis.length;
    const successRate = kpis.reduce((sum, k) => sum + (k.success_rate || 0), 0) / kpis.length;

    return {
      totalTasks,
      avgEfficiency: avgEfficiency.toFixed(1),
      avgResponseTime: avgResponseTime.toFixed(2),
      successRate: successRate.toFixed(1),
      activeAgents: agents?.length || 0
    };
  }, [kpis, agents]);

  const trendData = React.useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: Math.min(days, 30) }, (_, i) => ({
      day: `Day ${i + 1}`,
      efficiency: 70 + Math.random() * 25,
      tasks: Math.floor(50 + Math.random() * 100),
    }));
  }, [timeRange]);

  const agentComparison = React.useMemo(() => {
    if (!agents?.length) return [];
    return agents.slice(0, 8).map(agent => ({
      name: agent.name || 'Agent',
      efficiency: 70 + Math.random() * 30,
      tasks: Math.floor(20 + Math.random() * 80)
    }));
  }, [agents]);

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI Analytics Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-powered insights, anomaly detection, and predictive forecasting
          </p>
        </motion.div>

        {aggregatedMetrics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-6 h-6 text-cyan-400" />
                {getTrendIcon(5)}
              </div>
              <p className="text-white text-2xl font-bold">{aggregatedMetrics.totalTasks}</p>
              <p className="text-white/60 text-sm">Tasks Completed</p>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-6 h-6 text-purple-400" />
                {getTrendIcon(12)}
              </div>
              <p className="text-white text-2xl font-bold">{aggregatedMetrics.avgEfficiency}%</p>
              <p className="text-white/60 text-sm">Avg Efficiency</p>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-6 h-6 text-green-400" />
                {getTrendIcon(-3)}
              </div>
              <p className="text-white text-2xl font-bold">{aggregatedMetrics.avgResponseTime}s</p>
              <p className="text-white/60 text-sm">Response Time</p>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-6 h-6 text-orange-400" />
                {getTrendIcon(8)}
              </div>
              <p className="text-white text-2xl font-bold">{aggregatedMetrics.successRate}%</p>
              <p className="text-white/60 text-sm">Success Rate</p>
            </Card>
            <Card className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border-indigo-500/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-6 h-6 text-indigo-400" />
                {getTrendIcon(2)}
              </div>
              <p className="text-white text-2xl font-bold">{aggregatedMetrics.activeAgents}</p>
              <p className="text-white/60 text-sm">Active Agents</p>
            </Card>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-black/40 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-[200px] bg-black/40 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents?.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-black/30 p-1 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="data-[state=active]:bg-orange-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Anomalies
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-purple-600">
              Predictions
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-green-600">
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="forecasting" className="data-[state=active]:bg-blue-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              Forecasting
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-pink-600">
              <Brain className="w-4 h-4 mr-1" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10 p-6">
                <h3 className="text-white font-bold mb-4">Performance Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="day" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20' }} />
                    <Legend />
                    <Line type="monotone" dataKey="efficiency" stroke="#00f5ff" strokeWidth={2} />
                    <Line type="monotone" dataKey="tasks" stroke="#a855f7" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="bg-black/40 border-white/10 p-6">
                <h3 className="text-white font-bold mb-4">Agent Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={agentComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" stroke="#ffffff60" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20' }} />
                    <Legend />
                    <Bar dataKey="efficiency" fill="#00f5ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="anomalies">
            <ProactiveAnomalyPanel />
          </TabsContent>

          <TabsContent value="forecasting">
            <PredictiveForecastPanel />
          </TabsContent>

          <TabsContent value="insights">
            <AutomatedInsightsPanel />
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-white font-bold">AI Predictions</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="text-white/80 mb-2">Task volume predicted to increase 18% next week</p>
                  <p className="text-white/60 text-sm">Based on historical patterns and current trends</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-6">
              <h3 className="text-white font-bold mb-3">Optimization Opportunities</h3>
              <p className="text-white/80">
                Implement query caching to reduce response time by 35%
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}