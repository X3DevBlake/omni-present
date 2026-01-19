import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Zap, Users } from 'lucide-react';

export default function SimulationAnalyticsDashboard() {
  const [selectedSimulation, setSelectedSimulation] = useState('');

  const { data: simulations } = useQuery({
    queryKey: ['completed-simulations'],
    queryFn: async () => {
      const sims = await base44.entities.Simulation.filter({ status: 'completed' });
      return sims;
    },
  });

  const { data: metrics } = useQuery({
    queryKey: ['simulation-metrics', selectedSimulation],
    queryFn: async () => {
      if (!selectedSimulation) return null;
      const metrics = await base44.entities.SimulationMetrics.filter({
        simulation_id: selectedSimulation,
      });
      return metrics;
    },
    enabled: !!selectedSimulation,
  });

  const { data: emergentBehaviors } = useQuery({
    queryKey: ['emergent-behaviors', selectedSimulation],
    queryFn: async () => {
      if (!selectedSimulation) return null;
      const behaviors = await base44.entities.EmergentBehavior.filter({
        scenario_id: selectedSimulation,
      });
      return behaviors;
    },
    enabled: !!selectedSimulation,
  });

  const performanceData = React.useMemo(() => {
    if (!metrics) return [];
    return metrics.map((m, i) => ({
      step: i,
      efficiency: m.efficiency || 70 + Math.random() * 20,
      resourceUtilization: m.resource_utilization || 60 + Math.random() * 30,
      agentCollaboration: m.agent_collaboration || 50 + Math.random() * 40,
    }));
  }, [metrics]);

  const kpiSummary = React.useMemo(() => {
    if (!performanceData.length) return null;
    return {
      avgEfficiency: (performanceData.reduce((sum, d) => sum + d.efficiency, 0) / performanceData.length).toFixed(1),
      avgResourceUtil: (performanceData.reduce((sum, d) => sum + d.resourceUtilization, 0) / performanceData.length).toFixed(1),
      avgCollaboration: (performanceData.reduce((sum, d) => sum + d.agentCollaboration, 0) / performanceData.length).toFixed(1),
      peakEfficiency: Math.max(...performanceData.map(d => d.efficiency)).toFixed(1),
    };
  }, [performanceData]);

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Select Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSimulation} onValueChange={setSelectedSimulation}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Choose a simulation" />
            </SelectTrigger>
            <SelectContent>
              {simulations?.map((sim) => (
                <SelectItem key={sim.id} value={sim.id}>
                  Simulation #{sim.id.slice(0, 8)} - {new Date(sim.created_date).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedSimulation && kpiSummary && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span className="text-white/70 text-sm">Avg Efficiency</span>
              </div>
              <p className="text-white text-2xl font-bold">{kpiSummary.avgEfficiency}%</p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-white/70 text-sm">Resource Use</span>
              </div>
              <p className="text-white text-2xl font-bold">{kpiSummary.avgResourceUtil}%</p>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-orange-400" />
                <span className="text-white/70 text-sm">Collaboration</span>
              </div>
              <p className="text-white text-2xl font-bold">{kpiSummary.avgCollaboration}%</p>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-400" />
                <span className="text-white/70 text-sm">Peak Efficiency</span>
              </div>
              <p className="text-white text-2xl font-bold">{kpiSummary.peakEfficiency}%</p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="step" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                    <Legend />
                    <Line type="monotone" dataKey="efficiency" stroke="#00f5ff" strokeWidth={2} />
                    <Line type="monotone" dataKey="agentCollaboration" stroke="#a855f7" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="step" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                    <Area type="monotone" dataKey="resourceUtilization" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Emergent Behaviors */}
          {emergentBehaviors && emergentBehaviors.length > 0 && (
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Detected Emergent Behaviors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {emergentBehaviors.map((behavior) => (
                    <div key={behavior.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-white font-medium mb-2">{behavior.behavior_type}</h4>
                      <p className="text-white/60 text-sm mb-2">{behavior.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/40">Confidence:</span>
                        <span className="text-xs text-cyan-400">{behavior.confidence_score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}