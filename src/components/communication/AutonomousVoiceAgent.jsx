import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Volume2, Play, Pause } from 'lucide-react';

export default function AutonomousVoiceAgent({ userEmail }) {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: agents } = useQuery({
    queryKey: ['agents', userEmail],
    queryFn: () => base44.entities.Agent.filter({ user_email: userEmail }),
    initialData: []
  });

  const { data: devices } = useQuery({
    queryKey: ['devices', userEmail],
    queryFn: () => base44.entities.DeviceConnection.filter({ user_email: userEmail }),
    initialData: []
  });

  const { data: conversations } = useQuery({
    queryKey: ['autonomousConversations', userEmail],
    queryFn: () => base44.entities.AutonomousConversation.filter({ user_email: userEmail }),
    initialData: []
  });

  const initiateComm = useMutation({
    mutationFn: async (action) => {
      const response = await fetch('/api/functions/autonomous-communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          deviceId: selectedDevice,
          action: action
        })
      });

      if (!response.ok) throw new Error('Failed to initiate communication');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.audio) {
        const audio = new Audio(data.audio);
        audio.play();
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
      }
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Bot className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold">Autonomous Voice Agent</h3>
          <p className="text-white/60 text-sm">AI-driven device communication</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-white/80 text-sm mb-2 block">Select Agent</label>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Choose an agent..." />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-white/80 text-sm mb-2 block">Target Device</label>
          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Choose a device..." />
            </SelectTrigger>
            <SelectContent>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.device_name} ({device.ip_address})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => initiateComm.mutate('greeting')}
            disabled={!selectedAgent || !selectedDevice || initiateComm.isPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Greet User
          </Button>
          <Button
            onClick={() => initiateComm.mutate('status_update')}
            disabled={!selectedAgent || !selectedDevice || initiateComm.isPending}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            <Play className="w-4 h-4 mr-2" />
            Status Update
          </Button>
        </div>

        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
            <p className="text-white text-sm">Agent is speaking...</p>
          </motion.div>
        )}

        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-white font-bold text-sm mb-3">Recent Conversations</h4>
          <div className="space-y-2">
            {conversations.slice(0, 3).map((conv) => (
              <div key={conv.id} className="bg-white/5 rounded p-2">
                <p className="text-white/60 text-xs mb-1">
                  {new Date(conv.created_date).toLocaleString()}
                </p>
                <p className="text-white text-xs">
                  {conv.transcript?.[0]?.content?.substring(0, 50)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}