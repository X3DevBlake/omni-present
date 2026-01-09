import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, Database, Users, Download, TrendingUp, AlertCircle } from 'lucide-react';

export default function AgentMonitoringDashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState(['all']);

  const [realtimeMetrics, setRealtimeMetrics] = useState({
    taskCompletionRate: 94.2,
    resourceUtilization: 67.8,
    knowledgeInteractions: 1247,
    activeCollaborations: 23,
    avgResponseTime: 1.2,
    errorRate: 2.1
  });

  const [performanceData] = useState([
    { time: '00:00', tasks: 45, success: 42, resources: 65, kb: 120 },
    { time: '04:00', tasks: 38, success: 36, resources: 58, kb: 98 },
    { time: '08:00', tasks: 62, success: 59, resources: 72, kb: 156 },
    { time: '12:00', tasks: 71, success: 68, resources: 78, kb: 189 },
    { time: '16:00', tasks: 58, success: 55, resources: 69, kb: 142 },
    { time: '20:00', tasks: 49, success: 47, resources: 63, kb: 131 }
  ]);

  const [agentMetrics] = useState([
    { agent: 'Alpha', tasks: 156, success: 95, collab: 28, kb: 342 },
    { agent: 'Beta', tasks: 142, success: 89, collab: 31, kb: 298 },
    { agent: 'Gamma', tasks: 168, success: 97, collab: 25, kb: 387 },
    { agent: 'Delta', tasks: 131, success: 85, collab: 22, kb: 256 }
  ]);

  const [trendData] = useState([
    { week: 'Week 1', completion: 87, efficiency: 82, collaboration: 78 },
    { week: 'Week 2', completion: 89, efficiency: 85, collaboration: 81 },
    { week: 'Week 3', completion: 91, efficiency: 87, collaboration: 83 },
    { week: 'Week 4', completion: 94, efficiency: 90, collaboration: 86 }
  ]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setRealtimeMetrics(prev => ({
          taskCompletionRate: Math.min(100, prev.taskCompletionRate + (Math.random() - 0.5) * 2),
          resourceUtilization: Math.min(100, Math.max(0, prev.resourceUtilization + (Math.random() - 0.5) * 5)),
          knowledgeInteractions: prev.knowledgeInteractions + Math.floor(Math.random() * 10),
          activeCollaborations: Math.max(0, prev.activeCollaborations + Math.floor((Math.random() - 0.5) * 3)),
          avgResponseTime: Math.max(0.1, prev.avgResponseTime + (Math.random() - 0.5) * 0.2),
          errorRate: Math.max(0, prev.errorRate + (Math.random() - 0.5) * 0.5)
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      timeRange,
      metrics: realtimeMetrics,
      performanceData,
      agentMetrics,
      trendData
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-monitoring-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-2xl">Agent Monitoring Dashboard</h2>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              autoRefresh ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-gray-500/20 border border-gray-500/50 text-gray-400'
            }`}
          >
            {autoRefresh ? '🟢 Live' : '⏸️ Paused'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={exportReport}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
        </div>
      </div>

      {/* Real-time KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Task Completion', value: `${realtimeMetrics.taskCompletionRate.toFixed(1)}%`, icon: Activity, color: '#10b981', trend: '+2.3%' },
          { label: 'Resource Usage', value: `${realtimeMetrics.resourceUtilization.toFixed(1)}%`, icon: Cpu, color: '#f59e0b', trend: '-1.2%' },
          { label: 'KB Interactions', value: realtimeMetrics.knowledgeInteractions, icon: Database, color: '#3b82f6', trend: '+15%' },
          { label: 'Collaborations', value: realtimeMetrics.activeCollaborations, icon: Users, color: '#a855f7', trend: '+8' },
          { label: 'Avg Response', value: `${realtimeMetrics.avgResponseTime.toFixed(2)}s`, icon: TrendingUp, color: '#06b6d4', trend: '-0.3s' },
          { label: 'Error Rate', value: `${realtimeMetrics.errorRate.toFixed(1)}%`, icon: AlertCircle, color: '#ef4444', trend: '-0.5%' }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} style={{ color: metric.color }} />
                <span className={`text-xs font-semibold ${metric.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
              <p className="text-white/60 text-xs">{metric.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Over Time */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4">Task Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="time" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="tasks" stroke="#00f5ff" fill="#00f5ff20" strokeWidth={2} />
              <Area type="monotone" dataKey="success" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4">Resource & Knowledge Base</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="time" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="resources" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="kb" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Comparison */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Agent Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={agentMetrics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="agent" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="tasks" fill="#00f5ff" />
            <Bar dataKey="success" fill="#10b981" />
            <Bar dataKey="collab" fill="#a855f7" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Analysis */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Performance Trends</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="week" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="efficiency" stroke="#00f5ff" strokeWidth={2} />
            <Line type="monotone" dataKey="collaboration" stroke="#a855f7" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-green-400 font-semibold mb-2">✓ Optimal Performance</p>
          <p className="text-white text-sm">All agents operating within normal parameters</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-400 font-semibold mb-2">⚠ High Resource Usage</p>
          <p className="text-white text-sm">Agent-Delta at 89% CPU utilization</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 font-semibold mb-2">📊 Trend Alert</p>
          <p className="text-white text-sm">KB interactions up 15% this week</p>
        </div>
      </div>
    </div>
  );
}