import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Play, Pause, BarChart3 } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ModelTraining() {
  const data = Array.from({ length: 100 }, (_, i) => ({
    epoch: i + 1,
    loss: 2.5 / (1 + i * 0.05) + Math.random() * 0.2,
    accuracy: Math.min(98, 50 + i * 0.5)
  }));

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.div className="flex justify-between items-center mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Model Training</h1>
            <p className="text-white/60">Train and fine-tune AI models</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Start
            </button>
            <button className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-2">
              <Pause className="w-5 h-5" />
              Pause
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Epoch', value: '100/200', icon: BarChart3 },
            { label: 'Loss', value: '0.042', icon: TrendingUp },
            { label: 'Accuracy', value: '97.8%', icon: Brain },
            { label: 'Time Left', value: '2h 15m', icon: Clock }
          ].map((metric, i) => (
            <motion.div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="text-white/60 text-sm">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold text-xl mb-4">Training Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="epoch" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff20' }} />
              <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AuroraBackground>
  );
}