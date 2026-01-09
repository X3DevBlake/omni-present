import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Droplets, Wind, Camera, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IoTDataStream({ deviceId, deviceType = 'sensor' }) {
  const [dataStream, setDataStream] = useState([]);
  const [currentData, setCurrentData] = useState({
    temperature: 22.5,
    humidity: 45,
    airQuality: 85,
    motion: false
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = {
        time: new Date().toLocaleTimeString(),
        temperature: 20 + Math.random() * 10,
        humidity: 40 + Math.random() * 20,
        airQuality: 70 + Math.random() * 30
      };

      setDataStream(prev => [...prev.slice(-20), newData]);
      setCurrentData({
        temperature: newData.temperature,
        humidity: newData.humidity,
        airQuality: newData.airQuality,
        motion: Math.random() > 0.7
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const sensorIcons = {
    temperature: { icon: Thermometer, color: 'text-red-400' },
    humidity: { icon: Droplets, color: 'text-blue-400' },
    airQuality: { icon: Wind, color: 'text-green-400' },
    camera: { icon: Camera, color: 'text-purple-400' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">IoT Data Stream</h3>
            <div className="text-green-400 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live
            </div>
          </div>
        </div>
        <Cpu className="w-6 h-6 text-purple-400 animate-pulse" />
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-4 h-4 text-red-400" />
            <span className="text-white/60 text-xs">Temperature</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {currentData.temperature.toFixed(1)}°C
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-white/60 text-xs">Humidity</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {currentData.humidity.toFixed(0)}%
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-green-400" />
            <span className="text-white/60 text-xs">Air Quality</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {currentData.airQuality.toFixed(0)}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-white/60 text-xs">Motion</span>
          </div>
          <div className={`text-2xl font-bold ${currentData.motion ? 'text-yellow-400' : 'text-white/40'}`}>
            {currentData.motion ? 'Detected' : 'Clear'}
          </div>
        </div>
      </div>

      {/* Data Chart */}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="text-white/60 text-sm mb-2">Temperature Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dataStream}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" />
            <YAxis stroke="rgba(255,255,255,0.4)" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="temperature" stroke="#00f5ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}