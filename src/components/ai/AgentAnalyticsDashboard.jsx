import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Database, TrendingUp, Filter, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AgentAnalyticsDashboard() {
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [timePeriod, setTimePeriod] = useState('7d');

  const agents = [
    { id: 'all', name: 'All Agents', color: '#00f5ff' },
    { id: 'luna', name: 'Luna', color: '#00f5ff' },
    { id: 'apex', name: 'Apex', color: '#10b981' },
    { id: 'sage', name: 'Sage', color: '#a855f7' },
    { id: 'cipher', name: 'Cipher', color: '#ec4899' }
  ];

  const performanceData = [
    { day: 'Mon', tasks: 45, responseTime: 1.2, kbUsage: 230 },
    { day: 'Tue', tasks: 52, responseTime: 1.1, kbUsage: 245 },
    { day: 'Wed', tasks: 48, responseTime: 1.3, kbUsage: 260 },
    { day: 'Thu', tasks: 61, responseTime: 1.0, kbUsage: 280 },
    { day: 'Fri', tasks: 55, responseTime: 1.1, kbUsage: 295 },
    { day: 'Sat', tasks: 42, responseTime: 1.4, kbUsage: 240 },
    { day: 'Sun', tasks: 38, responseTime: 1.5, kbUsage: 220 }
  ];

  const metrics = [
    { label: 'Task Completion', value: '94.3%', trend: '+5.2%', icon: TrendingUp, color: 'green' },
    { label: 'Avg Response Time', value: '1.2s', trend: '-0.3s', icon: Clock, color: 'blue' },
    { label: 'KB Queries', value: '1,847', trend: '+12%', icon: Database, color: 'purple' },
    { label: 'Simulations Run', value: '328', trend: '+8%', icon: BarChart3, color: 'pink' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Filters */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-6 h-6 text-cyan-400" />
          <h3 className="text-white font-bold text-lg">Analytics Filters</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Agent Type</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Time Period</label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-${metric.color}-500/10 border border-${metric.color}-500/30 rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={`w-5 h-5 text-${metric.color}-400`} />
              <span className={`text-${metric.color}-400 text-xs font-bold`}>{metric.trend}</span>
            </div>
            <p className="text-white/60 text-xs mb-1">{metric.label}</p>
            <p className="text-white font-bold text-2xl">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Task Completion Chart */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Task Completion Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid #ffffff20', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="tasks" stroke="#00f5ff" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Knowledge Base Usage */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Knowledge Base Usage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1f', border: '1px solid #ffffff20', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="kbUsage" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Agent Performance Breakdown</h3>
        <div className="space-y-3">
          {agents.slice(1).map((agent, idx) => (
            <div key={agent.id} className="flex items-center gap-4">
              <div className="w-24">
                <p className="text-white font-semibold text-sm">{agent.name}</p>
              </div>
              <div className="flex-1">
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: agent.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${75 + Math.random() * 20}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                  />
                </div>
              </div>
              <div className="w-16 text-right">
                <p className="text-white font-bold text-sm">{Math.floor(75 + Math.random() * 20)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}