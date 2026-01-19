import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Store, Sparkles, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import AgentConstellationVisualizer3D from '../components/marketplace/AgentConstellationVisualizer3D';
import MarketplaceDynamics3D from '../components/marketplace/MarketplaceDynamics3D';

export default function EnhancedMarketplaceHub() {
  const queryClient = useQueryClient();
  const [taskQuery, setTaskQuery] = useState('Build AI trading bot');

  const { data: profiles } = useQuery({
    queryKey: ['marketplace-profiles'],
    queryFn: () => base44.entities.AgentMarketplaceProfile.list('-recommendation_score', 50),
  });

  const orchestratePricing = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('orchestrateDynamicPricing', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-profiles'] });
    }
  });

  const matchAgents = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('matchAgentsToTasks', {
        task_description: taskQuery,
        required_skills: ['AI', 'trading', 'automation'],
        budget: 5000
      });
      return response.data;
    }
  });

  const avgPrice = React.useMemo(() => {
    if (!profiles?.length) return 0;
    return profiles.reduce((sum, p) => sum + (p.pricing_model?.current_price || 0), 0) / profiles.length;
  }, [profiles]);

  const topRated = profiles?.filter(p => (p.performance_history?.success_rate || 0) > 80).length || 0;

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Enhanced Marketplace Hub
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            AI-powered agent matching, dynamic pricing orchestration, and 3D constellation view
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Store className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{profiles?.length || 0}</p>
            <p className="text-white/60 text-sm">Listed Agents</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">${avgPrice.toFixed(0)}</p>
            <p className="text-white/60 text-sm">Avg Price</p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <Sparkles className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">{topRated}</p>
            <p className="text-white/60 text-sm">Top Rated</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <Users className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {profiles?.filter(p => (p.availability_score || 0) > 70).length || 0}
            </p>
            <p className="text-white/60 text-sm">Available Now</p>
          </Card>
        </div>

        <Tabs defaultValue="match" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-black/30 p-1">
            <TabsTrigger value="match">AI Matching</TabsTrigger>
            <TabsTrigger value="pricing">Dynamic Pricing</TabsTrigger>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="constellation">Constellation 3D</TabsTrigger>
            <TabsTrigger value="dynamics">Market Dynamics</TabsTrigger>
          </TabsList>

          <TabsContent value="match">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">AI-Powered Agent Matching</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Describe Your Task</label>
                  <Input
                    value={taskQuery}
                    onChange={(e) => setTaskQuery(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="What do you need help with?"
                  />
                </div>
                <Button
                  onClick={() => matchAgents.mutate()}
                  disabled={matchAgents.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Find Perfect Matches
                </Button>
              </CardContent>
            </Card>

            {matchAgents.data?.matches && (
              <div className="space-y-4">
                {matchAgents.data.matches.map((match, i) => (
                  <Card key={i} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Badge className="bg-purple-500 mb-2">#{i + 1} Best Match</Badge>
                          <h3 className="text-white font-bold text-lg">
                            Agent {match.agent_id?.slice(-6)}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold text-2xl">
                            ${match.estimated_cost?.toFixed(0)}
                          </div>
                          <div className="text-purple-400 text-sm">
                            {match.match_score?.toFixed(0)}% match
                          </div>
                        </div>
                      </div>
                      {match.reasons?.length > 0 && (
                        <div className="bg-black/30 rounded p-3 mb-3">
                          <div className="text-cyan-300 text-sm mb-2">Why recommended:</div>
                          {match.reasons.map((reason, j) => (
                            <div key={j} className="text-white/70 text-sm">• {reason}</div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge className="bg-cyan-500/20">
                          ETA: {match.estimated_completion_time}
                        </Badge>
                        <Badge className="bg-green-500">
                          {match.confidence?.toFixed(0)}% confidence
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pricing">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Dynamic Pricing Orchestration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/60 mb-4">
                  Run AI-powered pricing optimization across all marketplace agents based on performance, demand, and availability.
                </p>
                <Button
                  onClick={() => orchestratePricing.mutate()}
                  disabled={orchestratePricing.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  Orchestrate Pricing
                </Button>
              </CardContent>
            </Card>

            {orchestratePricing.data && (
              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
                <CardContent className="p-6">
                  <h3 className="text-green-300 font-bold mb-4">Orchestration Complete</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Updated</div>
                      <div className="text-green-400 text-2xl font-bold">
                        {orchestratePricing.data.updated_count}
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Avg Price</div>
                      <div className="text-cyan-400 font-bold">
                        ${orchestratePricing.data.market_summary?.avg_price?.toFixed(0)}
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Avg Availability</div>
                      <div className="text-purple-400 font-bold">
                        {orchestratePricing.data.market_summary?.avg_availability?.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="browse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profiles?.map((profile) => (
                <Card key={profile.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-purple-500">
                        Agent {profile.agent_id?.slice(-6)}
                      </Badge>
                      <div className="text-green-400 font-bold text-lg">
                        ${profile.pricing_model?.current_price?.toFixed(0)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Success Rate</div>
                        <div className="text-green-400 font-bold">
                          {profile.performance_history?.success_rate || 0}%
                        </div>
                      </div>
                      <div className="bg-black/30 rounded p-2">
                        <div className="text-white/60 text-xs">Available</div>
                        <div className="text-cyan-400 font-bold">
                          {profile.availability_score || 0}%
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded p-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                            style={{ width: `${profile.recommendation_score || 0}%` }}
                          />
                        </div>
                        <span className="text-purple-400 text-xs font-bold">
                          {profile.recommendation_score?.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="constellation">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Agent Constellation Visualizer</CardTitle>
              </CardHeader>
              <CardContent>
                <AgentConstellationVisualizer3D agents={profiles} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dynamics">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Market Dynamics 3D</CardTitle>
              </CardHeader>
              <CardContent>
                <MarketplaceDynamics3D profiles={profiles} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}