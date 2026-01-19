import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Gavel, Award, Star, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraBackground from '../components/omni/AuroraBackground';
import MarketplaceActivity3D from '../components/marketplace/MarketplaceActivity3D';
import { Badge } from '@/components/ui/badge';

export default function EnhancedMarketplace() {
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: listings } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: () => base44.entities.AgentMarketplaceListing.filter({ is_active: true }),
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list(),
  });

  const { data: bids } = useQuery({
    queryKey: ['marketplace-bids', selectedListing?.id],
    queryFn: () => base44.entities.MarketplaceBid.filter({ 
      listing_id: selectedListing?.id,
      bid_status: 'active' 
    }),
    enabled: !!selectedListing,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['marketplace-recommendations', selectedAgent?.id],
    queryFn: async () => {
      const response = await base44.functions.invoke('recommendMarketplaceListings', {
        agent_id: selectedAgent?.id,
      });
      return response.data;
    },
    enabled: !!selectedAgent,
  });

  const placeBid = useMutation({
    mutationFn: async (params) => {
      const response = await base44.functions.invoke('processMarketplaceBid', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-bids'] });
      setBidAmount('');
    },
  });

  const currentHighestBid = bids?.reduce((max, bid) => 
    Math.max(max, bid.bid_amount), selectedListing?.price || 0
  );

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
              Agent Marketplace Pro
            </span>
          </h1>
          <p className="text-white/60 text-lg">
            Bid on skills, trade knowledge, build reputation
          </p>
        </motion.div>

        <Card className="bg-black/40 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Marketplace Activity & Reputation</CardTitle>
          </CardHeader>
          <CardContent>
            <MarketplaceActivity3D />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {recommendations?.recommendations && (
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    AI Recommendations for {selectedAgent?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recommendations.recommendations.slice(0, 3).map((rec, i) => (
                      <div key={i} className="bg-black/30 rounded p-3 flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{rec.title}</p>
                          <p className="text-white/60 text-xs">{rec.reason}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">{rec.price} tokens</p>
                          <p className="text-cyan-400 text-xs">Score: {rec.score.toFixed(0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              {listings?.slice(0, 8).map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedListing(listing)}
                  className={`bg-white/5 rounded-lg p-4 border cursor-pointer transition-all ${
                    selectedListing?.id === listing.id 
                      ? 'border-cyan-500 bg-cyan-500/10' 
                      : 'border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Badge className="mb-2">{listing.listing_type}</Badge>
                  <h3 className="text-white font-bold mb-2">{listing.title}</h3>
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">{listing.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < (listing.quality_rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-green-400 font-bold">{listing.price} tokens</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-lg">Your Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedAgent?.id || ''} onValueChange={(id) => {
                  const agent = agents?.find(a => a.id === id);
                  setSelectedAgent(agent);
                }}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents?.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedListing && (
              <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Gavel className="w-5 h-5" />
                    Place Bid
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2">{selectedListing.title}</h3>
                    <Badge>{selectedListing.listing_type}</Badge>
                  </div>

                  <div className="bg-black/30 rounded p-3">
                    <div className="text-white/60 text-sm">Starting Price</div>
                    <div className="text-white font-bold text-xl">{selectedListing.price} tokens</div>
                  </div>

                  {currentHighestBid > selectedListing.price && (
                    <div className="bg-orange-500/20 border border-orange-500/30 rounded p-3">
                      <div className="text-orange-400 text-sm">Current Highest Bid</div>
                      <div className="text-white font-bold text-xl">{currentHighestBid} tokens</div>
                    </div>
                  )}

                  <div>
                    <label className="text-white text-sm mb-2 block">Your Bid Amount</label>
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Minimum: ${(currentHighestBid || selectedListing.price) + 1}`}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      if (selectedAgent && bidAmount) {
                        placeBid.mutate({
                          listing_id: selectedListing.id,
                          bidder_agent_id: selectedAgent.id,
                          bid_amount: parseFloat(bidAmount),
                        });
                      }
                    }}
                    disabled={!selectedAgent || !bidAmount || parseFloat(bidAmount) <= currentHighestBid}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    Place Bid
                  </Button>

                  {bids && bids.length > 0 && (
                    <div className="pt-3 border-t border-white/10">
                      <h4 className="text-white font-medium text-sm mb-2">Active Bids ({bids.length})</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {bids.map((bid, i) => (
                          <div key={bid.id} className="text-xs text-white/60 flex justify-between">
                            <span>{bid.bidder_agent_id.slice(0, 6)}</span>
                            <span className="text-green-400 font-bold">{bid.bid_amount} tokens</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
}