import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function RealtimeDataStream({ dataSource, title, updateInterval = 2000 }) {
  const [data, setData] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time data updates
      const newDataPoint = {
        id: Date.now(),
        value: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString(),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      };

      setData(prev => [newDataPoint, ...prev].slice(0, 10));
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return (
    <Card className="bg-black/40 border-white/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-white font-bold">{title || 'Real-time Stream'}</h3>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Circle className={`w-3 h-3 ${isConnected ? 'fill-green-400 text-green-400' : 'fill-red-400 text-red-400'}`} />
          </motion.div>
          <span className="text-white/60 text-xs">{isConnected ? 'Live' : 'Disconnected'}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {data.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {item.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className="text-white font-mono">{item.value}</span>
              </div>
              <span className="text-white/60 text-xs">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
}