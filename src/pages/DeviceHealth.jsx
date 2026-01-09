import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Battery, Cpu, HardDrive, Thermometer } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';

export default function DeviceHealth() {
  const devices = [
    { id: 1, name: 'Omni-Core Pro', status: 'excellent', battery: 95, cpu: 34, temp: 42, storage: 67 },
    { id: 2, name: 'Neural Sensor', status: 'good', battery: 78, cpu: 45, temp: 38, storage: 45 },
    { id: 3, name: 'Vision Module', status: 'warning', battery: 23, cpu: 78, temp: 65, storage: 89 }
  ];

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold text-white mb-2">Device Health Monitor</h1>
          <p className="text-white/60">Real-time diagnostics and performance metrics</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device, i) => (
            <motion.div key={device.id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-white font-bold text-lg">{device.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  device.status === 'excellent' ? 'bg-green-500/20 text-green-400' :
                  device.status === 'good' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {device.status}
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/60 flex items-center gap-2"><Battery className="w-4 h-4" />Battery</span>
                    <span className="text-white">{device.battery}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${device.battery > 50 ? 'bg-green-500' : device.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${device.battery}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/60 flex items-center gap-2"><Cpu className="w-4 h-4" />CPU</span>
                    <span className="text-white">{device.cpu}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${device.cpu}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/60 flex items-center gap-2"><Thermometer className="w-4 h-4" />Temp</span>
                    <span className="text-white">{device.temp}°C</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${device.temp < 50 ? 'bg-green-500' : device.temp < 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(device.temp / 100) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-white/60 flex items-center gap-2"><HardDrive className="w-4 h-4" />Storage</span>
                    <span className="text-white">{device.storage}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${device.storage}%` }} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}