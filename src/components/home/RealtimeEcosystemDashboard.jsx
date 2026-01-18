import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, TrendingUp, Zap, Users } from 'lucide-react';

export default function RealtimeEcosystemDashboard() {
  const { data: ecosystemData } = useQuery({
    queryKey: ['realtimeEcosystem'],
    queryFn: () => base44.functions.invoke('aggregate-realtime-ecosystem-data', {}),
    refetchInterval: 3000,
    select: (response) => response.data?.ecosystem || {}
  });

  const getHealthColor = (health) => {
    if (health >= 90) return 'text-green-400';
    if (health >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const healthColor = ecosystemData?.health ? getHealthColor(ecosystemData.health.health) : 'text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Agents',
            value: ecosystemData?.agents?.active || 0,
            icon: <Users className="w-5 h-5" />,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20'
          },
          {
            label: 'Collaborations',
            value: ecosystemData?.collaborations || 0,
            icon: <Activity className="w-5 h-5" />,
            color: 'text-green-400',
            bgColor: 'bg-green-500/20'
          },
          {
            label: 'Transaction Volume',
            value: `$${(parseFloat(ecosystemData?.transactions?.volume) / 1000000).toFixed(1)}M`,
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/20'
          },
          {
            label: 'Total Staked',
            value: `$${(parseFloat(ecosystemData?.staking?.total) / 1000000).toFixed(1)}M`,
            icon: <Zap className="w-5 h-5" />,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/20'
          }
        ].map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-lg p-4"
          >
            <div className={`w-10 h-10 rounded-lg ${metric.bgColor} flex items-center justify-center mb-3`}>
              <div className={metric.color}>{metric.icon}</div>
            </div>
            <p className="text-xs text-slate-400 mb-1">{metric.label}</p>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Ecosystem Health & Performance */}
      <Card className="bg-slate-800/60 backdrop-blur border border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Ecosystem Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                label: 'System Health',
                value: ecosystemData?.health?.health?.toFixed(1),
                unit: '%',
                color: healthColor
              },
              {
                label: 'Efficiency Score',
                value: ecosystemData?.health?.efficiency?.toFixed(1),
                unit: '%',
                color: 'text-green-400'
              },
              {
                label: 'Growth Rate',
                value: ecosystemData?.health?.growth,
                unit: '%',
                color: 'text-blue-400'
              },
              {
                label: 'Network Latency',
                value: ecosystemData?.health?.networkLatency,
                unit: 'ms',
                color: 'text-yellow-400'
              }
            ].map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
              >
                <p className="text-xs text-slate-400 mb-2">{metric.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value || '—'}
                  </span>
                  <span className="text-xs text-slate-400">{metric.unit}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Patterns */}
      {ecosystemData?.behaviors && (
        <Card className="bg-slate-800/60 backdrop-blur border border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Emergent Behaviors</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(ecosystemData.behaviors.distribution).map(([type, count], idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-700/50 rounded-lg p-3 text-center border border-slate-600"
                >
                  <p className="text-xs text-slate-400 mb-1 capitalize">{type}</p>
                  <p className="text-lg font-bold text-white">{count}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Alerts */}
      {ecosystemData?.alerts && (
        <Card className="bg-slate-800/60 backdrop-blur border border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-white mb-4">System Alerts</h3>
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/20 border border-red-500 rounded-lg p-3 flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <div>
                  <p className="text-xs text-slate-400">Critical</p>
                  <p className="text-lg font-bold text-red-400">{ecosystemData.alerts.critical}</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
                className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <div>
                  <p className="text-xs text-slate-400">Warning</p>
                  <p className="text-lg font-bold text-yellow-400">{ecosystemData.alerts.warning}</p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-500/20 border border-blue-500 rounded-lg p-3 flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <div>
                  <p className="text-xs text-slate-400">Info</p>
                  <p className="text-lg font-bold text-blue-400">{ecosystemData.alerts.info}</p>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}