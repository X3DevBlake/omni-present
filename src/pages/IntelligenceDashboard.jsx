import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, BarChart3, AlertTriangle } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import CrossHubCorrelationVisualizer from '../components/intelligence/CrossHubCorrelationVisualizer';
import PredictiveAlertsPanel from '../components/intelligence/PredictiveAlertsPanel';

export default function IntelligenceDashboard() {
  return (
    <AuroraBackground className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Intelligence Dashboard
            </span>
          </h1>
          <p className="text-white/60 text-lg">Cross-hub correlations, predictive analytics, and unified alerts</p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'System IQ', value: '94.2%', icon: Brain, color: 'from-purple-500 to-pink-500' },
            { label: 'Correlations Found', value: '47', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
            { label: 'Alerts Generated', value: '12', icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
            { label: 'Predictions Accuracy', value: '89%', icon: Brain, color: 'from-green-500 to-emerald-500' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className={`bg-gradient-to-br ${stat.color} bg-opacity-20 border-white/10 p-4`}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-white/80" />
                    <div>
                      <p className="text-white/60 text-xs">{stat.label}</p>
                      <p className="text-white font-bold text-lg">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="correlations" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="correlations">Cross-Hub Correlations</TabsTrigger>
            <TabsTrigger value="predictions">Predictive Analytics</TabsTrigger>
            <TabsTrigger value="insights">System Insights</TabsTrigger>
          </TabsList>

          {/* Correlations */}
          <TabsContent value="correlations">
            <CrossHubCorrelationVisualizer />
          </TabsContent>

          {/* Predictions */}
          <TabsContent value="predictions">
            <PredictiveAlertsPanel />
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4">AI Learning Progress</CardTitle>
                <div className="space-y-3">
                  {[
                    { metric: 'Pattern Recognition', progress: 87 },
                    { metric: 'Risk Prediction', progress: 92 },
                    { metric: 'Anomaly Detection', progress: 84 },
                    { metric: 'User Preference Learning', progress: 78 },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-white text-sm font-semibold">{item.metric}</p>
                        <span className="text-white/60 text-xs">{item.progress}%</span>
                      </div>
                      <div className="bg-white/10 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 1 }}
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-black/40 border-white/10 p-6">
                <CardTitle className="text-white mb-4">Top System Events</CardTitle>
                <div className="space-y-3">
                  {[
                    { event: 'Market volatility spike', impact: 'High', time: '14:32' },
                    { event: 'Device performance shift', impact: 'Medium', time: '14:28' },
                    { event: 'AI model convergence', impact: 'High', time: '14:15' },
                    { event: 'Simulation anomaly detected', impact: 'Medium', time: '14:02' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div>
                        <p className="text-white text-sm font-semibold">{item.event}</p>
                        <p className="text-white/60 text-xs">{item.time}</p>
                      </div>
                      <Badge className={item.impact === 'High' ? 'bg-red-500/30 text-red-300' : 'bg-yellow-500/30 text-yellow-300'}>
                        {item.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}