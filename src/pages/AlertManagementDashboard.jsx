import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, CheckCircle2, Clock, Zap, Plus } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import AlertRulesPanel from '../components/alerts/AlertRulesPanel';
import AlertHistoryPanel from '../components/alerts/AlertHistoryPanel';
import AlertChannelsPanel from '../components/alerts/AlertChannelsPanel';

export default function AlertManagementDashboard() {
  const [showCreateRule, setShowCreateRule] = useState(false);

  const { data: alertRules = [] } = useQuery({
    queryKey: ['alertRules'],
    queryFn: () => base44.entities.AlertRule.list('-created_date', 100),
    initialData: []
  });

  const { data: alertHistory = [] } = useQuery({
    queryKey: ['alertHistory'],
    queryFn: () => base44.entities.AlertHistory.list('-created_date', 200),
    initialData: []
  });

  const activeAlerts = alertHistory.filter(a => a.status === 'new' || a.status === 'acknowledged');
  const unacknowledgedAlerts = alertHistory.filter(a => a.status === 'new');
  const criticalAlerts = alertHistory.filter(a => a.severity === 'critical' && (a.status === 'new' || a.status === 'acknowledged'));

  const stats = [
    { label: 'Active Rules', value: alertRules.filter(r => r.enabled).length, icon: <Zap className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { label: 'Unacknowledged', value: unacknowledgedAlerts.length, icon: <Bell className="w-5 h-5" />, color: 'from-red-500 to-pink-500' },
    { label: 'Active Alerts', value: activeAlerts.length, icon: <AlertTriangle className="w-5 h-5" />, color: 'from-yellow-500 to-orange-500' },
    { label: 'Critical Issues', value: criticalAlerts.length, icon: <AlertTriangle className="w-5 h-5" />, color: 'from-red-600 to-red-500' }
  ];

  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center gap-3">
            <Bell className="w-12 h-12 text-yellow-400" />
            <span className="bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">
              Alert Management
            </span>
          </h1>
          <p className="text-white/60 text-lg">Define rules, monitor alerts, and manage notifications across all hubs</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="active">Active Alerts</TabsTrigger>
            <TabsTrigger value="rules">Alert Rules</TabsTrigger>
            <TabsTrigger value="channels">Notification Channels</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Active Alerts */}
          <TabsContent value="active">
            <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Active Alerts ({unacknowledgedAlerts.length} unacknowledged)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unacknowledgedAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-4" />
                    <p className="text-slate-400">No active alerts</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unacknowledgedAlerts.slice(0, 10).map((alert) => (
                      <motion.div key={alert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg border border-slate-700 bg-slate-800/50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={alert.severity === 'critical' ? 'bg-red-600' : alert.severity === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <p className="font-semibold text-white">{alert.rule_name}</p>
                            </div>
                            <p className="text-slate-300 text-sm">{alert.message}</p>
                            <p className="text-slate-500 text-xs mt-2">Hub: {alert.hub} • Value: {alert.triggered_value}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Acknowledge</Button>
                            <Button size="sm" variant="outline">Escalate</Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowCreateRule(true)} className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Alert Rule
              </Button>
            </div>
            <AlertRulesPanel rules={alertRules} />
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels">
            <AlertChannelsPanel />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <AlertHistoryPanel history={alertHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}