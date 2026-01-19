import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function SkillTrendAnalyzer({ skillTrends = [] }) {
  if (!skillTrends || skillTrends.length === 0) {
    return (
      <Card className="bg-black/40 border-white/10">
        <CardContent className="p-6">
          <p className="text-white/60 text-center">No skill trend data available</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = skillTrends.map(skill => ({
    name: skill.skill_name,
    demand: skill.future_demand_forecast || 0,
    current: skill.current_level || 0
  }));

  const getTrendIcon = (direction) => {
    if (direction === 'increasing') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (direction === 'decreasing') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-yellow-400" />;
  };

  const getTrendColor = (direction) => {
    if (direction === 'increasing') return 'bg-green-500';
    if (direction === 'decreasing') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getDemandColor = (demand) => {
    if (demand >= 80) return '#00ff88';
    if (demand >= 50) return '#00ffff';
    return '#ffaa00';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Skill Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="demand" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getDemandColor(entry.demand)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillTrends.map((skill, i) => (
          <Card key={i} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">{skill.skill_name}</h3>
                <div className="flex items-center gap-2">
                  {getTrendIcon(skill.trend_direction)}
                  <Badge className={getTrendColor(skill.trend_direction)}>
                    {skill.trend_direction}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 rounded p-2">
                  <div className="text-white/60 text-xs">Current Level</div>
                  <div className="text-cyan-400 font-bold">{skill.current_level?.toFixed(0)}</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-white/60 text-xs">Demand Forecast</div>
                  <div className="text-green-400 font-bold">{skill.future_demand_forecast?.toFixed(0)}</div>
                </div>
              </div>
              {skill.recommended_priority && (
                <Badge className="mt-3 bg-purple-500">
                  Priority: {skill.recommended_priority}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}