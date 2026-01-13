import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Download, Search, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AgentMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('downloads');
  const queryClient = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ['marketplace-listings', selectedCategory],
    queryFn: async () => {
      if (selectedCategory === 'all') {
        return await base44.entities.AgentMarketplaceListing.list('-downloads', 50);
      }
      return await base44.entities.AgentMarketplaceListing.filter(
        { category: selectedCategory },
        '-downloads',
        50
      );
    }
  });

  const { data: aiRecommendations } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      // Simulate AI recommendations based on user's existing agents
      const agents = await base44.entities.Agent.list();
      const skills = agents.flatMap(a => a.skills || []);
      
      // Simple recommendation: suggest agents with complementary skills
      return listings?.filter(l => 
        l.tags?.some(tag => !skills.includes(tag))
      ).slice(0, 3) || [];
    },
    enabled: !!listings
  });

  const deployAgent = useMutation({
    mutationFn: async (listing) => {
      // Fetch behavior tree config
      const config = await base44.entities.AgentBehaviorTree.list();
      const agentConfig = config.find(c => c.id === listing.agent_config_id);
      
      if (!agentConfig) {
        throw new Error('Agent configuration not found');
      }

      // Create new agent from config
      const newAgent = await base44.entities.Agent.create({
        name: listing.name,
        skills: agentConfig.personality_config?.traits ? Object.keys(agentConfig.personality_config.traits) : [],
        status: 'idle',
        omni_budget: 1000
      });

      // Clone behavior tree for new agent
      await base44.entities.AgentBehaviorTree.create({
        ...agentConfig,
        agent_id: newAgent.id,
        id: undefined
      });

      // Update download count
      await base44.entities.AgentMarketplaceListing.update(listing.id, {
        downloads: listing.downloads + 1
      });

      return newAgent;
    },
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      toast.success(`Agent "${agent.name}" deployed successfully!`);
    }
  });

  const filteredListings = listings?.filter(listing => {
    const matchesSearch = !searchQuery || 
      listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'downloads') return b.downloads - a.downloads;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
    return 0;
  });

  const categories = ['all', 'finance', 'research', 'automation', 'communication', 'analytics', 'security', 'productivity'];

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      {aiRecommendations?.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              AI Recommendations For You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiRecommendations.map((listing) => (
                <AgentCard key={listing.id} listing={listing} onDeploy={deployAgent} isRecommended />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="downloads">Most Downloaded</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Agents ({filteredListings?.length || 0})</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings?.map((listing, idx) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <AgentCard listing={listing} onDeploy={deployAgent} />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings?.filter(l => l.featured).map((listing) => (
              <AgentCard key={listing.id} listing={listing} onDeploy={deployAgent} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="verified" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings?.filter(l => l.is_verified).map((listing) => (
              <AgentCard key={listing.id} listing={listing} onDeploy={deployAgent} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AgentCard({ listing, onDeploy, isRecommended }) {
  return (
    <Card className={`h-full ${isRecommended ? 'border-purple-500/50' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {listing.name}
              {listing.is_verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
            </CardTitle>
            <Badge variant="secondary" className="mt-1">{listing.category}</Badge>
          </div>
          {isRecommended && (
            <Badge className="bg-purple-500">Recommended</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-3">{listing.description}</p>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{listing.rating.toFixed(1)}</span>
            <span className="text-gray-500">({listing.total_reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Download className="w-4 h-4" />
            <span>{listing.downloads}</span>
          </div>
        </div>

        {listing.tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {listing.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            {listing.price > 0 ? (
              <span className="font-bold text-purple-600">{listing.price} OMNI</span>
            ) : (
              <Badge className="bg-green-500">Free</Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onDeploy.mutate(listing)}
            disabled={onDeploy.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Deploy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}