import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Zap, TrendingUp, Download, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AuroraBackground from '../components/omni/AuroraBackground';
import EnhancedHubNav from '../components/navigation/EnhancedHubNav';

export default function AgentSkillMarketplace() {
  const [skills, setSkills] = useState([]);
  const [filter, setFilter] = useState('all');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const mockSkills = [
      {
        id: 1,
        name: 'Advanced Trading Analysis',
        category: 'financial',
        price: 500,
        rating: 4.8,
        sales: 2450,
        description: 'ML-powered market trend analysis',
        icon: '📊',
        features: ['Pattern Recognition', 'Volatility Prediction', 'Sentiment Analysis']
      },
      {
        id: 2,
        name: 'Autonomous Shopping Agent',
        category: 'ecommerce',
        price: 350,
        rating: 4.6,
        sales: 1890,
        description: 'Smart product discovery and comparison',
        icon: '🛒',
        features: ['Price Tracking', 'Quality Analysis', 'Deal Finding']
      },
      {
        id: 3,
        name: 'Research & Data Synthesis',
        category: 'research',
        price: 600,
        rating: 4.9,
        sales: 3120,
        description: 'Deep web research and insight generation',
        icon: '🔍',
        features: ['Web Crawling', 'Data Synthesis', 'Report Generation']
      },
      {
        id: 4,
        name: 'Natural Language Mastery',
        category: 'ai',
        price: 450,
        rating: 4.7,
        sales: 2680,
        description: 'Advanced NLP and conversation abilities',
        icon: '💬',
        features: ['Multilingual Support', 'Sentiment Analysis', 'Context Understanding']
      },
      {
        id: 5,
        name: 'Portfolio Optimization Pro',
        category: 'financial',
        price: 750,
        rating: 4.9,
        sales: 1450,
        description: 'Advanced rebalancing algorithms',
        icon: '📈',
        features: ['Risk Optimization', 'Rebalancing', 'Tax-Loss Harvesting']
      }
    ];
    setSkills(mockSkills);
  }, []);

  const filtered = filter === 'all' ? skills : skills.filter(s => s.category === filter);

  const addToCart = (skill) => {
    setCart(prev => [...prev, skill]);
  };

  return (
    <AuroraBackground>
      <EnhancedHubNav currentHub="LabsHome" />
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4 flex items-center gap-3"
          >
            <ShoppingCart className="w-10 h-10 text-cyan-400" />
            Agent Skill Marketplace
          </motion.h1>
          <p className="text-white/60">Upgrade your agents with specialized capabilities</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {['all', 'financial', 'ecommerce', 'research', 'ai'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === cat
                  ? 'bg-cyan-500/30 border border-cyan-500/50 text-white'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence>
            {filtered.map((skill, idx) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all group"
              >
                <div className="text-4xl mb-3">{skill.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{skill.name}</h3>
                <p className="text-white/60 text-sm mb-4">{skill.description}</p>
                
                {/* Features */}
                <div className="space-y-1 mb-4">
                  {skill.features.map(f => (
                    <div key={f} className="text-xs text-cyan-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {f}
                    </div>
                  ))}
                </div>

                {/* Rating & Sales */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(skill.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`}
                      />
                    ))}
                  </div>
                  <span className="text-white/60">({skill.sales.toLocaleString()} sales)</span>
                </div>

                {/* Price & Button */}
                <div className="flex items-center justify-between">
                  <div className="text-white font-bold text-lg">{skill.price} Omni</div>
                  <button
                    onClick={() => addToCart(skill)}
                    className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-2xl p-6 backdrop-blur-xl"
          >
            <h3 className="text-white font-bold mb-3">Cart ({cart.length})</h3>
            <div className="space-y-2 mb-4">
              {cart.slice(0, 3).map(item => (
                <div key={item.id} className="text-sm text-white/80 flex justify-between">
                  <span>{item.name}</span>
                  <span className="text-cyan-400">{item.price} Omni</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-3 mb-4">
              <div className="text-white font-bold flex justify-between">
                <span>Total:</span>
                <span className="text-cyan-400">{cart.reduce((sum, item) => sum + item.price, 0)} Omni</span>
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold">
              Checkout
            </button>
          </motion.div>
        )}
      </div>
    </AuroraBackground>
  );
}