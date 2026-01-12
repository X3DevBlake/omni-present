import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, Database, Webhook, Flag, AlertTriangle, 
  CheckCircle, XCircle, TrendingUp, Clock 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SystemDashboard() {
  const [timeRange, setTimeRange] = useState('1h');

  const { data: metrics } = useQuery({
    queryKey: ['system-metrics', timeRange],
    queryFn: () => base44.entities.SystemMetric.list('-created_date', 50),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: webhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.WebhookConfiguration.list(),
  });

  const { data: featureFlags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: () => base44.entities.FeatureFlag.list(),
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 20),
  });

  const { data: upgrades } = useQuery({
    queryKey: ['upgrades'],
    queryFn: () => base44.entities.UpgradeTracker.list(),
  });

  // Calculate summary stats
  const stats = React.useMemo(() => {
    if (!metrics || !webhooks || !upgrades) return null;

    const activeWebhooks = webhooks.filter(w => w.status === 'active').length;
    const webhookSuccessRate = webhooks.reduce((acc, w) => {
      const total = (w.success_count || 0) + (w.failure_count || 0);
      return total > 0 ? acc + ((w.success_count || 0) / total) : acc;
    }, 0) / Math.max(webhooks.length, 1) * 100;

    const completedUpgrades = upgrades.filter(u => u.status === 'completed').length;
    const inProgressUpgrades = upgrades.filter(u => u.status === 'in_progress').length;

    const latestMetrics = metrics.slice(0, 5);
    const criticalAlerts = latestMetrics.filter(m => m.threshold_status === 'critical').length;
    const warningAlerts = latestMetrics.filter(m => m.threshold_status === 'warning').length;

    return {
      activeWebhooks,
      webhookSuccessRate: webhookSuccessRate.toFixed(1),
      completedUpgrades,
      inProgressUpgrades,
      totalUpgrades: upgrades.length,
      criticalAlerts,
      warningAlerts
    };
  }, [metrics, webhooks, upgrades]);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!metrics) return [];
    
    const grouped = metrics.reduce((acc, metric) => {
      const time = new Date(metric.created_date).toLocaleTimeString();
      if (!acc[time]) {
        acc[time] = { time };
      }
      acc[time][metric.metric_name] = metric.metric_value;
      return acc;
    }, {});

    return Object.values(grouped).reverse().slice(-20);
  }, [metrics]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">System Dashboard</h1>
            <p className="text-gray-300">Real-time monitoring and management</p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">Active Webhooks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">{stats.activeWebhooks}</span>
                  <Webhook className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {stats.webhookSuccessRate}% success rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">Upgrades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">
                    {stats.completedUpgrades}/{stats.totalUpgrades}
                  </span>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {stats.inProgressUpgrades} in progress
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="destructive">{stats.criticalAlerts}</Badge>
                    <Badge variant="outline" className="text-yellow-400">{stats.warningAlerts}</Badge>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
                <p className="text-xs text-gray-400 mt-2">Last hour</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-300">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Healthy
                  </Badge>
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-xs text-gray-400 mt-2">All systems operational</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-lg">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="features">Feature Flags</TabsTrigger>
            <TabsTrigger value="upgrades">Upgrades</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">System Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="time" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)' 
                      }}
                    />
                    <Line type="monotone" dataKey="api_avg_response_time" stroke="#8b5cf6" />
                    <Line type="monotone" dataKey="db_avg_query_time" stroke="#06b6d4" />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-6 space-y-2">
                  {metrics?.slice(0, 10).map(metric => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-white">{metric.metric_name}</p>
                        <p className="text-xs text-gray-400">{metric.metric_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">
                          {metric.metric_value.toFixed(2)} {metric.unit}
                        </span>
                        <Badge 
                          variant={
                            metric.threshold_status === 'critical' ? 'destructive' :
                            metric.threshold_status === 'warning' ? 'outline' : 'default'
                          }
                        >
                          {metric.threshold_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Webhook Configurations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {webhooks?.map(webhook => (
                    <div key={webhook.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{webhook.webhook_name}</h3>
                        <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                          {webhook.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-400">Event: <span className="text-white">{webhook.event_type}</span></p>
                        <p className="text-gray-400">Success: <span className="text-green-400">{webhook.success_count || 0}</span></p>
                        <p className="text-gray-400">Entity: <span className="text-white">{webhook.entity_name || 'Any'}</span></p>
                        <p className="text-gray-400">Failures: <span className="text-red-400">{webhook.failure_count || 0}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="features">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Feature Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {featureFlags?.map(flag => (
                    <div key={flag.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-white font-semibold">{flag.feature_name}</h3>
                          <p className="text-sm text-gray-400">{flag.feature_key}</p>
                        </div>
                        <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      {flag.description && (
                        <p className="text-sm text-gray-300 mb-2">{flag.description}</p>
                      )}
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-400">
                          Rollout: <span className="text-white">{flag.rollout_percentage}%</span>
                        </span>
                        <span className="text-gray-400">
                          Env: <span className="text-white">{flag.environment}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upgrades Tab */}
          <TabsContent value="upgrades">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Upgrade Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upgrades?.slice(0, 20).map(upgrade => (
                    <div key={upgrade.id} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{upgrade.upgrade_name}</h3>
                        <div className="flex gap-2">
                          <Badge variant={
                            upgrade.priority === 'critical' ? 'destructive' :
                            upgrade.priority === 'high' ? 'outline' : 'secondary'
                          }>
                            {upgrade.priority}
                          </Badge>
                          <Badge variant={
                            upgrade.status === 'completed' ? 'default' :
                            upgrade.status === 'in_progress' ? 'outline' : 'secondary'
                          }>
                            {upgrade.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                          Category: <span className="text-white">{upgrade.category}</span>
                        </span>
                        <span className="text-gray-400">
                          Progress: <span className="text-white">{upgrade.completion_percentage}%</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivity?.map(activity => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      {activity.success ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-white">
                          {activity.user_email} - {activity.action_type}
                        </p>
                        <p className="text-xs text-gray-400">
                          {activity.entity_type} {activity.entity_id}
                        </p>
                      </div>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}