import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

export default function WorkflowAnalytics() {
  const { data: metrics } = useQuery({
    queryKey: ['workflow-metrics'],
    queryFn: () => base44.entities.SystemMetric.list('-created_date', 100),
  });

  const { data: rules } = useQuery({
    queryKey: ['dynamic-rules'],
    queryFn: () => base44.entities.DynamicRuleSet.list(),
  });

  const performanceData = React.useMemo(() => {
    if (!metrics) return [];
    
    return metrics.slice(0, 20).reverse().map(m => ({
      time: new Date(m.created_date).toLocaleTimeString(),
      value: m.metric_value,
      name: m.metric_name
    }));
  }, [metrics]);

  const ruleEffectiveness = React.useMemo(() => {
    if (!rules) return [];
    
    return rules
      .filter(r => r.execution_count > 0)
      .map(r => ({
        name: r.rule_name.substring(0, 20) + '...',
        success_rate: r.success_rate || 0,
        executions: r.execution_count
      }))
      .slice(0, 5);
  }, [rules]);

  const insights = [
    {
      title: 'Active Automation',
      value: rules?.filter(r => r.active).length || 0,
      icon: CheckCircle,
      color: 'text-green-400',
      trend: 'up'
    },
    {
      title: 'Avg Success Rate',
      value: `${(rules?.reduce((sum, r) => sum + (r.success_rate || 0), 0) / Math.max(rules?.length || 1, 1)).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-blue-400',
      trend: 'up'
    },
    {
      title: 'Total Executions',
      value: rules?.reduce((sum, r) => sum + (r.execution_count || 0), 0) || 0,
      icon: TrendingUp,
      color: 'text-purple-400',
      trend: 'neutral'
    },
    {
      title: 'AI Confidence',
      value: `${(rules?.filter(r => r.ai_generated).reduce((sum, r) => sum + (r.confidence_score || 0), 0) / Math.max(rules?.filter(r => r.ai_generated).length || 1, 1)).toFixed(0)}%`,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          return (
            <Card key={idx} className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${insight.color}`} />
                  {insight.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                  {insight.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{insight.value}</div>
                <div className="text-sm text-gray-400">{insight.title}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Chart */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white">System Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)' 
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rule Effectiveness */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Rule Effectiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ruleEffectiveness}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.2)' 
                }}
              />
              <Bar dataKey="success_rate" fill="#8b5cf6" />
              <Bar dataKey="executions" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}