import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, TrendingDown, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TrainingProgressVisualization({ isTraining = false }) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    currentEpoch: 0,
    totalEpochs: 50,
    trainLoss: 0.45,
    valLoss: 0.48,
    trainAccuracy: 92.5,
    valAccuracy: 91.2,
    eta: '2m 34s'
  });

  useEffect(() => {
    if (!isTraining) return;

    const interval = setInterval(() => {
      setData(prev => {
        const epoch = prev.length + 1;
        const newPoint = {
          epoch,
          trainLoss: Math.max(0.1, 0.9 - epoch * 0.012 + Math.random() * 0.05),
          valLoss: Math.max(0.12, 0.95 - epoch * 0.011 + Math.random() * 0.06),
          trainAccuracy: Math.min(99, 10 + epoch * 1.6 + Math.random() * 5),
          valAccuracy: Math.min(99, 8 + epoch * 1.55 + Math.random() * 5)
        };

        setStats({
          currentEpoch: epoch,
          totalEpochs: 50,
          trainLoss: newPoint.trainLoss.toFixed(4),
          valLoss: newPoint.valLoss.toFixed(4),
          trainAccuracy: newPoint.trainAccuracy.toFixed(1),
          valAccuracy: newPoint.valAccuracy.toFixed(1),
          eta: `${Math.max(0, 50 - epoch)}m ${Math.floor(Math.random() * 60)}s`
        });

        return [...prev, newPoint].slice(-50);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTraining]);

  const progress = (stats.currentEpoch / stats.totalEpochs) * 100;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Epoch', value: `${stats.currentEpoch}/${stats.totalEpochs}`, icon: Activity, color: 'cyan' },
          { label: 'Train Loss', value: stats.trainLoss, icon: TrendingDown, color: 'blue' },
          { label: 'Val Loss', value: stats.valLoss, icon: AlertCircle, color: 'purple' },
          { label: 'ETA', value: stats.eta, icon: CheckCircle2, color: 'green' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          const colors = {
            cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30',
            blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30',
            purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/30',
            green: 'from-green-500/10 to-emerald-500/10 border-green-500/30'
          };

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-br ${colors[stat.color]} border rounded-xl p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-xs font-semibold">{stat.label}</span>
                <Icon className="w-4 h-4 text-white/40" />
              </div>
              <div className="text-white font-bold text-lg">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold">Training Progress</h3>
          <span className="text-cyan-400 font-bold">{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
          />
        </div>
      </div>

      {/* Loss Chart */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Training Loss</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="trainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f5ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="valGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="epoch" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="trainLoss" stroke="#00f5ff" fill="url(#trainGradient)" name="Train Loss" />
              <Area type="monotone" dataKey="valLoss" stroke="#a855f7" fill="url(#valGradient)" name="Val Loss" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-white/40">
            Start training to see loss progression
          </div>
        )}
      </div>

      {/* Accuracy Chart */}
      <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">Training Accuracy</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="epoch" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="trainAccuracy" stroke="#10b981" strokeWidth={2} dot={false} name="Train Accuracy %" />
              <Line type="monotone" dataKey="valAccuracy" stroke="#06b6d4" strokeWidth={2} dot={false} name="Val Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-white/40">
            Start training to see accuracy progression
          </div>
        )}
      </div>
    </div>
  );
}