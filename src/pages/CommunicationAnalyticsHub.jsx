import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageCircle, TrendingDown, AlertCircle, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SentimentNetwork3D from '../components/communication/SentimentNetwork3D';

export default function CommunicationAnalyticsHub() {
  const queryClient = useQueryClient();

  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: () => base44.entities.AgentCommunicationChannel.list('-last_activity', 30),
  });

  const { data: breakdowns } = useQuery({
    queryKey: ['breakdowns'],
    queryFn: () => base44.entities.CommunicationBreakdown.list('-created_date', 50),
  });

  const analyzeSentiment = useMutation({
    mutationFn: async (channelId) => {
      const response = await base44.functions.invoke('analyzeSentiment', {
        channel_id: channelId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', 'breakdowns'] });
    },
  });

  const avgSentiment = React.useMemo(() => {
    if (!channels || channels.length === 0) return 0;
    return channels.reduce((sum, c) => sum + (c.sentiment_score || 0), 0) / channels.length;
  }, [channels]);

  const criticalBreakdowns = breakdowns?.filter(b => b.severity === 'critical').length || 0;

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Communication Analytics
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-powered sentiment analysis, thread summarization, and breakdown detection
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 p-4">
            <MessageCircle className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-white text-2xl font-bold">{channels?.length || 0}</p>
            <p className="text-white/60 text-sm">Active Channels</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <BarChart3 className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">{avgSentiment.toFixed(2)}</p>
            <p className="text-white/60 text-sm">Avg Sentiment</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <AlertCircle className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">{breakdowns?.length || 0}</p>
            <p className="text-white/60 text-sm">Breakdowns</p>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 p-4">
            <TrendingDown className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-white text-2xl font-bold">{criticalBreakdowns}</p>
            <p className="text-white/60 text-sm">Critical</p>
          </Card>
        </div>

        <Tabs defaultValue="channels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black/30 p-1">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="breakdowns">Breakdowns</TabsTrigger>
            <TabsTrigger value="3d">Sentiment Network</TabsTrigger>
          </TabsList>

          <TabsContent value="channels">
            {analyzeSentiment.data && (
              <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 mb-6">
                <CardContent className="p-6">
                  <h3 className="text-blue-300 font-bold mb-4">Analysis Results</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Effectiveness</div>
                      <div className="text-green-400 font-bold">
                        {analyzeSentiment.data.collaboration_effectiveness?.toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Pattern</div>
                      <div className="text-cyan-400 text-xs">{analyzeSentiment.data.pattern}</div>
                    </div>
                    <div className="bg-black/30 rounded p-2">
                      <div className="text-white/60 text-xs">Breakdowns</div>
                      <div className="text-orange-400 font-bold">
                        {analyzeSentiment.data.breakdowns_detected}
                      </div>
                    </div>
                  </div>
                  {analyzeSentiment.data.summary && (
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-purple-300 text-sm mb-1">Summary:</div>
                      <div className="text-white/80 text-sm">{analyzeSentiment.data.summary}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels?.map((channel) => (
                <Card key={channel.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold">{channel.channel_name}</h3>
                      <Badge>{channel.channel_type}</Badge>
                    </div>

                    <div className="bg-black/30 rounded p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white/60 text-xs">Sentiment</div>
                          <div className={`font-bold ${
                            (channel.sentiment_score || 0) > 0.5 ? 'text-green-400' :
                            (channel.sentiment_score || 0) > 0 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {channel.sentiment_score?.toFixed(2) || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/60 text-xs">Messages</div>
                          <div className="text-cyan-400 font-bold">{channel.message_count || 0}</div>
                        </div>
                      </div>
                    </div>

                    {channel.summary && (
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded p-2 mb-3 text-xs text-white/80">
                        {channel.summary}
                      </div>
                    )}

                    <Button
                      onClick={() => analyzeSentiment.mutate(channel.id)}
                      disabled={analyzeSentiment.isPending}
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Analyze Sentiment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="breakdowns">
            <div className="space-y-4">
              {breakdowns?.map((breakdown) => (
                <Card key={breakdown.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge>{breakdown.breakdown_type}</Badge>
                      <Badge className={`${
                        breakdown.severity === 'critical' ? 'bg-red-500' :
                        breakdown.severity === 'high' ? 'bg-orange-500' :
                        breakdown.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      } text-white`}>
                        {breakdown.severity}
                      </Badge>
                    </div>

                    {breakdown.ai_summary && (
                      <div className="bg-black/30 rounded p-3 mb-3">
                        <div className="text-white/60 text-sm mb-1">AI Summary</div>
                        <div className="text-white text-sm">{breakdown.ai_summary}</div>
                      </div>
                    )}

                    {breakdown.recommended_actions?.length > 0 && (
                      <div className="bg-cyan-500/20 border border-cyan-500/30 rounded p-3">
                        <div className="text-cyan-300 text-xs mb-2">Recommended Actions:</div>
                        {breakdown.recommended_actions.map((action, i) => (
                          <div key={i} className="text-white/80 text-xs mb-1">• {action}</div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="3d">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Sentiment Network</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentNetwork3D channels={channels} breakdowns={breakdowns} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}