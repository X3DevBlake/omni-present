import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Gauge, Thermometer, Zap } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SensorDataAnalysis() {
  const data = Array.from({ length: 50 }, (_, i) => ({
    time: i,
    sensor1: 20 + Math.random() * 30,
    sensor2: 40 + Math.random() * 20,
    sensor3: 60 + Math.random() * 15
  }));

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Sensor Data Analysis</h1>
          <p className="text-white/60">Deep analysis of device sensor streams</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Temperature', value: '42°C', icon: Thermometer, color: 'orange' },
            { label: 'Pressure', value: '1.2 Bar', icon: Gauge, color: 'blue' },
            { label: 'Voltage', value: '12.4V', icon: Zap, color: 'yellow' }
          ].map((metric, i) => (
            <motion.div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <metric.icon className={`w-6 h-6 text-${metric.color}-400 mb-2`} />
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="text-white/60 text-sm">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-xl mb-4">Multi-Sensor Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
              <Area type="monotone" dataKey="sensor1" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
              <Area type="monotone" dataKey="sensor2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="sensor3" stroke="#eab308" fill="#eab308" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AuroraBackground>
  );
}