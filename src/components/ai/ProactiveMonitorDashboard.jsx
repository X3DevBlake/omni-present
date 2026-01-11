import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Volume2, Play, Eye } from 'lucide-react';

export default function ProactiveMonitorDashboard({ userEmail }) {
  const [selectedAgent, setSelectedAgent] = useState('');

  const { data: agents } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.filter({ user_email: userEmail }),
    initialData: []
  });

  const { data: proactiveEvents } = useQuery({
    queryKey: ['proactiveEvents', userEmail],
    queryFn: () => base44.entities.ProactiveEvent.filter({ user_email: userEmail }),
    initialData: []
  });

  const runMonitor = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/functions/proactive-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgent })
      });

      if (!response.ok) throw new Error('Failed to run monitor');
      return response.json();
    },
    onSuccess: (data) => {
      // Play audio for critical events
      data.events?.forEach(event => {
        if (event.audio && ['high', 'critical'].includes(event.severity)) {
          const audio = new Audio(event.audio);
          audio.play();
        }
      });
    }
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Eye className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold">Proactive Monitoring</h3>
          <p className="text-white/60 text-sm">AI agents monitoring and initiating communication</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <Select value={selectedAgent} onValueChange={setSelectedAgent} className="flex-1">
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Select monitoring agent..." />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => runMonitor.mutate()}
            disabled={!selectedAgent || runMonitor.isPending}
            className="bg-gradient-to-r from-yellow-500 to-orange-500"
          >
            {runMonitor.isPending ? (
              <>
                <Eye className="w-4 h-4 mr-2 animate-pulse" />
                Monitoring...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Monitor
              </>
            )}
          </Button>
        </div>

        {runMonitor.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-white font-bold text-sm">
                Monitoring Complete: {runMonitor.data.eventsDetected} events detected
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-white/60">Agents:</span>
                <span className="text-white ml-1">{runMonitor.data.systemState?.agents}</span>
              </div>
              <div>
                <span className="text-white/60">Devices:</span>
                <span className="text-white ml-1">{runMonitor.data.systemState?.devices}</span>
              </div>
              <div>
                <span className="text-white/60">Connected:</span>
                <span className="text-white ml-1">{runMonitor.data.systemState?.activeConnections}</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          <h4 className="text-white font-bold text-sm">Recent Events ({proactiveEvents.length})</h4>
          {proactiveEvents.slice(0, 5).map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`border rounded-lg p-3 ${getSeverityColor(event.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-bold text-sm capitalize">{event.event_type}</span>
                </div>
                <span className="px-2 py-0.5 bg-black/20 rounded text-xs capitalize">
                  {event.severity}
                </span>
              </div>
              <p className="text-sm mb-2">{event.description}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/60">
                  {new Date(event.created_date).toLocaleString()}
                </span>
                {event.voice_message_sent && (
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    Voice sent
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded ${
                  event.status === 'resolved' ? 'bg-green-500/20' : 'bg-white/10'
                }`}>
                  {event.status}
                </span>
              </div>
              {event.audio_url && (
                <audio controls className="w-full mt-2" src={event.audio_url} />
              )}
            </motion.div>
          ))}
          {proactiveEvents.length === 0 && (
            <p className="text-white/40 text-sm text-center py-4">No events detected yet</p>
          )}
        </div>
      </div>
    </Card>
  );
}