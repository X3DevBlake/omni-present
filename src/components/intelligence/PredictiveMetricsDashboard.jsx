import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Brain, Network, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PredictiveMetricsDashboard({ forecasts, insights, correlations }) {
  const avgForecastAccuracy = forecasts.reduce((acc, f) => acc + (f.model_metrics?.accuracy || 0), 0) / Math.max(forecasts.length, 1);
  const highConfidenceInsights = insights.filter(i => i.confidence_level > 0.8);
  const causalCorrelations = correlations.filter(c => c.causal_analysis?.likely_causal);
  const avgImpact = insights.reduce((acc, i) => acc + (i.business_impact?.impact_score || 0), 0) / Math.max(insights.length, 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Forecast Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Avg Accuracy</span>
              <span className="text-white font-bold">{(avgForecastAccuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Active Forecasts</span>
              <Badge className="bg-purple-500/20 text-purple-400">
                {forecasts.filter(f => f.status === 'active').length}
              </Badge>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${avgForecastAccuracy * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Intelligence Synthesis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">High Confidence</span>
              <Badge className="bg-green-500/20 text-green-400">
                {highConfidenceInsights.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Avg Impact Score</span>
              <span className="text-cyan-400 text-sm">{avgImpact.toFixed(1)}/100</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Top Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights
            .sort((a, b) => (b.business_impact?.impact_score || 0) - (a.business_impact?.impact_score || 0))
            .slice(0, 5)
            .map((insight, idx) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg"
              >
                <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-white text-xs font-medium mb-1 line-clamp-2">
                    {insight.insight_text}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {insight.insight_category}
                    </Badge>
                    <span className="text-slate-400">
                      Impact: {Math.round(insight.business_impact?.impact_score || 0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Strong Correlations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {correlations
              .filter(c => Math.abs(c.correlation_strength) > 0.7)
              .slice(0, 6)
              .map((corr, idx) => (
                <motion.div
                  key={corr.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-800/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="w-4 h-4 text-cyan-400" />
                    <span className="text-white text-xs font-medium">
                      {corr.source_entity_type} → {corr.target_entity_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">Strength:</span>
                    <Badge className={`${
                      corr.correlation_strength > 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    } text-xs`}>
                      {corr.correlation_strength.toFixed(2)}
                    </Badge>
                  </div>
                </motion.div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}