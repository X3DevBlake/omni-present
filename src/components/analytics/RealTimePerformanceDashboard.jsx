import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RealTimePerformanceDashboard({ analytics = [] }) {
  if (!analytics || analytics.length === 0) {
    return (
      <Card className="bg-black/40 border-white/10">
        <CardContent className="p-6">
          <p className="text-white/60 text-center">No performance data available</p>
        </CardContent>
      </Card>
    );
  }

  const latest = analytics[0] || {};
  const chartData = analytics.slice(0, 7).reverse().map((a, i) => ({
    day: `Day ${i + 1}`,
    completion: a.task_completion_rate || 0,
    communication: a.communication_efficiency || 0,
    collaboration: a.collaboration_effectiveness || 0
  }));

  const getBurnoutColor = (score) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getBurnoutBadge = (score) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Task Completion</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-white text-2xl font-bold">
              {latest.task_completion_rate?.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Communication</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-white text-2xl font-bold">
              {latest.communication_efficiency?.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Collaboration</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-white text-2xl font-bold">
              {latest.collaboration_effectiveness?.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${
          latest.burnout_risk_score >= 70 ? 'from-red-500/20 to-orange-500/20 border-red-500/30' :
          latest.burnout_risk_score >= 40 ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' :
          'from-green-500/20 to-emerald-500/20 border-green-500/30'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Burnout Risk</span>
              <AlertTriangle className={`w-4 h-4 ${getBurnoutColor(latest.burnout_risk_score)}`} />
            </div>
            <div className={`text-2xl font-bold ${getBurnoutColor(latest.burnout_risk_score)}`}>
              {latest.burnout_risk_score?.toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="completion" stroke="#00ffff" fill="#00ffff" fillOpacity={0.3} />
              <Area type="monotone" dataKey="communication" stroke="#aa00ff" fill="#aa00ff" fillOpacity={0.3} />
              <Area type="monotone" dataKey="collaboration" stroke="#00ff88" fill="#00ff88" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {latest.suggested_interventions?.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
          <CardHeader>
            <CardTitle className="text-orange-300">AI Suggested Interventions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {latest.suggested_interventions.map((intervention, i) => (
              <div key={i} className="bg-black/30 rounded p-3 text-white/90">
                • {intervention}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}