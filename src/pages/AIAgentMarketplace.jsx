import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Store, TrendingUp, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MarketplaceDynamics3D from '../components/marketplace/MarketplaceDynamics3D';
import AdvancedSpecializationFilters from '../components/marketplace/AdvancedSpecializationFilters';

export default function AIAgentMarketplace() {
  const queryClient = useQueryClient();
  const [taskDesc, setTaskDesc] = useState('Advanced data analysis');
  const [filters, setFilters] = useState({});

  const { data: profiles } = useQuery({
    queryKey: ['marketplace-profiles'],
    queryFn: () => base44.entities.AgentMarketplaceProfile.list('', 50),
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list('', 20),
  });

  const calculatePricing = useMutation({
    mutationFn: async (agentId) => {
      const response = await base44.functions.invoke('calculateAgentPricing', {
        agent_id: agentId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-profiles'] });
    },
  });

  const getRecommendations = useMutation({
    mutationFn: async (requirements) => {
      const response = await base44.functions.invoke('recommendAgents', requirements);
      return response.data;
    },
  });

  const avgPrice = React.useMemo(() => {
    if (!profiles || profiles.length === 0) return 0;
    return profiles.reduce((sum, p) => sum + (p.pricing_model?.current_price || 0), 0) / profiles.length;
  }, [profiles]);

  const filteredProfiles = React.useMemo(() => {
    if (!profiles) return [];
    return profiles.filter(profile => {
      if (filters.skills?.length > 0) {
        const hasSkills = filters.skills.some(skill => 
          profile.specializations?.some(spec => spec.toLowerCase().includes(skill.toLowerCase()))
        );
        if (!hasSkills) return false;
      }
      if (filters.minProficiency > 0) {
        const avgProf = profile.skills_profile?.reduce((sum, s) => sum + s.level, 0) / (profile.skills_profile?.length || 1);
        if (avgProf < filters.minProficiency) return false;
      }
      if (filters.minReputation > 0 && (profile.collaboration_score || 0) < filters.minReputation) return false;
      if (filters.maxPrice < 1000 && (profile.pricing_model?.current_price || 0) > filters.maxPrice) return false;
      if (filters.availability > 0 && (profile.availability_score || 0) < filters.availability) return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = profile.specializations?.some(s => s.toLowerCase().includes(searchLower)) ||
          profile.agent_id?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [profiles, filters]);

  return (
    <AuroraBackground className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              AI Agent Marketplace
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Intelligent profiling, dynamic pricing, and AI-powered recommendations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <Store className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-2xl font-bold">{profiles?.length || 0}</p>
            <p className="text-white/60 text-sm">Listed Agents</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <DollarSign className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-2xl font-bold">{avgPrice.toFixed(0)}</p>
            <p className="text-white/60 text-sm">Avg Price</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <TrendingUp className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {profiles?.filter(p => (p.pricing_model?.demand_multiplier || 1) > 1.2).length || 0}
            </p>
            <p className="text-white/60 text-sm">High Demand</p>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <Users className="w-6 h-6 text-cyan-400 mb-2" />
            <p className="text-white text-2xl font-bold">
              {profiles?.filter(p => (p.availability_score || 0) > 70).length || 0}
            </p>
            <p className="text-white/60 text-sm">Available</p>
          </Card>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/30 p-1">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="recommend">AI Recommendations</TabsTrigger>
            <TabsTrigger value="pricing">Dynamic Pricing</TabsTrigger>
            <TabsTrigger value="3d">Market Dynamics</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <AdvancedSpecializationFilters 
                  onFilterChange={setFilters}
                  availableSkills={[]}
                />
              </div>
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProfiles?.map((profile) => (
                <Card key={profile.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
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

                    {profile.specializations?.length > 0 && (
                      <div className="mb-3">
                        <div className="text-white/60 text-xs mb-1">Specializations</div>
                        <div className="flex flex-wrap gap-1">
                          {profile.specializations.slice(0, 3).map((spec, i) => (
                            <Badge key={i} className="text-xs bg-cyan-500/20">{spec}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-purple-500/20 border border-purple-500/30 rounded p-2">
                      <div className="text-purple-300 text-xs">Recommendation Score</div>
                      <div className="flex items-center gap-2 mt-1">
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
            </div>
            {filteredProfiles?.length === 0 && (
              <div className="lg:col-span-3 text-center py-12">
                <p className="text-white/60">No agents match your filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommend">
            <Card className="bg-black/40 border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Get AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">Task Description</label>
                  <Input
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Describe your task requirements"
                  />
                </div>

                <Button
                  onClick={() => getRecommendations.mutate({
                    task_requirements: { description: taskDesc, priority: 'high' },
                    requesting_agent_id: 'user-agent-001'
                  })}
                  disabled={getRecommendations.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Get Recommendations
                </Button>

                {getRecommendations.data?.recommendations && (
                  <div className="space-y-3 mt-6">
                    {getRecommendations.data.recommendations.map((rec, i) => (
                      <Card key={i} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <Badge className="bg-purple-500 mb-2">#{i + 1} Match</Badge>
                              <div className="text-white font-bold">Agent {rec.agent_id?.slice(-6)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-400 font-bold text-lg">
                                ${rec.estimated_cost?.toFixed(0)}
                              </div>
                              <div className="text-purple-400 text-sm">
                                {rec.match_score?.toFixed(0)}% match
                              </div>
                            </div>
                          </div>

                          {rec.reasons?.length > 0 && (
                            <div className="bg-black/30 rounded p-2">
                              <div className="text-cyan-300 text-xs mb-1">Why recommended:</div>
                              {rec.reasons.slice(0, 2).map((reason, j) => (
                                <div key={j} className="text-white/70 text-xs">• {reason}</div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {agents?.slice(0, 9).map((agent) => (
                <Card key={agent.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <h3 className="text-white font-bold mb-2">{agent.name}</h3>
                    <Button
                      onClick={() => calculatePricing.mutate(agent.id)}
                      disabled={calculatePricing.isPending}
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Calculate Pricing
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {calculatePricing.data && (
              <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
                <CardContent className="p-6">
                  <h3 className="text-green-300 font-bold mb-4">Dynamic Pricing Result</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Current Price</div>
                      <div className="text-green-400 text-2xl font-bold">
                        ${calculatePricing.data.current_price?.toFixed(0)}
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Base Rate</div>
                      <div className="text-cyan-400 font-bold">
                        ${calculatePricing.data.base_rate?.toFixed(0)}
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Demand</div>
                      <div className="text-orange-400 font-bold">
                        {calculatePricing.data.demand_multiplier?.toFixed(2)}x
                      </div>
                    </div>
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-white/60 text-sm">Available</div>
                      <div className="text-purple-400 font-bold">
                        {calculatePricing.data.availability?.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="3d">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Market Dynamics Visualization</CardTitle>
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