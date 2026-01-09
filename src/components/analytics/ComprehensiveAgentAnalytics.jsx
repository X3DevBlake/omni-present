import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Activity, Users, Target, Download, Filter } from 'lucide-react';

export default function ComprehensiveAgentAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const performanceData = [
    { day: 'Mon', tasks: 45, success: 42, knowledge: 120 },
    { day: 'Tue', tasks: 52, success: 48, knowledge: 145 },
    { day: 'Wed', tasks: 48, success: 46, knowledge: 138 },
    { day: 'Thu', tasks: 61, success: 58, knowledge: 167 },
    { day: 'Fri', tasks: 55, success: 52, knowledge: 152 },
    { day: 'Sat', tasks: 38, success: 36, knowledge: 98 },
    { day: 'Sun', tasks: 42, success: 40, knowledge: 115 }
  ];

  const agentDistribution = [
    { name: 'Active', value: 42, color: '#10b981' },
    { name: 'Training', value: 28, color: '#3b82f6' },
    { name: 'Idle', value: 18, color: '#6b7280' },
    { name: 'Deployed', value: 12, color: '#a855f7' }
  ];

  const skillsData = [
    { skill: 'Analysis', proficiency: 92 },
    { skill: 'Communication', proficiency: 85 },
    { skill: 'Problem Solving', proficiency: 88 },
    { skill: 'Collaboration', proficiency: 79 },
    { skill: 'Adaptation', proficiency: 91 }
  ];

  const collaborationMetrics = [
    { agent: 'Agent-1', tasks: 45, collaborations: 28, success: 92 },
    { agent: 'Agent-2', tasks: 38, collaborations: 22, success: 87 },
    { agent: 'Agent-3', tasks: 52, collaborations: 35, success: 95 },
    { agent: 'Agent-4', tasks: 41, collaborations: 19, success: 81 }
  ];

  const knowledgeGrowth = [
    { month: 'Jan', items: 1200 },
    { month: 'Feb', items: 1580 },
    { month: 'Mar', items: 2100 },
    { month: 'Apr', items: 2650 },
    { month: 'May', items: 3200 },
    { month: 'Jun', items: 3890 }
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-2xl">Comprehensive Analytics Dashboard</h2>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </motion.button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Task Completion', value: '94.3%', change: '+5.2%', icon: Target, color: '#10b981' },
          { label: 'Avg Performance', value: '87.5%', change: '+3.1%', icon: TrendingUp, color: '#3b82f6' },
          { label: 'Active Agents', value: '42', change: '+8', icon: Users, color: '#a855f7' },
          { label: 'Knowledge Base', value: '3.9K', change: '+240', icon: Activity, color: '#f59e0b' }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={24} style={{ color: metric.color }} />
                <span className="text-green-400 text-sm font-semibold">{metric.change}</span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
              <p className="text-white/60 text-sm">{metric.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Performance Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="tasks" stroke="#00f5ff" strokeWidth={2} />
              <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Distribution */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Agent Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={agentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {agentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Proficiency */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Average Skills Proficiency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={skillsData}>
              <PolarGrid stroke="#ffffff20" />
              <PolarAngleAxis dataKey="skill" stroke="#ffffff60" />
              <PolarRadiusAxis stroke="#ffffff60" />
              <Radar name="Proficiency" dataKey="proficiency" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Collaboration Metrics */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Collaboration Efficiency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={collaborationMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="agent" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="collaborations" fill="#00f5ff" />
              <Bar dataKey="success" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Knowledge Base Growth */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Knowledge Base Growth</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={knowledgeGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="month" stroke="#ffffff60" />
            <YAxis stroke="#ffffff60" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: '8px' }}
            />
            <Line type="monotone" dataKey="items" stroke="#f59e0b" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-green-400 font-semibold mb-2">✓ Top Performer</p>
          <p className="text-white text-sm">Agent-3 achieved 95% success rate this week</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 font-semibold mb-2">📈 Trending Up</p>
          <p className="text-white text-sm">Collaboration efficiency increased by 12%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
          <p className="text-purple-400 font-semibold mb-2">🎯 Recommendation</p>
          <p className="text-white text-sm">Consider deploying 3 more agents to meet demand</p>
        </div>
      </div>
    </div>
  );
}