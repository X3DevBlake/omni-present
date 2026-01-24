import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function RealTimeSystemSync() {
  const [updates, setUpdates] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to real-time updates from all critical entities
    const unsubscribers = [];

    const subscribe = async () => {
      try {
        // Mission updates
        const unsubMissions = base44.entities.MissionCommand.subscribe((event) => {
          setUpdates(prev => [{
            type: 'mission',
            action: event.type,
            timestamp: new Date().toISOString(),
            data: event.data
          }, ...prev.slice(0, 9)]);
        });
        unsubscribers.push(unsubMissions);

        // Ethical proposals
        const unsubProposals = base44.entities.EthicalProposal.subscribe((event) => {
          setUpdates(prev => [{
            type: 'ethics',
            action: event.type,
            timestamp: new Date().toISOString(),
            data: event.data
          }, ...prev.slice(0, 9)]);
        });
        unsubscribers.push(unsubProposals);

        // System metrics
        const unsubMetrics = base44.entities.SystemMetric.subscribe((event) => {
          if (event.data?.anomaly_detected) {
            setUpdates(prev => [{
              type: 'anomaly',
              action: 'detected',
              timestamp: new Date().toISOString(),
              data: event.data
            }, ...prev.slice(0, 9)]);
          }
        });
        unsubscribers.push(unsubMetrics);

        setIsConnected(true);
      } catch (error) {
        console.error('Subscription error:', error);
      }
    };

    subscribe();

    return () => {
      unsubscribers.forEach(unsub => unsub?.());
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-lg p-4 overflow-hidden z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-white text-sm font-bold">Real-Time Sync</span>
        </div>
        <Badge className={isConnected ? 'bg-green-600' : 'bg-red-600'}>
          <Zap className="w-3 h-3 mr-1" />
          {isConnected ? 'Live' : 'Offline'}
        </Badge>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-80">
        {updates.map((update, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-purple-950/30 border border-purple-500/20 rounded p-2"
          >
            <div className="flex items-center justify-between mb-1">
              <Badge className={
                update.type === 'mission' ? 'bg-orange-600' :
                update.type === 'ethics' ? 'bg-violet-600' :
                update.type === 'anomaly' ? 'bg-red-600' : 'bg-blue-600'
              }>
                {update.type}
              </Badge>
              <span className="text-gray-500 text-[10px]">
                {new Date(update.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-white text-xs">
              {update.action} - {update.data?.command_id || update.data?.proposal_id || update.data?.metric_name || 'System Event'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}