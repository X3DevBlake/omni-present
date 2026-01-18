import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Zap, TrendingUp, Activity } from 'lucide-react';

export default function HomeEnhanced3DSection() {
  const [activeTab, setActiveTab] = useState('performance');
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    setAnimationComplete(true);
  }, []);

  const performanceData = [
    { name: 'Jan', agents: 120, transactions: 3200, success: 98.5 },
    { name: 'Feb', agents: 150, transactions: 3800, success: 99.1 },
    { name: 'Mar', agents: 180, transactions: 4200, success: 99.3 },
    { name: 'Apr', agents: 220, transactions: 5100, success: 99.5 },
    { name: 'May', agents: 280, transactions: 6200, success: 99.7 },
    { name: 'Jun', agents: 350, transactions: 7800, success: 99.8 }
  ];

  const networkData = [
    { name: 'AI Lab', value: 450, growth: '+24%', color: '#3b82f6' },
    { name: 'Banking', value: 380, growth: '+18%', color: '#10b981' },
    { name: 'Devices', value: 320, growth: '+22%', color: '#f59e0b' },
    { name: 'Simulation', value: 290, growth: '+15%', color: '#8b5cf6' },
    { name: 'Governance', value: 240, growth: '+32%', color: '#ec4899' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={animationComplete ? { opacity: 1 } : {}}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Enhanced 3D Analytics Section */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl border-slate-700/50 overflow-hidden">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-slate-900/40 rounded-none border-b border-slate-700">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="networks" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Hub Activity
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Live Metrics
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Agent & Transaction Growth</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                      <Legend />
                      <Line type="monotone" dataKey="agents" stroke="#3b82f6" strokeWidth={2} name="Active Agents" />
                      <Line type="monotone" dataKey="transactions" stroke="#10b981" strokeWidth={2} name="Transactions" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Success Rate */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'System Uptime', value: '99.8%', trend: '+0.2%' },
                    { label: 'Avg Response Time', value: '245ms', trend: '-12%' },
                    { label: 'Success Rate', value: '99.8%', trend: '+0.1%' }
                  ].map((metric, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <p className="text-sm text-slate-400 mb-1">{metric.label}</p>
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <Badge className="mt-2 bg-green-500/20 text-green-300 text-xs">{metric.trend}</Badge>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Networks Tab */}
              <TabsContent value="networks" className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Hub Activity Distribution</h3>
                <div className="space-y-3">
                  {networkData.map((hub, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300">{hub.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge style={{ backgroundColor: hub.color + '33', color: hub.color }}>
                            {hub.growth}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(hub.value / 450) * 100}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          style={{ backgroundColor: hub.color }}
                          className="h-full rounded-full"
                        />
                      </div>
                      <p className="text-xs text-slate-400">{hub.value} active entities</p>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Metrics Tab */}
              <TabsContent value="metrics" className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Real-Time System Metrics</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                    <Legend />
                    <Bar dataKey="success" fill="#10b981" name="Success Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Data Sources Section */}
      <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Data Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Real-Time API', status: 'Connected', latency: '45ms' },
              { name: 'Blockchain Data', status: 'Synced', latency: '120ms' },
              { name: 'Agent Telemetry', status: 'Active', latency: '78ms' }
            ].map((source, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-white">{source.name}</p>
                  <Badge className="mt-1 bg-green-500/20 text-green-300 text-xs">
                    {source.status}
                  </Badge>
                </div>
                <span className="text-xs text-slate-400">{source.latency}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}