import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Filter } from 'lucide-react';

export default function DataReplayAnalytics() {
  const [selectedView, setSelectedView] = useState('timeline');

  const timelineData = [
    { time: '0s', agents: 10, events: 0, avgReturn: 0 },
    { time: '10s', agents: 10, events: 3, avgReturn: 2.5 },
    { time: '20s', agents: 9, events: 5, avgReturn: 5.2 },
    { time: '30s', agents: 9, events: 8, avgReturn: 8.1 },
    { time: '40s', agents: 8, events: 12, avgReturn: 12.5 },
    { time: '50s', agents: 8, events: 15, avgReturn: 15.8 },
    { time: '60s', agents: 7, events: 18, avgReturn: 18.3 },
  ];

  const metricsData = [
    { name: 'Success Rate', value: 78, target: 85 },
    { name: 'Profit', value: 2450, target: 2500 },
    { name: 'Risk', value: 12, target: 10 },
    { name: 'Efficiency', value: 91, target: 95 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedView('timeline')}
          className={`px-4 py-2 rounded-lg transition ${
            selectedView === 'timeline'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setSelectedView('metrics')}
          className={`px-4 py-2 rounded-lg transition ${
            selectedView === 'metrics'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Metrics
        </button>
        <button
          onClick={() => setSelectedView('events')}
          className={`px-4 py-2 rounded-lg transition ${
            selectedView === 'events'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Events Log
        </button>
        <div className="ml-auto flex gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg text-cyan-400">
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg text-cyan-400">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {selectedView === 'timeline' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4">Simulation Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="avgReturn" stroke="#06b6d4" name="Avg Return %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedView === 'metrics' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4">Performance Metrics vs Target</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#06b6d4" name="Actual" />
              <Bar dataKey="target" fill="#a855f7" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {selectedView === 'events' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="text-white font-bold mb-4">Event Log</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[
              { time: '0:05s', type: 'agent_decision', msg: 'Agent 3 initiated trade' },
              { time: '0:12s', type: 'error', msg: 'Agent 7 exceeded risk threshold' },
              { time: '0:18s', type: 'success', msg: 'Agent 1 completed successful transaction' },
              { time: '0:25s', type: 'agent_decision', msg: 'Agent 5 adjusted portfolio' },
              { time: '0:31s', type: 'warning', msg: 'Market volatility spike detected' },
            ].map((event, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${
                  event.type === 'success'
                    ? 'bg-green-500/10 border-green-500'
                    : event.type === 'error'
                    ? 'bg-red-500/10 border-red-500'
                    : event.type === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500'
                    : 'bg-blue-500/10 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white/80 text-sm">{event.msg}</span>
                  <span className="text-white/50 text-xs">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}