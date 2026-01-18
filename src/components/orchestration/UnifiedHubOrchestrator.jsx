import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, AlertCircle, CheckCircle } from 'lucide-react';

const HUBS = [
  { name: 'Home', status: 'operational', color: 'from-cyan-500 to-blue-500', metric: '100%' },
  { name: 'Banking', status: 'operational', color: 'from-green-500 to-emerald-500', metric: '94%' },
  { name: 'AI Labs', status: 'operational', color: 'from-purple-500 to-pink-500', metric: '87%' },
  { name: 'Simulations', status: 'operational', color: 'from-rose-500 to-red-500', metric: '92%' },
  { name: 'Devices', status: 'operational', color: 'from-amber-500 to-orange-500', metric: '99%' },
  { name: 'Communications', status: 'operational', color: 'from-indigo-500 to-purple-500', metric: '85%' },
];

const RECENT_EVENTS = [
  { id: 1, type: 'agent_trained', from: 'AI Labs', to: 'Banking', time: '2 min ago', icon: Zap },
  { id: 2, type: 'market_data_sync', from: 'Banking', to: 'Simulations', time: '5 min ago', icon: Activity },
  { id: 3, type: 'device_status', from: 'Devices', to: 'Home', time: '8 min ago', icon: CheckCircle },
  { id: 4, type: 'anomaly_alert', from: 'Simulations', to: 'Communications', time: '12 min ago', icon: AlertCircle },
];

export default function UnifiedHubOrchestrator() {
  const [events, setEvents] = useState(RECENT_EVENTS);

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) => [
        {
          id: prev.length + 1,
          type: ['agent_trained', 'market_data_sync', 'device_status'][Math.floor(Math.random() * 3)],
          from: HUBS[Math.floor(Math.random() * HUBS.length)].name,
          to: HUBS[Math.floor(Math.random() * HUBS.length)].name,
          time: 'Just now',
          icon: [Zap, Activity, CheckCircle][Math.floor(Math.random() * 3)],
        },
        ...prev.slice(0, 3),
      ]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Hub Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {HUBS.map((hub, idx) => (
          <motion.div
            key={hub.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={`bg-gradient-to-br ${hub.color} bg-opacity-10 border-white/10 p-4`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-semibold">{hub.name}</h4>
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <p className="text-white/60 text-xs mb-2">Health Score</p>
              <p className="text-white font-bold text-lg">{hub.metric}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Event Stream */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4">Cross-Hub Events</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.map((event) => {
            const Icon = event.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Icon className="w-4 h-4 text-white/60" />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {event.from} → {event.to}
                    </p>
                    <p className="text-white/60 text-xs">{event.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <span className="text-white/40 text-xs whitespace-nowrap ml-2">{event.time}</span>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Integration Status */}
      <Card className="bg-black/40 border-white/10 p-6">
        <h3 className="text-white font-bold mb-4">Integration Health</h3>
        <div className="space-y-3">
          {[
            { name: 'API Gateway', status: 'healthy', latency: '2ms' },
            { name: 'Event Bus', status: 'healthy', latency: '5ms' },
            { name: 'Data Sync', status: 'healthy', latency: '12ms' },
            { name: 'Webhook Broadcaster', status: 'healthy', latency: '8ms' },
          ].map((service, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded">
              <span className="text-white font-semibold text-sm">{service.name}</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/30 text-green-300 text-xs">{service.status}</Badge>
                <span className="text-white/60 text-xs">{service.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}