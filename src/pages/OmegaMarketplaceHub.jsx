import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Star, Shield, Plus, TrendingUp } from 'lucide-react';
import OmegaMarketplace3D from '../components/marketplace/OmegaMarketplace3D';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function OmegaMarketplaceHub() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    listing_type: 'agent',
    name: '',
    description: '',
    price_omni: 100
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: () => base44.entities.OmegaMarketplaceListing.list('-created_date', 50),
    initialData: []
  });

  const createListingMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('omegaMarketplaceEngine', {
        action: 'create_listing',
        listing_type: formData.listing_type,
        item_details: {
          name: formData.name,
          description: formData.description,
          capabilities: []
        },
        pricing: {
          price_omni: parseFloat(formData.price_omni)
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      setShowCreateForm(false);
      setFormData({ listing_type: 'agent', name: '', description: '', price_omni: 100 });
      toast.success('Listing created successfully!');
    }
  });

  const purchaseListingMutation = useMutation({
    mutationFn: async (listingId) => {
      const response = await base44.functions.invoke('omegaMarketplaceEngine', {
        action: 'purchase_listing',
        listing_id: listingId
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      toast.success('Purchase successful!');
    }
  });

  const activeListings = listings.filter(l => l.listing_status === 'active');
  const verifiedListings = listings.filter(l => l.verification_status?.verified);
  const totalRevenue = listings.reduce((sum, l) => sum + (l.marketplace_metrics?.revenue_generated || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-4">
            <ShoppingCart className="w-12 h-12 text-indigo-400 animate-pulse" />
            Omega Marketplace
          </h1>
          <p className="text-white/60 text-lg">
            Decentralized marketplace for AI agents, skills, augmentations, and consciousness modules
          </p>
        </motion.div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border-indigo-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-white">{activeListings.length}</div>
              <div className="text-white/60 text-sm">Active Listings</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{verifiedListings.length}</div>
              <div className="text-white/60 text-sm">Verified</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {listings.length > 0 
                  ? (listings.reduce((sum, l) => sum + (l.marketplace_metrics?.average_rating || 0), 0) / listings.length).toFixed(1)
                  : '0.0'}
              </div>
              <div className="text-white/60 text-sm">Avg Rating</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">{totalRevenue.toFixed(0)}</div>
              <div className="text-white/60 text-sm">OMNI Revenue</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 mb-6">
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </div>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <Card className="bg-black/40 border-indigo-500/50">
              <CardHeader>
                <CardTitle className="text-white">Create New Listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">Listing Type</label>
                  <Select value={formData.listing_type} onValueChange={(v) => setFormData({...formData, listing_type: v})}>
                    <SelectTrigger className="bg-black/60 border-indigo-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">AI Agent</SelectItem>
                      <SelectItem value="skill">Skill Module</SelectItem>
                      <SelectItem value="augmentation">Augmentation</SelectItem>
                      <SelectItem value="blueprint">Blueprint</SelectItem>
                      <SelectItem value="knowledge_pack">Knowledge Pack</SelectItem>
                      <SelectItem value="consciousness_module">Consciousness Module</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white/80 text-sm mb-2 block">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter item name"
                    className="bg-black/60 border-indigo-500/30 text-white"
                  />
                </div>

                <div>
                  <label className="text-white/80 text-sm mb-2 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your item"
                    className="bg-black/60 border-indigo-500/30 text-white"
                  />
                </div>

                <div>
                  <label className="text-white/80 text-sm mb-2 block">Price (OMNI)</label>
                  <Input
                    type="number"
                    value={formData.price_omni}
                    onChange={(e) => setFormData({...formData, price_omni: e.target.value})}
                    className="bg-black/60 border-indigo-500/30 text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => createListingMutation.mutate()}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Listing
                  </Button>
                  <Button 
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    className="border-indigo-500/50 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <OmegaMarketplace3D listings={activeListings} />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeListings.slice(0, 6).map((listing, idx) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-black/40 border-indigo-500/30 hover:border-indigo-500/60 transition-all">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>{listing.item_details?.name}</span>
                    {listing.verification_status?.verified && (
                      <Shield className="w-5 h-5 text-green-400" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="mb-3 bg-indigo-500/30 text-indigo-300">
                    {listing.listing_type}
                  </Badge>
                  <p className="text-white/70 text-sm mb-4">{listing.item_details?.description?.slice(0, 100)}...</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">{listing.pricing?.price_omni} OMNI</div>
                      <div className="text-white/60 text-xs">≈ ${listing.pricing?.price_usd?.toFixed(2)}</div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => purchaseListingMutation.mutate(listing.listing_id)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Purchase
                    </Button>
                  </div>
                  {listing.marketplace_metrics?.average_rating > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
                      <Star className="w-4 h-4" />
                      {listing.marketplace_metrics.average_rating.toFixed(1)} ({listing.marketplace_metrics.review_count} reviews)
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}