import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Activity, Zap, Thermometer, Wifi, HardDrive } from 'lucide-react';

export default function TelemetryStream() {
  const [metrics, setMetrics] = useState({
    cpu: 42,
    memory: 78,
    temperature: 38,
    bandwidth: 45,
    storage: 256,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        temperature: 35 + Math.floor(Math.random() * 20),
        bandwidth: Math.floor(Math.random() * 100),
        storage: 200 + Math.floor(Math.random() * 100),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const telemetryItems = [
    { label: 'CPU Usage', value: `${metrics.cpu}%`, icon: Activity, color: 'from-cyan-500 to-blue-500' },
    { label: 'Memory', value: `${metrics.memory}%`, icon: Zap, color: 'from-purple-500 to-pink-500' },
    { label: 'Temperature', value: `${metrics.temperature}°C`, icon: Thermometer, color: 'from-orange-500 to-red-500' },
    { label: 'Bandwidth', value: `${metrics.bandwidth}%`, icon: Wifi, color: 'from-green-500 to-emerald-500' },
    { label: 'Storage', value: `${metrics.storage}GB`, icon: HardDrive, color: 'from-yellow-500 to-amber-500' },
  ];

  return (
    <div className="space-y-4">
      {telemetryItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`bg-gradient-to-r ${item.color} bg-opacity-10 border-white/10 p-4`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-white/80" />
                  <span className="text-white/80 font-semibold">{item.label}</span>
                </div>
                <span className="text-white font-bold text-lg">{item.value}</span>
              </div>

              {/* Progress bar for percentage metrics */}
              {item.label !== 'Temperature' && item.label !== 'Storage' && (
                <div className="bg-white/10 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                    animate={{ width: `${Number(item.value.replace('%', ''))}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}

      {/* Event Log */}
      <Card className="bg-black/40 border-white/10 p-4 mt-6">
        <h4 className="text-white font-semibold mb-3">Recent Events</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {[
            { time: '14:32:15', event: 'Device synced with cloud', type: 'info' },
            { time: '14:30:42', event: 'Battery charging initiated', type: 'success' },
            { time: '14:28:10', event: 'Network switched to WiFi', type: 'info' },
            { time: '14:25:33', event: 'Background process updated', type: 'warning' },
          ].map((log, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs p-2 bg-white/5 rounded">
              <span className="text-white/60">{log.time}</span>
              <span className="text-white/80">{log.event}</span>
              <div
                className={`w-2 h-2 rounded-full ${
                  log.type === 'success'
                    ? 'bg-green-500'
                    : log.type === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}