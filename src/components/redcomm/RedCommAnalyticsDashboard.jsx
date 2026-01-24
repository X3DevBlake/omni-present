import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Activity, Zap, AlertTriangle } from 'lucide-react';

export default function RedCommAnalyticsDashboard() {
  const { data: linkHealthData = [] } = useQuery({
    queryKey: ['redcomm-analytics-health'],
    queryFn: () => base44.entities.RedCommLinkHealth.list('-created_date', 30),
    refetchInterval: 10000
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['redcomm-analytics-messages'],
    queryFn: () => base44.entities.RedCommMessage.list('-created_date', 50),
    refetchInterval: 10000
  });

  // Calculate analytics
  const avgHealthScore = linkHealthData.length > 0
    ? linkHealthData.reduce((sum, l) => sum + l.health_score, 0) / linkHealthData.length
    : 0;

  const avgLatency = messages.length > 0
    ? messages.reduce((sum, m) => sum + (m.latency_ms || 0), 0) / messages.length
    : 0;

  const successRate = messages.length > 0
    ? (messages.filter(m => m.transmission_status === 'delivered').length / messages.length) * 100
    : 0;

  const aiOptimizedRate = messages.length > 0
    ? (messages.filter(m => m.ai_optimized).length / messages.length) * 100
    : 0;

  // Prepare chart data
  const healthTrendData = linkHealthData.slice(0, 10).reverse().map((link, idx) => ({
    time: `T-${10-idx}`,
    health: link.health_score,
    signal: link.signal_quality,
    packetLoss: link.packet_loss_rate * 100
  }));

  const messageTypeData = [
    { type: 'Data', count: messages.filter(m => m.message_type === 'data').length },
    { type: 'Control', count: messages.filter(m => m.message_type === 'control').length },
    { type: 'Telemetry', count: messages.filter(m => m.message_type === 'telemetry').length },
    { type: 'Emergency', count: messages.filter(m => m.message_type === 'emergency').length }
  ];

  const modulationData = [
    { scheme: 'BPSK', count: messages.filter(m => m.adaptive_modulation_used === 'BPSK').length },
    { scheme: 'QPSK', count: messages.filter(m => m.adaptive_modulation_used === 'QPSK').length },
    { scheme: '16QAM', count: messages.filter(m => m.adaptive_modulation_used === '16QAM').length },
    { scheme: '64QAM', count: messages.filter(m => m.adaptive_modulation_used === '64QAM').length }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Health Score</p>
                <p className="text-3xl font-bold text-green-400 mt-1">{avgHealthScore.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Latency</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{avgLatency.toFixed(0)}ms</p>
              </div>
              <Activity className="w-10 h-10 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">{successRate.toFixed(1)}%</p>
              </div>
              <Zap className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-yellow-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">AI Optimized</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{aiOptimizedRate.toFixed(0)}%</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Trend Chart */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white">Link Health & Signal Quality Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={healthTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Legend />
              <Area type="monotone" dataKey="health" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Health Score" />
              <Area type="monotone" dataKey="signal" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Signal Quality" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Message Type Distribution */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Message Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={messageTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="type" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Modulation Scheme Usage */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Modulation Scheme Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={modulationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="scheme" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="count" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}