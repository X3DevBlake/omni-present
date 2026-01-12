import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Brain, Award, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EnhancedAgentMarketplace() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [filters, setFilters] = useState({
    minScore: 0,
    maxPrice: 1000,
    sortBy: 'gemini_score'
  });
  const [trialAgent, setTrialAgent] = useState(null);

  useEffect(() => {
    loadMarketplace();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [listings, filters]);

  const loadMarketplace = async () => {
    const data = await base44.entities.AgentMarketplaceListing.list('-gemini_score', 50);
    setListings(data);
    
    const topRated = data.filter(l => l.gemini_score > 80);
    setRecommendations(topRated.slice(0, 3));
  };

  const applyFilters = () => {
    let filtered = listings.filter(l => 
      (l.gemini_score || 0) >= filters.minScore && 
      l.price <= filters.maxPrice
    );

    filtered.sort((a, b) => {
      if (filters.sortBy === 'price') return a.price - b.price;
      if (filters.sortBy === 'gemini_score') return (b.gemini_score || 0) - (a.gemini_score || 0);
      if (filters.sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      return 0;
    });

    setFilteredListings(filtered);
  };

  const startTrial = async (listing) => {
    setTrialAgent(listing);
    await base44.entities.AgentMarketplaceListing.update(listing.id, {
      downloads: (listing.downloads || 0) + 1
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D1A] via-[#1a1a2e] to-[#0D0D1A] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Agent Marketplace</h1>
          <p className="text-white/60">AI-powered agent discovery with personality profiling</p>
        </motion.div>

        {recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400" />
              Gemini Recommendations
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {recommendations.map(listing => (
                <motion.div key={listing.id} className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Award className="w-8 h-8 text-cyan-400" />
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold">
                      {listing.gemini_score}/100
                    </span>
                  </div>
                  <h3 className="text-white font-bold mb-2">{listing.personality_profile?.archetype || 'Agent'}</h3>
                  <div className="space-y-1 text-xs mb-3">
                    {listing.personality_profile?.strengths?.slice(0, 2).map((s, i) => (
                      <p key={i} className="text-green-400">✓ {s}</p>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-cyan-400 font-bold">{listing.price} OMNI</p>
                    <button className="px-3 py-1 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded text-xs">
                      Try {listing.trial_period_days}d
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
          <h3 className="text-white font-bold mb-3">Filters & Sorting</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-white/60 text-xs mb-1 block">Min Gemini Score</label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => setFilters({...filters, minScore: parseInt(e.target.value)})}
                className="w-full"
              />
              <span className="text-cyan-400 text-xs">{filters.minScore}</span>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Max Price</label>
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                className="w-full"
              />
              <span className="text-cyan-400 text-xs">{filters.maxPrice} OMNI</span>
            </div>
            <div>
              <label className="text-white/60 text-xs mb-1 block">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
              >
                <option value="gemini_score">Gemini Score</option>
                <option value="price">Price</option>
                <option value="downloads">Downloads</option>
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-white/60 text-xs">{filteredListings.length} agents found</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {filteredListings.map(listing => (
            <motion.div key={listing.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-cyan-400/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{listing.personality_profile?.archetype}</p>
                    <p className="text-white/60 text-xs">{listing.downloads} downloads</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-cyan-400 font-bold">{listing.price} OMNI</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < (listing.rating || 0) ? 'text-yellow-400' : 'text-gray-600'}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-white/60 text-xs mb-1">Skill Benchmarks:</p>
                {Object.entries(listing.skill_benchmarks || {}).slice(0, 3).map(([skill, score]) => (
                  <div key={skill} className="flex items-center gap-2 mb-1">
                    <span className="text-white text-xs flex-1">{skill}</span>
                    <div className="flex-1 bg-white/10 rounded-full h-1.5">
                      <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => startTrial(listing)}
                className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded font-semibold hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Start {listing.trial_period_days}-Day Trial
              </button>
            </motion.div>
          ))}
        </div>

        {/* Trial Modal */}
        {trialAgent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#0D0D1A] border border-cyan-400 rounded-lg p-6 max-w-md"
            >
              <h3 className="text-white font-bold text-xl mb-3">Trial Started!</h3>
              <p className="text-white/80 mb-4">
                You have {trialAgent.trial_period_days} days to test this agent. 
                Performance will be monitored automatically.
              </p>
              <div className="bg-white/5 rounded p-3 mb-4">
                <p className="text-white text-sm mb-2">Trial Agent: {trialAgent.personality_profile?.archetype}</p>
                <p className="text-white/60 text-xs">Expires in {trialAgent.trial_period_days} days</p>
              </div>
              <button
                onClick={() => setTrialAgent(null)}
                className="w-full px-4 py-2 bg-cyan-500 text-white rounded font-semibold"
              >
                Start Using Agent
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}