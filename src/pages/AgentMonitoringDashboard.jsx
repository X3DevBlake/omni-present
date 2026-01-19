import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, TrendingUp, AlertTriangle, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerformanceMetrics3D from '../components/monitoring/PerformanceMetrics3D';
import SkillEvolution3D from '../components/monitoring/SkillEvolution3D';

export default function AgentMonitoringDashboard() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list('', 50),
  });

  const { data: metrics } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: () => base44.entities.AgentPerformanceMetrics.list('-created_date', 100),
  });

  const trackMetrics = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('trackAgentMetrics', {
        agent_id: agentId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-metrics'] });
    },
  });

  const avgEfficiency = React.useMemo(() => {
    if (!metrics || metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + (m.efficiency_score || 0), 0) / metrics.length;
  }, [metrics]);

  const totalAnomalies = React.useMemo(() => {
    if (!metrics) return 0;
    return metrics.reduce((sum, m) => sum + (m.anomalies_detected?.length || 0), 0);
  }, [metrics]);

  const avgCompletion = React.useMemo(() => {
    if (!metrics || metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + (m.task_completion_rate || 0), 0) / metrics.length;
  }, [metrics]);

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              Agent Monitoring Dashboard
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Real-time performance tracking, anomaly detection, and skill evolution
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <Activity className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">{avgEfficiency.toFixed(0)}%</p>
            <p className="text-white/60 text-sm">Avg Efficiency</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">{avgCompletion.toFixed(0)}%</p>
            <p className="text-white/60 text-sm">Completion Rate</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <AlertTriangle className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">{totalAnomalies}</p>
            <p className="text-white/60 text-sm">Anomalies</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Cpu className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{agents?.length || 0}</p>
            <p className="text-white/60 text-sm">Active Agents</p>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="skills">Skill Evolution</TabsTrigger>
            <TabsTrigger value="3d">3D Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {agents?.slice(0, 9).map((agent) => (
                <Card
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`cursor-pointer transition-all ${
                    selectedAgent?.id === agent.id
                      ? 'bg-cyan-500/20 border-cyan-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <CardContent className="p-4">
                    <h3 className="text-white font-bold mb-2">{agent.name}</h3>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        trackMetrics.mutate(agent.id);
                      }}
                      disabled={trackMetrics.isPending}
                      size="sm"
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                    >
                      Track Metrics
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {trackMetrics.data && (
              <Card className="bg-gradient-to-r from-cyan-500/20 to-green-500/20 border-cyan-500/30">
                <CardContent className="p-6">
                  <h3 className="text-cyan-300 font-bold mb-4">Latest Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Completion</div>
                      <div className="text-green-400 text-2xl font-bold">
                        {trackMetrics.data.summary.completion_rate.toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Efficiency</div>
                      <div className="text-cyan-400 text-2xl font-bold">
                        {trackMetrics.data.summary.efficiency.toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Anomalies</div>
                      <div className="text-orange-400 text-2xl font-bold">
                        {trackMetrics.data.summary.anomalies}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {metrics?.slice(0, 8).map((metric) => (
                <Card key={metric.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge>Agent {metric.agent_id.slice(-6)}</Badge>
                      <span className="text-white/60 text-xs">{metric.time_period}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Tasks</div>
                        <div className="text-green-400 font-bold">{metric.task_completion_rate?.toFixed(0)}%</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Efficiency</div>
                        <div className="text-cyan-400 font-bold">{metric.efficiency_score?.toFixed(0)}%</div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Errors</div>
                        <div className="text-orange-400 font-bold">{metric.error_rate?.toFixed(1)}%</div>
                      </div>
                    </div>

                    {metric.resource_utilization && (
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded p-2">
                        <div className="text-purple-300 text-xs mb-1">Resources</div>
                        <div className="text-white/80 text-xs">
                          CPU: {metric.resource_utilization.cpu?.toFixed(0)}% | 
                          Mem: {metric.resource_utilization.memory?.toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="anomalies">
            <div className="space-y-4">
              {metrics?.map((metric) => 
                metric.anomalies_detected?.map((anomaly, i) => (
                  <Card key={`${metric.id}-${i}`} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold">Agent {metric.agent_id.slice(-6)}</h3>
                        <Badge className={`${
                          anomaly.severity === 'critical' ? 'bg-red-500' :
                          anomaly.severity === 'high' ? 'bg-orange-500' :
                          anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        } text-white`}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <div className="bg-black/30 rounded p-3 mb-2">
                        <div className="text-white/60 text-sm mb-1">Type: {anomaly.anomaly_type}</div>
                        <div className="text-white text-sm">{anomaly.description}</div>
                      </div>
                      <div className="text-white/40 text-xs">{anomaly.timestamp}</div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="skills">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Skill Evolution Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <SkillEvolution3D metrics={metrics} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="3d">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Performance Metrics Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceMetrics3D metrics={metrics} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}