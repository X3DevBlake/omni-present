import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingCart, Star, TrendingUp, Coins, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import AgentMarketplace3D from '../components/marketplace/AgentMarketplace3D';
import { Badge } from '@/components/ui/badge';

export default function AgentMarketplaceHub() {
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: listings } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: () => base44.entities.AgentMarketplaceListing.filter({ is_active: true }),
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const purchaseListing = useMutation({
    mutationFn: async ({ buyerAgentId, listingId }) => {
      const response = await base44.functions.invoke('marketplacePurchase', {
        buyer_agent_id: buyerAgentId,
        listing_id: listingId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      setSelectedListing(null);
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
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Agent Marketplace
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Decentralized exchange for agent skills, knowledge, and resources
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-white text-2xl font-bold">{listings?.length || 0}</p>
                <p className="text-white/60 text-sm">Active Listings</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30 p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <div>
                <p className="text-white text-2xl font-bold">
                  {listings?.reduce((sum, l) => sum + (l.total_sales || 0), 0) || 0}
                </p>
                <p className="text-white/60 text-sm">Total Sales</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 p-4">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-purple-400" />
              <div>
                <p className="text-white text-2xl font-bold">
                  {(listings?.reduce((sum, l) => sum + (l.quality_rating || 0), 0) / (listings?.length || 1)).toFixed(1)}
                </p>
                <p className="text-white/60 text-sm">Avg Rating</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-4">
            <div className="flex items-center gap-3">
              <Coins className="w-6 h-6 text-orange-400" />
              <div>
                <p className="text-white text-2xl font-bold">
                  {listings?.reduce((sum, l) => sum + (l.price || 0), 0).toFixed(0) || 0}
                </p>
                <p className="text-white/60 text-sm">Total Value</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">3D Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentMarketplace3D onListingSelect={setSelectedListing} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            {selectedListing ? (
              <Card className="bg-gradient-to-br from-green-500/20 to-cyan-500/20 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Listing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge className="mb-2">{selectedListing.listing_type}</Badge>
                    <h3 className="text-white font-bold text-xl">{selectedListing.title}</h3>
                  </div>

                  <p className="text-white/70 text-sm">{selectedListing.description}</p>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (selectedListing.quality_rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-white/60 text-sm ml-2">
                      ({selectedListing.total_sales || 0} sales)
                    </span>
                  </div>

                  <div className="bg-black/30 rounded p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Price</span>
                      <span className="text-green-400 font-bold text-xl">
                        {selectedListing.price} tokens
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm">Purchase with Agent:</label>
                    <select
                      value={selectedAgent?.id || ''}
                      onChange={(e) => {
                        const agent = agents?.find(a => a.id === e.target.value);
                        setSelectedAgent(agent);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded p-2 text-white"
                    >
                      <option value="">Select Agent...</option>
                      {agents?.map(agent => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={() => {
                      if (selectedAgent) {
                        purchaseListing.mutate({
                          buyerAgentId: selectedAgent.id,
                          listingId: selectedListing.id,
                        });
                      }
                    }}
                    disabled={!selectedAgent || purchaseListing.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    {purchaseListing.isPending ? 'Processing...' : 'Purchase'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-black/40 border-white/10">
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">Select a listing to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}