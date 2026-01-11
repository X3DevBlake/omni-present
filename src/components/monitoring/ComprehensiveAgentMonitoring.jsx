import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Zap, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ComprehensiveAgentMonitoring({ userEmail }) {
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [timePeriod, setTimePeriod] = useState('24h');

  const { data: agents = [] } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.list(),
    enabled: !!userEmail
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ['agent-kpis', userEmail],
    queryFn: () => base44.entities.AgentKPI.list('-created_date', 100),
    enabled: !!userEmail
  });

  const { data: communications = [] } = useQuery({
    queryKey: ['agent-comms', userEmail],
    queryFn: () => base44.entities.AgentCommunication.list('-created_date', 50),
    enabled: !!userEmail
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['gemini-tasks', userEmail],
    queryFn: () => base44.entities.GeminiTask.list('-created_date', 50),
    enabled: !!userEmail
  });

  // Calculate aggregated metrics
  const calculateMetrics = (agentId) => {
    const agentKpis = agentId === 'all' ? kpis : kpis.filter(k => k.agent_id === agentId);
    const agentTasks = agentId === 'all' ? tasks : tasks.filter(t => t.user_email === userEmail);
    
    const completedTasks = agentTasks.filter(t => t.status === 'completed').length;
    const failedTasks = agentTasks.filter(t => t.status === 'failed').length;
    const totalTasks = agentTasks.length;
    
    const avgResponseTime = agentKpis.reduce((sum, k) => sum + (k.response_time_ms || 0), 0) / (agentKpis.length || 1);
    const avgAccuracy = agentKpis.reduce((sum, k) => sum + (k.task_success_rate || 0), 0) / (agentKpis.length || 1);
    
    return {
      completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0,
      errorRate: totalTasks > 0 ? ((failedTasks / totalTasks) * 100).toFixed(1) : 0,
      avgResponseTime: avgResponseTime.toFixed(0),
      efficiency: avgAccuracy.toFixed(1),
      totalTasks,
      completedTasks,
      failedTasks
    };
  };

  // Anomaly detection
  const detectAnomalies = () => {
    const anomalies = [];
    
    agents.forEach(agent => {
      const metrics = calculateMetrics(agent.id);
      
      if (parseFloat(metrics.errorRate) > 20) {
        anomalies.push({
          agent_id: agent.id,
          agent_name: agent.name,
          type: 'high_error_rate',
          severity: 'critical',
          message: `Error rate: ${metrics.errorRate}%`,
          suggestion: 'Review recent failed tasks and check agent configuration'
        });
      }
      
      if (parseFloat(metrics.avgResponseTime) > 5000) {
        anomalies.push({
          agent_id: agent.id,
          agent_name: agent.name,
          type: 'slow_response',
          severity: 'warning',
          message: `Avg response: ${metrics.avgResponseTime}ms`,
          suggestion: 'Consider optimizing agent prompts or reducing context size'
        });
      }
      
      if (parseFloat(metrics.efficiency) < 60) {
        anomalies.push({
          agent_id: agent.id,
          agent_name: agent.name,
          type: 'low_efficiency',
          severity: 'warning',
          message: `Efficiency: ${metrics.efficiency}%`,
          suggestion: 'Retrain agent or adjust reward functions'
        });
      }
    });
    
    return anomalies;
  };

  const metrics = calculateMetrics(selectedAgent);
  const anomalies = detectAnomalies();
  const recentActivity = communications.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Monitoring</h2>
          <p className="text-white/60 text-sm">Real-time performance & anomaly detection</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32 bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white">{metrics.completionRate}%</div>
          <div className="text-green-400 text-sm">Completion Rate</div>
          <div className="text-white/60 text-xs mt-1">{metrics.completedTasks}/{metrics.totalTasks} tasks</div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-400" />
            {parseFloat(metrics.errorRate) > 10 ? <TrendingUp className="w-4 h-4 text-red-400" /> : <TrendingDown className="w-4 h-4 text-green-400" />}
          </div>
          <div className="text-3xl font-bold text-white">{metrics.errorRate}%</div>
          <div className="text-red-400 text-sm">Error Rate</div>
          <div className="text-white/60 text-xs mt-1">{metrics.failedTasks} failures</div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{metrics.avgResponseTime}ms</div>
          <div className="text-blue-400 text-sm">Avg Response Time</div>
          <div className="text-white/60 text-xs mt-1">Real-time metrics</div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{metrics.efficiency}%</div>
          <div className="text-purple-400 text-sm">Efficiency Score</div>
          <div className="text-white/60 text-xs mt-1">AI-calculated</div>
        </Card>
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <div>
              <h3 className="text-white font-bold">Anomalies Detected</h3>
              <p className="text-white/60 text-sm">{anomalies.length} issues requiring attention</p>
            </div>
          </div>
          <div className="space-y-3">
            {anomalies.map((anomaly, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg border ${
                  anomaly.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-bold">{anomaly.agent_name}</div>
                    <div className="text-white/80 text-sm">{anomaly.message}</div>
                    <div className="text-white/60 text-xs mt-2">💡 {anomaly.suggestion}</div>
                  </div>
                  <Button size="sm" className="bg-white/10 hover:bg-white/20">
                    Auto-Fix
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Real-time Activity Stream */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Real-time Activity Stream
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {recentActivity.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-400' :
                  activity.status === 'failed' ? 'bg-red-400' :
                  'bg-yellow-400'
                }`} />
                <div className="flex-1">
                  <div className="text-white text-sm">{activity.message_content?.substring(0, 60) || 'Agent activity'}</div>
                  <div className="text-white/60 text-xs">{new Date(activity.created_date).toLocaleTimeString()}</div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  activity.response_time_ms < 1000 ? 'bg-green-500/20 text-green-400' :
                  activity.response_time_ms < 3000 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {activity.response_time_ms || 0}ms
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
}