import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AuroraBackground from '@/components/omni/AuroraBackground';
import Enhanced3DAgentConstellation from '@/components/marketplace/Enhanced3DAgentConstellation';
import AgentSkillTree3D from '@/components/marketplace/AgentSkillTree3D';
import AgentReviewSystem from '@/components/marketplace/AgentReviewSystem';
import AdvancedAgentFilters from '@/components/marketplace/AdvancedAgentFilters';
import { Sparkles, TrendingUp, Award, DollarSign, Star, Users } from 'lucide-react';

export default function EnhancedAIAgentMarketplace() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [filters, setFilters] = useState({});
  const queryClient = useQueryClient();

  // Fetch agent profiles
  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['agent-profiles'],
    queryFn: () => base44.entities.AgentProfile.list()
  });

  // Fetch agent skills
  const { data: allSkills = [] } = useQuery({
    queryKey: ['agent-skills'],
    queryFn: () => base44.entities.AgentSkill.list()
  });

  // Fetch marketplace profiles
  const { data: marketplaceData = [] } = useQuery({
    queryKey: ['marketplace-profiles'],
    queryFn: () => base44.entities.AgentMarketplaceProfile.list()
  });

  // Agent matching mutation
  const matchAgentsMutation = useMutation({
    mutationFn: async (requirements) => {
      const response = await base44.functions.invoke('enhancedAgentMatching', {
        taskRequirements: requirements
      });
      return response.data;
    }
  });

  // Dynamic pricing mutation
  const calculatePricingMutation = useMutation({
    mutationFn: async ({ agent_id, task_complexity }) => {
      const response = await base44.functions.invoke('dynamicPricingEngine', {
        agent_id,
        task_complexity
      });
      return response.data;
    }
  });

  // Apply filters
  const filteredProfiles = profiles.filter(profile => {
    if (filters.searchQuery && !profile.display_name.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.minRating > 0 && (profile.performance_summary?.avg_rating || 0) < filters.minRating) {
      return false;
    }
    if (filters.availability !== 'all') {
      if (filters.availability === 'available' && !profile.is_available) return false;
      if (filters.availability === 'busy' && profile.is_available) return false;
    }
    return true;
  });

  const selectedAgentSkills = selectedAgent 
    ? allSkills.filter(s => s.agent_id === selectedAgent.agent_id)
    : [];

  const stats = {
    totalAgents: profiles.length,
    avgRating: profiles.reduce((sum, p) => sum + (p.performance_summary?.avg_rating || 0), 0) / profiles.length || 0,
    availableAgents: profiles.filter(p => p.is_available).length,
    totalTasks: profiles.reduce((sum, p) => sum + (p.performance_summary?.total_tasks || 0), 0)
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto p-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
            <Sparkles className="w-12 h-12 text-cyan-400" />
            Enhanced AI Agent Marketplace
          </h1>
          <p className="text-xl text-gray-300">
            Discover, match, and deploy AI agents with advanced 3D visualization
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Agents</p>
                  <p className="text-3xl font-bold text-white">{stats.totalAgents}</p>
                </div>
                <Users className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Available Now</p>
                  <p className="text-3xl font-bold text-white">{stats.availableAgents}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Rating</p>
                  <p className="text-3xl font-bold text-white">{stats.avgRating.toFixed(1)} ⭐</p>
                </div>
                <Award className="w-10 h-10 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Tasks Completed</p>
                  <p className="text-3xl font-bold text-white">{stats.totalTasks.toLocaleString()}</p>
                </div>
                <Star className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <AdvancedAgentFilters onFilterChange={setFilters} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="constellation" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-slate-900/50">
                <TabsTrigger value="constellation">3D Constellation</TabsTrigger>
                <TabsTrigger value="skills">Skill Tree</TabsTrigger>
                <TabsTrigger value="list">Agent List</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="constellation">
                <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
                  <CardContent className="p-0 h-full">
                    <Enhanced3DAgentConstellation
                      agents={filteredProfiles}
                      onAgentClick={setSelectedAgent}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                {selectedAgent ? (
                  <Card className="bg-slate-900/50 border-slate-700 h-[600px]">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {selectedAgent.display_name} - Skill Tree
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[500px]">
                      <AgentSkillTree3D skills={selectedAgentSkills} />
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-slate-900/50 border-slate-700">
                    <CardContent className="pt-6 text-center text-gray-400">
                      Select an agent from the constellation to view their skill tree
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="list">
                <div className="space-y-4">
                  {filteredProfiles.map((profile) => (
                    <Card key={profile.id} className="bg-slate-900/50 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">{profile.display_name}</h3>
                              {profile.is_available && (
                                <Badge className="bg-green-600">Available</Badge>
                              )}
                              {profile.performance_summary?.avg_rating && (
                                <Badge className="bg-yellow-600">
                                  ⭐ {profile.performance_summary.avg_rating.toFixed(1)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400 mb-3">{profile.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {profile.specializations?.map((spec, idx) => (
                                <Badge key={idx} variant="outline" className="text-cyan-400 border-cyan-400">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            onClick={() => setSelectedAgent(profile)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                {selectedAgent ? (
                  <AgentReviewSystem agentId={selectedAgent.agent_id} />
                ) : (
                  <Card className="bg-slate-900/50 border-slate-700">
                    <CardContent className="pt-6 text-center text-gray-400">
                      Select an agent to view and submit reviews
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}