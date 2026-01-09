import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Users, DollarSign, Zap, Brain } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    // Generate analytics data
    const data = {
      agentActivity: Array.from({ length: 20 }, (_, i) => ({
        time: `T${i}`,
        agents: Math.floor(Math.random() * 50) + 20,
        efficiency: Math.floor(Math.random() * 40) + 60,
        learning: Math.floor(Math.random() * 30) + 70
      })),
      resourceFlow: Array.from({ length: 20 }, (_, i) => ({
        time: `T${i}`,
        food: Math.floor(Math.random() * 100),
        water: Math.floor(Math.random() * 100),
        materials: Math.floor(Math.random() * 80)
      })),
      economicData: Array.from({ length: 20 }, (_, i) => ({
        time: `T${i}`,
        trades: Math.floor(Math.random() * 30) + 10,
        volume: Math.floor(Math.random() * 500) + 200
      })),
      stats: {
        totalAgents: 1247,
        activeSimulations: 89,
        totalTrades: 5632,
        avgEfficiency: 87
      }
    };

    setMetrics(data);
  };

  if (!metrics) return null;

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Platform <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Analytics</span>
          </h1>
          <p className="text-white/60 text-lg">Comprehensive insights into your AI ecosystem</p>
        </motion.div>

        <div className="flex gap-3 mb-8">
          {['24h', '7d', '30d', '90d'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-3 rounded-xl font-medium ${
                timeRange === range
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Agents', value: metrics.stats.totalAgents, icon: Users, color: 'cyan' },
            { label: 'Active Sims', value: metrics.stats.activeSimulations, icon: Activity, color: 'purple' },
            { label: 'Total Trades', value: metrics.stats.totalTrades, icon: DollarSign, color: 'green' },
            { label: 'Avg Efficiency', value: `${metrics.stats.avgEfficiency}%`, icon: Zap, color: 'yellow' }
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`bg-${stat.color}-500/10 border border-${stat.color}-500/30 rounded-2xl p-6`}>
                <Icon className={`w-8 h-8 text-${stat.color}-400 mb-3`} />
                <div className="text-white/60 text-sm mb-1">{stat.label}</div>
                <div className={`text-${stat.color}-400 text-3xl font-bold`}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Agent Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={metrics.agentActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                <Legend />
                <Area type="monotone" dataKey="agents" stroke="#00f5ff" fill="#00f5ff" fillOpacity={0.3} />
                <Area type="monotone" dataKey="efficiency" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Resource Flow</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.resourceFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
                <Legend />
                <Line type="monotone" dataKey="food" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="materials" stroke="#fbbf24" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">Economic Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.economicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
              <Legend />
              <Bar dataKey="trades" fill="#00f5ff" />
              <Bar dataKey="volume" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AuroraBackground>
  );
}