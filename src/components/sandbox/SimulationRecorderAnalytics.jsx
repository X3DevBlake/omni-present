import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, Square, Download, BarChart3, Zap, Users } from 'lucide-react';

export default function SimulationRecorderAnalytics() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([
    {
      id: 1,
      name: 'Run-001-Baseline',
      duration: '15m 32s',
      agents: 5,
      interactions: 1250,
      avgFitness: 78.5,
      date: '2h ago'
    },
    {
      id: 2,
      name: 'Run-002-Optimized',
      duration: '12m 18s',
      agents: 5,
      interactions: 980,
      avgFitness: 85.2,
      date: '1h ago'
    }
  ]);

  const [selectedRecording, setSelectedRecording] = useState(null);

  const performanceData = [
    { time: '0m', fitness: 45, efficiency: 30 },
    { time: '2m', fitness: 52, efficiency: 42 },
    { time: '4m', fitness: 61, efficiency: 55 },
    { time: '6m', fitness: 68, efficiency: 63 },
    { time: '8m', fitness: 72, efficiency: 71 },
    { time: '10m', fitness: 78, efficiency: 76 },
    { time: '12m', fitness: 85, efficiency: 82 },
    { time: '15m', fitness: 92, efficiency: 88 }
  ];

  const behaviorData = [
    { category: 'Collaboration', value: 87 },
    { category: 'Resource Use', value: 74 },
    { category: 'Problem Solve', value: 91 },
    { category: 'Communication', value: 79 },
    { category: 'Adaptation', value: 85 }
  ];

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    const newRecording = {
      id: recordings.length + 1,
      name: `Run-${String(recordings.length + 1).padStart(3, '0')}-NewRun`,
      duration: `${Math.floor(Math.random() * 20)}m ${Math.floor(Math.random() * 60)}s`,
      agents: 5,
      interactions: Math.floor(Math.random() * 1000) + 500,
      avgFitness: (Math.random() * 30 + 70).toFixed(1),
      date: 'just now'
    };
    setRecordings([newRecording, ...recordings]);
  };

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 transition-all ${
        isRecording
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-black/40 border-cyan-500/30'
      }`}>
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Zap className={`w-5 h-5 ${isRecording ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
          {isRecording ? 'Recording Simulation...' : 'Simulation Recorder'}
        </h3>

        <div className="flex gap-3">
          {!isRecording ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={startRecording}
              className="flex-1 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-5 h-5" />
              Start Recording
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={stopRecording}
              className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Square className="w-5 h-5" />
              Stop Recording
            </motion.button>
          )}
        </div>

        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <p className="text-red-300 text-sm">🔴 Recording in progress • 5 agents • 234 interactions</p>
          </motion.div>
        )}
      </div>

      {/* Recordings List */}
      <div className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Saved Recordings ({recordings.length})
        </h3>

        <div className="space-y-3">
          <AnimatePresence>
            {recordings.map((rec, idx) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => setSelectedRecording(rec)}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-lg cursor-pointer transition-all border ${
                  selectedRecording?.id === rec.id
                    ? 'bg-cyan-500/20 border-cyan-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-white font-semibold">{rec.name}</h4>
                    <p className="text-white/50 text-xs">{rec.date} • {rec.duration}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-400">{rec.avgFitness}%</div>
                    <div className="text-xs text-white/50">Avg Fitness</div>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-white/60">
                  <span>👥 {rec.agents} agents</span>
                  <span>⚡ {rec.interactions} interactions</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Analysis Charts */}
      {selectedRecording && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Performance Over Time - {selectedRecording.name}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="fitness" stroke="#00f5ff" strokeWidth={2} dot={false} name="Agent Fitness" />
                <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} dot={false} name="System Efficiency" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Behavior Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={behaviorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="category" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none' }} />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Total Duration', value: selectedRecording.duration, color: 'cyan' },
              { label: 'Agent Count', value: selectedRecording.agents, color: 'purple' },
              { label: 'Interactions', value: selectedRecording.interactions, color: 'green' }
            ].map((stat, i) => {
              const colors = {
                cyan: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30',
                purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/30',
                green: 'from-green-500/10 to-emerald-500/10 border-green-500/30'
              };
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-gradient-to-br ${colors[stat.color]} border rounded-xl p-4`}
                >
                  <p className="text-white/60 text-xs mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-5 h-5" />
            Export Full Report
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}