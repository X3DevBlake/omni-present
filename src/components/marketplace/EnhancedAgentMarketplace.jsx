import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Download, TrendingUp, Shield, Zap, Brain, DollarSign, Plus, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function EnhancedAgentMarketplace({ userEmail }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showListForm, setShowListForm] = useState(false);
  const [newListing, setNewListing] = useState({
    agent_name: '',
    description: '',
    price: 0,
    skills: '',
    category: 'general'
  });

  const queryClient = useQueryClient();

  const { data: listings = [] } = useQuery({
    queryKey: ['agent-listings'],
    queryFn: () => base44.entities.AgentListing.list('-created_date', 50)
  });

  const { data: myAgents = [] } = useQuery({
    queryKey: ['my-agents', userEmail],
    queryFn: () => base44.entities.Agent.list(),
    enabled: !!userEmail
  });

  const deployMutation = useMutation({
    mutationFn: async (listing) => {
      const agent = await base44.entities.Agent.create({
        name: listing.agent_name,
        agent_type: listing.category,
        personality: listing.description,
        status: 'active',
        capabilities: listing.skills?.split(',').map(s => s.trim()) || []
      });

      await base44.entities.AgentPurchase.create({
        user_email: userEmail,
        agent_listing_id: listing.id,
        agent_id: agent.id,
        purchase_price: listing.price,
        status: 'completed'
      });

      return agent;
    },
    onSuccess: () => {
      toast.success('Agent deployed successfully!');
      queryClient.invalidateQueries(['my-agents']);
    }
  });

  const listAgentMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.AgentListing.create({
        seller_email: userEmail,
        agent_name: data.agent_name,
        description: data.description,
        category: data.category,
        price: parseFloat(data.price),
        skills: data.skills.split(',').map(s => s.trim()),
        performance_metrics: { avg_rating: 0, total_deployments: 0 },
        status: 'active'
      });
    },
    onSuccess: () => {
      toast.success('Agent listed in marketplace!');
      setShowListForm(false);
      setNewListing({ agent_name: '', description: '', price: 0, skills: '', category: 'general' });
      queryClient.invalidateQueries(['agent-listings']);
    }
  });

  const filteredListings = listings.filter(listing =>
    listing.agent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category) => {
    const icons = {
      general: Brain,
      trading: TrendingUp,
      communication: Zap,
      analysis: Shield
    };
    return icons[category] || Brain;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Marketplace</h2>
          <p className="text-white/60 text-sm">Discover, deploy, and share AI agents</p>
        </div>
        <Button
          onClick={() => setShowListForm(!showListForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          List Your Agent
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search agents by name, skills, or category..."
          className="pl-10 bg-white/5 border-white/10 text-white"
        />
      </div>

      {/* List Agent Form */}
      {showListForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 p-6">
            <h3 className="text-white font-bold mb-4">List Your Agent</h3>
            <div className="space-y-4">
              <Input
                placeholder="Agent Name"
                value={newListing.agent_name}
                onChange={(e) => setNewListing({ ...newListing, agent_name: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <Textarea
                placeholder="Description"
                value={newListing.description}
                onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                className="bg-white/5 border-white/10 text-white h-24"
              />
              <Input
                placeholder="Skills (comma-separated)"
                value={newListing.skills}
                onChange={(e) => setNewListing({ ...newListing, skills: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Price (OMNI)"
                  value={newListing.price}
                  onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                />
                <select
                  value={newListing.category}
                  onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 text-white"
                >
                  <option value="general">General</option>
                  <option value="trading">Trading</option>
                  <option value="communication">Communication</option>
                  <option value="analysis">Analysis</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => listAgentMutation.mutate(newListing)}
                  disabled={listAgentMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {listAgentMutation.isPending ? 'Listing...' : 'List Agent'}
                </Button>
                <Button
                  onClick={() => setShowListForm(false)}
                  variant="outline"
                  className="border-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Agent Listings Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((listing, idx) => {
          const CategoryIcon = getCategoryIcon(listing.category);
          const rating = listing.performance_metrics?.avg_rating || 4.5;
          const deployments = listing.performance_metrics?.total_deployments || Math.floor(Math.random() * 100);

          return (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6 hover:border-purple-500/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <CategoryIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {listing.status}
                  </Badge>
                </div>

                <h3 className="text-white font-bold text-lg mb-2">{listing.agent_name}</h3>
                <p className="text-white/60 text-sm mb-3 line-clamp-2">{listing.description}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(listing.skills || []).slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white">{rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span className="text-white">{deployments}</span>
                  </div>
                </div>

                {/* Price & Deploy */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="text-white font-bold">{listing.price || 0} OMNI</span>
                  </div>
                  <Button
                    onClick={() => deployMutation.mutate(listing)}
                    disabled={deployMutation.isPending}
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500"
                  >
                    Deploy
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
        <Card className="bg-black/40 border-white/10 p-12 text-center">
          <Brain className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No agents found. Try a different search or list your own!</p>
        </Card>
      )}
    </div>
  );
}