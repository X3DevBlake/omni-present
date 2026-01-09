import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, TrendingUp, Search } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import Agent3DViewer from '../components/agents/Agent3DViewer';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function AgentMarketplace() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    const mockListings = [
      {
        id: '1',
        title: 'Elite Financial Advisor',
        description: 'AI agent specialized in portfolio optimization and market analysis',
        price: 50,
        category: 'financial',
        rating: 4.8,
        sales_count: 234,
        featured: true,
        agent: {
          name: 'FinBot Pro',
          personality: { curiosity: 90, risk_aversion: 60, frugality: 70, ambition: 85 },
          skills: ['portfolio_management', 'risk_analysis', 'market_forecasting'],
          omni_budget: 0,
          omni_spent: 0,
          status: 'idle'
        }
      },
      {
        id: '2',
        title: 'Smart Shopping Assistant',
        description: 'Negotiates prices and finds the best deals automatically',
        price: 25,
        category: 'shopping',
        rating: 4.9,
        sales_count: 456,
        featured: true,
        agent: {
          name: 'DealHunter',
          personality: { curiosity: 70, risk_aversion: 40, frugality: 95, ambition: 60 },
          skills: ['price_comparison', 'negotiation', 'coupon_finding'],
          omni_budget: 0,
          omni_spent: 0,
          status: 'idle'
        }
      },
      {
        id: '3',
        title: 'Research Specialist',
        description: 'Deep research capabilities with comprehensive data analysis',
        price: 40,
        category: 'research',
        rating: 4.7,
        sales_count: 189,
        featured: false,
        agent: {
          name: 'ResearchBot',
          personality: { curiosity: 95, risk_aversion: 30, frugality: 50, ambition: 90 },
          skills: ['data_analysis', 'research', 'summarization'],
          omni_budget: 0,
          omni_spent: 0,
          status: 'idle'
        }
      }
    ];
    setListings(mockListings);
  };

  const handlePurchase = async (listing) => {
    const user = await base44.auth.me();
    if (listing.price > (user?.omni_balance || 0)) {
      toast.error('Insufficient Omni balance');
      return;
    }

    await base44.auth.updateMe({
      omni_balance: (user.omni_balance || 0) - listing.price
    });

    toast.success(`Purchased ${listing.title} for ${listing.price} OMNI!`);
    setSelectedListing(null);
  };

  const categories = [
    { id: 'all', label: 'All', icon: '🌐' },
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'shopping', label: 'Shopping', icon: '🛒' },
    { id: 'research', label: 'Research', icon: '📚' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'productivity', label: 'Productivity', icon: '⚡' },
  ];

  const filteredListings = listings.filter(l => {
    const matchesCategory = categoryFilter === 'all' || l.category === categoryFilter;
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         l.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AuroraBackground className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Agent <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Marketplace</span>
          </h1>
          <p className="text-white/60 text-lg">Buy and sell custom AI agents</p>
        </motion.div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents..."
              className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-cyan-500 outline-none"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedListing(listing)}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all cursor-pointer"
            >
              {listing.featured && (
                <div className="mb-3">
                  <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-full text-xs font-bold">
                    ⭐ FEATURED
                  </span>
                </div>
              )}

              <h3 className="text-white font-bold text-xl mb-2">{listing.title}</h3>
              <p className="text-white/60 text-sm mb-4 line-clamp-2">{listing.description}</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-sm font-bold">{listing.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-white/60 text-sm">
                  <ShoppingBag className="w-4 h-4" />
                  {listing.sales_count} sales
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-green-400 text-2xl font-bold">{listing.price} OMNI</div>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90">
                  View
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Agent3DViewer agent={selectedListing.agent} showBudget={false} />

                <div>
                  <h2 className="text-white font-bold text-3xl mb-4">{selectedListing.title}</h2>
                  <p className="text-white/70 mb-6">{selectedListing.description}</p>

                  <div className="bg-white/5 rounded-xl p-4 mb-6">
                    <h4 className="text-cyan-400 font-semibold mb-3">Agent Capabilities</h4>
                    <div className="space-y-2">
                      {selectedListing.agent.skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2 text-white/80">
                          <div className="w-2 h-2 rounded-full bg-purple-400" />
                          {skill.replace(/_/g, ' ').toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold">{selectedListing.rating}</span>
                    </div>
                    <div className="text-white/60">{selectedListing.sales_count} sales</div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                    <div className="text-white/60 text-sm mb-1">Price</div>
                    <div className="text-green-400 text-4xl font-bold">{selectedListing.price} OMNI</div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedListing(null)}
                      className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handlePurchase(selectedListing)}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90"
                    >
                      Purchase Agent
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AuroraBackground>
  );
}