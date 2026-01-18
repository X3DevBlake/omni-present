import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Bot, AlertTriangle, TrendingUp, Settings, Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Autonomy3DVisualizer from '../components/3d/Autonomy3DVisualizer';

export default function AgentAutonomyDashboard() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [globalAutonomyLevel, setGlobalAutonomyLevel] = useState(50);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: agents = [] } = useQuery({
    queryKey: ['agents', user?.email],
    queryFn: () => base44.entities.Agent.filter({ created_by: user?.email }),
    enabled: !!user
  });

  const { data: autonomySettings = [] } = useQuery({
    queryKey: ['autonomySettings', user?.email],
    queryFn: () => base44.entities.AutonomousSetting.filter({ user_email: user?.email }),
    enabled: !!user
  });

  const { data: agentKPIs = [] } = useQuery({
    queryKey: ['agentKPIs'],
    queryFn: () => base44.entities.AgentKPI.filter({}).sort('-created_date').limit(100)
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['autonomyAlerts'],
    queryFn: () => base44.entities.ProactiveAlert.filter({ alert_type: 'autonomy_violation' })
  });

  const updateAutonomyMutation = useMutation({
    mutationFn: async ({ agentId, level }) => {
      const setting = autonomySettings.find(s => s.setting_key === `agent_${agentId}_autonomy`);
      if (setting) {
        return base44.entities.AutonomousSetting.update(setting.id, { automation_level: level });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['autonomySettings'])
  });

  const agentsWithAutonomy = agents.map(agent => {
    const setting = autonomySettings.find(s => s.setting_key === `agent_${agent.id}_autonomy`);
    const kpis = agentKPIs.filter(k => k.agent_id === agent.id);
    const avgPerformance = kpis.length > 0 
      ? kpis.reduce((sum, k) => sum + (k.success_rate || 0), 0) / kpis.length 
      : 0;

    return {
      ...agent,
      autonomy_level: setting?.automation_level || 0,
      performance: avgPerformance,
      status_color: setting?.automation_level > 80 ? '#ef4444' : setting?.automation_level > 50 ? '#f59e0b' : '#10b981'
    };
  });

  const performanceImpactData = agentsWithAutonomy.map(agent => ({
    name: agent.name,
    autonomy: agent.autonomy_level,
    performance: agent.performance,
    efficiency: agentKPIs.find(k => k.agent_id === agent.id)?.efficiency || 0
  }));

  const autonomyDistribution = [
    { range: '0-25%', count: agentsWithAutonomy.filter(a => a.autonomy_level <= 25).length },
    { range: '26-50%', count: agentsWithAutonomy.filter(a => a.autonomy_level > 25 && a.autonomy_level <= 50).length },
    { range: '51-75%', count: agentsWithAutonomy.filter(a => a.autonomy_level > 50 && a.autonomy_level <= 75).length },
    { range: '76-100%', count: agentsWithAutonomy.filter(a => a.autonomy_level > 75).length }
  ];

  const radarData = selectedAgent ? [{
    metric: 'Autonomy',
    value: selectedAgent.autonomy_level,
    fullMark: 100
  }, {
    metric: 'Performance',
    value: selectedAgent.performance,
    fullMark: 100
  }, {
    metric: 'Efficiency',
    value: agentKPIs.find(k => k.agent_id === selectedAgent.id)?.efficiency || 0,
    fullMark: 100
  }, {
    metric: 'Reliability',
    value: agentKPIs.find(k => k.agent_id === selectedAgent.id)?.success_rate || 0,
    fullMark: 100
  }] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Agent Autonomy Control Center</h1>
          <p className="text-slate-400">Monitor and manage AI agent autonomy levels across your ecosystem</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Total Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{agents.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Avg Autonomy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {(agentsWithAutonomy.reduce((sum, a) => sum + a.autonomy_level, 0) / agentsWithAutonomy.length || 0).toFixed(0)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                High Autonomy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">
                {agentsWithAutonomy.filter(a => a.autonomy_level > 75).length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{alerts.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">3D Autonomy Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <Autonomy3DVisualizer agents={agentsWithAutonomy} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Autonomy Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={autonomyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="range" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Performance Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceImpactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
                <Line type="monotone" dataKey="autonomy" stroke="#3b82f6" name="Autonomy %" />
                <Line type="monotone" dataKey="performance" stroke="#10b981" name="Performance %" />
                <Line type="monotone" dataKey="efficiency" stroke="#f59e0b" name="Efficiency" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Agent Control Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentsWithAutonomy.map(agent => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: agent.status_color }} />
                      <div>
                        <h3 className="text-white font-semibold">{agent.name}</h3>
                        <p className="text-sm text-slate-400">Performance: {agent.performance.toFixed(1)}%</p>
                      </div>
                    </div>
                    <Badge variant={agent.autonomy_level > 75 ? 'destructive' : 'default'}>
                      {agent.autonomy_level}% Autonomy
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-400 w-24">Autonomy:</span>
                      <Slider
                        value={[agent.autonomy_level]}
                        onValueChange={(value) => updateAutonomyMutation.mutate({ agentId: agent.id, level: value[0] })}
                        max={100}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-white font-mono w-12">{agent.autonomy_level}%</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    View Details
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedAgent && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Agent Radar Analysis: {selectedAgent.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
                  <PolarRadiusAxis stroke="#94a3b8" />
                  <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}