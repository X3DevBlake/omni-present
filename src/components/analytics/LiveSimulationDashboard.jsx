import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Zap, Users } from 'lucide-react';

export default function LiveSimulationDashboard() {
  const [metrics, setMetrics] = useState({
    activeAgents: 0,
    cpuUsage: 0,
    eventsPerSec: 0,
    interactions: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        activeAgents: Math.floor(10 + Math.random() * 20),
        cpuUsage: Math.floor(40 + Math.random() * 30),
        eventsPerSec: Math.floor(50 + Math.random() * 100),
        interactions: Math.floor(100 + Math.random() * 200)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const metricCards = [
    { label: 'Active Agents', value: metrics.activeAgents, icon: Users, color: 'cyan' },
    { label: 'CPU Usage', value: `${metrics.cpuUsage}%`, icon: Cpu, color: 'purple' },
    { label: 'Events/sec', value: metrics.eventsPerSec, icon: Zap, color: 'green' },
    { label: 'Interactions', value: metrics.interactions, icon: Activity, color: 'orange' }
  ];

  const colorMap = {
    cyan: { bg: 'from-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    purple: { bg: 'from-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
    green: { bg: 'from-green-500/20', border: 'border-green-500/30', text: 'text-green-400' },
    orange: { bg: 'from-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-black/50 border border-white/10 rounded-xl p-6">
      <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
        <Activity className="w-6 h-6 text-cyan-400" />
        Live Simulation Dashboard
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((metric, i) => {
          const Icon = metric.icon;
          const colors = colorMap[metric.color];
          return (
            <motion.div
              key={i}
              className={`bg-gradient-to-br ${colors.bg} to-black/20 border ${colors.border} rounded-xl p-4`}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            >
              <Icon className={`w-5 h-5 ${colors.text} mb-2`} />
              <div className="text-white/60 text-xs mb-1">{metric.label}</div>
              <div className={`${colors.text} text-2xl font-bold`}>{metric.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 bg-black/20 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 text-sm">Real-Time Activity</h4>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 text-sm"
            >
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/60">Agent {i + 1}</span>
              <span className="text-white">
                {['Exploring', 'Collaborating', 'Learning', 'Analyzing', 'Optimizing'][i]}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}