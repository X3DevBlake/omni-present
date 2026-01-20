import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AgentTeamFormation3D from '../components/agents/AgentTeamFormation3D';
import LiveDataStream3D from '../components/data/LiveDataStream3D';
import MarketDataIntegration from '../components/data/MarketDataIntegration';
import { Users, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AICollaborativeIntelligenceHub() {
  const [taskRequirement, setTaskRequirement] = useState('');
  const queryClient = useQueryClient();

  const { data: teamDynamics } = useQuery({
    queryKey: ['team-dynamics'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getAgentTeamDynamics', {});
      return response.data;
    },
    refetchInterval: 10000
  });

  const { data: marketData } = useQuery({
    queryKey: ['live-market-data'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getLiveMarketData', {
        symbols: ['BTC', 'ETH', 'SOL', 'AAPL', 'GOOGL']
      });
      return response.data.market_data;
    },
    refetchInterval: 30000
  });

  const { data: liveDataVisuals } = useQuery({
    queryKey: ['live-data-visuals'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getLiveDataStreamVisuals', {});
      return response.data;
    },
    refetchInterval: 15000
  });

  const { data: newsFeeds } = useQuery({
    queryKey: ['realtime-news'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getRealtimeNewsFeed', {
        categories: ['AI', 'Crypto', 'Security']
      });
      return response.data;
    },
    refetchInterval: 60000
  });

  const formTeam = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('formDynamicAgentTeam', {
        task_requirement: {
          task_id: `task-${Date.now()}`,
          complexity: 'high',
          required_skills: taskRequirement.split(',').map(s => s.trim()),
          estimated_duration: 3600
        }
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Team "${data.team.team_name}" formed`);
      queryClient.invalidateQueries({ queryKey: ['team-dynamics'] });
      setTaskRequirement('');
    }
  });

  return (
    <AuroraBackground className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">
            AI Collaborative Intelligence Hub
          </h1>
          <p className="text-white/70 text-xl">
            Dynamic Agent Teams • Real-Time Data Integration • Sentiment Analysis
          </p>
        </div>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/30">
            <TabsTrigger value="teams">
              <Users className="w-4 h-4 mr-2" />
              Agent Teams
            </TabsTrigger>
            <TabsTrigger value="data">
              <TrendingUp className="w-4 h-4 mr-2" />
              Live Data Streams
            </TabsTrigger>
            <TabsTrigger value="communication">
              <MessageSquare className="w-4 h-4 mr-2" />
              Communication
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-6 mt-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">Form Dynamic Agent Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">
                    Required Skills (comma-separated)
                  </label>
                  <Input
                    value={taskRequirement}
                    onChange={(e) => setTaskRequirement(e.target.value)}
                    placeholder="e.g., data analysis, machine learning, communication"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Button
                  onClick={() => formTeam.mutate()}
                  disabled={!taskRequirement || formTeam.isPending}
                  className="w-full bg-gradient-to-r from-cyan-600 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {formTeam.isPending ? 'Forming Team...' : 'Form AI Team'}
                </Button>
              </CardContent>
            </Card>

            {teamDynamics?.team_dynamics?.map((team, i) => (
              <AgentTeamFormation3D
                key={i}
                teamData={team}
                onMemberSelect={(member) => toast.info(`Agent: ${member.agent_name}`)}
              />
            ))}

            {teamDynamics?.total_teams === 0 && (
              <div className="text-center text-white/60 py-12">
                No active teams. Create one above to get started!
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-6 mt-6">
            {marketData && marketData.length > 0 && (
              <>
                <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-white">Live Market Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarketDataIntegration marketData={marketData} />
                  </CardContent>
                </Card>
              </>
            )}

            {liveDataVisuals && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Live Data Impact Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <LiveDataStream3D
                    dataStreams={liveDataVisuals.data_streams || []}
                    newsStreams={liveDataVisuals.news_streams || []}
                    impactAnalysis={liveDataVisuals.impact_analysis || {}}
                  />
                </CardContent>
              </Card>
            )}

            {liveDataVisuals?.impact_analysis && (
              <Card className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 border-purple-400/50 backdrop-blur-md">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-3">AI Impact Analysis</h3>
                  <div className="space-y-2">
                    {liveDataVisuals.impact_analysis.primary_influences?.map((influence, i) => (
                      <p key={i} className="text-white/80 text-sm">• {influence}</p>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                    <div>
                      <span className="text-white/60 text-xs">Agent Decisions Affected</span>
                      <p className="text-white text-2xl font-bold">
                        {liveDataVisuals.impact_analysis.agent_decisions_affected || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-white/60 text-xs">Overall Impact</span>
                      <p className="text-white text-2xl font-bold">
                        {((liveDataVisuals.impact_analysis.overall_impact_score || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="communication" className="space-y-6 mt-6">
            {newsFeeds?.news && (
              <Card className="bg-white/10 border-white/20 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Real-Time News & Threat Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {newsFeeds.news.map((article, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium text-sm mb-2">{article.title}</h4>
                      <p className="text-white/70 text-xs mb-2">{article.summary}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-white/50 text-xs">{article.source}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          article.sentiment === 'positive' ? 'bg-green-600' :
                          article.sentiment === 'negative' ? 'bg-red-600' : 'bg-gray-600'
                        }`}>
                          {article.sentiment}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {newsFeeds?.threats && newsFeeds.threats.length > 0 && (
              <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-400/50 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-white">Security Threats Detected</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {newsFeeds.threats.map((threat, i) => (
                    <div key={i} className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{threat.threat_name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          threat.severity === 'critical' ? 'bg-red-600' :
                          threat.severity === 'high' ? 'bg-orange-600' : 'bg-yellow-600'
                        }`}>
                          {threat.severity}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm">{threat.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}