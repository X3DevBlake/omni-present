import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Sparkles, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VisualizerMarketplace({ onPurchase }) {
  const [cart, setCart] = useState([]);
  const [purchasedPacks, setPurchasedPacks] = useState([]);

  const packs = [
    {
      id: 'financial-3d',
      name: 'Financial 3D Pack',
      price: 19.99,
      description: 'Complete suite of financial visualization components',
      thumbnail: '📊',
      category: 'financial',
      visualizers: [
        'Transaction Data Cityscape 3D',
        'Financial Galaxy 3D',
        'Real-Time Spending Insights 3D',
        'Debt Repayment Visualizer 3D',
        'Portfolio Performance 3D'
      ],
      downloads: 1234,
      rating: 4.8
    },
    {
      id: 'defi-advanced',
      name: 'DeFi Advanced Pack',
      price: 24.99,
      description: 'Advanced DeFi protocol visualizations',
      thumbnail: '💎',
      category: 'defi',
      visualizers: [
        'Crypto Asset Constellations 3D',
        'Liquidity Pool Ocean 3D',
        'Multi-Chain Asset Manager 3D',
        'DAO Governance Arena 3D',
        'Yield Farming Optimizer 3D'
      ],
      downloads: 892,
      rating: 4.9
    },
    {
      id: 'did-identity',
      name: 'Identity & Privacy Pack',
      price: 14.99,
      description: 'Decentralized identity visualization suite',
      thumbnail: '🔐',
      category: 'identity',
      visualizers: [
        'DID Avatar 3D',
        'DID Reputation Tree 3D',
        'Credential Exchange Arena 3D',
        'Permissions Control Panel 3D',
        'Privacy Dashboard 3D'
      ],
      downloads: 567,
      rating: 4.7
    },
    {
      id: 'ai-agents',
      name: 'AI Agent Visualization Pack',
      price: 29.99,
      description: 'Complete AI agent behavior and analytics suite',
      thumbnail: '🤖',
      category: 'ai',
      visualizers: [
        'Agent Decision Tree 3D',
        'Multi-Agent World 3D',
        'Knowledge Graph 3D Nebula',
        'Agent Emotional Aura 3D',
        'Inter-Agent Relationship Web 3D',
        'Agent Learning Curve 3D'
      ],
      downloads: 1456,
      rating: 5.0
    },
    {
      id: 'market-data',
      name: 'Market Data Pro Pack',
      price: 34.99,
      description: 'Professional market analysis visualizations',
      thumbnail: '📈',
      category: 'financial',
      visualizers: [
        'Financial Market Cityscape 3D',
        'Data Flow Cyberspace 3D',
        'Live Market Heatmap 3D',
        'Trading Volume Waves 3D',
        'Price Action Terrain 3D'
      ],
      downloads: 723,
      rating: 4.6
    },
    {
      id: 'complete-bundle',
      name: 'Complete Visualizer Bundle',
      price: 99.99,
      originalPrice: 124.95,
      description: 'All visualizer packs at 20% discount',
      thumbnail: '🎁',
      category: 'bundle',
      visualizers: [
        'All Financial 3D visualizers',
        'All DeFi Advanced visualizers',
        'All Identity & Privacy visualizers',
        'All AI Agent visualizers',
        'All Market Data visualizers',
        'Future pack updates included'
      ],
      downloads: 2341,
      rating: 4.9,
      badge: 'Best Value'
    }
  ];

  const addToCart = (pack) => {
    if (!cart.find(item => item.id === pack.id) && !purchasedPacks.includes(pack.id)) {
      setCart([...cart, pack]);
    }
  };

  const removeFromCart = (packId) => {
    setCart(cart.filter(item => item.id !== packId));
  };

  const handlePurchase = () => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    onPurchase?.(cart, total);
    setPurchasedPacks([...purchasedPacks, ...cart.map(item => item.id)]);
    setCart([]);
  };

  const categories = ['all', 'financial', 'defi', 'identity', 'ai', 'bundle'];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-black/40 border border-white/10">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packs
                .filter(pack => category === 'all' || pack.category === category)
                .map((pack) => {
                  const isPurchased = purchasedPacks.includes(pack.id);
                  const inCart = cart.find(item => item.id === pack.id);

                  return (
                    <motion.div
                      key={pack.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="h-full bg-black/40 border-white/10 hover:border-cyan-400/50 transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-5xl">{pack.thumbnail}</div>
                            {pack.badge && (
                              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                                {pack.badge}
                              </Badge>
                            )}
                            {isPurchased && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <Check className="w-3 h-3 mr-1" />
                                Owned
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-white">{pack.name}</CardTitle>
                          <p className="text-sm text-gray-400">{pack.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Price */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-cyan-400">${pack.price}</span>
                            {pack.originalPrice && (
                              <span className="text-lg text-gray-500 line-through">
                                ${pack.originalPrice}
                              </span>
                            )}
                          </div>

                          {/* Visualizers List */}
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {pack.visualizers.map((viz, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                                <Sparkles className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
                                <span>{viz}</span>
                              </div>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/10">
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {pack.downloads.toLocaleString()}
                            </span>
                            <span>⭐ {pack.rating}</span>
                          </div>

                          {/* Actions */}
                          {isPurchased ? (
                            <Button className="w-full bg-green-500/20 text-green-400 border border-green-500/30" disabled>
                              <Check className="w-4 h-4 mr-2" />
                              Purchased
                            </Button>
                          ) : inCart ? (
                            <Button
                              variant="outline"
                              className="w-full border-cyan-400 text-cyan-400"
                              onClick={() => removeFromCart(pack.id)}
                            >
                              Remove from Cart
                            </Button>
                          ) : (
                            <Button
                              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
                              onClick={() => addToCart(pack)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Card className="bg-gradient-to-br from-cyan-900/90 to-blue-900/90 border-cyan-400 backdrop-blur-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-semibold">{cart.length} items</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-xl font-bold text-white">
                    ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                  </p>
                </div>
                <Button
                  className="bg-gradient-to-r from-green-500 to-emerald-500"
                  onClick={handlePurchase}
                >
                  Purchase Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}