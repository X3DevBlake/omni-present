import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Radio, Send, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import BroadcastNetwork3D from '../components/communication/BroadcastNetwork3D';
import { Badge } from '@/components/ui/badge';

export default function MessageBroadcastHub() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [targetScope, setTargetScope] = useState('all');
  const [priority, setPriority] = useState('normal');

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const { data: broadcasts } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => base44.entities.MessageBroadcast.list('-created_date', 20),
  });

  const sendBroadcast = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('broadcastAgentMessage', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
      setMessage('');
    },
  });

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Message Broadcast Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Send broadcasts to agent groups with priority-based delivery
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                Create Broadcast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white text-sm mb-2 block">Sender Agent</label>
                <Select value={selectedAgent?.id || ''} onValueChange={(id) => {
                  const agent = agents?.find(a => a.id === id);
                  setSelectedAgent(agent);
                }}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white text-sm mb-2 block">Target Scope</label>
                  <Select value={targetScope} onValueChange={setTargetScope}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                      <SelectItem value="group">Working Group</SelectItem>
                      <SelectItem value="role">By Role</SelectItem>
                      <SelectItem value="channel">Specific Channel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white text-sm mb-2 block">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-white text-sm mb-2 block">Message</label>
                <Textarea
                  placeholder="Enter broadcast message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-white/5 border-white/10 text-white h-32"
                />
              </div>

              <Button
                onClick={() => {
                  if (selectedAgent && message) {
                    sendBroadcast.mutate({
                      sender_agent_id: selectedAgent.id,
                      content: message,
                      target_scope: targetScope,
                      priority,
                    });
                  }
                }}
                disabled={!selectedAgent || !message || sendBroadcast.isPending}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendBroadcast.isPending ? 'Sending...' : 'Send Broadcast'}
              </Button>

              {sendBroadcast.data && (
                <div className="bg-green-500/20 border border-green-500/30 rounded p-3">
                  <p className="text-white text-sm">
                    Broadcast sent to {sendBroadcast.data.recipients_count} agents
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Broadcast Network</CardTitle>
            </CardHeader>
            <CardContent>
              <BroadcastNetwork3D broadcasts={broadcasts || []} />
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Broadcasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {broadcasts?.map((broadcast, i) => (
                <motion.div
                  key={broadcast.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge>{broadcast.broadcast_type}</Badge>
                    <Badge className={`${
                      broadcast.priority === 'urgent' ? 'bg-red-500' :
                      broadcast.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                    } text-white border-0`}>
                      {broadcast.priority}
                    </Badge>
                  </div>

                  <p className="text-white/80 mb-2">{broadcast.content}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      From: {broadcast.sender_agent_id?.slice(0, 8)}
                    </span>
                    <span className="text-cyan-400">
                      {broadcast.recipients?.length || 0} recipients
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuroraBackground>
  );
}