import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wrench, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MAINTENANCE_PREDICTIONS = [
  {
    id: 'device-1',
    name: 'Server-1',
    component: 'Cooling Fan',
    failureRisk: 0.87,
    estimatedFailure: '8-12 hours',
    recommendation: 'Schedule replacement immediately',
    historicalData: [
      { day: 'D-30', health: 95, temp: 45 },
      { day: 'D-20', health: 88, temp: 52 },
      { day: 'D-10', health: 76, temp: 62 },
      { day: 'D-5', health: 65, temp: 72 },
      { day: 'Today', health: 42, temp: 85 },
    ],
  },
  {
    id: 'device-5',
    name: 'GPU-Cluster',
    component: 'Power Supply',
    failureRisk: 0.64,
    estimatedFailure: '2-3 days',
    recommendation: 'Order replacement, schedule for next maintenance window',
    historicalData: [
      { day: 'D-30', health: 98, temp: 42 },
      { day: 'D-20', health: 92, temp: 48 },
      { day: 'D-10', health: 85, temp: 55 },
      { day: 'D-5', health: 75, temp: 62 },
      { day: 'Today', health: 68, temp: 68 },
    ],
  },
];

export default function PredictiveMaintenanceSystem() {
  const [selectedDevice, setSelectedDevice] = useState('device-1');
  const [automatedDiagnostics, setAutomatedDiagnostics] = useState({});

  const device = MAINTENANCE_PREDICTIONS.find((d) => d.id === selectedDevice);

  const handleRunDiagnostics = (id) => {
    setAutomatedDiagnostics({ ...automatedDiagnostics, [id]: 'running' });
    setTimeout(() => {
      setAutomatedDiagnostics({ ...automatedDiagnostics, [id]: 'complete' });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Device Selection */}
      <div className="flex gap-2">
        {MAINTENANCE_PREDICTIONS.map((dev) => (
          <Button
            key={dev.id}
            onClick={() => setSelectedDevice(dev.id)}
            variant={selectedDevice === dev.id ? 'default' : 'outline'}
            className={`${selectedDevice === dev.id ? 'bg-orange-600' : ''}`}
          >
            {dev.name}
            {dev.failureRisk > 0.8 && <Badge className="ml-2 bg-red-500/50">Critical</Badge>}
          </Button>
        ))}
      </div>

      {/* Prediction Summary */}
      <Card className={`p-6 border ${device?.failureRisk > 0.8 ? 'bg-red-500/20 border-red-500/30' : 'bg-black/40 border-white/10'}`}>
        <div className="flex items-start gap-4">
          <Wrench className="w-6 h-6 text-white/70 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">{device?.name}</h3>
            <p className="text-white/60 text-sm mt-1">Component: {device?.component}</p>
            <div className="flex items-center gap-4 mt-3">
              <div>
                <p className="text-white/60 text-xs">Failure Risk</p>
                <p className="text-white font-bold text-2xl">{(device?.failureRisk * 100 || 0).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">Estimated Failure</p>
                <p className="text-white font-bold text-lg flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {device?.estimatedFailure}
                </p>
              </div>
            </div>
            <p className="text-white/80 text-sm mt-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {device?.recommendation}
            </p>
          </div>
        </div>
      </Card>

      {/* Health Trend Chart */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4">Component Health Forecast</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={device?.historicalData || []}>
            <defs>
              <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
            <Area
              type="monotone"
              dataKey="health"
              stroke="#ff6b6b"
              fillOpacity={1}
              fill="url(#colorHealth)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Diagnostics */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Wrench className="w-5 h-5" /> Automated Diagnostics
        </h3>
        <div className="space-y-3">
          {MAINTENANCE_PREDICTIONS.map((dev) => (
            <div key={dev.id} className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold text-sm">{dev.name}</span>
                {automatedDiagnostics[dev.id] === 'complete' ? (
                  <Badge className="bg-green-500/30 text-green-300">Complete</Badge>
                ) : automatedDiagnostics[dev.id] === 'running' ? (
                  <Badge className="bg-yellow-500/30 text-yellow-300">Running...</Badge>
                ) : (
                  <Button
                    onClick={() => handleRunDiagnostics(dev.id)}
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700 text-xs"
                  >
                    Run
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Maintenance Schedule */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4">Recommended Maintenance Schedule</h3>
        <div className="space-y-2">
          {[
            { action: 'Emergency', component: 'Server-1 Cooling Fan', date: 'Today', priority: 'critical' },
            { action: 'Preventive', component: 'GPU-Cluster Power Supply', date: '2-3 days', priority: 'high' },
            { action: 'Routine', component: 'All devices', date: '2 weeks', priority: 'low' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 bg-white/5 rounded flex items-center justify-between"
            >
              <div>
                <p className="text-white font-semibold text-sm">{item.action}: {item.component}</p>
                <p className="text-white/60 text-xs">{item.date}</p>
              </div>
              <Badge
                className={
                  item.priority === 'critical'
                    ? 'bg-red-500/30 text-red-300'
                    : item.priority === 'high'
                    ? 'bg-yellow-500/30 text-yellow-300'
                    : 'bg-green-500/30 text-green-300'
                }
              >
                {item.priority}
              </Badge>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}