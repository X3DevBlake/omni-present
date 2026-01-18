import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DEVICES_TELEMETRY = [
  {
    id: 'device-1',
    name: 'Server-1',
    metrics: {
      cpu: { current: 45, avg: 42, trend: 'stable' },
      memory: { current: 62, avg: 58, trend: 'rising' },
      temp: { current: 52, avg: 48, trend: 'stable' },
      bandwidth: { current: 78, avg: 72, trend: 'stable' },
    },
    anomalies: [{ metric: 'memory', severity: 'warning', reason: 'Unusual spike detected' }],
  },
  {
    id: 'device-5',
    name: 'GPU-Cluster',
    metrics: {
      cpu: { current: 92, avg: 65, trend: 'rising' },
      memory: { current: 85, avg: 70, trend: 'rising' },
      temp: { current: 78, avg: 55, trend: 'critical' },
      bandwidth: { current: 45, avg: 50, trend: 'stable' },
    },
    anomalies: [
      { metric: 'cpu', severity: 'critical', reason: 'Sustained high usage' },
      { metric: 'temperature', severity: 'critical', reason: 'Exceeding safe limits' },
    ],
  },
];

const CHART_DATA = [
  { time: '14:00', cpu: 40, memory: 55, temp: 48 },
  { time: '14:15', cpu: 42, memory: 58, temp: 50 },
  { time: '14:30', cpu: 48, memory: 62, temp: 52 },
  { time: '14:45', cpu: 92, memory: 78, temp: 70 },
  { time: '15:00', cpu: 92, memory: 85, temp: 78 },
];

export default function EnhancedTelemetryStream() {
  const [selectedDevice, setSelectedDevice] = useState('device-5');
  const [alerts, setAlerts] = useState([]);
  const [showCustomAlert, setShowCustomAlert] = useState(false);

  const device = DEVICES_TELEMETRY.find((d) => d.id === selectedDevice);

  const handleSetAlert = (metric, threshold) => {
    const newAlert = {
      id: Date.now(),
      device: device.name,
      metric,
      threshold,
      timestamp: new Date().toLocaleTimeString(),
    };
    setAlerts([newAlert, ...alerts]);
    setShowCustomAlert(false);
  };

  return (
    <div className="space-y-6">
      {/* Device Selection */}
      <div className="flex gap-2">
        {DEVICES_TELEMETRY.map((dev) => (
          <Button
            key={dev.id}
            onClick={() => setSelectedDevice(dev.id)}
            variant={selectedDevice === dev.id ? 'default' : 'outline'}
            className={`${selectedDevice === dev.id ? 'bg-cyan-600' : ''}`}
          >
            {dev.name}
            {dev.anomalies.length > 0 && (
              <Badge className="ml-2 bg-red-500/50 text-red-200">{dev.anomalies.length}</Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Anomaly Alerts */}
      {device?.anomalies && device.anomalies.length > 0 && (
        <Card className="bg-red-500/20 border-red-500/30 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-white font-bold mb-2">Anomalies Detected</p>
              {device.anomalies.map((anom, idx) => (
                <p key={idx} className="text-white/80 text-sm">
                  • {anom.metric}: {anom.reason}
                </p>
              ))}
              <p className="text-white/60 text-xs mt-2">Root cause analysis in progress...</p>
            </div>
          </div>
        </Card>
      )}

      {/* Metrics Chart */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4">Performance Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={CHART_DATA}>
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="cpu" stroke="#00f5ff" dot={false} />
            <Line type="monotone" dataKey="memory" stroke="#a855f7" dot={false} />
            <Line type="monotone" dataKey="temp" stroke="#ff6b6b" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(device?.metrics || {}).map(([key, value]) => (
          <Card key={key} className="bg-black/40 border-white/10 p-4">
            <p className="text-white/60 text-xs uppercase mb-2">{key}</p>
            <p className="text-white font-bold text-2xl mb-2">{value.current}%</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">avg: {value.avg}%</span>
              <Badge
                className={value.trend === 'rising' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-green-500/30 text-green-300'}
              >
                {value.trend}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Custom Alerts */}
      <Card className="bg-black/40 border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Bell className="w-5 h-5" /> Custom Alerts
          </h3>
          <Button
            onClick={() => setShowCustomAlert(!showCustomAlert)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Settings className="w-3 h-3 mr-1" /> Set Alert
          </Button>
        </div>

        {showCustomAlert && (
          <div className="p-4 bg-white/5 rounded-lg mb-4 space-y-3">
            {['cpu', 'memory', 'temperature', 'bandwidth'].map((metric) => (
              <div key={metric} className="flex items-center justify-between">
                <label className="text-white text-sm capitalize">{metric} Threshold (%)</label>
                <input
                  type="number"
                  defaultValue="80"
                  className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-20 text-sm"
                  onChange={(e) => {}}
                />
                <Button onClick={() => handleSetAlert(metric, 80)} size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-xs">
                  Set
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 max-h-40 overflow-y-auto">
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-2 bg-white/5 rounded flex items-center justify-between text-xs"
              >
                <span className="text-white">
                  {alert.device} - {alert.metric} &gt; {alert.threshold}%
                </span>
                <span className="text-white/60">{alert.timestamp}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {alerts.length === 0 && <p className="text-white/40 text-xs">No custom alerts set</p>}
        </div>
      </Card>
    </div>
  );
}