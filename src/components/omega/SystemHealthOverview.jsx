import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, Globe, Network } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function SystemHealthOverview() {
  const { data: anomalies } = useQuery({
    queryKey: ['system_anomalies'],
    queryFn: () => base44.entities.AnomalyDetection.filter({ resolved: false }),
    initialData: []
  });

  const { data: geoPredictions } = useQuery({
    queryKey: ['geo_risks'],
    queryFn: () => base44.entities.GeopoliticalPrediction.list('-probability', 10),
    initialData: []
  });

  const { data: networkNodes } = useQuery({
    queryKey: ['network_health'],
    queryFn: () => base44.entities.RedCommNetworkNode.list(),
    initialData: []
  });

  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
  const highRiskRegions = geoPredictions.filter(p => p.probability > 0.5);
  const onlineNodes = networkNodes.filter(n => n.node_status === 'online');
  const networkHealthScore = networkNodes.length > 0 ? 
    (onlineNodes.length / networkNodes.length) * 100 : 100;

  const overallHealth = (
    ((anomalies.length === 0 ? 100 : Math.max(0, 100 - anomalies.length * 10)) +
    (highRiskRegions.length === 0 ? 100 : Math.max(0, 100 - highRiskRegions.length * 15)) +
    networkHealthScore) / 3
  );

  return (
    <Card className="bg-gradient-to-br from-slate-950/90 via-gray-950/90 to-zinc-950/90 backdrop-blur-xl border-slate-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <Activity className="w-7 h-7 text-blue-400" />
          System Health Overview
        </CardTitle>
        <p className="text-gray-300 text-sm mt-2">
          Real-time monitoring of all Omega systems
        </p>
      </CardHeader>
      <CardContent>
        {/* Overall Health Score */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Overall System Health</span>
            <span className="text-white font-bold text-lg">{overallHealth.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallHealth > 80 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                overallHealth > 60 ? 'bg-gradient-to-r from-amber-600 to-yellow-500' :
                'bg-gradient-to-r from-red-600 to-rose-500'
              }`}
              style={{ width: `${overallHealth}%` }}
            />
          </div>
        </div>

        {/* Critical Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/60 rounded-lg p-4 border border-red-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <Badge className={criticalAnomalies.length > 0 ? 'bg-red-600' : 'bg-green-600'}>
                {criticalAnomalies.length > 0 ? 'Alert' : 'OK'}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">{anomalies.length}</div>
            <div className="text-xs text-gray-400">Active Anomalies</div>
            {criticalAnomalies.length > 0 && (
              <div className="text-xs text-red-400 mt-1">{criticalAnomalies.length} critical</div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-black/60 rounded-lg p-4 border border-orange-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-5 h-5 text-orange-400" />
              <Badge className={highRiskRegions.length > 2 ? 'bg-red-600' : 'bg-amber-600'}>
                {highRiskRegions.length} High
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">{geoPredictions.length}</div>
            <div className="text-xs text-gray-400">Geo Predictions</div>
            {highRiskRegions.length > 0 && (
              <div className="text-xs text-orange-400 mt-1">
                Avg risk: {((highRiskRegions.reduce((s, p) => s + p.probability, 0) / highRiskRegions.length) * 100).toFixed(0)}%
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-black/60 rounded-lg p-4 border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <Network className="w-5 h-5 text-green-400" />
              <Badge className={networkHealthScore > 80 ? 'bg-green-600' : 'bg-amber-600'}>
                {networkHealthScore.toFixed(0)}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-white">{onlineNodes.length}/{networkNodes.length}</div>
            <div className="text-xs text-gray-400">Network Nodes</div>
          </motion.div>
        </div>

        {/* Recent Critical Events */}
        <div className="space-y-2">
          <div className="text-white text-sm font-bold mb-2">Recent Critical Events</div>
          
          {criticalAnomalies.slice(0, 2).map((anomaly, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-red-950/40 rounded-lg p-3 border border-red-500/30"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-red-400 font-semibold text-sm">{anomaly.anomaly_type}</div>
                  <div className="text-gray-400 text-xs">{anomaly.detection_source}</div>
                </div>
                <Badge className="bg-red-600">Critical</Badge>
              </div>
              {anomaly.ai_analysis?.recommended_actions?.[0] && (
                <div className="text-xs text-green-400 mt-2">
                  → {anomaly.ai_analysis.recommended_actions[0]}
                </div>
              )}
            </motion.div>
          ))}

          {highRiskRegions.slice(0, 2).map((pred, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (criticalAnomalies.length + idx) * 0.1 }}
              className="bg-orange-950/40 rounded-lg p-3 border border-orange-500/30"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-orange-400 font-semibold text-sm">{pred.target_region}</div>
                  <div className="text-gray-400 text-xs capitalize">{pred.prediction_type.replace(/_/g, ' ')}</div>
                </div>
                <Badge className="bg-orange-600">{(pred.probability * 100).toFixed(0)}%</Badge>
              </div>
            </motion.div>
          ))}

          {criticalAnomalies.length === 0 && highRiskRegions.length === 0 && (
            <div className="text-center text-gray-500 py-6 bg-black/40 rounded-lg border border-green-500/20">
              <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-sm">All systems operational</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}