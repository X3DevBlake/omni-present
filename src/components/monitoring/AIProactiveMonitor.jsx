import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Activity, TrendingDown, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AIProactiveMonitor() {
  const [liveAlerts, setLiveAlerts] = useState([]);
  const queryClient = useQueryClient();

  const { data: alerts } = useQuery({
    queryKey: ['proactive-alerts'],
    queryFn: () => base44.entities.ProactiveAlert.list('-created_date', 50),
    refetchInterval: 3000
  });

  const { data: logs } = useQuery({
    queryKey: ['recent-logs'],
    queryFn: () => base44.entities.AgentInteractionLog.list('-created_date', 100),
    refetchInterval: 5000
  });

  // AI Analysis of logs for anomalies
  useEffect(() => {
    if (!logs) return;

    const analyzePatterns = async () => {
      // Error spike detection
      const recentErrors = logs.filter(l => !l.success && 
        new Date(l.created_date) > new Date(Date.now() - 5 * 60 * 1000));
      
      if (recentErrors.length > 10) {
        const newAlert = {
          alert_type: 'error_spike',
          severity: 'high',
          title: 'Error Spike Detected',
          description: `${recentErrors.length} errors in the last 5 minutes`,
          affected_agents: [...new Set(recentErrors.map(e => e.agent_id))],
          metrics: { error_count: recentErrors.length, time_window: '5min' },
          suggested_actions: [
            'Review agent logs for common error patterns',
            'Check system resources and connectivity',
            'Consider rolling back recent deployments'
          ],
          confidence_score: 95
        };
        
        setLiveAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
        toast.error('Error spike detected! Check monitoring dashboard.');
      }

      // Performance degradation
      const slowOps = logs.filter(l => l.execution_time_ms > 5000);
      if (slowOps.length > 5) {
        const newAlert = {
          alert_type: 'performance_degradation',
          severity: 'medium',
          title: 'Performance Degradation',
          description: `${slowOps.length} operations taking >5s to execute`,
          affected_agents: [...new Set(slowOps.map(o => o.agent_id))],
          metrics: { slow_operations: slowOps.length, threshold: '5000ms' },
          suggested_actions: [
            'Optimize agent logic and queries',
            'Scale up system resources',
            'Review database indexes'
          ],
          confidence_score: 88
        };
        
        setLiveAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
      }
    };

    analyzePatterns();
  }, [logs]);

  const updateAlertStatus = useMutation({
    mutationFn: ({ id, status }) => 
      base44.entities.ProactiveAlert.update(id, { 
        status, 
        resolved_at: status === 'resolved' ? new Date().toISOString() : null 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proactive-alerts'] });
      toast.success('Alert status updated');
    }
  });

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'from-red-500 to-red-700',
      high: 'from-orange-500 to-orange-700',
      medium: 'from-yellow-500 to-yellow-700',
      low: 'from-blue-500 to-blue-700'
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: AlertTriangle,
      high: AlertCircle,
      medium: Activity,
      low: Shield
    };
    return icons[severity] || Activity;
  };

  const activeAlerts = alerts?.filter(a => a.status === 'active') || [];
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');

  return (
    <div className="space-y-4">
      {/* Real-Time Status */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-700/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {logs?.filter(l => l.success).length || 0}
                </p>
                <p className="text-xs text-green-600">Successful Ops</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-700/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
                <p className="text-xs text-red-600">Critical Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-700/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(logs?.reduce((sum, l) => sum + (l.execution_time_ms || 0), 0) / (logs?.length || 1))}ms
                </p>
                <p className="text-xs text-yellow-600">Avg Response</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{activeAlerts.length}</p>
                <p className="text-xs text-blue-600">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Alerts Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-500" />
            AI Proactive Monitoring
            <Badge variant="secondary" className="ml-2">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {[...liveAlerts, ...(alerts?.slice(0, 5) || [])].slice(0, 8).map((alert, idx) => {
              const Icon = getSeverityIcon(alert.severity);
              return (
                <motion.div
                  key={alert.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 rounded-lg bg-gradient-to-r ${getSeverityColor(alert.severity)}/10 border border-${alert.severity === 'critical' ? 'red' : alert.severity === 'high' ? 'orange' : 'yellow'}-500/30`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5" />
                        <h3 className="font-semibold">{alert.title}</h3>
                        <Badge variant="secondary">{alert.severity}</Badge>
                        {alert.confidence_score && (
                          <Badge variant="outline" className="text-xs">
                            {alert.confidence_score}% confidence
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      
                      {alert.affected_agents?.length > 0 && (
                        <div className="text-xs text-gray-500 mb-2">
                          Affected agents: {alert.affected_agents.slice(0, 3).join(', ')}
                          {alert.affected_agents.length > 3 && ` +${alert.affected_agents.length - 3} more`}
                        </div>
                      )}

                      {alert.suggested_actions?.length > 0 && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-semibold text-gray-700">Suggested Actions:</p>
                          {alert.suggested_actions.map((action, i) => (
                            <div key={i} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500">→</span>
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {alert.id && alert.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateAlertStatus.mutate({ id: alert.id, status: 'resolved' })}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateAlertStatus.mutate({ id: alert.id, status: 'ignored' })}
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {activeAlerts.length === 0 && liveAlerts.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">All systems operational</p>
              <p className="text-sm text-gray-500">No alerts detected</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}