import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Bell, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PredictiveAnalyticsDashboard() {
  const [predictions, setPredictions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    // Generate AI predictions
    setPredictions([
      { metric: 'Network Activity', current: 85, predicted: 92, trend: 'up', confidence: 87 },
      { metric: 'Social Dynamics', current: 72, predicted: 68, trend: 'down', confidence: 73 },
      { metric: 'Economic Index', current: 65, predicted: 71, trend: 'up', confidence: 82 },
    ]);

    setAnomalies([
      { type: 'spike', region: 'Asia Pacific', metric: 'Traffic', severity: 'high', detected: new Date() },
      { type: 'drop', region: 'Europe', metric: 'Latency', severity: 'medium', detected: new Date() },
    ]);

    setInsights([
      { text: 'Network activity expected to increase 8% in next 24h', priority: 'high', action: 'Scale infrastructure' },
      { text: 'Social sentiment trending negative in EU region', priority: 'medium', action: 'Monitor closely' },
      { text: 'Economic indicators suggest growth opportunity', priority: 'low', action: 'Prepare expansion' },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Predictive Analytics</h3>

      {/* AI Forecasts */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          AI Forecasts (24h)
        </h4>
        <div className="space-y-4">
          {predictions.map((pred, i) => (
            <div key={i} className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{pred.metric}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-sm">Current: {pred.current}</span>
                  <span className={`text-sm font-bold ${pred.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    → {pred.predicted}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-2 bg-black/20 rounded-full overflow-hidden flex-1 mr-3">
                  <div
                    className={`h-full ${pred.trend === 'up' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                    style={{ width: `${pred.confidence}%` }}
                  />
                </div>
                <span className="text-white/40 text-xs">{pred.confidence}% confidence</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Detection */}
      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Anomaly Detection
        </h4>
        <div className="space-y-3">
          {anomalies.map((anomaly, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-black/20 border rounded-lg p-4 ${
                anomaly.severity === 'high' ? 'border-red-500/50' :
                anomaly.severity === 'medium' ? 'border-orange-500/50' :
                'border-yellow-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-medium capitalize">{anomaly.type} detected</div>
                  <div className="text-white/60 text-sm">{anomaly.region} - {anomaly.metric}</div>
                  <div className="text-white/40 text-xs mt-1">
                    {new Date(anomaly.detected).toLocaleTimeString()}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  anomaly.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                  anomaly.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {anomaly.severity}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-green-400" />
          Actionable Insights
        </h4>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="bg-black/20 rounded-lg p-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="text-white mb-1">{insight.text}</div>
                <div className="text-white/60 text-sm">Recommended: {insight.action}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ml-3 ${
                insight.priority === 'high' ? 'bg-green-500/20 text-green-400' :
                insight.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {insight.priority}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Predictive Model Performance
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">94%</div>
            <div className="text-white/60 text-xs">Accuracy</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">156</div>
            <div className="text-white/60 text-xs">Predictions</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">12</div>
            <div className="text-white/60 text-xs">Anomalies</div>
          </div>
        </div>
      </div>
    </div>
  );
}