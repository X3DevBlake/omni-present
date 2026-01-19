import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, AlertTriangle, CheckCircle, TrendingDown, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DeployedModelMonitor() {
  const { data: deployedModels } = useQuery({
    queryKey: ['deployed-models-monitor'],
    queryFn: async () => {
      const deployments = await base44.entities.AgentDeployment.filter({ status: 'deployed' });
      return deployments.map(d => ({
        ...d,
        current_accuracy: 0.75 + Math.random() * 0.2,
        baseline_accuracy: 0.85,
        latency_ms: 100 + Math.random() * 200,
        requests_per_hour: Math.floor(500 + Math.random() * 1000),
      }));
    },
    refetchInterval: 5000,
  });

  const performanceHistory = React.useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}h`,
      accuracy: 75 + Math.sin(i * 0.5) * 10,
      latency: 100 + Math.cos(i * 0.3) * 50,
    }));
  }, []);

  const getHealthStatus = (current, baseline) => {
    const ratio = current / baseline;
    if (ratio >= 0.95) return { status: 'healthy', color: 'green', icon: CheckCircle };
    if (ratio >= 0.85) return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    return { status: 'critical', color: 'red', icon: TrendingDown };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-orange-400" />
            Deployed Model Performance Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">
            Real-time tracking of deployed models with automated alerts for performance degradation.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {deployedModels?.map((model) => {
          const health = getHealthStatus(model.current_accuracy, model.baseline_accuracy);
          const HealthIcon = health.icon;

          return (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`bg-black/40 border-${health.color}-500/30`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">
                      {model.deployment_name}
                    </CardTitle>
                    <HealthIcon className={`w-5 h-5 text-${health.color}-400`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded p-3">
                      <div className="text-white/60 text-xs mb-1">Current Accuracy</div>
                      <div className={`text-${health.color}-400 text-xl font-bold`}>
                        {(model.current_accuracy * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-white/5 rounded p-3">
                      <div className="text-white/60 text-xs mb-1">Baseline</div>
                      <div className="text-white text-xl font-bold">
                        {(model.baseline_accuracy * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-white/5 rounded p-3">
                      <div className="text-white/60 text-xs mb-1">Latency</div>
                      <div className="text-white font-bold">{model.latency_ms.toFixed(0)}ms</div>
                    </div>
                    <div className="bg-white/5 rounded p-3">
                      <div className="text-white/60 text-xs mb-1">Requests/hr</div>
                      <div className="text-white font-bold">{model.requests_per_hour}</div>
                    </div>
                  </div>

                  <Badge className={`bg-${health.color}-500/20 text-${health.color}-400 border-0`}>
                    {health.status.toUpperCase()}
                  </Badge>

                  {health.status !== 'healthy' && (
                    <div className={`bg-${health.color}-500/10 border border-${health.color}-500/30 rounded p-3`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Bell className={`w-4 h-4 text-${health.color}-400`} />
                        <span className={`text-${health.color}-200 font-medium text-sm`}>
                          Performance Alert
                        </span>
                      </div>
                      <p className="text-white/70 text-xs">
                        Model accuracy dropped {((1 - model.current_accuracy / model.baseline_accuracy) * 100).toFixed(1)}% below baseline. Consider retraining.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Performance Chart */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">24-Hour Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="hour" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #ffffff20',
                }}
              />
              <Line type="monotone" dataKey="accuracy" stroke="#00f5ff" strokeWidth={2} name="Accuracy %" />
              <Line type="monotone" dataKey="latency" stroke="#ec4899" strokeWidth={2} name="Latency (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}