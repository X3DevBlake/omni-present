import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertTriangle, DollarSign, X } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AIMonitoringDashboard({ deployedBlueprints, onClose }) {
  const [metrics, setMetrics] = useState({
    latency: [],
    throughput: [],
    errorRate: [],
    cpuUtilization: [],
    gpuUtilization: [],
    memoryUsage: [],
    costs: []
  });
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    generateMetrics();
    const interval = setInterval(generateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateMetrics = () => {
    const timestamp = Date.now();
    setMetrics(prev => ({
      latency: [...prev.latency, { time: timestamp, value: 20 + Math.random() * 30 }].slice(-20),
      throughput: [...prev.throughput, { time: timestamp, value: 1000 + Math.random() * 500 }].slice(-20),
      errorRate: [...prev.errorRate, { time: timestamp, value: Math.random() * 2 }].slice(-20),
      cpuUtilization: [...prev.cpuUtilization, { time: timestamp, value: 60 + Math.random() * 30 }].slice(-20),
      gpuUtilization: [...prev.gpuUtilization, { time: timestamp, value: 70 + Math.random() * 25 }].slice(-20),
      memoryUsage: [...prev.memoryUsage, { time: timestamp, value: 55 + Math.random() * 35 }].slice(-20),
      costs: [...prev.costs, { time: timestamp, value: 5000 + Math.random() * 1000 }].slice(-20)
    }));

    if (Math.random() > 0.8) {
      setPredictions({
        capacityAlert: 'GPU capacity will reach 95% in 3 days',
        performanceDegradation: 'Expected 15% latency increase next week due to memory pressure',
        costProjection: 'Monthly cost trending 12% above budget'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-7xl h-[90vh] overflow-y-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">AI Service Monitoring</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <div className="text-cyan-400 text-sm mb-1">Avg Latency</div>
            <div className="text-white text-2xl font-bold">
              {metrics.latency[metrics.latency.length - 1]?.value.toFixed(1)}ms
            </div>
            <div className="text-green-400 text-xs">-8% from baseline</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <div className="text-purple-400 text-sm mb-1">Throughput</div>
            <div className="text-white text-2xl font-bold">
              {metrics.throughput[metrics.throughput.length - 1]?.value.toFixed(0)} req/s
            </div>
            <div className="text-green-400 text-xs">+12% from baseline</div>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="text-red-400 text-sm mb-1">Error Rate</div>
            <div className="text-white text-2xl font-bold">
              {metrics.errorRate[metrics.errorRate.length - 1]?.value.toFixed(2)}%
            </div>
            <div className="text-green-400 text-xs">Within SLA</div>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <div className="text-green-400 text-sm mb-1">Monthly Cost</div>
            <div className="text-white text-2xl font-bold">
              ${metrics.costs[metrics.costs.length - 1]?.value.toFixed(0)}
            </div>
            <div className="text-yellow-400 text-xs">+5% trend</div>
          </div>
        </div>

        {/* Predictive Alerts */}
        {predictions && (
          <div className="mb-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
            <h3 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Predictive Insights
            </h3>
            <div className="space-y-2">
              <div className="text-white/80 text-sm">⚠ {predictions.capacityAlert}</div>
              <div className="text-white/80 text-sm">⚠ {predictions.performanceDegradation}</div>
              <div className="text-white/80 text-sm">💰 {predictions.costProjection}</div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-white font-semibold mb-3">Latency Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={metrics.latency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" tickFormatter={() => ''} stroke="#ffffff40" />
                <YAxis stroke="#ffffff40" />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20' }} />
                <Area type="monotone" dataKey="value" stroke="#00f5ff" fill="#00f5ff20" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-white font-semibold mb-3">Throughput</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metrics.throughput}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" tickFormatter={() => ''} stroke="#ffffff40" />
                <YAxis stroke="#ffffff40" />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20' }} />
                <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-white font-semibold mb-3">Resource Utilization</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" tickFormatter={() => ''} stroke="#ffffff40" />
                <YAxis stroke="#ffffff40" />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20' }} />
                <Line data={metrics.cpuUtilization} type="monotone" dataKey="value" stroke="#00f5ff" name="CPU" />
                <Line data={metrics.gpuUtilization} type="monotone" dataKey="value" stroke="#a855f7" name="GPU" />
                <Line data={metrics.memoryUsage} type="monotone" dataKey="value" stroke="#ec4899" name="Memory" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-white font-semibold mb-3">Cost Tracking</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={metrics.costs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" tickFormatter={() => ''} stroke="#ffffff40" />
                <YAxis stroke="#ffffff40" />
                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff20' }} />
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b98120" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}