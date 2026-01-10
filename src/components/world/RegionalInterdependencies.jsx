import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Activity, Link } from 'lucide-react';

export default function RegionalInterdependencies({ show, onClose }) {
  const regions = [
    { id: 1, name: 'North America', dependencies: ['Europe', 'Asia'], criticalScore: 85 },
    { id: 2, name: 'Europe', dependencies: ['North America', 'Asia', 'Africa'], criticalScore: 92 },
    { id: 3, name: 'Asia', dependencies: ['North America', 'Europe'], criticalScore: 88 },
    { id: 4, name: 'South America', dependencies: ['North America'], criticalScore: 65 },
    { id: 5, name: 'Africa', dependencies: ['Europe'], criticalScore: 58 },
  ];

  const chokePoints = [
    { location: 'Transatlantic Cable', severity: 'critical', bandwidth: '95%', latency: '45ms' },
    { location: 'Pacific Gateway', severity: 'high', bandwidth: '88%', latency: '120ms' },
    { location: 'Mediterranean Hub', severity: 'medium', bandwidth: '72%', latency: '35ms' },
  ];

  if (!show) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Regional Interdependencies</h3>

      {/* Dependency Matrix */}
      <div className="bg-white/5 border border-cyan-500/30 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Link className="w-5 h-5 text-cyan-400" />
          Dependency Network
        </h4>
        <div className="space-y-3">
          {regions.map(region => (
            <div key={region.id} className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-medium">{region.name}</div>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  region.criticalScore > 85 ? 'bg-red-500/20 text-red-400' :
                  region.criticalScore > 70 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {region.criticalScore}% critical
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {region.dependencies.map((dep, i) => (
                  <div key={i} className="px-2 py-1 bg-cyan-500/10 rounded text-cyan-400 text-xs">
                    → {dep}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Choke Points */}
      <div className="bg-white/5 border border-red-500/30 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Critical Choke Points
        </h4>
        <div className="space-y-3">
          {chokePoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/20 border border-red-500/20 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-medium">{point.location}</div>
                  <div className={`text-xs mt-1 ${
                    point.severity === 'critical' ? 'text-red-400' :
                    point.severity === 'high' ? 'text-orange-400' :
                    'text-yellow-400'
                  }`}>
                    {point.severity.toUpperCase()} PRIORITY
                  </div>
                </div>
                <Activity className={`w-5 h-5 ${
                  point.severity === 'critical' ? 'text-red-400' :
                  point.severity === 'high' ? 'text-orange-400' :
                  'text-yellow-400'
                }`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-white/60 text-xs">Bandwidth Usage</div>
                  <div className="text-white font-bold">{point.bandwidth}</div>
                </div>
                <div>
                  <div className="text-white/60 text-xs">Avg Latency</div>
                  <div className="text-white font-bold">{point.latency}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Network Health */}
      <div className="bg-white/5 border border-green-500/30 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4">Overall Network Health</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">94%</div>
            <div className="text-white/60 text-xs">Uptime</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-cyan-400">12.5TB/s</div>
            <div className="text-white/60 text-xs">Throughput</div>
          </div>
          <div className="bg-black/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">65ms</div>
            <div className="text-white/60 text-xs">Avg Latency</div>
          </div>
        </div>
      </div>
    </div>
  );
}