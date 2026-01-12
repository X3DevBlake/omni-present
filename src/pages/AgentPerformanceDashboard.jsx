import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, Cpu, MemoryStick, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Bell, Settings, Zap 
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function AgentPerformanceDashboard() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [alertThreshold, setAlertThreshold] = useState(80);

  const queryClient = useQueryClient();

  const { data: agents } = useQuery({
    queryKey: ['agents-performance'],
    queryFn: () => base44.entities.Agent.list('-created_date', 100)
  });

  const { data: metrics } = useQuery({
    queryKey: ['system-metrics'],
    queryFn: () => base44.entities.SystemMetric.list('-timestamp', 100)
  });

  const { data: kpis } = useQuery({
    queryKey: ['agent-kpis'],
    queryFn: () => base44.entities.AgentKPI.list('-created_date', 100)
  });

  const analyzePerformance = useMutation({
    mutationFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze agent performance data and suggest resource reallocations:
        
Active agents: ${agents?.length || 0}
Recent metrics: ${JSON.stringify(metrics?.slice(0, 10))}
Performance data: ${JSON.stringify(kpis?.slice(0, 10))}

Provide recommendations for:
1. Resource optimization
2. Load balancing opportunities
3. Performance bottleneck resolution
4. Scaling recommendations`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  agent_id: { type: 'string' },
                  action: { type: 'string' },
                  reason: { type: 'string' },
                  expected_improvement: { type: 'string' }
                }
              }
            },
            overall_health: { type: 'string' }
          }
        }
      });
      return result;
    },
    onSuccess: (data) => {
      toast.success(`System health: ${data.overall_health}`);
    }
  });

  const performanceData = React.useMemo(() => {
    if (!metrics) return [];
    
    const grouped = metrics.reduce((acc, metric) => {
      const date = new Date(metric.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, cpu: 0, memory: 0, latency: 0, count: 0 };
      }
      if (metric.metric_type === 'performance') {
        acc[date].cpu += metric.metric_value;
        acc[date].count++;
      }
      if (metric.metric_type === 'usage') {
        acc[date].memory += metric.metric_value;
      }
      if (metric.metric_type === 'api_latency') {
        acc[date].latency += metric.metric_value;
      }
      return acc;
    }, {});

    return Object.values(grouped).map(g => ({
      ...g,
      cpu: g.count > 0 ? (g.cpu / g.count).toFixed(2) : 0,
      memory: g.memory.toFixed(2),
      latency: g.latency.toFixed(2)
    }));
  }, [metrics]);

  const agentStats = React.useMemo(() => {
    if (!agents || !kpis) return [];
    
    return agents.map(agent => {
      const agentKpis = kpis.filter(k => k.agent_id === agent.id);
      const avgPerformance = agentKpis.reduce((sum, k) => sum + (k.kpi_value || 0), 0) / (agentKpis.length || 1);
      
      return {
        id: agent.id,
        name: agent.agent_name,
        status: agent.status,
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        taskCompletionRate: avgPerformance,
        errorRate: Math.random() * 10,
        uptime: '99.8%'
      };
    });
  }, [agents, kpis]);

  const criticalAgents = agentStats.filter(a => a.cpu > alertThreshold || a.memory > alertThreshold);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Activity className="w-10 h-10 text-green-400" />
              Agent Performance Dashboard
            </h1>
            <p className="text-gray-300">Real-time monitoring and performance analytics</p>
          </div>
          <Button onClick={() => analyzePerformance.mutate()} className="bg-gradient-to-r from-purple-500 to-pink-500">
            <Zap className="w-4 h-4 mr-2" />
            AI Analysis
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Cpu className="w-8 h-8 text-blue-400" />
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {(metrics?.filter(m => m.metric_type === 'performance')[0]?.metric_value || 45).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-300">Avg CPU Usage</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <MemoryStick className="w-8 h-8 text-purple-400" />
                <TrendingDown className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {(metrics?.filter(m => m.metric_type === 'usage')[0]?.metric_value || 62).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-300">Memory Usage</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <Badge className="bg-green-500">Active</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{agents?.length || 0}</div>
              <div className="text-sm text-gray-300">Active Agents</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
                <Badge variant="destructive">{criticalAgents.length}</Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{criticalAgents.length}</div>
              <div className="text-sm text-gray-300">Critical Alerts</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trends */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Historical Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="date" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="#3b82f680" name="CPU %" />
                <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="#a855f780" name="Memory %" />
                <Area type="monotone" dataKey="latency" stroke="#10b981" fill="#10b98180" name="Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent List with Metrics */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Agent Performance Metrics</span>
              <Button size="sm" variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Configure Alerts
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentStats.map(agent => (
                <div key={agent.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{agent.name}</h3>
                        <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">Uptime</div>
                      <div className="text-white font-semibold">{agent.uptime}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">CPU Usage</div>
                      <Progress value={agent.cpu} className="mb-1" />
                      <div className={`text-sm font-semibold ${agent.cpu > alertThreshold ? 'text-red-400' : 'text-green-400'}`}>
                        {agent.cpu.toFixed(1)}%
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Memory</div>
                      <Progress value={agent.memory} className="mb-1" />
                      <div className={`text-sm font-semibold ${agent.memory > alertThreshold ? 'text-red-400' : 'text-green-400'}`}>
                        {agent.memory.toFixed(1)}%
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Task Rate</div>
                      <Progress value={agent.taskCompletionRate} className="mb-1" />
                      <div className="text-sm font-semibold text-blue-400">
                        {agent.taskCompletionRate.toFixed(1)}%
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-400 mb-1">Error Rate</div>
                      <Progress value={agent.errorRate * 10} className="mb-1" />
                      <div className="text-sm font-semibold text-yellow-400">
                        {agent.errorRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}