import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Users, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegionalDrilldown({ show, region, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  const regionalData = {
    name: region?.name || 'New York',
    metrics: {
      activeAgents: 145,
      avgResponseTime: '12ms',
      successRate: 94.5,
      totalRequests: 28500,
    },
    issues: [
      { id: 1, type: 'latency', severity: 'medium', count: 3 },
      { id: 2, type: 'timeout', severity: 'low', count: 1 },
    ],
    trends: [
      { time: '00:00', value: 120 },
      { time: '04:00', value: 80 },
      { time: '08:00', value: 200 },
      { time: '12:00', value: 150 },
      { time: '16:00', value: 180 },
      { time: '20:00', value: 140 },
    ],
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5 text-white" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">{regionalData.name} - Regional Details</h2>

        <div className="flex gap-2 mb-6">
          {['overview', 'agents', 'performance', 'issues'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize ${
                activeTab === tab
                  ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-500/50'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <Users className="w-8 h-8 text-cyan-400 mb-2" />
                <div className="text-white/60 text-sm">Active Agents</div>
                <div className="text-2xl font-bold text-white">{regionalData.metrics.activeAgents}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <Activity className="w-8 h-8 text-green-400 mb-2" />
                <div className="text-white/60 text-sm">Avg Response</div>
                <div className="text-2xl font-bold text-white">{regionalData.metrics.avgResponseTime}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
                <div className="text-white/60 text-sm">Success Rate</div>
                <div className="text-2xl font-bold text-white">{regionalData.metrics.successRate}%</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <AlertCircle className="w-8 h-8 text-orange-400 mb-2" />
                <div className="text-white/60 text-sm">Total Requests</div>
                <div className="text-2xl font-bold text-white">{regionalData.metrics.totalRequests.toLocaleString()}</div>
              </div>
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-white font-semibold mb-4">24-Hour Activity Trend</h3>
              <div className="h-64 flex items-end gap-2">
                {regionalData.trends.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t"
                      style={{ height: `${(point.value / 200) * 100}%` }}
                    />
                    <div className="text-white/40 text-xs mt-2">{point.time}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'issues' && (
            <motion.div
              key="issues"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {regionalData.issues.map(issue => (
                <div key={issue.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`w-6 h-6 ${issue.severity === 'high' ? 'text-red-400' : issue.severity === 'medium' ? 'text-orange-400' : 'text-yellow-400'}`} />
                    <div>
                      <div className="text-white font-medium capitalize">{issue.type}</div>
                      <div className="text-white/60 text-sm">{issue.count} occurrences</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    issue.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                    issue.severity === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {issue.severity}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white">
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}