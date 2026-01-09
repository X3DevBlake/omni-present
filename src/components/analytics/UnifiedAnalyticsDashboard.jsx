import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Download, Filter, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function UnifiedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedHubs, setSelectedHubs] = useState(['omni', 'defi', 'simulation', 'devices']);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [correlations, setCorrelations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedHubs]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // Generate cross-hub analytics data
      const mockData = generateCrossHubData();
      setAnalyticsData(mockData);
      setCorrelations(generateCorrelations(mockData));
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCrossHubData = () => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    const data = [];

    for (let i = 0; i < days; i++) {
      data.push({
        day: i,
        omniPerformance: Math.floor(Math.random() * 40) + 50,
        defiReturns: Math.floor(Math.random() * 20) + 40,
        simulationAccuracy: Math.floor(Math.random() * 30) + 60,
        deviceHealth: Math.floor(Math.random() * 15) + 80,
        agentActivity: Math.floor(Math.random() * 100),
        marketVolatility: Math.floor(Math.random() * 50) + 20
      });
    }
    return data;
  };

  const generateCorrelations = (data) => {
    return [
      { metric: 'Simulation → Device', correlation: 0.78, description: 'Simulation insights improve device efficiency' },
      { metric: 'Market → Portfolio', correlation: 0.85, description: 'Market trends directly impact DeFi strategies' },
      { metric: 'Agent Activity → Returns', correlation: 0.62, description: 'Agent activity correlates with trading returns' },
      { metric: 'Device Health → Uptime', correlation: 0.92, description: 'Strong correlation between health metrics and uptime' }
    ];
  };

  const hubColors = {
    omni: '#00f5ff',
    defi: '#10b981',
    simulation: '#a855f7',
    devices: '#f59e0b'
  };

  const COLORS = ['#00f5ff', '#10b981', '#a855f7', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-white font-bold text-lg">Unified Analytics</h3>
              <p className="text-white/60 text-sm">Cross-hub insights and KPI tracking</p>
            </div>
          </div>
          <button className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/60" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
            </select>
          </div>

          <div className="flex gap-2">
            {['omni', 'defi', 'simulation', 'devices'].map(hub => (
              <button
                key={hub}
                onClick={() => setSelectedHubs(prev => 
                  prev.includes(hub) ? prev.filter(h => h !== hub) : [...prev, hub]
                )}
                className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedHubs.includes(hub)
                    ? 'bg-cyan-500/30 border border-cyan-500/50 text-white'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                {hub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      {analyticsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6"
        >
          <h4 className="text-white font-bold mb-4">Hub Performance Trends</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="day" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000000', border: '1px solid #ffffff20' }}
                labelStyle={{ color: '#ffffff' }}
              />
              <Legend />
              {selectedHubs.includes('omni') && <Line type="monotone" dataKey="omniPerformance" stroke="#00f5ff" strokeWidth={2} />}
              {selectedHubs.includes('defi') && <Line type="monotone" dataKey="defiReturns" stroke="#10b981" strokeWidth={2} />}
              {selectedHubs.includes('simulation') && <Line type="monotone" dataKey="simulationAccuracy" stroke="#a855f7" strokeWidth={2} />}
              {selectedHubs.includes('devices') && <Line type="monotone" dataKey="deviceHealth" stroke="#f59e0b" strokeWidth={2} />}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Correlations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6"
      >
        <h4 className="text-white font-bold mb-4">Cross-Hub Correlations</h4>
        <div className="space-y-3">
          {correlations.map((corr, idx) => (
            <motion.div
              key={corr.metric}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-white font-semibold text-sm">{corr.metric}</h5>
                <span className={`text-lg font-bold ${
                  corr.correlation > 0.8 ? 'text-green-400' :
                  corr.correlation > 0.6 ? 'text-blue-400' :
                  'text-yellow-400'
                }`}>
                  {(corr.correlation * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-white/60 text-xs mb-2">{corr.description}</p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                  style={{ width: `${corr.correlation * 100}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* KPI Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6"
        >
          <h4 className="text-white font-bold mb-4">Key Performance Indicators</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Avg Portfolio Return</span>
              <span className="text-white font-bold">+12.4%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Agent Efficiency</span>
              <span className="text-white font-bold">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Device Uptime</span>
              <span className="text-white font-bold">99.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 text-sm">Simulation Accuracy</span>
              <span className="text-white font-bold">87%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6"
        >
          <h4 className="text-white font-bold mb-4">Activity Distribution</h4>
          {analyticsData && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Trading', value: 28 },
                    { name: 'Simulation', value: 22 },
                    { name: 'Research', value: 18 },
                    { name: 'Maintenance', value: 32 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000000', border: '1px solid #ffffff20' }}
                  labelStyle={{ color: '#ffffff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}