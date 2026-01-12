import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Brain, Award, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EnhancedAgentMarketplace() {
  const [listings, setListings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    loadMarketplace();
  }, []);

  const loadMarketplace = async () => {
    const data = await base44.entities.AgentMarketplaceListing.list('-gemini_score', 20);
    setListings(data);
    
    const topRated = data.filter(l => l.gemini_score > 80);
    setRecommendations(topRated.slice(0, 3));
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

        <div className="grid grid-cols-3 gap-4">
          {listings.map(listing => (
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

              <button className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded font-semibold hover:shadow-lg flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Start {listing.trial_period_days}-Day Trial
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}