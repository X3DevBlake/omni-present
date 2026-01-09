import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Thermometer, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DeviceTelemetry() {
  const data = Array.from({ length: 20 }, (_, i) => ({
    time: `${i}m`,
    cpu: 30 + Math.random() * 40,
    temp: 35 + Math.random() * 20,
    power: 100 + Math.random() * 50
  }));

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Device Telemetry</h1>
          <p className="text-white/60">Real-time sensor data streams</p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'CPU Usage', value: '45%', icon: Cpu, color: 'blue' },
            { label: 'Temperature', value: '42°C', icon: Thermometer, color: 'orange' },
            { label: 'Power Draw', value: '125W', icon: Zap, color: 'yellow' },
            { label: 'Network', value: '1.2 Mbps', icon: Activity, color: 'green' }
          ].map((metric, i) => (
            <motion.div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <metric.icon className={`w-6 h-6 text-${metric.color}-400 mb-2`} />
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="text-white/60 text-sm">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-xl mb-4">Live Metrics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
              <Line type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AuroraBackground>
  );
}