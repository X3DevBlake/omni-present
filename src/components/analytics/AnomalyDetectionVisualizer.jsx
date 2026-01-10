import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp } from 'lucide-react';

export default function AnomalyDetectionVisualizer() {
  const [dataPoints, setDataPoints] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const value = 50 + Math.random() * 30 + Math.sin(Date.now() / 1000) * 20;
      const isAnomaly = Math.random() > 0.9;
      
      setDataPoints(prev => [...prev, { value, time: Date.now(), isAnomaly }].slice(-50));
      
      if (isAnomaly) {
        setAnomalies(prev => [...prev, {
          value,
          time: new Date(),
          severity: value > 80 ? 'high' : 'medium'
        }].slice(-5));
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(...dataPoints.map(d => d.value), 100);

  return (
    <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-red-400" />
        Anomaly Detection
      </h3>

      <div className="bg-black/20 rounded-lg p-4 mb-4 h-48 relative">
        <svg className="w-full h-full">
          <polyline
            points={dataPoints.map((d, i) => 
              `${(i / 50) * 100},${100 - (d.value / maxValue) * 100}`
            ).join(' ')}
            fill="none"
            stroke="#00f5ff"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          {dataPoints.map((d, i) => d.isAnomaly && (
            <circle
              key={i}
              cx={(i / 50) * 100}
              cy={100 - (d.value / maxValue) * 100}
              r="3"
              fill="#ef4444"
            />
          ))}
        </svg>
      </div>

      <div className="space-y-2">
        <h4 className="text-white font-semibold text-sm mb-2">Recent Anomalies</h4>
        {anomalies.map((anomaly, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-lg ${
              anomaly.severity === 'high' ? 'bg-red-500/20 border border-red-500/30' : 'bg-orange-500/20 border border-orange-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-white text-sm">Value: {anomaly.value.toFixed(2)}</div>
              <div className="text-white/60 text-xs">{anomaly.time.toLocaleTimeString()}</div>
            </div>
            <div className={`text-xs mt-1 ${anomaly.severity === 'high' ? 'text-red-400' : 'text-orange-400'}`}>
              {anomaly.severity} severity
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}