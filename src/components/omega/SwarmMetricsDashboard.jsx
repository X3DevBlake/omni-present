import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Users, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function SwarmMetricsDashboard() {
  const { data: user } = useQuery({
    queryKey: ['current_user'],
    queryFn: () => base44.auth.me()
  });

  const { data: swarms } = useQuery({
    queryKey: ['swarm_metrics'],
    queryFn: () => base44.entities.AgentSwarmHierarchy.list(),
    initialData: []
  });

  const performanceData = [
    { time: '00:00', score: 65 },
    { time: '04:00', score: 72 },
    { time: '08:00', score: 78 },
    { time: '12:00', score: 85 },
    { time: '16:00', score: 82 },
    { time: '20:00', score: 88 }
  ];

  const capacityData = [
    { level: 'Manager', count: 3, utilization: 85 },
    { level: 'Worker', count: 12, utilization: 72 },
    { level: 'Specialist', count: 5, utilization: 90 }
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <Card className="bg-gradient-to-br from-slate-950/90 via-gray-950/90 to-zinc-950/90 backdrop-blur-xl border-slate-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <LayoutDashboard className="w-7 h-7 text-slate-400" />
          Swarm Metrics Dashboard
          {isAdmin && <Badge className="bg-purple-600">Admin View</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/60">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/60 rounded-lg p-3 border border-blue-500/30">
                  <div className="text-blue-400 text-xs mb-1">Avg Performance</div>
                  <div className="text-white text-2xl font-bold">78%</div>
                </div>
                <div className="bg-black/60 rounded-lg p-3 border border-green-500/30">
                  <div className="text-green-400 text-xs mb-1">Active Swarms</div>
                  <div className="text-white text-2xl font-bold">{swarms.length}</div>
                </div>
                <div className="bg-black/60 rounded-lg p-3 border border-purple-500/30">
                  <div className="text-purple-400 text-xs mb-1">Total Agents</div>
                  <div className="text-white text-2xl font-bold">20</div>
                </div>
              </div>

              <div className="bg-black/40 rounded-lg p-4 border border-slate-500/20">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="capacity">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-black/40 rounded-lg p-4 border border-slate-500/20">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={capacityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="level" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="utilization" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {capacityData.map((item, idx) => (
                  <div key={idx} className="bg-black/60 rounded p-2 border border-purple-500/20 text-center">
                    <div className="text-purple-400 text-[10px]">{item.level}</div>
                    <div className="text-white font-bold">{item.count}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="insights">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="bg-blue-950/60 rounded-lg p-4 border border-blue-500/30">
                <div className="text-blue-400 text-sm font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance Trend
                </div>
                <div className="text-gray-300 text-sm">
                  Swarm performance improved 18% over last 24h. Optimal coordination detected.
                </div>
              </div>

              <div className="bg-green-950/60 rounded-lg p-4 border border-green-500/30">
                <div className="text-green-400 text-sm font-bold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Efficiency Gains
                </div>
                <div className="text-gray-300 text-sm">
                  GWT broadcast optimization reduced latency by 25%. Continue current strategy.
                </div>
              </div>

              <div className="bg-amber-950/60 rounded-lg p-4 border border-amber-500/30">
                <div className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Capacity Recommendation
                </div>
                <div className="text-gray-300 text-sm">
                  Consider adding 2 specialist agents to improve complex task handling.
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}