import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Download, TrendingUp, Users, Clock, ShoppingCart, X, Check } from 'lucide-react';
import AuroraBackground from '../components/omni/AuroraBackground';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const categories = [
  { id: 'all', label: 'All', icon: '🌐' },
  { id: 'agents', label: 'AI Agents', icon: '🤖' },
  { id: 'behaviors', label: 'Behaviors', icon: '🧠' },
  { id: 'environments', label: 'Environments', icon: '🌍' },
  { id: 'templates', label: 'Templates', icon: '📋' },
  { id: 'models', label: '3D Models', icon: '🎨' }
];

const mockItems = [
  {
    id: 1,
    name: 'Advanced Explorer Agent',
    category: 'agents',
    description: 'Highly autonomous agent optimized for environment exploration and resource discovery',
    price: 'Free',
    rating: 4.8,
    downloads: 1247,
    author: 'AI Labs',
    image: '🤖',
    featured: true,
    tags: ['exploration', 'autonomous', 'learning']
  },
  {
    id: 2,
    name: 'Cooperative Builder Behavior',
    category: 'behaviors',
    description: 'Complex behavior pattern for agents to collaborate on construction projects',
    price: '$4.99',
    rating: 4.9,
    downloads: 892,
    author: 'BehaviorTech',
    image: '🧠',
    featured: true,
    tags: ['cooperation', 'building', 'teamwork']
  },
  {
    id: 3,
    name: 'Cyberpunk City Environment',
    category: 'environments',
    description: 'Fully interactive futuristic city with neon lights and dynamic elements',
    price: '$9.99',
    rating: 4.7,
    downloads: 2103,
    author: 'EnviroDesign',
    image: '🌃',
    featured: true,
    tags: ['cyberpunk', 'city', 'interactive']
  },
  {
    id: 4,
    name: 'ML Training Blueprint',
    category: 'templates',
    description: 'Pre-configured blueprint for machine learning training infrastructure',
    price: 'Free',
    rating: 4.6,
    downloads: 1567,
    author: 'MLPro',
    image: '📋',
    tags: ['ml', 'training', 'infrastructure']
  },
  {
    id: 5,
    name: 'Modular Furniture Pack',
    category: 'models',
    description: 'Collection of 50+ 3D furniture models for office and home environments',
    price: '$6.99',
    rating: 4.5,
    downloads: 734,
    author: '3D Studio',
    image: '🪑',
    tags: ['furniture', 'modular', 'interior']
  },
  {
    id: 6,
    name: 'Social Dynamics Simulator',
    category: 'agents',
    description: 'Agent pack designed for complex social interactions and relationship building',
    price: '$7.99',
    rating: 4.8,
    downloads: 945,
    author: 'SocialAI',
    image: '👥',
    tags: ['social', 'dynamics', 'relationships']
  }
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [items, setItems] = useState(mockItems);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cart, setCart] = useState([]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.downloads - a.downloads;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return b.id - a.id;
    return 0;
  });

  const addToCart = (item) => {
    if (!cart.find(i => i.id === item.id)) {
      setCart([...cart, item]);
      toast.success(`${item.name} added to cart`);
    } else {
      toast.info('Already in cart');
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(i => i.id !== itemId));
    toast.success('Removed from cart');
  };

  const handleDownload = async (item) => {
    try {
      toast.success(`Downloading ${item.name}...`);
      // Simulate download
      setTimeout(() => toast.success('Download complete!'), 1500);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            AI Agent
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Marketplace</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Discover and download AI agents, behaviors, environments, and more from the community
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search agents, behaviors, environments..."
                  className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40"
                />
              </div>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
            <button
              onClick={() => setCart([])}
              className="relative px-4 py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded-xl hover:bg-cyan-500/30 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300'
                    : 'bg-black/40 border border-white/10 text-white/60 hover:bg-white/5'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Featured Items */}
        {selectedCategory === 'all' && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">✨ Featured</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {mockItems.filter(i => i.featured).map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer"
                >
                  <div className="text-5xl mb-3">{item.image}</div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{item.rating}</span>
                    </div>
                    <span className="text-cyan-400 font-semibold">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            {selectedCategory === 'all' ? 'All Items' : categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{item.image}</div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-2">{item.name}</h3>
                <p className="text-white/60 text-sm mb-3 line-clamp-2">{item.description}</p>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {item.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-white/60 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <Download className="w-4 h-4" />
                    {item.downloads}
                  </div>
                  <span className="text-cyan-400 font-semibold">{item.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Item Detail Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
              <motion.div
                className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10">
                  <X className="w-5 h-5 text-white/70" />
                </button>

                <div className="flex items-start gap-6 mb-6">
                  <div className="text-6xl">{selectedItem.image}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                      <span>by {selectedItem.author}</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        {selectedItem.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {selectedItem.downloads}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-4">
                      {selectedItem.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-cyan-300 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-white/70 mb-6">{selectedItem.description}</p>

                <div className="bg-white/5 rounded-xl p-4 mb-6">
                  <h3 className="text-white font-semibold mb-3">Features</h3>
                  <ul className="space-y-2 text-white/60 text-sm">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Fully customizable and extensible</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Optimized performance</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Regular updates and support</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Compatible with all environments</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  {selectedItem.price === 'Free' ? (
                    <button onClick={() => handleDownload(selectedItem)} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      Download Free
                    </button>
                  ) : (
                    <>
                      <button onClick={() => addToCart(selectedItem)} className="flex-1 py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-medium rounded-xl hover:bg-cyan-500/30 flex items-center justify-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                      <button className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90">
                        Buy Now {selectedItem.price}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart Modal */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.div
              className="fixed bottom-6 right-6 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl z-40 max-w-sm"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Cart ({cart.length})</h3>
                <button onClick={() => setCart([])} className="text-red-400 text-xs">Clear All</button>
              </div>
              <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                    <span className="text-2xl">{item.image}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm truncate">{item.name}</div>
                      <div className="text-cyan-400 text-xs">{item.price}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90">
                Checkout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuroraBackground>
  );
}