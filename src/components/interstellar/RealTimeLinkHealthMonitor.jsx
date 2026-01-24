import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Wifi, AlertCircle, TrendingDown, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RealTimeLinkHealthMonitor({ linkId }) {
  const [healthData, setHealthData] = useState([]);
  const [adaptiveChanges, setAdaptiveChanges] = useState([]);

  useEffect(() => {
    const unsubscribe = base44.entities.InterstellarLink.subscribe((event) => {
      if (event.type === 'update' && event.data?.link_id === linkId) {
        setHealthData(prev => [...prev, {
          timestamp: new Date().toISOString(),
          latency: event.data.effective_latency_ms,
          bandwidth: event.data.bandwidth_tbps,
          wormhole_stability: event.data.wormhole_stability
        }].slice(-20));

        if (event.data.adaptive_modulation_config) {
          setAdaptiveChanges(prev => [...prev, {
            timestamp: new Date().toISOString(),
            type: 'modulation',
            change: event.data.adaptive_modulation_config.type
          }].slice(-10));
        }
      }
    });

    return () => unsubscribe?.();
  }, [linkId]);

  const currentHealth = healthData[healthData.length - 1];
  const avgLatency = healthData.reduce((sum, d) => sum + (d.latency || 0), 0) / (healthData.length || 1);

  return (
    <Card className="bg-gradient-to-br from-purple-950/30 via-black/40 to-indigo-950/30 backdrop-blur-lg border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-sm">
          <Activity className="w-4 h-4 text-purple-400" />
          Real-Time Link Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-purple-950/20 border border-purple-500/20 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Wifi className="w-3 h-3 text-purple-400" />
              <span className="text-gray-400 text-[10px]">Latency</span>
            </div>
            <div className="text-white text-lg font-bold">
              {currentHealth?.latency?.toFixed(0) || '--'} <span className="text-xs text-gray-400">ms</span>
            </div>
          </div>

          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-indigo-400" />
              <span className="text-gray-400 text-[10px]">Bandwidth</span>
            </div>
            <div className="text-white text-lg font-bold">
              {currentHealth?.bandwidth?.toFixed(1) || '--'} <span className="text-xs text-gray-400">Tbps</span>
            </div>
          </div>
        </div>

        <div className="bg-violet-950/20 border border-violet-500/20 rounded p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-[10px]">Wormhole Stability</span>
            <Badge className={currentHealth?.wormhole_stability > 0.7 ? 'bg-green-600' : 'bg-yellow-600'}>
              {Math.round((currentHealth?.wormhole_stability || 0) * 100)}%
            </Badge>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentHealth?.wormhole_stability || 0) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-white text-xs font-bold mb-1">Recent Adaptations:</div>
          {adaptiveChanges.slice(0, 3).map((change, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-[10px]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span className="text-gray-400">{new Date(change.timestamp).toLocaleTimeString()}</span>
              <Badge className="bg-purple-700 text-[9px]">{change.change}</Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}