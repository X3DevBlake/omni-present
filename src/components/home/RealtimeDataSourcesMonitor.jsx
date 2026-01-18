import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Zap } from 'lucide-react';

export default function RealtimeDataSourcesMonitor() {
  const [dataSources, setDataSources] = useState([
    {
      name: 'Real-Time API',
      status: 'Connected',
      latency: 45,
      dataRate: 1250,
      quality: 99.8,
      lastUpdate: new Date()
    },
    {
      name: 'Blockchain Data',
      status: 'Synced',
      latency: 120,
      dataRate: 842,
      quality: 99.5,
      lastUpdate: new Date()
    },
    {
      name: 'Agent Telemetry',
      status: 'Active',
      latency: 78,
      dataRate: 3420,
      quality: 99.9,
      lastUpdate: new Date()
    },
    {
      name: 'Market Data Feed',
      status: 'Connected',
      latency: 32,
      dataRate: 5630,
      quality: 100,
      lastUpdate: new Date()
    },
    {
      name: 'Transaction Log',
      status: 'Synced',
      latency: 95,
      dataRate: 2100,
      quality: 99.7,
      lastUpdate: new Date()
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDataSources(prev =>
        prev.map(source => ({
          ...source,
          latency: Math.max(20, source.latency + (Math.random() - 0.5) * 30),
          dataRate: source.dataRate + Math.random() * 500 - 250,
          quality: Math.min(100, Math.max(98, source.quality + (Math.random() - 0.5) * 1)),
          lastUpdate: new Date()
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Connected':
      case 'Active':
      case 'Synced':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-red-500/20 text-red-300';
    }
  };

  const getQualityColor = (quality) => {
    if (quality >= 99) return 'text-green-400';
    if (quality >= 95) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-4"
    >
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Data Sources Monitor
            </h3>
            <Badge className="bg-blue-500/20 text-blue-300">Live</Badge>
          </div>

          {/* Overall System Health */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Avg Latency</p>
                <p className="text-2xl font-bold text-white">
                  {(dataSources.reduce((sum, s) => sum + s.latency, 0) / dataSources.length).toFixed(0)}ms
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Total Data Rate</p>
                <p className="text-2xl font-bold text-white">
                  {(dataSources.reduce((sum, s) => sum + s.dataRate, 0) / 1000).toFixed(1)}K req/s
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Avg Quality</p>
                <p className="text-2xl font-bold text-green-400">
                  {(dataSources.reduce((sum, s) => sum + s.quality, 0) / dataSources.length).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Connected Sources</p>
                <p className="text-2xl font-bold text-blue-400">{dataSources.length}/{dataSources.length}</p>
              </div>
            </div>
          </motion.div>

          {/* Individual Data Sources */}
          <div className="space-y-3">
            {dataSources.map((source, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-white">{source.name}</p>
                      <Badge className={`mt-1 text-xs ${getStatusColor(source.status)}`}>
                        {source.status}
                      </Badge>
                    </div>
                  </div>
                  <Zap className="w-4 h-4 text-yellow-400" />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Latency</p>
                    <p className="text-sm font-bold text-slate-200">{source.latency.toFixed(0)}ms</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Data Rate</p>
                    <p className="text-sm font-bold text-slate-200">{(source.dataRate / 1000).toFixed(1)}K/s</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Quality</p>
                    <p className={`text-sm font-bold ${getQualityColor(source.quality)}`}>
                      {source.quality.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Quality Bar */}
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${source.quality}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${
                      source.quality >= 99 ? 'bg-green-500' :
                      source.quality >= 95 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                  />
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  Last update: {source.lastUpdate.toLocaleTimeString()}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}