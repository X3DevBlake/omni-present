import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LiveMetricsDashboard({ userEmail }) {
  const [metrics, setMetrics] = useState([]);

  const { data: alerts } = useQuery({
    queryKey: ['realtimeAlerts', userEmail],
    queryFn: () => userEmail ? base44.entities.RealTimeAlert.filter({ user_email: userEmail, status: 'triggered' }).catch(() => []) : [],
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: !!userEmail
  });

  const { data: feeds } = useQuery({
    queryKey: ['liveDataFeeds', userEmail],
    queryFn: () => userEmail ? base44.entities.LiveDataFeed.filter({ user_email: userEmail }).catch(() => []) : [],
    refetchInterval: 3000,
    enabled: !!userEmail
  });

  const chartData = feeds?.slice(0, 5).map((feed, idx) => ({
    time: `${idx}m`,
    price: feed.current_value || 0,
    change: feed.change_percent || 0
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-xs font-bold">ACTIVE FEEDS</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-bold text-white">{feeds?.length || 0}</p>
          <p className="text-xs text-cyan-400 mt-1">Real-time streams</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-xs font-bold">ALERTS</span>
            <AlertCircle className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-white">{alerts?.length || 0}</p>
          <p className="text-xs text-orange-400 mt-1">Active triggers</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-xs font-bold">SENTIMENT</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">
            {feeds?.filter(f => (f.change_percent || 0) > 0).length || 0}/{feeds?.length || 0}
          </p>
          <p className="text-xs text-green-400 mt-1">Positive</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4"
        >
          <h4 className="text-white font-bold text-sm mb-3">Price Movement</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
              <Area
                type="monotone"
                dataKey="price"
                fill="#06b6d4"
                stroke="#06b6d4"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4"
        >
          <h4 className="text-white font-bold text-sm mb-3">Volatility</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
              <Line
                type="monotone"
                dataKey="change"
                stroke="#a855f7"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Alerts */}
      {alerts && alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
        >
          <h4 className="text-red-400 font-bold text-sm mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Recent Alerts
          </h4>
          <div className="space-y-1">
            {alerts.slice(0, 3).map((alert, idx) => (
              <p key={idx} className="text-xs text-white/70">
                • {alert.alert_type} - {alert.asset_id} ({alert.severity})
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}