import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function IntelligentMetricsDashboard({ alerts, insights, models }) {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active');
  const highConfidenceModels = models.filter(m => 
    m.performance_metrics?.accuracy > 0.8 && m.is_active
  );
  const validatedInsights = insights.filter(i => i.validation_status === 'validated');

  const topInsights = insights
    .filter(i => i.business_impact?.impact_score)
    .sort((a, b) => b.business_impact.impact_score - a.business_impact.impact_score)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Insights */}
      <Card className="bg-slate-900/60 border-slate-700 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-white text-lg">High-Impact Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topInsights.map((insight, idx) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-bold text-sm">{insight.insight_title}</h3>
                <Badge className="bg-purple-500/20 text-purple-400">
                  {Math.round(insight.business_impact?.impact_score)}
                </Badge>
              </div>
              <p className="text-slate-400 text-xs mb-3">{insight.ai_interpretation}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {insight.connected_hubs?.map(hub => (
                  <Badge key={hub} variant="outline" className="text-xs">
                    {hub}
                  </Badge>
                ))}
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Model Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {highConfidenceModels.slice(0, 5).map((model, idx) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
            >
              <div>
                <p className="text-white text-xs font-medium">{model.model_name}</p>
                <p className="text-slate-400 text-xs">{model.model_type}</p>
              </div>
              <div className="flex items-center gap-2">
                {model.performance_metrics?.accuracy >= 0.9 ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-white text-sm font-bold">
                  {Math.round(model.performance_metrics?.accuracy * 100)}%
                </span>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Critical Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {criticalAlerts.slice(0, 5).map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-white text-xs font-medium mb-1">{alert.alert_type}</p>
                <p className="text-slate-400 text-xs">
                  {alert.ai_analysis?.root_cause || 'Analyzing...'}
                </p>
              </div>
              <Badge className="bg-red-500/20 text-red-400 text-xs">
                {alert.severity}
              </Badge>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}