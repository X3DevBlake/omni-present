import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Activity, Award, BarChart3, LineChart, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdvancedAgentAnalytics({ userEmail }) {
  const [timeRange, setTimeRange] = useState('7d');
  const [comparisonMode, setComparisonMode] = useState('all');

  const { data: agents = [] } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.list(),
    enabled: !!userEmail
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ['agent-kpis'],
    queryFn: () => base44.entities.AgentKPI.list('-created_date', 500),
    enabled: !!userEmail
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['agent-tasks'],
    queryFn: () => base44.entities.GeminiTask.list('-created_date', 200),
    enabled: !!userEmail
  });

  // Calculate trend data
  const trendData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayKpis = kpis.filter(k => k.created_date?.startsWith(dateStr));
      const dayTasks = tasks.filter(t => t.created_date?.startsWith(dateStr));
      
      data.push({
        date: dateStr,
        efficiency: dayKpis.length > 0 ? dayKpis.reduce((sum, k) => sum + (k.efficiency || 0), 0) / dayKpis.length : 0,
        tasksCompleted: dayTasks.filter(t => t.status === 'completed').length,
        responseTime: dayKpis.length > 0 ? dayKpis.reduce((sum, k) => sum + (k.response_time_ms || 0), 0) / dayKpis.length : 0
      });
    }
    
    return data;
  }, [kpis, tasks, timeRange]);

  // Agent comparison data
  const agentComparison = useMemo(() => {
    return agents.map(agent => {
      const agentKpis = kpis.filter(k => k.agent_id === agent.id);
      const agentTasks = tasks.filter(t => t.user_email === userEmail);
      
      const completed = agentTasks.filter(t => t.status === 'completed').length;
      const total = agentTasks.length;
      const avgEfficiency = agentKpis.length > 0 ? 
        agentKpis.reduce((sum, k) => sum + (k.efficiency || 0), 0) / agentKpis.length : 0;
      const avgResponseTime = agentKpis.length > 0 ?
        agentKpis.reduce((sum, k) => sum + (k.response_time_ms || 0), 0) / agentKpis.length : 0;
      
      return {
        name: agent.name,
        type: agent.agent_type,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        efficiency: avgEfficiency,
        responseTime: avgResponseTime,
        totalTasks: total
      };
    }).sort((a, b) => b.efficiency - a.efficiency);
  }, [agents, kpis, tasks, userEmail]);

  // Best practices identification
  const bestPractices = useMemo(() => {
    const topPerformers = agentComparison.slice(0, 3);
    const practices = [];
    
    if (topPerformers.length > 0) {
      const avgEfficiency = topPerformers.reduce((sum, a) => sum + a.efficiency, 0) / topPerformers.length;
      if (avgEfficiency > 80) {
        practices.push({
          title: 'High Efficiency Pattern',
          description: `Top agents maintain ${avgEfficiency.toFixed(0)}% efficiency`,
          agents: topPerformers.map(a => a.name)
        });
      }
      
      const fastResponders = topPerformers.filter(a => a.responseTime < 1000);
      if (fastResponders.length > 0) {
        practices.push({
          title: 'Fast Response Times',
          description: 'Sub-second response times achieved',
          agents: fastResponders.map(a => a.name)
        });
      }
    }
    
    return practices;
  }, [agentComparison]);

  // Bottleneck detection
  const bottlenecks = useMemo(() => {
    const issues = [];
    
    agentComparison.forEach(agent => {
      if (agent.responseTime > 3000) {
        issues.push({
          agent: agent.name,
          type: 'Slow Response',
          metric: `${agent.responseTime.toFixed(0)}ms`,
          severity: 'high'
        });
      }
      
      if (agent.efficiency < 60) {
        issues.push({
          agent: agent.name,
          type: 'Low Efficiency',
          metric: `${agent.efficiency.toFixed(0)}%`,
          severity: 'medium'
        });
      }
      
      if (agent.completionRate < 70 && agent.totalTasks > 5) {
        issues.push({
          agent: agent.name,
          type: 'Low Completion Rate',
          metric: `${agent.completionRate.toFixed(0)}%`,
          severity: 'high'
        });
      }
    });
    
    return issues;
  }, [agentComparison]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Advanced Analytics</h2>
          <p className="text-white/60 text-sm">Trends, insights, and cross-agent comparisons</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
            <SelectItem value="90d">90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Trend Analysis */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <LineChart className="w-5 h-5 text-cyan-400" />
          Performance Trends
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLine data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="date" stroke="#ffffff60" fontSize={12} />
            <YAxis stroke="#ffffff60" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="efficiency" stroke="#00f5ff" name="Efficiency %" />
            <Line type="monotone" dataKey="tasksCompleted" stroke="#a855f7" name="Tasks Completed" />
          </RechartsLine>
        </ResponsiveContainer>
      </Card>

      {/* Cross-Agent Comparison */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          Agent Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={agentComparison.slice(0, 5)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="name" stroke="#ffffff60" fontSize={12} />
            <YAxis stroke="#ffffff60" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="efficiency" fill="#00f5ff" name="Efficiency %" />
            <Bar dataKey="completionRate" fill="#a855f7" name="Completion Rate %" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Best Practices */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-400" />
            Best Practices Identified
          </h3>
          <div className="space-y-3">
            {bestPractices.map((practice, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-black/20 rounded-lg"
              >
                <div className="text-white font-bold mb-1">{practice.title}</div>
                <div className="text-white/80 text-sm mb-2">{practice.description}</div>
                <div className="flex flex-wrap gap-2">
                  {practice.agents.map((agent, i) => (
                    <span key={i} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                      {agent}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
            {bestPractices.length === 0 && (
              <div className="text-center py-8 text-white/40">
                Gathering data for best practices analysis...
              </div>
            )}
          </div>
        </Card>

        {/* Bottlenecks */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Bottlenecks Detected
          </h3>
          <div className="space-y-3">
            {bottlenecks.map((issue, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg ${
                  issue.severity === 'high' 
                    ? 'bg-red-500/10 border border-red-500/30' 
                    : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{issue.agent}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    issue.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {issue.severity}
                  </span>
                </div>
                <div className="text-white/80 text-sm">{issue.type}</div>
                <div className="text-white/60 text-xs mt-1">Current: {issue.metric}</div>
              </motion.div>
            ))}
            {bottlenecks.length === 0 && (
              <div className="text-center py-8 text-white/40">
                No bottlenecks detected
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Performance Insights
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {agentComparison.slice(0, 3).map((agent, idx) => (
            <div key={idx} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                {idx === 0 && <Award className="w-5 h-5 text-yellow-400" />}
                <span className="text-white font-bold">{agent.name}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Efficiency:</span>
                  <span className="text-cyan-400 font-bold">{agent.efficiency.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Completion:</span>
                  <span className="text-green-400 font-bold">{agent.completionRate.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Response:</span>
                  <span className="text-blue-400 font-bold">{agent.responseTime.toFixed(0)}ms</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}