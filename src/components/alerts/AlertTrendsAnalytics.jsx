import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';

export default function AlertTrendsAnalytics() {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d

  const { data: alertHistory = [] } = useQuery({
    queryKey: ['alertHistory', timeRange],
    queryFn: () => base44.entities.AlertHistory.list('-created_date', 500),
    initialData: []
  });

  const getTrendData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const now = new Date();
    const trends = {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trends[key] = { date: key, total: 0, critical: 0, warning: 0, info: 0 };
    }

    alertHistory.forEach(alert => {
      const alertDate = new Date(alert.created_date);
      const key = alertDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (trends[key]) {
        trends[key].total++;
        trends[key][alert.severity]++;
      }
    });

    return Object.values(trends);
  };

  const getSeverityDistribution = () => {
    const dist = { critical: 0, warning: 0, info: 0 };
    alertHistory.forEach(a => dist[a.severity]++);
    return [
      { name: 'Critical', value: dist.critical, fill: '#ef4444' },
      { name: 'Warning', value: dist.warning, fill: '#f59e0b' },
      { name: 'Info', value: dist.info, fill: '#3b82f6' }
    ];
  };

  const trendData = getTrendData();
  const severityDist = getSeverityDistribution();

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {['7d', '30d', '90d'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Line Chart */}
        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Alert Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" strokeWidth={2} />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={severityDist} cx="50%" cy="50%" labelLine={false} label={{ fill: '#e2e8f0' }} outerRadius={80} dataKey="value">
                  {severityDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {severityDist.map(item => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="text-slate-300">{item.name}</span>
                  <Badge style={{ backgroundColor: item.fill }} className="text-white">
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Total Alerts</p>
              <p className="text-3xl font-bold text-white">{alertHistory.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-400">
                {alertHistory.filter(a => a.severity === 'critical').length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Avg Response Time</p>
              <p className="text-3xl font-bold text-blue-400">2.5h</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}