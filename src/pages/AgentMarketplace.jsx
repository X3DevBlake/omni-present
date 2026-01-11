import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Store, Star, Download, DollarSign, Package, Search, Filter, Zap, Award, TrendingUp, Target, Brain, ThumbsUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AgentMarketplace() {
  const [userEmail, setUserEmail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);
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

  const { data: userAgents } = useQuery({
    queryKey: ['userAgents', userEmail],
    queryFn: () => base44.entities.Agent.filter({ created_by: userEmail }),
    enabled: !!userEmail,
  });

  // AI-powered recommendations
  const aiRecommendations = React.useMemo(() => {
    if (!userAgents?.length || !listings?.length) return [];
    const topCategory = userAgents[0]?.type || 'general';
    return listings
      .filter(l => l.category === topCategory)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }, [userAgents, listings]);

  const featuredListings = React.useMemo(() => {
    return listings
      .filter(l => l.featured || (l.rating || 0) >= 4.5)
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 4);
  }, [listings]);

  const trendingListings = React.useMemo(() => {
    return listings
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 6);
  }, [listings]);

  const filteredListings = React.useMemo(() => {
    let filtered = listings;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(l => l.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(l =>
        l.agent_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = filtered.filter(l => {
      const price = l.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (minRating > 0) {
      filtered = filtered.filter(l => (l.rating || 0) >= minRating);
    }

    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [listings, selectedCategory, searchQuery, priceRange, minRating, sortBy]);

  const deployAgent = useMutation({
    mutationFn: async (listingId) => {
      const listing = listings.find(l => l.id === listingId);
      if (!listing) throw new Error('Listing not found');

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
      toast.success('Agent deployed successfully!');
    },
    onError: () => {
      toast.error('Deployment failed');
    }
  });

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
          <p className="text-white/60">Discover, deploy, and share specialized AI agents with smart recommendations</p>
        </motion.div>

        {/* Advanced Filters */}
        <Card className="bg-black/40 border-white/10 p-6 mb-8">
          <div className="grid lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border-white/10 pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-white/20 text-white">
              <Filter className="w-5 h-5 mr-2" />
              More Filters
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={1000}
                step={10}
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">
                Min Rating: {minRating} stars
              </label>
              <Slider
                value={[minRating]}
                onValueChange={([v]) => setMinRating(v)}
                min={0}
                max={5}
                step={0.5}
              />
            </div>
          </div>
        </Card>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="browse">Browse All</TabsTrigger>
            <TabsTrigger value="recommended">
              <Zap className="w-4 h-4 mr-2" />
              For You
            </TabsTrigger>
            <TabsTrigger value="featured">
              <Award className="w-4 h-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="my-agents">My Agents</TabsTrigger>
            <TabsTrigger value="list">List Agent</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing, idx) => (
                <AgentCard key={listing.id} listing={listing} userEmail={userEmail} deployAgent={deployAgent} idx={idx} />
              ))}
            </div>
            {filteredListings.length === 0 && (
              <div className="text-center py-12 text-white/40">
                No agents match your filters
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommended">
            <Card className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/30 p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-6 h-6 text-cyan-400" />
                <h2 className="text-white font-bold text-xl">AI Recommendations for You</h2>
              </div>
              <p className="text-white/70">
                Based on your usage patterns and agent portfolio
              </p>
            </Card>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiRecommendations.map((listing, idx) => (
                <AgentCard key={listing.id} listing={listing} userEmail={userEmail} deployAgent={deployAgent} idx={idx} recommended />
              ))}
            </div>
            {aiRecommendations.length === 0 && (
              <div className="text-center py-12 text-white/40">
                Start using agents to get personalized recommendations!
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing, idx) => (
                <AgentCard key={listing.id} listing={listing} userEmail={userEmail} deployAgent={deployAgent} idx={idx} featured />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingListings.map((listing, idx) => (
                <AgentCard key={listing.id} listing={listing} userEmail={userEmail} deployAgent={deployAgent} idx={idx} trending />
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

function AgentCard({ listing, userEmail, deployAgent, idx, recommended, featured, trending }) {
  const [showReviews, setShowReviews] = useState(false);

  const mockReviews = [
    { user: 'Alex M.', rating: 5, comment: 'Excellent agent, very efficient!', date: '2 days ago' },
    { user: 'Sarah K.', rating: 4, comment: 'Good performance, worth the price', date: '1 week ago' },
    { user: 'John D.', rating: 5, comment: 'Best investment for my workflow', date: '2 weeks ago' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="relative"
    >
      <Card className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 p-6 h-full flex flex-col hover:bg-black/50 transition-all">
        {(recommended || featured || trending) && (
          <div className="absolute -top-3 -right-3">
            <Badge className={`${
              recommended ? 'bg-cyan-500/30 text-cyan-300 border-cyan-500' :
              featured ? 'bg-yellow-500/30 text-yellow-300 border-yellow-500' :
              'bg-orange-500/30 text-orange-300 border-orange-500'
            }`}>
              {recommended && <><Zap className="w-3 h-3 mr-1" />For You</>}
              {featured && <><Award className="w-3 h-3 mr-1" />Featured</>}
              {trending && <><TrendingUp className="w-3 h-3 mr-1" />Trending</>}
            </Badge>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">{listing.agent_name}</h3>
              <p className="text-white/60 text-sm mb-2 line-clamp-2">{listing.description}</p>
              {listing.category && (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">
                  {listing.category}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => setShowReviews(!showReviews)}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= (listing.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                  }`}
                />
              ))}
              <span className="text-white font-semibold ml-1">{(listing.rating || 5.0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-white/60 text-sm">
              <Download className="w-4 h-4" />
              {listing.downloads || 0}
            </div>
          </div>

          {listing.skills && (
            <div className="flex flex-wrap gap-2 mb-4">
              {listing.skills.slice(0, 3).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {recommended && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 mb-3">
              <p className="text-cyan-300 text-xs flex items-center gap-1">
                <Target className="w-3 h-3" />
                92% match with your usage patterns
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          {listing.price > 0 ? (
            <span className="text-green-400 font-bold">${listing.price}</span>
          ) : (
            <span className="text-cyan-400 font-bold">Free</span>
          )}
          <Button
            onClick={() => deployAgent.mutate(listing.id)}
            disabled={deployAgent.isPending || !userEmail}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            Deploy
          </Button>
        </div>

        {showReviews && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-white/10 space-y-2"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">Recent Reviews</h4>
              <ThumbsUp className="w-4 h-4 text-green-400" />
            </div>
            {mockReviews.slice(0, 2).map((review, i) => (
              <div key={i} className="bg-black/20 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 text-xs font-semibold">{review.user}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-white/60 text-xs">{review.comment}</p>
                <span className="text-white/40 text-xs">{review.date}</span>
              </div>
            ))}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

function ListAgentForm({ userEmail }) {
  const [formData, setFormData] = useState({
    agent_name: '',
    description: '',
    skills: '',
    price: 0,
    version: '1.0.0',
    category: 'productivity'
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
        category: formData.category,
        agent_blueprint: { type: 'custom', config: {} },
        status: 'active',
        downloads: 0,
        rating: 5.0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentListings'] });
      setFormData({ agent_name: '', description: '', skills: '', price: 0, version: '1.0.0', category: 'productivity' });
      toast.success('Agent listed successfully!');
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
        <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="shopping">Shopping</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="productivity">Productivity</SelectItem>
          </SelectContent>
        </Select>
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