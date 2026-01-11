import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertTriangle, Users, Zap, Settings } from 'lucide-react';

export default function ComprehensiveAnalyticsDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [customReport, setCustomReport] = useState(null);

  const metrics = {
    agentPerformance: {
      tasksCompleted: 234,
      successRate: 94.2,
      avgResponseTime: 1.2,
      efficiency: 87.5,
    },
    systemHealth: {
      uptime: 99.8,
      errorRate: 0.8,
      memoryUsage: 62,
      cpuUsage: 45,
    },
    integrations: {
      slack: { status: 'active', usage: 2400 },
      googleWorkspace: { status: 'active', usage: 1800 },
      stripe: { status: 'active', usage: 950 },
      zoom: { status: 'active', usage: 450 },
    },
    anomalies: [
      { type: 'High Error Rate', severity: 'medium', time: '2h ago' },
      { type: 'Unusual Spending Pattern', severity: 'low', time: '5h ago' },
      { type: 'Memory Spike', severity: 'low', time: '1d ago' },
    ],
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'agents', label: 'Agent Performance', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'health', label: 'System Health', icon: TrendingUp },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Comprehensive Analytics Dashboard</h1>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            <button className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/30 rounded-lg px-4 py-2 text-cyan-300 text-sm hover:bg-cyan-500/30">
              <Settings className="w-4 h-4" />
              Custom Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tasks Completed', value: metrics.agentPerformance.tasksCompleted },
            { label: 'Success Rate', value: `${metrics.agentPerformance.successRate}%` },
            { label: 'Avg Response', value: `${metrics.agentPerformance.avgResponseTime}s` },
            { label: 'System Uptime', value: `${metrics.systemHealth.uptime}%` },
          ].map((kpi, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
            >
              <p className="text-white/60 text-sm mb-2">{kpi.label}</p>
              <p className="text-2xl font-bold text-cyan-400">{kpi.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-all ${
                  selectedTab === tab.id
                    ? 'bg-cyan-500/20 border-cyan-400'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-lg p-6"
        >
          {selectedTab === 'overview' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">System Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/80 font-semibold mb-2">Agent Efficiency</p>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[87.5%] bg-green-500" />
                  </div>
                  <p className="text-green-400 text-sm mt-2">87.5%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/80 font-semibold mb-2">System Health</p>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[99.8%] bg-cyan-500" />
                  </div>
                  <p className="text-cyan-400 text-sm mt-2">99.8%</p>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'integrations' && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white mb-4">Integration Status</h2>
              {Object.entries(metrics.integrations).map(([name, data]) => (
                <div key={name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white capitalize font-semibold">{name.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-white/60 text-sm">{data.usage} events/day</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                    {data.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'anomalies' && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white mb-4">Detected Anomalies</h2>
              {metrics.anomalies.map((anomaly, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border-l-4 border-yellow-400">
                  <div>
                    <p className="text-white font-semibold">{anomaly.type}</p>
                    <p className="text-white/60 text-sm">{anomaly.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {anomaly.severity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Custom Report Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Custom Report Builder</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Metric Selection', desc: 'Choose metrics to track' },
              { label: 'Time Granularity', desc: 'Daily, weekly, monthly' },
              { label: 'Export Format', desc: 'PDF, CSV, JSON' },
            ].map((item, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all"
              >
                <p className="text-white font-semibold mb-1">{item.label}</p>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}