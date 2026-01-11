import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function AgentMonitoringDashboard() {
  const [userEmail, setUserEmail] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: agents = [] } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => userEmail ? base44.entities.Agent.filter({ user_email: userEmail }) : [],
    enabled: !!userEmail
  });

  const { data: kpis = [] } = useQuery({
    queryKey: ['agentKPIs', userEmail],
    queryFn: () => userEmail ? base44.entities.AgentKPI.filter({ user_email: userEmail }) : [],
    enabled: !!userEmail
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['geminiTasks', userEmail],
    queryFn: () => userEmail ? base44.entities.GeminiTask.filter({ user_email: userEmail }) : [],
    enabled: !!userEmail
  });

  const { data: violations = [] } = useQuery({
    queryKey: ['ethicsViolations'],
    queryFn: () => base44.entities.AgentEthicsViolation.list('-created_date', 10),
    enabled: !!userEmail
  });

  const filteredAgents = selectedAgent === 'all' ? agents : agents.filter(a => a.id === selectedAgent);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const failedTasks = tasks.filter(t => t.status === 'failed').length;
  const avgEfficiency = kpis.length > 0 ? kpis.reduce((sum, k) => sum + (k.efficiency || 0), 0) / kpis.length : 0;

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10 text-cyan-400" />
            Agent Monitoring Dashboard
          </h1>
          <p className="text-white/60">Real-time performance tracking & anomaly detection</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Filter by agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-white">{completedTasks}</span>
            </div>
            <p className="text-white/80 text-sm">Tasks Completed</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <span className="text-2xl font-bold text-white">{avgEfficiency.toFixed(1)}%</span>
            </div>
            <p className="text-white/80 text-sm">Avg Efficiency</p>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <span className="text-2xl font-bold text-white">{failedTasks}</span>
            </div>
            <p className="text-white/80 text-sm">Failed Tasks</p>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-white">{violations.length}</span>
            </div>
            <p className="text-white/80 text-sm">Anomalies Detected</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Real-Time Activity Stream
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {tasks.slice(0, 10).map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 rounded p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-400' :
                      task.status === 'failed' ? 'bg-red-400' :
                      task.status === 'in_progress' ? 'bg-blue-400 animate-pulse' :
                      'bg-gray-400'
                    }`} />
                    <div>
                      <p className="text-white text-sm font-bold">{task.task_name}</p>
                      <p className="text-white/60 text-xs">{task.task_type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    task.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {task.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Anomaly Detection
            </h3>
            <div className="space-y-3">
              {violations.length === 0 && (
                <div className="text-center py-8 text-white/40">
                  No anomalies detected
                </div>
              )}
              {violations.map((violation) => (
                <div key={violation.id} className="bg-red-500/10 border border-red-500/30 rounded p-3">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-bold text-sm">{violation.violation_type}</p>
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                      {violation.severity}
                    </span>
                  </div>
                  <p className="text-white/80 text-xs mb-2">{violation.description}</p>
                  {violation.recommended_action && (
                    <div className="bg-black/20 rounded p-2">
                      <p className="text-yellow-400 text-xs font-bold">Suggested Action:</p>
                      <p className="text-white/60 text-xs">{violation.recommended_action}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
          <h3 className="text-white font-bold mb-4">Agent Performance Metrics</h3>
          <div className="space-y-3">
            {filteredAgents.map((agent) => {
              const agentKPIs = kpis.filter(k => k.agent_id === agent.id);
              const agentEfficiency = agentKPIs.length > 0 ? 
                agentKPIs.reduce((sum, k) => sum + (k.efficiency || 0), 0) / agentKPIs.length : 0;
              
              return (
                <div key={agent.id} className="bg-white/5 rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-bold">{agent.name}</p>
                      <p className="text-white/60 text-xs">{agent.agent_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-400">{agentEfficiency.toFixed(0)}%</p>
                      <p className="text-white/60 text-xs">Efficiency</p>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${agentEfficiency}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AuroraBackground>
  );
}