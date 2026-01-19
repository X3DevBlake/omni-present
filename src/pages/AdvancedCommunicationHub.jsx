import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, TrendingUp, AlertTriangle, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import CommunicationTopicTrends3D from '../components/communication/CommunicationTopicTrends3D';
import SentimentNetwork3D from '../components/communication/SentimentNetwork3D';
import RealTimePerformanceDashboard from '../components/analytics/RealTimePerformanceDashboard';
import SkillTrendAnalyzer from '../components/analytics/SkillTrendAnalyzer';

export default function AdvancedCommunicationHub() {
  const queryClient = useQueryClient();
  const [selectedChannel, setSelectedChannel] = useState(null);

  const { data: channels } = useQuery({
    queryKey: ['communication-channels'],
    queryFn: () => base44.entities.AgentCommunicationChannel.list('', 50),
  });

  const { data: topics } = useQuery({
    queryKey: ['communication-topics'],
    queryFn: () => base44.entities.AgentCommunicationTopic.list('-prevalence_score', 20),
  });

  const { data: alerts } = useQuery({
    queryKey: ['communication-alerts'],
    queryFn: () => base44.entities.CommunicationAlert.filter({ resolved: false }, '-created_date', 20),
  });

  const { data: analytics } = useQuery({
    queryKey: ['performance-analytics'],
    queryFn: () => base44.entities.AgentPerformanceAnalytics.list('-created_date', 10),
  });

  const predictBurnout = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('analytics/predictAgentBurnout', {
        agent_id: agentId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-analytics'] });
    }
  });

  const forecastSkills = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('analytics/forecastSkillDemand', {
        agent_id: agentId,
        forecast_months: 6
      });
      return response.data;
    }
  });

  const detectTopics = useMutation({
    mutationFn: async (channelId) => {
      const response = await base44.functions.invoke('detectCommunicationTopics', {
        channel_id: channelId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-topics'] });
    }
  });

  const predictBreakdown = useMutation({
    mutationFn: async (channelId) => {
      const response = await base44.functions.invoke('predictCommunicationBreakdown', {
        channel_id: channelId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication-alerts'] });
    }
  });

  const criticalAlerts = alerts?.filter(a => a.severity === 'critical' || a.severity === 'high').length || 0;
  const risingTopics = topics?.filter(t => t.trend_direction === 'rising').length || 0;

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Advanced Communication Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-powered topic detection, sentiment analysis, and predictive breakdown alerts
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <MessageSquare className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">{channels?.length || 0}</p>
            <p className="text-white/60 text-sm">Active Channels</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">{risingTopics}</p>
            <p className="text-white/60 text-sm">Rising Topics</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <AlertTriangle className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">{criticalAlerts}</p>
            <p className="text-white/60 text-sm">Critical Alerts</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Brain className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{topics?.length || 0}</p>
            <p className="text-white/60 text-sm">Topics Detected</p>
          </Card>
        </div>

        <Tabs defaultValue="channels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-black/30 p-1">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="topics">Topic Trends</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="skills">Skill Trends</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment 3D</TabsTrigger>
            <TabsTrigger value="predict">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="channels">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels?.map((channel) => (
                <Card key={channel.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-cyan-500">{channel.channel_type}</Badge>
                      <div className="text-sm text-white/60">
                        {channel.participant_agent_ids?.length || 0} agents
                      </div>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{channel.channel_name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Messages:</span>
                        <span className="text-white">{channel.message_count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Sentiment:</span>
                        <span className={channel.sentiment_score > 0 ? 'text-green-400' : 'text-red-400'}>
                          {channel.sentiment_score?.toFixed(2) || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => detectTopics.mutate(channel.id)}
                        disabled={detectTopics.isPending}
                        size="sm"
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                      >
                        Detect Topics
                      </Button>
                      <Button
                        onClick={() => predictBreakdown.mutate(channel.id)}
                        disabled={predictBreakdown.isPending}
                        size="sm"
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                      >
                        Predict Issues
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="topics">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Topic Trends 3D Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <CommunicationTopicTrends3D topics={topics} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topics?.map((topic) => (
                <Card key={topic.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={
                        topic.trend_direction === 'rising' ? 'bg-green-500' :
                        topic.trend_direction === 'declining' ? 'bg-red-500' : 'bg-yellow-500'
                      }>
                        {topic.trend_direction}
                      </Badge>
                      <div className="text-cyan-400 font-bold">
                        {topic.prevalence_score?.toFixed(0)}%
                      </div>
                    </div>
                    <h3 className="text-white font-bold mb-2">{topic.topic_name}</h3>
                    <p className="text-white/60 text-sm mb-3">{topic.ai_summary}</p>
                    {topic.keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {topic.keywords.slice(0, 4).map((keyword, i) => (
                          <Badge key={i} className="text-xs bg-cyan-500/20">{keyword}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <div className="space-y-4">
              {alerts?.map((alert) => (
                <Card key={alert.id} className={`border-2 ${
                  alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/50' :
                  alert.severity === 'high' ? 'bg-orange-500/10 border-orange-500/50' :
                  'bg-yellow-500/10 border-yellow-500/50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                          }>
                            {alert.severity?.toUpperCase()}
                          </Badge>
                          <Badge className="bg-purple-500/20">{alert.alert_type}</Badge>
                        </div>
                        <h3 className="text-white font-bold text-lg">{alert.predicted_impact}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-white/60 text-sm mb-1">Confidence</div>
                        <div className="text-white font-bold text-2xl">
                          {alert.prediction_confidence?.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    {alert.recommended_actions?.length > 0 && (
                      <div className="bg-black/30 rounded p-3">
                        <div className="text-cyan-300 text-sm mb-2">Recommended Actions:</div>
                        {alert.recommended_actions.map((action, i) => (
                          <div key={i} className="text-white/70 text-sm">• {action}</div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <RealTimePerformanceDashboard analytics={analytics} />
            
            <Card className="bg-black/40 border-white/10 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Burnout Prediction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-white/60 mb-4">
                  Select an agent to run AI-powered burnout risk analysis and get intervention suggestions.
                </p>
                {channels?.slice(0, 4).map((channel) => 
                  channel.participant_agent_ids?.slice(0, 2).map((agentId, i) => (
                    <Button
                      key={`${channel.id}-${i}`}
                      onClick={() => predictBurnout.mutate(agentId)}
                      disabled={predictBurnout.isPending}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600"
                    >
                      Analyze Agent {agentId.slice(-6)}
                    </Button>
                  ))
                )}
                {predictBurnout.data && (
                  <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30 mt-4">
                    <CardContent className="p-6">
                      <h3 className="text-orange-300 font-bold mb-4">Burnout Analysis Results</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-black/30 rounded p-3">
                          <div className="text-white/60 text-sm">Risk Score</div>
                          <div className={`text-2xl font-bold ${
                            predictBurnout.data.burnout_analysis.burnout_risk_score >= 70 ? 'text-red-400' :
                            predictBurnout.data.burnout_analysis.burnout_risk_score >= 40 ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {predictBurnout.data.burnout_analysis.burnout_risk_score?.toFixed(0)}%
                          </div>
                        </div>
                        <div className="bg-black/30 rounded p-3">
                          <div className="text-white/60 text-sm">Priority</div>
                          <Badge className={
                            predictBurnout.data.burnout_analysis.priority === 'critical' ? 'bg-red-500' :
                            predictBurnout.data.burnout_analysis.priority === 'high' ? 'bg-orange-500' :
                            'bg-yellow-500'
                          }>
                            {predictBurnout.data.burnout_analysis.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded p-3">
                        <div className="text-cyan-300 text-sm mb-2">Suggested Interventions:</div>
                        {predictBurnout.data.burnout_analysis.interventions?.map((intervention, i) => (
                          <div key={i} className="text-white/70 text-sm">• {intervention}</div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Skill Demand Forecasting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-white/60 mb-4">
                  Forecast future skill demand for agents to optimize training priorities.
                </p>
                {channels?.slice(0, 3).map((channel) => 
                  channel.participant_agent_ids?.slice(0, 1).map((agentId, i) => (
                    <Button
                      key={`${channel.id}-${i}`}
                      onClick={() => forecastSkills.mutate(agentId)}
                      disabled={forecastSkills.isPending}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Forecast Skills for Agent {agentId.slice(-6)}
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>

            {forecastSkills.data?.forecast && (
              <SkillTrendAnalyzer skillTrends={forecastSkills.data.forecast.skill_forecasts} />
            )}
          </TabsContent>

          <TabsContent value="sentiment">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Channel Sentiment Network</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentNetwork3D channels={channels} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predict">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Predictive Breakdown Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/60">
                  Select a channel and run predictive analysis to identify potential communication breakdowns before they occur.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {channels?.slice(0, 6).map((channel) => (
                    <Button
                      key={channel.id}
                      onClick={() => {
                        setSelectedChannel(channel);
                        predictBreakdown.mutate(channel.id);
                      }}
                      disabled={predictBreakdown.isPending}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Analyze {channel.channel_name}
                    </Button>
                  ))}
                </div>
                {predictBreakdown.data && (
                  <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 mt-6">
                    <CardContent className="p-6">
                      <h3 className="text-purple-300 font-bold mb-4">Prediction Results</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 rounded p-3">
                          <div className="text-white/60 text-sm">Breakdown Likelihood</div>
                          <div className="text-purple-400 text-2xl font-bold">
                            {predictBreakdown.data.prediction?.breakdown_likelihood?.toFixed(0)}%
                          </div>
                        </div>
                        <div className="bg-black/30 rounded p-3">
                          <div className="text-white/60 text-sm">Alert Created</div>
                          <div className="text-green-400 font-bold">
                            {predictBreakdown.data.alert ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}