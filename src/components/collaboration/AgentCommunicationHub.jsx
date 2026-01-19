import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Send, MessageCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import CollaborationNetwork3D from './CollaborationNetwork3D';

export default function AgentCommunicationHub({ channelId, workflowId, simulationId }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: channel } = useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      if (!channelId) return null;
      const channels = await base44.entities.AgentCommunicationChannel.filter({ id: channelId });
      return channels[0];
    },
    enabled: !!channelId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['channel-messages', channelId],
    queryFn: () => base44.entities.AgentMessage.filter({ channel_id: channelId }),
    enabled: !!channelId,
    refetchInterval: 3000, // Real-time updates
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const sendMessage = useMutation({
    mutationFn: async (messageData) => {
      return await base44.entities.AgentMessage.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-messages'] });
      setMessage('');
    },
  });

  const analyzeSentiment = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('analyzeChannelSentiment', {
        channel_id: channelId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel'] });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !selectedAgent) return;

    sendMessage.mutate({
      channel_id: channelId,
      sender_agent_id: selectedAgent.id,
      content: message,
      message_type: 'text',
    });
  };

  const getSentimentIcon = (score) => {
    if (score > 0.3) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (score < -0.3) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <MessageCircle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                {channel?.channel_name || 'Agent Communication'}
              </CardTitle>
              {channel?.sentiment_score !== undefined && (
                <div className="flex items-center gap-2">
                  {getSentimentIcon(channel.sentiment_score)}
                  <span className="text-white/60 text-sm">
                    Sentiment: {(channel.sentiment_score * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="text-xs">{msg.sender_agent_id?.slice(0, 8)}</Badge>
                    <span className="text-white/40 text-xs">
                      {new Date(msg.created_date).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{msg.content}</p>
                  {msg.sentiment !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      {getSentimentIcon(msg.sentiment)}
                      <span className="text-white/50 text-xs">
                        {msg.sentiment > 0 ? 'Positive' : msg.sentiment < 0 ? 'Negative' : 'Neutral'}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                value={selectedAgent?.id || ''}
                onChange={(e) => {
                  const agent = agents?.find(a => a.id === e.target.value);
                  setSelectedAgent(agent);
                }}
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
              >
                <option value="">Select Agent...</option>
                {channel?.participant_agent_ids?.map(agentId => {
                  const agent = agents?.find(a => a.id === agentId);
                  return (
                    <option key={agentId} value={agentId}>
                      {agent?.name || agentId.slice(0, 8)}
                    </option>
                  );
                })}
              </select>

              <Input
                placeholder="Type message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-white/5 border-white/10 text-white"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !selectedAgent}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={() => analyzeSentiment.mutate()}
              variant="outline"
              size="sm"
              className="mt-3 border-purple-500 text-purple-300"
              disabled={messages.length === 0 || analyzeSentiment.isPending}
            >
              {analyzeSentiment.isPending ? 'Analyzing...' : 'AI Sentiment Analysis'}
            </Button>

            {analyzeSentiment.data && (
              <div className="mt-4 bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-white font-bold mb-2">AI Summary</h4>
                <p className="text-white/70 text-sm mb-3">{analyzeSentiment.data.summary}</p>
                
                {analyzeSentiment.data.themes?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-white/60 text-xs">Key Themes: </span>
                    {analyzeSentiment.data.themes.map((theme, i) => (
                      <Badge key={i} className="mr-1 text-xs">{theme}</Badge>
                    ))}
                  </div>
                )}

                <div className="text-white/60 text-sm">
                  Collaboration Effectiveness: {analyzeSentiment.data.collaboration_effectiveness}/10
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Collaboration Network</CardTitle>
        </CardHeader>
        <CardContent>
          <CollaborationNetwork3D 
            participants={channel?.participant_agent_ids || []} 
            messages={messages}
          />
        </CardContent>
      </Card>
    </div>
  );
}