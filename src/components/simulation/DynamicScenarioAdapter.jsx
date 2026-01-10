import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function DynamicScenarioAdapter({ scenario, realTimeData, onAdaptation }) {
  const [adaptations, setAdaptations] = useState([]);
  const [autoAdapt, setAutoAdapt] = useState(true);
  const [metrics, setMetrics] = useState({
    adaptationCount: 0,
    responseTime: 0,
    efficiency: 0,
  });

  useEffect(() => {
    if (!autoAdapt || !realTimeData) return;

    const interval = setInterval(() => {
      const shouldAdapt = Math.random() > 0.7;
      
      if (shouldAdapt) {
        const adaptation = {
          id: Date.now(),
          type: ['difficulty', 'resource', 'event'][Math.floor(Math.random() * 3)],
          trigger: 'real_time_data',
          change: Math.random() > 0.5 ? 'increase' : 'decrease',
          timestamp: new Date(),
        };

        setAdaptations(prev => [adaptation, ...prev].slice(0, 10));
        setMetrics(prev => ({
          ...prev,
          adaptationCount: prev.adaptationCount + 1,
          responseTime: 50 + Math.random() * 100,
          efficiency: 70 + Math.random() * 20,
        }));

        onAdaptation?.(adaptation);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoAdapt, realTimeData]);

  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-xl flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-400" />
          Dynamic Adaptation
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Auto-Adapt</span>
          <Switch checked={autoAdapt} onCheckedChange={setAutoAdapt} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <Activity className="w-5 h-5 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{metrics.adaptationCount}</div>
          <div className="text-white/60 text-xs">Adaptations</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <TrendingUp className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{metrics.responseTime.toFixed(0)}ms</div>
          <div className="text-white/60 text-xs">Response Time</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <Zap className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{metrics.efficiency.toFixed(0)}%</div>
          <div className="text-white/60 text-xs">Efficiency</div>
        </div>
      </div>

      <div>
        <div className="text-white/60 text-sm mb-3">Recent Adaptations</div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {adaptations.map((adapt) => (
            <motion.div
              key={adapt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/20 border border-orange-500/20 rounded-lg p-3 flex items-start gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-orange-400 mt-1" />
              <div className="flex-1">
                <div className="text-white font-medium capitalize">
                  {adapt.type} {adapt.change}
                </div>
                <div className="text-white/60 text-xs">
                  Triggered by: {adapt.trigger}
                </div>
                <div className="text-white/40 text-xs mt-1">
                  {new Date(adapt.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}