import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Store, Star, Download, DollarSign, Package, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AgentMarketplace() {
  const [userEmail, setUserEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me()
      .then(user => setUserEmail(user?.email))
      .catch(() => setUserEmail(null));
  }, []);

  const { data: listings = [] } = useQuery({
    queryKey: ['agentListings'],
    queryFn: () => base44.entities.AgentListing.list(),
    initialData: []
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['agentPurchases', userEmail],
    queryFn: () => userEmail ? base44.entities.AgentPurchase.filter({ buyer_email: userEmail }) : [],
    enabled: !!userEmail,
    initialData: []
  });

  const deployAgent = useMutation({
    mutationFn: async (listingId) => {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) throw new Error('Listing not found');

      // Create agent purchase
      await base44.entities.AgentPurchase.create({
        buyer_email: userEmail,
        listing_id: listingId,
        agent_blueprint: listing.agent_blueprint,
        price_paid: listing.price || 0,
        status: 'active'
      });

      return listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentPurchases'] });
    }
  });

  const filteredListings = listings.filter(listing =>
    listing.agent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuroraBackground className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Store className="w-10 h-10 text-purple-400" />
            Agent Marketplace
          </h1>
          <p className="text-white/60">Discover, deploy, and share specialized AI agents</p>
        </motion.div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              placeholder="Search agents by name or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border-white/10 pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="browse">Browse Agents</TabsTrigger>
            <TabsTrigger value="my-agents">My Agents</TabsTrigger>
            <TabsTrigger value="list">List Agent</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing, idx) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-bold text-lg">{listing.agent_name}</h3>
                        <p className="text-white/60 text-xs">v{listing.version || '1.0.0'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-sm">{listing.rating?.toFixed(1) || '5.0'}</span>
                      </div>
                    </div>

                    <p className="text-white/80 text-sm mb-4 flex-1">{listing.description}</p>

                    {listing.skills && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {listing.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-white/60" />
                        <span className="text-white/60 text-sm">{listing.downloads || 0}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {listing.price > 0 ? (
                          <span className="text-green-400 font-bold">${listing.price}</span>
                        ) : (
                          <span className="text-cyan-400 font-bold">Free</span>
                        )}
                        <Button
                          onClick={() => deployAgent.mutate(listing.id)}
                          disabled={deployAgent.isPending}
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-pink-500"
                        >
                          Deploy
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-agents">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.length === 0 && (
                <div className="col-span-full text-center py-12 text-white/40">
                  You haven't deployed any agents yet
                </div>
              )}
              {purchases.map((purchase) => {
                const listing = listings.find(l => l.id === purchase.listing_id);
                return (
                  <Card key={purchase.id} className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold">{listing?.agent_name || 'Agent'}</h3>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        {purchase.status}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mb-2">
                      Deployed: {new Date(purchase.created_date).toLocaleDateString()}
                    </p>
                    {purchase.price_paid > 0 && (
                      <p className="text-white/60 text-sm">Paid: ${purchase.price_paid}</p>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <ListAgentForm userEmail={userEmail} />
          </TabsContent>
        </Tabs>
      </div>
    </AuroraBackground>
  );
}

function ListAgentForm({ userEmail }) {
  const [formData, setFormData] = useState({
    agent_name: '',
    description: '',
    skills: '',
    price: 0,
    version: '1.0.0'
  });
  const queryClient = useQueryClient();

  const createListing = useMutation({
    mutationFn: async () => {
      return await base44.entities.AgentListing.create({
        seller_email: userEmail,
        agent_name: formData.agent_name,
        description: formData.description,
        skills: formData.skills.split(',').map(s => s.trim()),
        price: parseFloat(formData.price) || 0,
        version: formData.version,
        agent_blueprint: { type: 'custom', config: {} },
        status: 'active',
        downloads: 0,
        rating: 5.0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentListings'] });
      setFormData({ agent_name: '', description: '', skills: '', price: 0, version: '1.0.0' });
    }
  });

  return (
    <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6 max-w-2xl mx-auto">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-purple-400" />
        List Your Agent
      </h3>
      <div className="space-y-4">
        <Input
          placeholder="Agent Name"
          value={formData.agent_name}
          onChange={(e) => setFormData({...formData, agent_name: e.target.value})}
          className="bg-white/5 border-white/10"
        />
        <Textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="bg-white/5 border-white/10 min-h-[100px]"
        />
        <Input
          placeholder="Skills (comma-separated)"
          value={formData.skills}
          onChange={(e) => setFormData({...formData, skills: e.target.value})}
          className="bg-white/5 border-white/10"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Version"
            value={formData.version}
            onChange={(e) => setFormData({...formData, version: e.target.value})}
            className="bg-white/5 border-white/10"
          />
          <Input
            type="number"
            placeholder="Price (0 for free)"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className="bg-white/5 border-white/10"
          />
        </div>
        <Button
          onClick={() => createListing.mutate()}
          disabled={!formData.agent_name || createListing.isPending}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          List Agent
        </Button>
      </div>
    </Card>
  );
}