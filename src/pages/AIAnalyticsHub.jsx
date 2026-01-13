import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, Brain, Activity, Target, Award, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuroraBackground from '../components/omni/AuroraBackground';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PersonalizedContentFeed from "../components/ai/PersonalizedContentFeed";
import XPSystem from "../components/gamification/XPSystem";
import TeamSynergyAnalyzer from "../components/collaboration/TeamSynergyAnalyzer";
import IntegrationHealthMonitor from "../components/integrations/IntegrationHealthMonitor";
import PredictiveBottleneckDetector from "../components/workflow/PredictiveBottleneckDetector";
import RealTimeTrendAnalyzer from "../components/analytics/RealTimeTrendAnalyzer";
import AIStrategyAdvisor from "../components/insights/AIStrategyAdvisor";
import VoiceCommandInterface from "../components/multimodal/VoiceCommandInterface";
import ImmersiveDataFlowVisualizer from "../components/3d/ImmersiveDataFlowVisualizer";
import QuickActionsPanel from "../components/dashboard/QuickActionsPanel";

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
    queryFn: () => base44.entities.Agent.list({ created_by: userEmail }),
    enabled: !!userEmail,
    initialData: []
  });

  const { data: kpis } = useQuery({
    queryKey: ['agentKPIs', userEmail, timeRange],
    queryFn: () => base44.entities.AgentKPI.list({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: []
  });

  const { data: predictions } = useQuery({
    queryKey: ['predictions', userEmail],
    queryFn: () => base44.entities.PredictiveAnalytic.list({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: []
  });

  // Calculate aggregated metrics
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

  // Performance trend data
  const trendData = React.useMemo(() => {
    if (!kpis?.length) return [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      day: `Day ${i + 1}`,
      efficiency: 70 + Math.random() * 25,
      tasks: Math.floor(50 + Math.random() * 100),
      responseTime: 1 + Math.random() * 2
    }));
  }, [timeRange, kpis]);

  // Agent performance comparison
  const agentComparison = React.useMemo(() => {
    if (!agents?.length) return [];
    return agents.slice(0, 8).map(agent => ({
      name: agent.name || 'Agent',
      efficiency: 70 + Math.random() * 30,
      tasks: Math.floor(20 + Math.random() * 80)
    }));
  }, [agents]);

  // Anomaly detection
  const anomalies = [
    {
      id: 1,
      type: 'performance_drop',
      severity: 'high',
      agent: 'Financial Analyst',
      description: 'Response time increased by 45% in last 24 hours',
      impact: 'Critical',
      recommendation: 'Check system resources and optimize query patterns'
    },
    {
      id: 2,
      type: 'success_rate',
      severity: 'medium',
      agent: 'Market Scanner',
      description: 'Task success rate dropped to 72% (baseline: 89%)',
      impact: 'Moderate',
      recommendation: 'Review recent API changes and error logs'
    },
    {
      id: 3,
      type: 'efficiency',
      severity: 'low',
      agent: 'All Agents',
      description: 'Overall efficiency up 12% week-over-week',
      impact: 'Positive',
      recommendation: 'Document current practices for future optimization'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'from-red-500/20 to-orange-500/20 border-red-500/40';
      case 'medium': return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40';
      case 'low': return 'from-green-500/20 to-emerald-500/20 border-green-500/40';
      default: return 'from-gray-500/20 to-slate-500/20 border-gray-500/40';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'low': return <TrendingUp className="w-5 h-5 text-green-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

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
            Comprehensive performance monitoring with AI-powered insights and predictions
          </p>
        </motion.div>

        {/* Top-level KPIs */}
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
                <Zap className="w-6 h-6 text-purple-400" />
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

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-black/40 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-[200px] bg-black/40 border-white/10">
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
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10 p-6">
                <h3 className="text-white font-bold mb-4">Performance Trends</h3>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="day" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20' }} />
                      <Legend />
                      <Line type="monotone" dataKey="efficiency" stroke="#00f5ff" strokeWidth={2} isAnimationActive={false} />
                      <Line type="monotone" dataKey="tasks" stroke="#a855f7" strokeWidth={2} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-white/60">
                    Loading data...
                  </div>
                )}
              </Card>

              <Card className="bg-black/40 border-white/10 p-6">
                <h3 className="text-white font-bold mb-4">Agent Performance Comparison</h3>
                {agentComparison.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={agentComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="name" stroke="#ffffff60" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20' }} />
                      <Legend />
                      <Bar dataKey="efficiency" fill="#00f5ff" isAnimationActive={false} />
                      <Bar dataKey="tasks" fill="#a855f7" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-white/60">
                    No agent data available
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            {anomalies.map(anomaly => (
              <Card key={anomaly.id} className={`bg-gradient-to-br ${getSeverityColor(anomaly.severity)} p-6`}>
                <div className="flex items-start gap-4">
                  {getSeverityIcon(anomaly.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold">{anomaly.agent}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        anomaly.severity === 'high' ? 'bg-red-500/30 text-red-300' :
                        anomaly.severity === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                        'bg-green-500/30 text-green-300'
                      }`}>
                        {anomaly.impact}
                      </span>
                    </div>
                    <p className="text-white/80 mb-3">{anomaly.description}</p>
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-white/60 text-sm mb-1">💡 AI Recommendation:</p>
                      <p className="text-white text-sm">{anomaly.recommendation}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-white font-bold">7-Day Performance Forecast</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">Predicted Task Volume</span>
                    <span className="text-green-400 font-bold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +18%
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">
                    Expect approximately 420 tasks next week based on historical patterns and current trends
                  </p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">Efficiency Trajectory</span>
                    <span className="text-cyan-400 font-bold">Stable</span>
                  </div>
                  <p className="text-white/60 text-sm">
                    Efficiency expected to remain around 85-90% with current optimization patterns
                  </p>
                </div>
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80">Potential Bottleneck</span>
                    <span className="text-orange-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Day 5
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">
                    AI predicts resource constraints around Day 5 due to concurrent workload spikes
                  </p>
                </div>
              </div>
            </Card>

            {predictions?.slice(0, 3).map(pred => (
              <Card key={pred.id} className="bg-black/40 border-white/10 p-6">
                <h4 className="text-white font-bold mb-2">{pred.prediction_type}</h4>
                <p className="text-white/80 mb-2">{pred.prediction}</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${pred.confidence || 75}%` }}
                    />
                  </div>
                  <span className="text-white/60 text-sm">{pred.confidence || 75}% confident</span>
                </div>
                {pred.suggested_actions?.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-white/60 text-sm">Suggested Actions:</p>
                    {pred.suggested_actions.map((action, i) => (
                      <p key={i} className="text-white/80 text-sm">• {action}</p>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-green-400" />
                <h3 className="text-white font-bold">High-Impact Optimization</h3>
              </div>
              <p className="text-white/80 mb-3">
                Implement query caching for Financial Analyst agent to reduce response time by estimated 35%
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-500/30 hover:bg-green-500/40 text-green-300 rounded-lg text-sm font-semibold transition-colors">
                  Apply Optimization
                </button>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-sm transition-colors">
                  Learn More
                </button>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-cyan-400" />
                <h3 className="text-white font-bold">Scaling Opportunity</h3>
              </div>
              <p className="text-white/80 mb-3">
                Market Scanner agent showing consistent high performance. Consider deploying 2 additional instances.
              </p>
              <button className="px-4 py-2 bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-300 rounded-lg text-sm font-semibold transition-colors">
                Deploy Instances
              </button>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
                <h3 className="text-white font-bold">Training Recommendation</h3>
              </div>
              <p className="text-white/80 mb-3">
                Data Analyst agent could benefit from additional training on recent market volatility patterns.
              </p>
              <button className="px-4 py-2 bg-purple-500/30 hover:bg-purple-500/40 text-purple-300 rounded-lg text-sm font-semibold transition-colors">
                Start Training Session
              </button>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Enhanced Sections */}
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <PersonalizedContentFeed />
          <XPSystem />
        </div>

        <Card className="bg-black/40 border-white/10 p-6 mt-6">
          <h3 className="text-white font-bold mb-4">Immersive Data Flow</h3>
          <ImmersiveDataFlowVisualizer height="500px" />
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <AIStrategyAdvisor />
          <TeamSynergyAnalyzer />
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-6">
          <RealTimeTrendAnalyzer />
          <IntegrationHealthMonitor />
          <VoiceCommandInterface />
        </div>

        <div className="mt-6">
          <PredictiveBottleneckDetector />
        </div>

        <div className="mt-6">
          <QuickActionsPanel />
        </div>
      </div>
    </AuroraBackground>
  );
}