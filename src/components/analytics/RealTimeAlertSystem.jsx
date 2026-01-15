import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const ALERT_TYPES = {
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' }
};

export default function RealTimeAlertSystem() {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const { data: proactiveAlerts } = useQuery({
    queryKey: ['proactive-alerts'],
    queryFn: () => base44.entities.ProactiveAlert.filter({ status: 'active' }, '-created_date', 10),
    refetchInterval: 30000, // Poll every 30 seconds
    initialData: []
  });

  const { data: agentKPIs } = useQuery({
    queryKey: ['agent-kpis'],
    queryFn: () => base44.entities.AgentKPI.list('-created_date', 50),
    refetchInterval: 30000,
    initialData: []
  });

  useEffect(() => {
    // Generate alerts from data
    const newAlerts = [];

    // From ProactiveAlert entities
    proactiveAlerts.forEach(alert => {
      if (!dismissedAlerts.has(alert.id)) {
        newAlerts.push({
          id: alert.id,
          type: alert.severity === 'critical' || alert.severity === 'high' ? 'error' : 'warning',
          title: alert.title,
          message: alert.description,
          timestamp: new Date(alert.created_date),
          source: 'System Monitor'
        });
      }
    });

    // Analyze KPIs for anomalies
    const recentKPIs = agentKPIs.slice(0, 10);
    recentKPIs.forEach(kpi => {
      if (kpi.efficiency_score < 70 && !dismissedAlerts.has(`kpi-${kpi.id}`)) {
        newAlerts.push({
          id: `kpi-${kpi.id}`,
          type: 'warning',
          title: 'Low Agent Performance',
          message: `Agent efficiency dropped to ${kpi.efficiency_score}%`,
          timestamp: new Date(kpi.created_date),
          source: 'Performance Monitor'
        });
      }
    });

    // Simulated workflow failures
    if (Math.random() > 0.8 && newAlerts.length < 5) {
      newAlerts.push({
        id: `sim-${Date.now()}`,
        type: 'error',
        title: 'Workflow Failed',
        message: 'Automated trading workflow encountered an error',
        timestamp: new Date(),
        source: 'Workflow Engine'
      });
    }

    setAlerts(newAlerts.slice(0, 5)); // Keep only 5 most recent
  }, [proactiveAlerts, agentKPIs, dismissedAlerts]);

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 w-96 max-w-[calc(100vw-3rem)] space-y-2">
      <AnimatePresence>
        {alerts.map((alert) => {
          const alertStyle = ALERT_TYPES[alert.type];
          const Icon = alertStyle.icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Card className={`${alertStyle.bg} ${alertStyle.border} border backdrop-blur-xl`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${alertStyle.color} mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm">{alert.title}</p>
                          <p className="text-white/70 text-xs mt-1">{alert.message}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dismissAlert(alert.id)}
                          className="h-6 w-6 p-0 hover:bg-white/10"
                        >
                          <X className="w-4 h-4 text-white/60" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-white/10 text-white/60 text-xs">
                          {alert.source}
                        </Badge>
                        <span className="text-white/40 text-xs">
                          {alert.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}